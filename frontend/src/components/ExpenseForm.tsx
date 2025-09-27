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
            <form
                onSubmit={handleSubmit}
                className="rounded-md p-3 flex flex-wrap items-center gap-3 font-sans"
                style={{
                    border: "2px dashed var(--theme-border)",
                    backgroundColor: "var(--theme-surface)",
                    color: "var(--theme-text)",
                }}
            >
                <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    className="rounded-md px-3 py-1.5 text-sm transition-all"
                    style={{
                        backgroundColor: "var(--theme-surface)",
                        borderColor: "var(--theme-border)",
                        color: "var(--theme-text)",
                    }}
                />
                <select
                    name="template"
                    onChange={handleTemplateChange}
                    className="rounded-md px-3 py-1.5 text-sm transition-all w-40"
                    style={{
                        backgroundColor: "var(--theme-surface)",
                        borderColor: "var(--theme-border)",
                        color: "var(--theme-text)",
                    }}
                >
                    <option value="">Templates</option>
                    {templates.map((t) => (
                        <option
                            key={t._id ?? t.description}
                            value={t._id ?? t.description}
                        >
                            {t.description}
                        </option>
                    ))}
                </select>

                <input
                    type="text"
                    name="description"
                    placeholder="Description"
                    value={form.description}
                    onChange={handleChange}
                    className="rounded-md px-3 py-1.5 text-sm transition-all flex-grow min-w-[120px]"
                    style={{
                        backgroundColor: "var(--theme-surface)",
                        borderColor: "var(--theme-border)",
                        color: "var(--theme-text)",
                    }}
                />

                <div className="flex items-center space-x-2">
                    {/* allow free text input but suggest existing server-side types */}
                    <input
                        list="type-suggestions"
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                        placeholder="Type"
                        className="rounded-md px-3 py-1.5 text-sm transition-all w-40"
                        style={{
                            backgroundColor: "var(--theme-surface)",
                            borderColor: "var(--theme-border)",
                            color: "var(--theme-text)",
                        }}
                    />
                    <datalist id="type-suggestions">
                        {types.map((t) => (
                            <option key={t} value={t} />
                        ))}
                    </datalist>
                </div>

                <input
                    type="number"
                    name="amount"
                    placeholder="Amount"
                    value={form.amount}
                    onChange={handleChange}
                    step="1"
                    className="rounded-md px-3 py-1.5 text-sm transition-all w-20 text-right"
                    style={{
                        backgroundColor: "var(--theme-surface)",
                        borderColor: "var(--theme-border)",
                        color: "var(--theme-text)",
                    }}
                />

                <label
                    htmlFor="included"
                    className="flex items-center gap-2 cursor-pointer select-none text-sm"
                    style={{ color: "var(--theme-text)" }}
                >
                    <input
                        id="included"
                        type="checkbox"
                        name="included"
                        checked={!form.included}
                        onChange={handleChange}
                        className="w-4 h-4 cursor-pointer"
                        style={{
                            accentColor: "var(--theme-primary)",
                            border: "none",
                        }}
                    />
                    EXCLUDE FROM TOTAL
                </label>

                <label
                    htmlFor="isRecurring"
                    className="flex items-center gap-2 cursor-pointer select-none text-sm"
                    style={{ color: "var(--theme-text)" }}
                >
                    <input
                        id="isRecurring"
                        type="checkbox"
                        name="isRecurring"
                        checked={form.isRecurring}
                        onChange={handleChange}
                        className="w-4 h-4 cursor-pointer"
                        style={{
                            accentColor: "var(--theme-primary)",
                            border: "none",
                        }}
                    />
                    RECURRING
                </label>

                {form.isRecurring && (
                    <select
                        name="frequency"
                        value={form.frequency}
                        onChange={handleChange}
                        className="rounded-md px-3 py-1.5 text-sm transition-all w-32"
                        style={{
                            backgroundColor: "var(--theme-surface)",
                            borderColor: "var(--theme-border)",
                            color: "var(--theme-text)",
                        }}
                    >
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                )}

                <button
                    type="submit"
                    aria-label="Add expense"
                    className="px-6 py-1.5 flex items-center gap-2 text-sm rounded-lg transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{
                        backgroundColor: "var(--theme-primary)",
                        color: "var(--theme-background)",
                        border: "none",
                        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                            "var(--theme-active)";
                        e.currentTarget.style.color = "var(--theme-text)";
                        e.currentTarget.style.boxShadow =
                            "0 2px 4px rgba(0, 0, 0, 0.15)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                            "var(--theme-primary)";
                        e.currentTarget.style.color = "var(--theme-background)";
                        e.currentTarget.style.boxShadow =
                            "0 1px 2px rgba(0, 0, 0, 0.1)";
                    }}
                >
                    <Plus className="w-4 h-4" />
                    Add
                </button>
            </form>
        </>
    );
}
