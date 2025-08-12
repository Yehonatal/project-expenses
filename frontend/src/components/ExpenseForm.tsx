import { useState, type ChangeEvent, type FormEvent } from "react";
import API from "../api/api";
import type { Expense } from "../types/expense";
import { Plus, Check } from "lucide-react";

type ExpenseFormData = {
    date: string;
    description: string;
    amount: string;
    included: boolean;
};

type ExpenseFormProps = {
    onAdd: (expense: Expense) => void;
};

export default function ExpenseForm({ onAdd }: ExpenseFormProps) {
    const today = new Date().toISOString().split("T")[0];

    const [form, setForm] = useState<ExpenseFormData>({
        date: today,
        description: "",
        amount: "",
        included: true,
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
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
