import { useState, type ChangeEvent, type FormEvent } from "react";
import API from "../api/api";
import type { Expense } from "../types/expense";
import { Plus, Check } from "lucide-react";

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

    const templates = [
        { description: "taxi to work", type: "transport" },
        { description: "bus to home", type: "transport" },
        { description: "lunch at restaurant", type: "food" },
        { description: "coffee", type: "drink" },
        { description: "internet bill", type: "internet" },
        { description: "groceries", type: "food" },
    ];

    const [form, setForm] = useState<ExpenseFormData>({
        date: today,
        description: "",
        amount: "",
        included: true,
        type: "",
    });

    const handleTemplateChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value) {
            const template = templates.find((t) => t.description === value);
            if (template) {
                setForm((prev) => ({
                    ...prev,
                    description: template.description,
                    type: template.type,
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
        } catch (err) {
            console.error(err);
            alert("Failed to add expense");
        }
    };

    return (
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
                    <option key={t.description} value={t.description}>
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

            <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="bg-sand border border-olive rounded-md px-3 py-1.5 text-brown text-sm
          shadow-inner focus:outline-none focus:ring-1 focus:ring-olive focus:border-olive
          w-32"
            >
                <option value="">Type</option>
                <option value="transport">Transport</option>
                <option value="food">Food</option>
                <option value="drink">Drink</option>
                <option value="internet">Internet</option>
                <option value="other">Other</option>
            </select>

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
    );
}
