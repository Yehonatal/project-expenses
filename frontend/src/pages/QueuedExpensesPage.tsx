import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCw, Trash2, Wifi, WifiOff } from "lucide-react";
import PageContainer from "../components/ui/PageContainer";
import GlassCard from "../components/ui/GlassCard";
import Toast from "../components/Toast";
import { uiControl } from "../utils/uiClasses";
import {
    clearOfflineExpenseQueue,
    getOfflineExpenseQueue,
    processOfflineExpenseQueue,
    removeOfflineExpenseQueueItem,
    subscribeToOfflineExpenseQueue,
    type QueuedExpenseOperation,
} from "../services/offlineExpenseQueue";

const formatQueuedAt = (iso: string) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleString();
};

export default function QueuedExpensesPage() {
    const [operations, setOperations] = useState<QueuedExpenseOperation[]>([]);
    const [isOnline, setIsOnline] = useState(
        typeof navigator !== "undefined" ? navigator.onLine : true,
    );
    const [isSyncing, setIsSyncing] = useState(false);
    const [toast, setToast] = useState<
        { message: string; type: "success" | "error" | "info" } | undefined
    >();

    const loadQueue = useCallback(() => {
        setOperations(getOfflineExpenseQueue());
    }, []);

    useEffect(() => {
        loadQueue();

        const cleanupQueue = subscribeToOfflineExpenseQueue(() => {
            loadQueue();
        });

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            cleanupQueue();
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, [loadQueue]);

    const syncQueue = useCallback(async () => {
        if (!isOnline) {
            setToast({
                message: "You are offline. Reconnect to sync queued changes.",
                type: "info",
            });
            return;
        }

        if (isSyncing) return;

        setIsSyncing(true);
        try {
            const result = await processOfflineExpenseQueue();
            loadQueue();

            if (result.synced === 0 && result.discarded === 0 && result.failed > 0) {
                setToast({
                    message: "No changes synced yet. Some items remain queued.",
                    type: "info",
                });
                return;
            }

            if (result.discarded > 0) {
                setToast({
                    message: `Synced ${result.synced}, discarded ${result.discarded}.`,
                    type: "error",
                });
                return;
            }

            setToast({
                message: `Synced ${result.synced} queued change${result.synced === 1 ? "" : "s"}.`,
                type: "success",
            });
        } catch (error) {
            console.error("Failed to sync queued operations", error);
            setToast({
                message: "Sync failed. Please try again.",
                type: "error",
            });
        } finally {
            setIsSyncing(false);
        }
    }, [isOnline, isSyncing, loadQueue]);

    useEffect(() => {
        if (!isOnline || operations.length === 0) return;
        void syncQueue();
    }, [isOnline, operations.length, syncQueue]);

    const groupedCounts = useMemo(() => {
        let creates = 0;
        let updates = 0;
        let deletes = 0;

        for (const operation of operations) {
            if (operation.kind === "create") creates += 1;
            else if (operation.kind === "update") updates += 1;
            else deletes += 1;
        }

        return { creates, updates, deletes };
    }, [operations]);

    return (
        <PageContainer
            title="Queued Expenses"
            subtitle="Review offline changes, remove invalid queue items, and manually sync when internet is available."
            className="space-y-6"
        >
            <Toast message={toast?.message} type={toast?.type} />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <GlassCard>
                    <p className="text-xs uppercase text-[var(--theme-text-secondary)]">
                        Status
                    </p>
                    <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold">
                        {isOnline ? (
                            <>
                                <Wifi className="h-4 w-4" /> Online
                            </>
                        ) : (
                            <>
                                <WifiOff className="h-4 w-4" /> Offline
                            </>
                        )}
                    </p>
                </GlassCard>
                <GlassCard>
                    <p className="text-xs uppercase text-[var(--theme-text-secondary)]">
                        Total queued
                    </p>
                    <p className="mt-1 text-lg font-semibold">{operations.length}</p>
                </GlassCard>
                <GlassCard>
                    <p className="text-xs uppercase text-[var(--theme-text-secondary)]">
                        Creates / Updates
                    </p>
                    <p className="mt-1 text-lg font-semibold">
                        {groupedCounts.creates} / {groupedCounts.updates}
                    </p>
                </GlassCard>
                <GlassCard>
                    <p className="text-xs uppercase text-[var(--theme-text-secondary)]">
                        Deletes
                    </p>
                    <p className="mt-1 text-lg font-semibold">{groupedCounts.deletes}</p>
                </GlassCard>
            </div>

            <GlassCard className="space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-[var(--theme-text-secondary)]">
                        Queue operations are persisted locally and replayed in FIFO order.
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className={uiControl.button}
                            onClick={loadQueue}
                            disabled={isSyncing}
                        >
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </button>
                        <button
                            type="button"
                            className={uiControl.buttonPrimary}
                            onClick={() => void syncQueue()}
                            disabled={isSyncing || operations.length === 0}
                        >
                            {isSyncing ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Syncing...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="h-4 w-4" />
                                    Sync now
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            className={uiControl.buttonDanger}
                            disabled={operations.length === 0 || isSyncing}
                            onClick={() => {
                                clearOfflineExpenseQueue();
                                setToast({
                                    message: "Queue cleared.",
                                    type: "info",
                                });
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                            Clear all
                        </button>
                    </div>
                </div>

                {operations.length === 0 ? (
                    <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-4 text-sm text-[var(--theme-text-secondary)]">
                        No queued expense operations.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {operations.map((operation, index) => (
                            <div
                                key={operation.id}
                                className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3"
                            >
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0 space-y-1">
                                        <p className="text-xs uppercase tracking-[0.15em] text-[var(--theme-text-secondary)]">
                                            #{index + 1} {operation.kind}
                                        </p>
                                        <p className="text-sm font-semibold">
                                            {operation.kind === "delete"
                                                ? `Expense ID: ${operation.expenseId}`
                                                : operation.payload.description}
                                        </p>
                                        <p className="text-xs text-[var(--theme-text-secondary)]">
                                            Queued at {formatQueuedAt(operation.queuedAt)}
                                        </p>
                                        {operation.kind !== "delete" && (
                                            <p className="text-xs text-[var(--theme-text-secondary)]">
                                                {operation.payload.date} • {operation.payload.type} • Birr {operation.payload.amount.toFixed(2)}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        className={uiControl.buttonDanger}
                                        onClick={() =>
                                            removeOfflineExpenseQueueItem(operation.id)
                                        }
                                        disabled={isSyncing}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </GlassCard>
        </PageContainer>
    );
}
