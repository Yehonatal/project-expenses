import { useState, type ChangeEvent, type FormEvent } from "react";
import API from "../api/api";

type ExpenseFormData = {
    date: string;
    description: string;
    amount: string;
    included: boolean;
};

export type Expense = {
    id: number;
    date: string;
    description: string;
    amount: number;
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
            className="bg-sand shadow rounded p-4 flex gap-4 flex-wrap"
        >
            <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="border border-olive p-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-olive"
            />
            <input
                type="text"
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={handleChange}
                className="border border-olive p-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-olive flex-grow"
            />
            <input
                type="number"
                name="amount"
                placeholder="Amount"
                value={form.amount}
                onChange={handleChange}
                className="border border-olive p-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-olive"
            />
            <label className="flex items-center gap-2 text-brown">
                <input
                    type="checkbox"
                    name="included"
                    checked={form.included}
                    onChange={handleChange}
                    className="accent-olive"
                />
                Include in total
            </label>
            <button
                type="submit"
                className="bg-clay text-white px-5 py-2 rounded hover:bg-brown transition-colors duration-200"
            >
                Add
            </button>
        </form>
    );
}
