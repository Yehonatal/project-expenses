import { useState, type ChangeEvent, type FormEvent, useEffect } from "react";
import API from "../api/api";
import type { Expense } from "../types/expense";
import { Plus, Check } from "lucide-react";
import Toast from "./Toast";

type ExpenseFormData = {
    date: string;
    description: string;
    amount: string;
    included: boolean;
    type: string;
};

type ExpenseFormProps = {
    onAdd: (expense: Expense) => void;
};

export default function ExpenseForm({ onAdd }: ExpenseFormProps) {
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
            [name]: type === "checkbox" ? checked : value,
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

            const res = await API.post<Expense>("/expenses", {
                ...form,
                amount: parseFloat(form.amount),
            });
            onAdd(res.data);
            setForm({
                date: today,
                description: "",
                amount: "",
                included: true,
                type: "",
            });
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
                message: "Expense added successfully!",
                type: "success",
            });
        } catch (err) {
            console.error(err);
            setToast({ message: "Failed to add expense", type: "error" });
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
                    className="relative flex items-center gap-2 cursor-pointer select-none text-sm"
                    style={{ color: "var(--theme-text)" }}
                >
                    <input
                        id="included"
                        type="checkbox"
                        name="included"
                        checked={form.included}
                        onChange={handleChange}
                        className="peer absolute w-5 h-5 opacity-0 cursor-pointer"
                    />
                    <span
                        className="w-5 h-5 rounded border-2 bg-surface flex items-center justify-center transition-colors duration-200"
                        style={{
                            borderColor: "var(--theme-border)",
                            backgroundColor: "var(--theme-surface)",
                        }}
                        aria-hidden="true"
                    >
                        <Check
                            className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200"
                            strokeWidth={3}
                        />
                    </span>
                    EXCLUDE FROM TOTAL
                </label>

                <button
                    type="submit"
                    aria-label="Add expense"
                    className="px-6 py-1.5 flex items-center gap-2 text-sm rounded-lg transition-all"
                    style={{
                        backgroundColor: "var(--theme-primary)",
                        color: "white",
                    }}
                >
                    <Plus className="w-4 h-4" />
                    Add
                </button>
            </form>
        </>
    );
}
