import { useState, type ChangeEvent, type FormEvent, useEffect } from "react";
import API from "../api/api";
import type { Expense } from "../types/expense";
import { Plus, Pencil, Trash2, Send, ListChecks, X } from "lucide-react";
import Toast from "./Toast";
import { uiControl } from "../utils/uiClasses";

type ExpenseFormData = {
    date: string;
    description: string;
    amount: string;
    included: boolean;
    type: string;
    isRecurring: boolean;
    frequency: "weekly" | "monthly";
};

type QueuedExpense = {
    date: string;
    description: string;
    amount: number;
    included: boolean;
    type: string;
    isRecurring: boolean;
    frequency: "weekly" | "monthly";
};

type ExpenseFormProps = {
    onAdd: (expense: Expense) => void;
    editExpense?: Expense | null;
};

export default function ExpenseForm({ onAdd, editExpense }: ExpenseFormProps) {
    const today = new Date().toISOString().split("T")[0];

    const [templates, setTemplates] = useState<
        Array<{
            description: string;
            type: string;
            price: number | string;
            _id?: string;
        }>
    >([]);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const res = await API.get("/templates");
                if (!mounted) return;
                setTemplates(res.data || []);
            } catch {
                console.error("Failed to load templates");
            }
        };
        void load();
        return () => {
            mounted = false;
        };
    }, []);

    const [form, setForm] = useState<ExpenseFormData>({
        date: today,
        description: "",
        amount: "",
        included: true,
        type: "",
        isRecurring: false,
        frequency: "monthly",
    });

    useEffect(() => {
        if (editExpense) {
            setForm({
                date: new Date(editExpense.date).toISOString().split("T")[0],
                description: editExpense.description,
                amount: editExpense.amount.toString(),
                included: editExpense.included,
                type: editExpense.type,
                isRecurring: editExpense.isRecurring || false,
                frequency: editExpense.frequency || "monthly",
            });
        }
    }, [editExpense]);

    const [types, setTypes] = useState<string[]>([]);
    const [queuedExpenses, setQueuedExpenses] = useState<QueuedExpense[]>([]);
    const [editingQueueIndex, setEditingQueueIndex] = useState<number | null>(
        null,
    );
    const [isSubmittingQueue, setIsSubmittingQueue] = useState(false);
    const [toast, setToast] = useState<
        { message: string; type: "success" | "error" | "info" } | undefined
    >(undefined);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const res = await API.get<string[]>("/types");
                if (!mounted) return;
                setTypes(res.data || []);
            } catch {
                setTypes(["transport", "food", "drink", "internet", "other"]);
            }
        };
        void load();
        return () => {
            mounted = false;
        };
    }, []);

    const resetForm = () => {
        setForm({
            date: today,
            description: "",
            amount: "",
            included: true,
            type: "",
            isRecurring: false,
            frequency: "monthly",
        });
    };

    const handleTemplateChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value) {
            const template = templates.find((t) =>
                t._id ? t._id === value : t.description === value,
            );
            if (template) {
                setForm((prev) => ({
                    ...prev,
                    description: template.description,
                    type: template.type,
                    amount: String(template.price),
                }));
            }
        }
    };

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setForm((prev) => ({
            ...prev,
            [name]:
                type === "checkbox" && name === "included"
                    ? !checked
                    : type === "checkbox"
                      ? checked
                      : value,
        }));
    };

    const ensureTypeExists = async (rawType: string) => {
        const enteredType = rawType.trim();
        if (!enteredType || types.includes(enteredType)) return;
        const norm = enteredType.toLowerCase();
        try {
            await API.post("/types", { name: norm });
            setTypes((prev) => (prev.includes(norm) ? prev : [...prev, norm]));
        } catch {
            console.warn("Failed to create type", norm);
        }
    };

    const buildPayloadFromForm = (): QueuedExpense | null => {
        const amount = parseFloat(form.amount);
        if (!form.description.trim()) {
            setToast({ message: "Description is required", type: "error" });
            return null;
        }
        if (!form.type.trim()) {
            setToast({ message: "Type is required", type: "error" });
            return null;
        }
        if (!Number.isFinite(amount) || amount <= 0) {
            setToast({ message: "Amount must be greater than 0", type: "error" });
            return null;
        }

        return {
            date: form.date,
            description: form.description.trim(),
            amount,
            included: form.included,
            type: form.type.trim().toLowerCase(),
            isRecurring: form.isRecurring,
            frequency: form.frequency,
        };
    };

    const handleQueueAddOrUpdate = () => {
        const payload = buildPayloadFromForm();
        if (!payload) return;

        if (editingQueueIndex !== null) {
            setQueuedExpenses((prev) =>
                prev.map((item, idx) =>
                    idx === editingQueueIndex ? payload : item,
                ),
            );
            setToast({ message: "Queued expense updated", type: "success" });
            setEditingQueueIndex(null);
        } else {
            setQueuedExpenses((prev) => [...prev, payload]);
            setToast({ message: "Expense queued", type: "info" });
        }

        resetForm();
    };

    const handleQueueEdit = (index: number) => {
        const item = queuedExpenses[index];
        if (!item) return;
        setForm({
            date: item.date,
            description: item.description,
            amount: String(item.amount),
            included: item.included,
            type: item.type,
            isRecurring: item.isRecurring,
            frequency: item.frequency,
        });
        setEditingQueueIndex(index);
    };

    const handleQueueRemove = (index: number) => {
        setQueuedExpenses((prev) => prev.filter((_, idx) => idx !== index));
        if (editingQueueIndex === index) {
            setEditingQueueIndex(null);
            resetForm();
        } else if (editingQueueIndex !== null && index < editingQueueIndex) {
            setEditingQueueIndex((prev) => (prev === null ? null : prev - 1));
        }
    };

    const handleQueueSubmit = async () => {
        if (editingQueueIndex !== null) {
            setToast({
                message: "Finish updating the item in edit mode before submit",
                type: "info",
            });
            return;
        }

        if (queuedExpenses.length === 0) {
            setToast({
                message: "Add at least one expense to the queue first",
                type: "info",
            });
            return;
        }

        setIsSubmittingQueue(true);
        let successCount = 0;
        let failureCount = 0;

        const queueSnapshot = [...queuedExpenses];

        const uniqueTypes = Array.from(
            new Set(queueSnapshot.map((item) => item.type.trim().toLowerCase())),
        );
        for (const type of uniqueTypes) {
            await ensureTypeExists(type);
        }

        for (const item of queueSnapshot) {
            try {
                const res = await API.post<Expense>("/expenses", item);
                onAdd(res.data);
                successCount += 1;
            } catch (error) {
                console.error("Failed to submit queued expense:", error);
                failureCount += 1;
            }
        }

        if (successCount > 0) {
            setQueuedExpenses([]);
            resetForm();
        }

        if (failureCount > 0) {
            setToast({
                message: `${successCount} submitted, ${failureCount} failed.`,
                type: "error",
            });
        } else {
            setToast({
                message: `Submitted ${successCount} expense${successCount === 1 ? "" : "s"} successfully!`,
                type: "success",
            });
        }

        setIsSubmittingQueue(false);
    };

    const handleSingleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const enteredType = form.type?.trim().toLowerCase();
            if (enteredType) {
                await ensureTypeExists(enteredType);
            }

            const res = await API.put<Expense>(`/expenses/${editExpense?._id}`, {
                ...form,
                amount: parseFloat(form.amount),
                type: form.type.trim().toLowerCase(),
            });

            onAdd(res.data);
            setToast({ message: "Expense updated successfully!", type: "success" });
        } catch (err) {
            console.error(err);
            setToast({ message: "Failed to update expense", type: "error" });
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (editExpense) {
            await handleSingleSubmit(e);
            return;
        }

        handleQueueAddOrUpdate();
    };

    return (
        <>
            <Toast message={toast?.message} type={toast?.type} />
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className={uiControl.label}>Date</label>
                        <input
                            type="date"
                            name="date"
                            value={form.date}
                            onChange={handleChange}
                            className={uiControl.input}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className={uiControl.label}>Template</label>
                        <select
                            name="template"
                            onChange={handleTemplateChange}
                            className={uiControl.select}
                        >
                            <option value="">Select Template</option>
                            {templates.map((t) => (
                                <option
                                    key={t._id ?? t.description}
                                    value={t._id ?? t.description}
                                >
                                    {t.description}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className={uiControl.label}>Description</label>
                        <input
                            type="text"
                            name="description"
                            placeholder="Enter description"
                            value={form.description}
                            onChange={handleChange}
                            className={uiControl.input}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className={uiControl.label}>Type</label>
                        <input
                            list="type-suggestions"
                            name="type"
                            value={form.type}
                            onChange={handleChange}
                            placeholder="Enter type"
                            className={uiControl.input}
                        />
                        <datalist id="type-suggestions">
                            {types.map((t) => (
                                <option key={t} value={t} />
                            ))}
                        </datalist>
                    </div>

                    <div className="space-y-2">
                        <label className={uiControl.label}>Amount</label>
                        <input
                            type="number"
                            name="amount"
                            placeholder="0.00"
                            value={form.amount}
                            onChange={handleChange}
                            step="1"
                            className={uiControl.inputRight}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className={uiControl.label}>Options</label>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
                                <input
                                    type="checkbox"
                                    name="included"
                                    checked={!form.included}
                                    onChange={handleChange}
                                    className={uiControl.checkbox}
                                    style={{
                                        accentColor: "var(--theme-accent)",
                                    }}
                                />
                                <span className="text-[var(--theme-text-secondary)]">
                                    Exclude from total
                                </span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
                                <input
                                    type="checkbox"
                                    name="isRecurring"
                                    checked={form.isRecurring}
                                    onChange={handleChange}
                                    className={uiControl.checkbox}
                                    style={{
                                        accentColor: "var(--theme-accent)",
                                    }}
                                />
                                <span className="text-[var(--theme-text-secondary)]">
                                    Recurring
                                </span>
                            </label>
                        </div>
                    </div>

                    {form.isRecurring && (
                        <div className="space-y-2">
                            <label className={uiControl.label}>Frequency</label>
                            <select
                                name="frequency"
                                value={form.frequency}
                                onChange={handleChange}
                                className={uiControl.select}
                            >
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>
                    )}
                </div>

                {!editExpense && (
                    <div className="space-y-3 border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <ListChecks className="h-4 w-4" />
                                <h3 className="text-sm font-semibold">Queued Expenses</h3>
                            </div>
                            <span className="text-xs text-[var(--theme-text-secondary)]">
                                {queuedExpenses.length} item{queuedExpenses.length === 1 ? "" : "s"}
                            </span>
                        </div>

                        {queuedExpenses.length === 0 ? (
                            <p className="text-xs text-[var(--theme-text-secondary)]">
                                Add expenses to the queue, review them here, then submit all as individual records.
                            </p>
                        ) : (
                            <div className="space-y-2 max-h-56 overflow-y-auto">
                                {queuedExpenses.map((item, index) => (
                                    <div
                                        key={`${item.description}-${index}`}
                                        className="flex items-start justify-between gap-3 border border-[var(--theme-border)] bg-[var(--theme-background)] p-2"
                                    >
                                        <div className="min-w-0 space-y-1">
                                            <p className="truncate text-sm font-semibold">
                                                {item.description}
                                            </p>
                                            <p className="text-[11px] text-[var(--theme-text-secondary)]">
                                                {item.date} • {item.type} • Birr {item.amount.toFixed(2)} • {item.included ? "Included" : "Excluded"}
                                                {item.isRecurring ? ` • ${item.frequency}` : ""}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => handleQueueEdit(index)}
                                                className={uiControl.button}
                                                title="Edit queued expense"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleQueueRemove(index)}
                                                className={uiControl.buttonDanger}
                                                title="Remove queued expense"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="flex flex-wrap justify-end gap-2 pt-2">
                    {editExpense ? (
                        <button
                            type="submit"
                            aria-label="Save expense"
                            className={uiControl.buttonPrimary}
                        >
                            <Plus className="w-4 h-4" />
                            Save Expense
                        </button>
                    ) : (
                        <>
                            {editingQueueIndex !== null && (
                                <button
                                    type="button"
                                    className={uiControl.button}
                                    onClick={() => {
                                        setEditingQueueIndex(null);
                                        resetForm();
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                    Cancel edit
                                </button>
                            )}
                            <button
                                type="submit"
                                aria-label="Add expense to queue"
                                className={uiControl.buttonPrimary}
                            >
                                <Plus className="w-4 h-4" />
                                {editingQueueIndex !== null ? "Update in list" : "Add to list"}
                            </button>
                            <button
                                type="button"
                                className={uiControl.button}
                                onClick={() => void handleQueueSubmit()}
                                disabled={queuedExpenses.length === 0 || isSubmittingQueue}
                            >
                                <Send className="h-4 w-4" />
                                {isSubmittingQueue
                                    ? "Submitting..."
                                    : `Submit all (${queuedExpenses.length})`}
                            </button>
                        </>
                    )}
                </div>
            </form>
        </>
    );
}
