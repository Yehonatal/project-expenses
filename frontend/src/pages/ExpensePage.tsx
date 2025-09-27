import { useEffect, useState } from "react";
import API from "../api/api";
import { getBudgets } from "../api/api";
import type { Expense, Budget } from "../types/expense";
import ExpenseTable from "../components/ExpenseTable";
import ExpenseForm from "../components/ExpenseForm";

export default function ExpensePage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [budgets, setBudgets] = useState<Budget[]>([]);

    const fetchExpenses = async () => {
        try {
            const res = await API.get<Expense[]>("/expenses");
            setExpenses(res.data);

            const includedTotal = res.data
                .filter((e) => e.included)
                .reduce((sum, e) => sum + e.amount, 0);

            setTotal(includedTotal);
        } catch (error) {
            console.error("Failed to fetch expenses:", error);
        }
    };

    const fetchBudgets = async () => {
        try {
            const res = await getBudgets();
            setBudgets(res.data);
        } catch (error) {
            console.error("Failed to fetch budgets:", error);
        }
    };

    useEffect(() => {
        fetchExpenses();
        fetchBudgets();
    }, []);

    const handleAdd = (newExpense: Expense) => {
        setExpenses((prev) => [newExpense, ...prev]);

        if (newExpense.included) {
            setTotal((prev) => prev + newExpense.amount);
        }
    };

    return (
        <div
            className="p-6 max-w-5xl mx-auto"
            style={{
                backgroundColor: "var(--theme-background)",
                color: "var(--theme-text)",
            }}
        >
            <h1 className="text-2xl font-bold mb-6">Expense Tracker</h1>
            <ExpenseForm onAdd={handleAdd} />
            <div className="mt-4 text-lg font-medium">
                Total (Included): Birr {total.toFixed(2)}
            </div>

            {budgets.length > 0 && (
                <div
                    className="mt-6 p-4 rounded"
                    style={{
                        backgroundColor: "var(--theme-surface)",
                        borderColor: "var(--theme-border)",
                        border: "1px solid",
                    }}
                >
                    <h2 className="text-lg font-semibold mb-4">
                        Budget Progress
                    </h2>
                    <div className="space-y-3">
                        {budgets.slice(0, 3).map((budget) => {
                            // Show up to 3 most recent budgets
                            const progress =
                                (budget.spent / budget.totalBudget) * 100;
                            const isOverBudget = progress > 100;
                            return (
                                <div
                                    key={budget._id}
                                    className="flex items-center justify-between"
                                >
                                    <div className="flex-1">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>
                                                {budget.startMonth}/
                                                {budget.startYear} -{" "}
                                                {budget.endMonth}/
                                                {budget.endYear}
                                            </span>
                                            <span>
                                                ${budget.spent.toFixed(2)} / $
                                                {budget.totalBudget.toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                                className="h-3 rounded-full transition-all duration-300"
                                                style={{
                                                    width: `${Math.min(
                                                        progress,
                                                        100
                                                    )}%`,
                                                    backgroundColor:
                                                        isOverBudget
                                                            ? "#ef4444"
                                                            : "#22c55e",
                                                }}
                                            ></div>
                                        </div>
                                        <div
                                            className="text-xs mt-1"
                                            style={{
                                                color: isOverBudget
                                                    ? "#ef4444"
                                                    : "var(--theme-text-secondary)",
                                            }}
                                        >
                                            {progress.toFixed(1)}% spent
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {budgets.length > 3 && (
                        <p
                            className="text-sm mt-2"
                            style={{ color: "var(--theme-text-secondary)" }}
                        >
                            And {budgets.length - 3} more budgets...
                        </p>
                    )}
                </div>
            )}

            <ExpenseTable expenses={expenses} />
        </div>
    );
}
