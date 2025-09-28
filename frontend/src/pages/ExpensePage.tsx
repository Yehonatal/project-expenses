import { useEffect, useState } from "react";
import API from "../api/api";
import { getBudgets } from "../api/api";
import type { Expense, Budget } from "../types/expense";
import ExpenseTable from "../components/ExpenseTable";
import ExpenseForm from "../components/ExpenseForm";
import Modal from "../components/Modal";
import { RotateCcw, Plus } from "lucide-react";
import PageContainer from "../components/ui/PageContainer";
import GlassCard from "../components/ui/GlassCard";

export default function ExpensePage({
    expenseUpdateTrigger,
}: {
    expenseUpdateTrigger?: number;
}) {
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

    useEffect(() => {
        fetchExpenses();
        fetchBudgets();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [expenseUpdateTrigger]);

    const fetchExpenses = async () => {
        try {
            const res = await API.get<Expense[]>("/expenses");
            setExpenses(res.data || []);
            const includedTotal = (res.data || [])
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
            setBudgets(res.data || []);
        } catch (error) {
            console.error("Failed to fetch budgets:", error);
        }
    };

    const handleAdd = (expense: Expense) => {
        setExpenses((prev) => [expense, ...prev]);
        if (expense.included) setTotal((prev) => prev + expense.amount);
    };

    const handleEdit = (expense: Expense) => {
        setEditingExpense(expense);
        setShowEditModal(true);
    };

    const handleDelete = (expenseId: string) => {
        setDeletingExpenseId(expenseId);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!deletingExpenseId) return;
        try {
            await API.delete(`/expenses/${deletingExpenseId}`);
            // remove from state
            // remove from state and recompute total based on new list
            setExpenses((prev) => {
                const next = prev.filter((e) => e._id !== deletingExpenseId);
                const included = next.filter((e) => e.included);
                setTotal(included.reduce((s, e) => s + e.amount, 0));
                return next;
            });
            setShowDeleteModal(false);
            setDeletingExpenseId(null);
        } catch (error) {
            console.error("Failed to delete expense:", error);
        }
    };

    const handleGenerateRecurring = () => {
        setRecurringModalContent({
            title: "Generate Recurring",
            message:
                "This will create due recurring expenses based on your templates.",
            showAddButton: true,
        });
        setShowRecurringModal(true);
    };

    return (
        <PageContainer title="Expense Tracker" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <ExpenseForm onAdd={handleAdd} />

                    <GlassCard>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-base font-semibold text-theme-text">
                                    Total Expenses
                                </h2>
                                <p
                                    className="text-xl font-bold"
                                    style={{ color: "#059669" }}
                                >
                                    Birr {total.toFixed(2)}
                                </p>
                            </div>
                            <button
                                onClick={handleGenerateRecurring}
                                className="glass-button px-4 py-2 flex items-center gap-2 text-sm font-medium"
                                style={{ color: "var(--theme-accent)" }}
                                title="Generate due recurring expenses"
                            >
                                <RotateCcw className="w-4 h-4" />
                                <span className="hidden sm:inline">
                                    Generate Recurring
                                </span>
                            </button>
                        </div>
                        <p className="text-xs text-theme-text-secondary">
                            Auto-create due recurring expenses
                        </p>
                    </GlassCard>

                    <ExpenseTable
                        expenses={expenses}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </div>

                <div className="space-y-6">
                    {budgets.length > 0 && (
                        <GlassCard className="p-0">
                            <h2 className="text-base font-semibold text-theme-text mb-4">
                                Budget Progress
                            </h2>
                            <div className="space-y-4">
                                {budgets.slice(0, 3).map((budget) => {
                                    const progress =
                                        (budget.spent / budget.totalBudget) *
                                        100;
                                    const isOverBudget = progress > 100;
                                    return (
                                        <div key={budget._id} className="p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3
                                                    className="text-sm font-semibold"
                                                    style={{
                                                        color: "var(--theme-text)",
                                                    }}
                                                >
                                                    {budget.startMonth}/
                                                    {budget.startYear} -{" "}
                                                    {budget.endMonth}/
                                                    {budget.endYear}
                                                </h3>
                                            </div>

                                            <div className="flex items-center justify-between mb-3">
                                                <div className="text-center">
                                                    <p
                                                        className="text-xs font-medium"
                                                        style={{
                                                            color: "var(--theme-text-secondary)",
                                                        }}
                                                    >
                                                        Spent
                                                    </p>
                                                    <p
                                                        className="text-sm font-bold"
                                                        style={{
                                                            color: "var(--theme-text)",
                                                        }}
                                                    >
                                                        {budget.spent.toLocaleString(
                                                            "en-US",
                                                            {
                                                                minimumFractionDigits: 0,
                                                                maximumFractionDigits: 0,
                                                            }
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="text-center">
                                                    <p
                                                        className="text-xs font-medium"
                                                        style={{
                                                            color: "var(--theme-text-secondary)",
                                                        }}
                                                    >
                                                        Budget
                                                    </p>
                                                    <p
                                                        className="text-sm font-bold"
                                                        style={{
                                                            color: "var(--theme-text)",
                                                        }}
                                                    >
                                                        {budget.totalBudget.toLocaleString(
                                                            "en-US",
                                                            {
                                                                minimumFractionDigits: 0,
                                                                maximumFractionDigits: 0,
                                                            }
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="text-center">
                                                    <p
                                                        className="text-xs font-medium"
                                                        style={{
                                                            color: "var(--theme-text-secondary)",
                                                        }}
                                                    >
                                                        {budget.spent >
                                                        budget.totalBudget
                                                            ? "Over"
                                                            : "Left"}
                                                    </p>
                                                    <p
                                                        className={`text-sm font-bold ${
                                                            budget.spent >
                                                            budget.totalBudget
                                                                ? "text-red-500"
                                                                : "text-green-500"
                                                        }`}
                                                    >
                                                        {Math.abs(
                                                            budget.totalBudget -
                                                                budget.spent
                                                        ).toLocaleString(
                                                            "en-US",
                                                            {
                                                                minimumFractionDigits: 0,
                                                                maximumFractionDigits: 0,
                                                            }
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex justify-between items-center">
                                                    <span
                                                        className="text-xs font-medium"
                                                        style={{
                                                            color: "var(--theme-text-secondary)",
                                                        }}
                                                    >
                                                        Progress
                                                    </span>
                                                    <span
                                                        className={`text-xs font-semibold ${
                                                            isOverBudget
                                                                ? "text-red-500"
                                                                : progress > 80
                                                                ? "text-yellow-500"
                                                                : "text-green-500"
                                                        }`}
                                                    >
                                                        {progress.toFixed(0)}%
                                                    </span>
                                                </div>
                                                <div
                                                    className="w-full rounded-full h-2 overflow-hidden"
                                                    style={{
                                                        backgroundColor:
                                                            "var(--theme-surface)",
                                                    }}
                                                >
                                                    <div
                                                        className="h-full rounded-full transition-all duration-300 ease-out"
                                                        style={{
                                                            width: `${Math.min(
                                                                progress,
                                                                100
                                                            )}%`,
                                                            backgroundColor:
                                                                isOverBudget
                                                                    ? "#ef4444"
                                                                    : progress >
                                                                      80
                                                                    ? "#f59e0b"
                                                                    : "#22c55e",
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {budgets.length > 3 && (
                                <p className="text-sm text-theme-text-secondary mt-4">
                                    And {budgets.length - 3} more budgets...
                                </p>
                            )}
                        </GlassCard>
                    )}
                </div>
            </div>

            <Modal
                isOpen={showRecurringModal}
                onClose={() => setShowRecurringModal(false)}
                title={recurringModalContent?.title || ""}
                actions={
                    recurringModalContent?.showAddButton ? (
                        <button
                            onClick={() => {
                                setShowRecurringModal(false);
                                (
                                    document.querySelector(
                                        'input[name="description"]'
                                    ) as HTMLInputElement
                                )?.focus();
                            }}
                            className="glass-button text-sm rounded-lg transition-all hover:opacity-90 flex items-center gap-2"
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
                            className="glass-button text-sm rounded-lg transition-all hover:opacity-90"
                            style={{ color: "var(--theme-text)" }}
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
                            setExpenses((prev) =>
                                prev.map((exp) =>
                                    exp._id === updatedExpense._id
                                        ? updatedExpense
                                        : exp
                                )
                            );
                            setShowEditModal(false);
                            setEditingExpense(null);
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
                            className="glass-button text-sm rounded-lg transition-all hover:opacity-90"
                            style={{ color: "var(--theme-text)" }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmDelete}
                            className="text-sm rounded-lg transition-all hover:opacity-90 font-medium px-4 py-2"
                            style={{
                                backgroundColor: "#dc2626", // Red-600
                                color: "white",
                                border: "1px solid #dc2626",
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
        </PageContainer>
    );
}
