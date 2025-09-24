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
                const res = await API.get("/api/templates");
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
                const res = await API.get<string[]>("/api/types");
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
                    await API.post("/api/types", { name: norm });
                    setToast({ message: `Saved type "${norm}"`, type: "info" });
                } catch {
                    // non-fatal — continue to try creating the expense
                    console.warn("Failed to create type");
                }
            }

            const res = await API.post<Expense>("/api/expenses", {
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
                    const r = await API.get<string[]>("/api/types");
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
                className="border-dashed border border-olive rounded-md p-3 flex flex-wrap items-center gap-3 font-sans text-brown"
            >
                <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    className="bg-sand border border-olive rounded-md px-3 py-1.5 text-brown text-sm
          shadow-inner focus:outline-none focus:ring-1 focus:ring-olive focus:border-olive transition w-32"
                />
                <select
                    name="template"
                    onChange={handleTemplateChange}
                    className="bg-sand border border-olive rounded-md px-3 py-1.5 text-brown text-sm
          shadow-inner focus:outline-none focus:ring-1 focus:ring-olive focus:border-olive
          w-40"
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
                    className="bg-sand border border-olive rounded-md px-3 py-1.5 text-brown text-sm
          shadow-inner focus:outline-none focus:ring-1 focus:ring-olive focus:border-olive
          flex-grow min-w-[120px]"
                />

                <div className="flex items-center space-x-2">
                    {/* allow free text input but suggest existing server-side types */}
                    <input
                        list="type-suggestions"
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                        placeholder="Type"
                        className="bg-sand border border-olive rounded-md px-3 py-1.5 text-brown text-sm shadow-inner focus:outline-none focus:ring-1 focus:ring-olive focus:border-olive w-40"
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
                    className=" border border-olive rounded-md px-3 py-1.5 text-brown text-sm
          shadow-inner focus:outline-none focus:ring-1 focus:ring-olive focus:border-olive
          w-20 text-right"
                />

                <label
                    htmlFor="included"
                    className="relative flex items-center gap-2 cursor-pointer select-none text-brown text-sm"
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
                        className="w-5 h-5 rounded border-2 border-olive bg-sand
            flex items-center justify-center
            peer-checked:bg-olive peer-checked:border-olive
            transition-colors duration-200"
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
                    className="bg-clay text-white px-6 py-1.5 flex items-center gap-2
          hover:bg-brown transition-colors duration-200 text-sm shadow-sm border-2 border-b-4 rounded-lg"
                >
                    <Plus className="w-4 h-4" />
                    Add
                </button>
            </form>
        </>
    );
}
