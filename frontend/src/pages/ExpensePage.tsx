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
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(
        null
    );

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

    const handleEdit = (expense: Expense) => {
        setEditingExpense(expense);
        setShowEditModal(true);
    };

    const handleDelete = (id: string) => {
        setDeletingExpenseId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!deletingExpenseId) return;

        try {
            await API.delete(`/expenses/${deletingExpenseId}`);
            await fetchExpenses(); // Refresh the list
            setShowDeleteModal(false);
            setDeletingExpenseId(null);
        } catch (error) {
            console.error("Failed to delete expense:", error);
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
            <h1 className="text-sm sm:text-base lg:text-base font-bold mb-6">
                Expense Tracker
            </h1>
            <div className="flex items-center gap-4 mb-4">
                <ExpenseForm onAdd={handleAdd} />
            </div>
            <div className="flex items-center justify-between mt-4 gap-4">
                <div className="text-sm sm:text-base lg:text-base font-medium flex-1">
                    Total (Included): Birr {total.toFixed(2)}
                </div>
                <button
                    onClick={handleGenerateRecurring}
                    className="px-4 py-2 flex items-center gap-2 text-sm rounded-lg transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 flex-shrink-0"
                    style={{
                        backgroundColor: "var(--theme-accent)",
                        color: "var(--theme-background)",
                        border: "1px solid var(--theme-border)",
                        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                    }}
                    title="Generate due recurring expenses"
                >
                    <RotateCcw className="w-4 h-4" />
                    <span className="hidden sm:inline">Generate Recurring</span>
                </button>
            </div>
            <div
                className="text-xs text-right mt-1 hidden sm:block"
                style={{ color: "var(--theme-textSecondary)" }}
            >
                Auto-create due recurring expenses
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
                    <h2 className="text-xs sm:text-sm lg:text-base font-semibold mb-4">
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

            <ExpenseTable
                expenses={expenses}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

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
                            className="px-4 py-2 flex items-center gap-2 text-sm rounded-lg transition-all hover:opacity-90"
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
                            className="px-4 py-2 text-sm rounded-lg transition-all hover:opacity-80"
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

            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Edit Expense"
            >
                {editingExpense && (
                    <ExpenseForm
                        onAdd={(updatedExpense) => {
                            // Update the expense in the list
                            setExpenses((prev) =>
                                prev.map((exp) =>
                                    exp._id === updatedExpense._id
                                        ? updatedExpense
                                        : exp
                                )
                            );
                            setShowEditModal(false);
                            setEditingExpense(null);
                            // Update total if included status changed
                            const oldExpense = expenses.find(
                                (e) => e._id === updatedExpense._id
                            );
                            if (oldExpense) {
                                const oldIncluded = oldExpense.included;
                                const newIncluded = updatedExpense.included;
                                if (oldIncluded !== newIncluded) {
                                    setTotal((prev) =>
                                        newIncluded
                                            ? prev + updatedExpense.amount
                                            : prev - updatedExpense.amount
                                    );
                                } else if (
                                    oldIncluded &&
                                    oldExpense.amount !== updatedExpense.amount
                                ) {
                                    setTotal(
                                        (prev) =>
                                            prev -
                                            oldExpense.amount +
                                            updatedExpense.amount
                                    );
                                }
                            }
                        }}
                        editExpense={editingExpense}
                    />
                )}
            </Modal>

            <Modal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setDeletingExpenseId(null);
                }}
                title="Delete Expense"
                actions={
                    <>
                        <button
                            onClick={() => {
                                setShowDeleteModal(false);
                                setDeletingExpenseId(null);
                            }}
                            className="px-4 py-2 text-sm rounded-lg transition-all hover:opacity-80"
                            style={{
                                backgroundColor: "var(--theme-surface)",
                                color: "var(--theme-text)",
                                border: "1px solid var(--theme-border)",
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmDelete}
                            className="px-4 py-2 text-sm rounded-lg transition-all hover:opacity-90"
                            style={{
                                backgroundColor: "var(--theme-error)",
                                color: "white",
                            }}
                        >
                            Delete
                        </button>
                    </>
                }
            >
                <p style={{ color: "var(--theme-text)" }}>
                    Are you sure you want to delete this expense? This action
                    cannot be undone.
                </p>
            </Modal>
        </div>
    );
}
