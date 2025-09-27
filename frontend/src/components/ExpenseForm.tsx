import { useState, type ChangeEvent, type FormEvent, useEffect } from "react";
import API from "../api/api";
import type { Expense } from "../types/expense";
import { Plus } from "lucide-react";
import Toast from "./Toast";

type ExpenseFormData = {
    date: string;
    description: string;
    amount: string;
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

    const [form, setForm] = useState<ExpenseFormData>({
        date: today,
        description: "",
        amount: "",
        included: true,
        type: "",
        isRecurring: false,
        frequency: "monthly",
    });

    const [types, setTypes] = useState<string[]>([]);
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

    const handleTemplateChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value) {
            // template select stores template id when loaded from server, or description for older local entries
            const template = templates.find((t) =>
                t._id ? t._id === value : t.description === value
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
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
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

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            // if the entered type is new, persist it to /api/types so it appears in suggestions
            const enteredType = form.type?.trim();
            if (enteredType && !types.includes(enteredType)) {
                const norm = enteredType.trim().toLowerCase();
                try {
                    await API.post("/types", { name: norm });
                    setToast({ message: `Saved type "${norm}"`, type: "info" });
                } catch {
                    // non-fatal — continue to try creating the expense
                    console.warn("Failed to create type");
                }
            }

            const res = editExpense
                ? await API.put<Expense>(`/expenses/${editExpense._id}`, {
                      ...form,
                      amount: parseFloat(form.amount),
                  })
                : await API.post<Expense>("/expenses", {
                      ...form,
                      amount: parseFloat(form.amount),
                  });
            onAdd(res.data);
            if (!editExpense) {
                setForm({
                    date: today,
                    description: "",
                    amount: "",
                    included: true,
                    type: "",
                    isRecurring: false,
                    frequency: "monthly",
                });
            }
            // refresh types from server in background
            void (async () => {
                try {
                    const r = await API.get<string[]>("/types");
                    setTypes(r.data || []);
                } catch {
                    // ignore
                }
            })();
            setToast({
                message: editExpense
                    ? "Expense updated successfully!"
                    : "Expense added successfully!",
                type: "success",
            });
        } catch (err) {
            console.error(err);
            setToast({
                message: editExpense
                    ? "Failed to update expense"
                    : "Failed to add expense",
                type: "error",
            });
        }
    };

    return (
        <>
            <Toast message={toast?.message} type={toast?.type} />
            <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-theme-text-secondary">
                            Date
                        </label>
                        <input
                            type="date"
                            name="date"
                            value={form.date}
                            onChange={handleChange}
                            className="w-full glass-button rounded-xl text-sm"
                            style={{
                                color: "var(--theme-text)",
                            }}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-theme-text-secondary">
                            Template
                        </label>
                        <select
                            name="template"
                            onChange={handleTemplateChange}
                            className="w-full glass-button rounded-xl text-sm"
                            style={{
                                color: "var(--theme-text)",
                            }}
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
                        <label className="text-sm font-medium text-theme-text-secondary">
                            Description
                        </label>
                        <input
                            type="text"
                            name="description"
                            placeholder="Enter description"
                            value={form.description}
                            onChange={handleChange}
                            className="w-full glass-button rounded-xl text-sm"
                            style={{
                                color: "var(--theme-text)",
                            }}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-theme-text-secondary">
                            Type
                        </label>
                        <input
                            list="type-suggestions"
                            name="type"
                            value={form.type}
                            onChange={handleChange}
                            placeholder="Enter type"
                            className="w-full glass-button rounded-xl text-sm"
                            style={{
                                color: "var(--theme-text)",
                            }}
                        />
                        <datalist id="type-suggestions">
                            {types.map((t) => (
                                <option key={t} value={t} />
                            ))}
                        </datalist>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-theme-text-secondary">
                            Amount
                        </label>
                        <input
                            type="number"
                            name="amount"
                            placeholder="0.00"
                            value={form.amount}
                            onChange={handleChange}
                            step="1"
                            className="w-full glass-button rounded-xl text-sm text-right"
                            style={{
                                color: "var(--theme-text)",
                            }}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-theme-text-secondary">
                            Options
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
                                <input
                                    type="checkbox"
                                    name="included"
                                    checked={!form.included}
                                    onChange={handleChange}
                                    className="w-4 h-4 cursor-pointer rounded"
                                    style={{
                                        accentColor: "var(--theme-accent)",
                                    }}
                                />
                                <span className="text-theme-text-secondary">
                                    Exclude from total
                                </span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
                                <input
                                    type="checkbox"
                                    name="isRecurring"
                                    checked={form.isRecurring}
                                    onChange={handleChange}
                                    className="w-4 h-4 cursor-pointer rounded"
                                    style={{
                                        accentColor: "var(--theme-accent)",
                                    }}
                                />
                                <span className="text-theme-text-secondary">
                                    Recurring
                                </span>
                            </label>
                        </div>
                    </div>

                    {form.isRecurring && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-theme-text-secondary">
                                Frequency
                            </label>
                            <select
                                name="frequency"
                                value={form.frequency}
                                onChange={handleChange}
                                className="w-full glass-button rounded-xl text-sm"
                                style={{
                                    color: "var(--theme-text)",
                                }}
                            >
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>
                    )}
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        aria-label="Add expense"
                        className="glass-button rounded-xl flex items-center gap-2 text-sm font-medium"
                        style={{
                            backgroundColor: "var(--theme-accent)",
                            color: "var(--theme-background)",
                        }}
                    >
                        <Plus className="w-4 h-4" />
                        Add Expense
                    </button>
                </div>
            </form>
        </>
    );
}
