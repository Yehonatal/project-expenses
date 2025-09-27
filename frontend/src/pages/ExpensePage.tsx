import { useEffect, useState } from "react";
import API from "../api/api";
import { getBudgets } from "../api/api";
import type { Expense, Budget } from "../types/expense";
import ExpenseTable from "../components/ExpenseTable";
import ExpenseForm from "../components/ExpenseForm";
import Modal from "../components/Modal";
import { RotateCcw, Plus } from "lucide-react";

export default function ExpensePage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [showRecurringModal, setShowRecurringModal] = useState(false);
    const [recurringModalContent, setRecurringModalContent] = useState<{
        title: string;
        message: string;
        showAddButton?: boolean;
    } | null>(null);

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

    const handleGenerateRecurring = async () => {
        try {
            const res = await API.post("/expenses/generate-recurring");

            if (res.data.generatedExpenses.length > 0) {
                // Refresh expenses to show the newly generated ones
                await fetchExpenses();
                setRecurringModalContent({
                    title: "Success",
                    message: `Successfully generated ${
                        res.data.generatedExpenses.length
                    } recurring expense${
                        res.data.generatedExpenses.length === 1 ? "" : "s"
                    }.`,
                });
            } else {
                // Check if there are any recurring expenses at all
                const hasRecurringExpenses = expenses.some(
                    (exp) => exp.isRecurring
                );
                if (!hasRecurringExpenses) {
                    setRecurringModalContent({
                        title: "No Recurring Expenses",
                        message:
                            "You don't have any recurring expenses set up yet. Would you like to create your first recurring expense?",
                        showAddButton: true,
                    });
                } else {
                    setRecurringModalContent({
                        title: "No Expenses Due",
                        message:
                            "All your recurring expenses are up to date. No new expenses were generated.",
                    });
                }
            }
            setShowRecurringModal(true);
        } catch (error) {
            console.error("Failed to generate recurring expenses:", error);
            setRecurringModalContent({
                title: "Error",
                message:
                    "Failed to generate recurring expenses. Please try again later.",
            });
            setShowRecurringModal(true);
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
            <div className="flex items-center gap-4 mb-4">
                <ExpenseForm onAdd={handleAdd} />
            </div>
            <div className="flex mt-4 justify-between">
                <div className="text-lg font-medium">
                    Total (Included): Birr {total.toFixed(2)}
                </div>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={handleGenerateRecurring}
                        className="px-4 py-2 flex items-center gap-2 text-sm rounded-lg transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
                        style={{
                            backgroundColor: "var(--theme-accent)",
                            color: "var(--theme-background)",
                            border: "1px solid var(--theme-border)",
                            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                        }}
                        title="Generate due recurring expenses"
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                                "var(--theme-active)";
                            e.currentTarget.style.color = "var(--theme-text)";
                            e.currentTarget.style.boxShadow =
                                "0 2px 4px rgba(0, 0, 0, 0.15)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                                "var(--theme-accent)";
                            e.currentTarget.style.color =
                                "var(--theme-background)";
                            e.currentTarget.style.boxShadow =
                                "0 1px 2px rgba(0, 0, 0, 0.1)";
                        }}
                    >
                        <RotateCcw className="w-4 h-4" />
                        Generate Recurring
                    </button>
                    <div
                        className="text-xs"
                        style={{ color: "var(--theme-textSecondary)" }}
                    >
                        Auto-create due recurring expenses
                    </div>
                </div>
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

            <Modal
                isOpen={showRecurringModal}
                onClose={() => setShowRecurringModal(false)}
                title={recurringModalContent?.title || ""}
                actions={
                    recurringModalContent?.showAddButton ? (
                        <button
                            onClick={() => {
                                setShowRecurringModal(false);
                                // Scroll to the form or focus on it
                                (
                                    document.querySelector(
                                        'input[name="description"]'
                                    ) as HTMLInputElement
                                )?.focus();
                            }}
                            className="px-4 py-2 flex items-center gap-2 text-sm rounded-lg transition-all"
                            style={{
                                backgroundColor: "var(--theme-primary)",
                                color: "white",
                            }}
                        >
                            <Plus className="w-4 h-4" />
                            Add Recurring Expense
                        </button>
                    ) : (
                        <button
                            onClick={() => setShowRecurringModal(false)}
                            className="px-4 py-2 text-sm rounded-lg transition-all"
                            style={{
                                backgroundColor: "var(--theme-surface)",
                                color: "var(--theme-text)",
                                border: "1px solid var(--theme-border)",
                            }}
                        >
                            OK
                        </button>
                    )
                }
            >
                <p style={{ color: "var(--theme-text)" }}>
                    {recurringModalContent?.message}
                </p>
            </Modal>
        </div>
    );
}
