import { useState } from "react";
import type { Expense } from "../types/expense";
import ExpenseTable from "../components/ExpenseTable";
import ExpenseForm from "../components/ExpenseForm";
import Modal from "../components/Modal";
import { RotateCcw, Plus } from "lucide-react";
import PageContainer from "../components/ui/PageContainer";
import GlassCard from "../components/ui/GlassCard";
import { formatBudgetPeriod } from "../utils/dateFormatter";
import PageSkeleton from "../components/ui/PageSkeleton";
import { useExpensePageData } from "../hooks/useExpensePageData";

export default function ExpensePage({
    expenseUpdateTrigger,
}: {
    expenseUpdateTrigger?: number;
}) {
    const {
        expenses,
        total,
        budgets,
        loading,
        recurringCount,
        addExpense,
        deleteExpense,
        mergeUpdatedExpense,
    } = useExpensePageData(expenseUpdateTrigger);
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
        null,
    );

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
            await deleteExpense(deletingExpenseId);
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

    if (loading) {
        return <PageSkeleton title="Loading expenses" />;
    }

    return (
        <PageContainer title="Expense Tracker" className="space-y-8">
            <div className="dashboard-hero flex flex-col lg:flex-row lg:items-center gap-6">
                <div className="flex-1 space-y-2">
                    <div
                        className="text-xs uppercase tracking-[0.2em]"
                        style={{ color: "var(--theme-text-secondary)" }}
                    >
                        Daily tracking
                    </div>
                    <h2 className="section-title text-2xl font-semibold">
                        Keep every expense in one place
                    </h2>
                    <p
                        className="text-sm"
                        style={{ color: "var(--theme-text-secondary)" }}
                    >
                        Track spending, monitor budgets, and generate recurring
                        entries when needed.
                    </p>
                </div>
                <div className="flex flex-wrap gap-6">
                    <div>
                        <div
                            className="text-xs uppercase tracking-[0.2em]"
                            style={{ color: "var(--theme-text-secondary)" }}
                        >
                            Total entries
                        </div>
                        <div className="text-2xl font-semibold">
                            {expenses.length}
                        </div>
                    </div>
                    <div>
                        <div
                            className="text-xs uppercase tracking-[0.2em]"
                            style={{ color: "var(--theme-text-secondary)" }}
                        >
                            Recurring
                        </div>
                        <div className="text-2xl font-semibold">
                            {recurringCount}
                        </div>
                    </div>
                </div>
            </div>

            <div className="kpi-strip">
                <div className="kpi-card">
                    <div
                        className="text-xs font-semibold uppercase"
                        style={{ color: "var(--theme-text-secondary)" }}
                    >
                        Total included
                    </div>
                    <div className="text-xl font-semibold">
                        Birr {total.toFixed(2)}
                    </div>
                </div>
                <div className="kpi-card">
                    <div
                        className="text-xs font-semibold uppercase"
                        style={{ color: "var(--theme-text-secondary)" }}
                    >
                        Budget entries
                    </div>
                    <div className="text-xl font-semibold">
                        {budgets.length}
                    </div>
                </div>
                <div className="kpi-card">
                    <div
                        className="text-xs font-semibold uppercase"
                        style={{ color: "var(--theme-text-secondary)" }}
                    >
                        Next action
                    </div>
                    <div className="text-xl font-semibold">Add expense</div>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <ExpenseForm onAdd={addExpense} />

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
                                                <span
                                                    className="text-xs font-medium px-2 py-1 rounded-full border"
                                                    style={{
                                                        color: "var(--theme-text-secondary)",
                                                        backgroundColor:
                                                            "var(--theme-surface)",
                                                        borderColor:
                                                            "var(--theme-border)",
                                                        borderWidth: "1px",
                                                    }}
                                                >
                                                    {formatBudgetPeriod(budget)}
                                                </span>
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
                                                            },
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
                                                            },
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
                                                                budget.spent,
                                                        ).toLocaleString(
                                                            "en-US",
                                                            {
                                                                minimumFractionDigits: 0,
                                                                maximumFractionDigits: 0,
                                                            },
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
                                                    className="w-full rounded-full h-2 overflow-hidden border"
                                                    style={{
                                                        backgroundColor:
                                                            "var(--theme-surface)",
                                                        borderColor:
                                                            "var(--theme-text-secondary)",
                                                        borderWidth: "1px",
                                                    }}
                                                >
                                                    <div
                                                        className="h-full rounded-full transition-all duration-300 ease-out"
                                                        style={{
                                                            width: `${Math.min(
                                                                progress,
                                                                100,
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
                                        'input[name="description"]',
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
                            mergeUpdatedExpense(updatedExpense);
                            setShowEditModal(false);
                            setEditingExpense(null);
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
