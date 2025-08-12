import { useEffect, useState } from "react";
import API from "../api/api";
import ExpenseForm, { type Expense } from "../components/ExpenseForm";
import ExpenseTable from "../components/ExpenseTable";

export default function ExpensePage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [total, setTotal] = useState<number>(0);

    const fetchExpenses = async () => {
        try {
            const res = await API.get<Expense[]>("/expenses");
            setExpenses(res.data);

            console.error("Fetched expenses:", res.data);

            const includedTotal = res.data
                .filter((e) => e.included)
                .reduce((sum, e) => sum + e.amount, 0);

            setTotal(includedTotal);
        } catch (error) {
            console.error("Failed to fetch expenses:", error);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const handleAdd = (newExpense: Expense) => {
        setExpenses((prev) => [newExpense, ...prev]);

        if (newExpense.included) {
            setTotal((prev) => prev + newExpense.amount);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Expense Tracker</h1>
            <ExpenseForm onAdd={handleAdd} />
            <div className="mt-4 text-lg font-semibold">
                Total (Included): Birr {total.toFixed(2)}
            </div>
            <ExpenseTable expenses={expenses} />
        </div>
    );
}
