import API from "../api/api";
import type { Expense } from "../types/expense";

export type ExpenseWritePayload = {
    date: string;
    description: string;
    amount: number;
    included: boolean;
    type: string;
    tags?: string[];
    workspaceId?: string;
    isRecurring?: boolean;
    frequency?: "daily" | "weekly" | "monthly" | "yearly" | "custom";
    recurrenceRules?: {
        daysOfWeek?: number[];
        interval?: number;
        endDate?: string;
        occurrenceCount?: number;
    };
};

type OfflineOperation =
    | {
          id: string;
          kind: "create";
          payload: ExpenseWritePayload;
          queuedAt: string;
      }
    | {
          id: string;
          kind: "update";
          expenseId: string;
          payload: ExpenseWritePayload;
          queuedAt: string;
      }
    | {
          id: string;
          kind: "delete";
          expenseId: string;
          queuedAt: string;
      };

export type QueuedExpenseOperation = OfflineOperation;

type ProcessQueueResult = {
    synced: number;
    discarded: number;
    failed: number;
};

type ExpenseWriteResult =
    | { queued: true }
    | { queued: false; expense: Expense };

const STORAGE_KEY = "offline-expense-write-queue-v1";
const EVENT_NAME = "offline-expense-queue-updated";

const isBrowser =
    typeof window !== "undefined" && typeof localStorage !== "undefined";

const canUseRandomUUID =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function";

const buildOperationId = () => {
    if (canUseRandomUUID) return crypto.randomUUID();
    return `offline-op-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const safeParseQueue = (raw: string | null): OfflineOperation[] => {
    if (!raw) return [];

    try {
        const parsed = JSON.parse(raw) as OfflineOperation[];
        if (!Array.isArray(parsed)) return [];
        return parsed;
    } catch {
        return [];
    }
};

const readQueue = (): OfflineOperation[] =>
    isBrowser ? safeParseQueue(localStorage.getItem(STORAGE_KEY)) : [];

const writeQueue = (queue: OfflineOperation[]) => {
    if (!isBrowser) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    window.dispatchEvent(
        new CustomEvent(EVENT_NAME, {
            detail: { count: queue.length },
        }),
    );
};

const isRetryableNetworkError = (error: unknown): boolean => {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
        return true;
    }

    const maybeError = error as {
        code?: string;
        message?: string;
        response?: unknown;
    };

    if (!maybeError?.response) {
        return true;
    }

    return (
        maybeError.code === "ERR_NETWORK" ||
        maybeError.message?.toLowerCase().includes("network") === true
    );
};

const queueOperation = (operation: OfflineOperation) => {
    const current = readQueue();
    current.push(operation);
    writeQueue(current);
};

export const getOfflineExpenseQueueCount = () => readQueue().length;

export const getOfflineExpenseQueue = (): QueuedExpenseOperation[] =>
    readQueue();

export const removeOfflineExpenseQueueItem = (operationId: string) => {
    const next = readQueue().filter(
        (operation) => operation.id !== operationId,
    );
    writeQueue(next);
};

export const clearOfflineExpenseQueue = () => {
    writeQueue([]);
};

export const createExpenseOfflineAware = async (
    payload: ExpenseWritePayload,
): Promise<ExpenseWriteResult> => {
    if (!navigator.onLine) {
        queueOperation({
            id: buildOperationId(),
            kind: "create",
            payload,
            queuedAt: new Date().toISOString(),
        });
        return { queued: true };
    }

    try {
        const res = await API.post<Expense>("/expenses", payload);
        return { queued: false, expense: res.data };
    } catch (error) {
        if (isRetryableNetworkError(error)) {
            queueOperation({
                id: buildOperationId(),
                kind: "create",
                payload,
                queuedAt: new Date().toISOString(),
            });
            return { queued: true };
        }

        throw error;
    }
};

export const updateExpenseOfflineAware = async (
    expenseId: string,
    payload: ExpenseWritePayload,
): Promise<ExpenseWriteResult> => {
    if (!navigator.onLine) {
        queueOperation({
            id: buildOperationId(),
            kind: "update",
            expenseId,
            payload,
            queuedAt: new Date().toISOString(),
        });
        return { queued: true };
    }

    try {
        const res = await API.put<Expense>(`/expenses/${expenseId}`, payload);
        return { queued: false, expense: res.data };
    } catch (error) {
        if (isRetryableNetworkError(error)) {
            queueOperation({
                id: buildOperationId(),
                kind: "update",
                expenseId,
                payload,
                queuedAt: new Date().toISOString(),
            });
            return { queued: true };
        }

        throw error;
    }
};

export const deleteExpenseOfflineAware = async (
    expenseId: string,
): Promise<{ queued: boolean }> => {
    if (!navigator.onLine) {
        queueOperation({
            id: buildOperationId(),
            kind: "delete",
            expenseId,
            queuedAt: new Date().toISOString(),
        });
        return { queued: true };
    }

    try {
        await API.delete(`/expenses/${expenseId}`);
        return { queued: false };
    } catch (error) {
        if (isRetryableNetworkError(error)) {
            queueOperation({
                id: buildOperationId(),
                kind: "delete",
                expenseId,
                queuedAt: new Date().toISOString(),
            });
            return { queued: true };
        }

        throw error;
    }
};

export const processOfflineExpenseQueue =
    async (): Promise<ProcessQueueResult> => {
        const queue = readQueue();
        if (!queue.length) return { synced: 0, discarded: 0, failed: 0 };

        const remaining: OfflineOperation[] = [];
        let synced = 0;
        let discarded = 0;
        let failed = 0;

        for (const operation of queue) {
            try {
                if (operation.kind === "create") {
                    await API.post("/expenses", operation.payload);
                } else if (operation.kind === "update") {
                    await API.put(
                        `/expenses/${operation.expenseId}`,
                        operation.payload,
                    );
                } else {
                    await API.delete(`/expenses/${operation.expenseId}`);
                }

                synced += 1;
            } catch (error) {
                if (isRetryableNetworkError(error)) {
                    remaining.push(operation);
                    failed += 1;
                    break;
                }

                // Non-retryable (validation/authorization) operations are discarded
                discarded += 1;
            }
        }

        // Keep the current operation and all not-yet-processed operations on retryable failure.
        if (failed > 0) {
            const firstFailedIndex = queue.findIndex(
                (item) => remaining[0]?.id === item.id,
            );
            if (firstFailedIndex >= 0) {
                const tail = queue.slice(firstFailedIndex + 1);
                writeQueue([...remaining, ...tail]);
                return { synced, discarded, failed };
            }
        }

        writeQueue(remaining);
        return { synced, discarded, failed };
    };

export const subscribeToOfflineExpenseQueue = (
    callback: (count: number) => void,
) => {
    if (!isBrowser) return () => undefined;

    const handler = (event: Event) => {
        const custom = event as CustomEvent<{ count?: number }>;
        const count = custom.detail?.count ?? getOfflineExpenseQueueCount();
        callback(count);
    };

    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
};
