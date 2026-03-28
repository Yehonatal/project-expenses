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
import { modalCopy } from "../content/modalCopy";
import { uiControl } from "../utils/uiClasses";

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
    const [showCreateModal, setShowCreateModal] = useState(false);
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
            title: modalCopy.expense.recurringTitle,
            message: modalCopy.expense.recurringBody,
            showAddButton: true,
        });
        setShowRecurringModal(true);
    };

    if (loading) {
        return <PageSkeleton title="Loading expenses" />;
    }

    return (
        <PageContainer
            title="Expense Tracker"
            subtitle="Track daily entries, review grouped history, and manage recurring generation from one place."
            className="space-y-6 sm:space-y-8"
        >
            <div className="border border-[var(--theme-glass-border)] bg-gradient-to-br from-white/60 to-white/10 p-4 sm:p-5">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1 space-y-2">
                        <div
                            className="text-xs uppercase tracking-[0.2em]"
                            style={{ color: "var(--theme-text-secondary)" }}
                        >
                            Daily tracking
                        </div>
                        <h2 className="font-['Playfair_Display'] text-xl font-semibold tracking-[-0.01em] sm:text-2xl">
                            Keep every expense in one place
                        </h2>
                        <p
                            className="text-sm"
                            style={{ color: "var(--theme-text-secondary)" }}
                        >
                            Track spending, monitor budgets, and generate
                            recurring entries when needed.
                        </p>
                        <button
                            type="button"
                            onClick={() => setShowCreateModal(true)}
                            className="mt-2 inline-flex w-full items-center justify-center gap-2 border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] px-3 py-2 text-sm font-medium backdrop-blur-[20px] transition-colors hover:bg-white/5 sm:w-auto"
                            style={{
                                backgroundColor: "var(--theme-active)",
                                color: "var(--theme-text)",
                            }}
                        >
                            <Plus className="w-4 h-4" />
                            Add expense
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:flex sm:flex-wrap sm:gap-6">
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
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div className="border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] rounded-none p-3">
                    <div
                        className="text-xs font-semibold uppercase"
                        style={{ color: "var(--theme-text-secondary)" }}
                    >
                        Total included
                    </div>
                    <div className="text-lg font-semibold sm:text-xl">
                        Birr {total.toFixed(2)}
                    </div>
                </div>
                <div className="border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] rounded-none p-3">
                    <div
                        className="text-xs font-semibold uppercase"
                        style={{ color: "var(--theme-text-secondary)" }}
                    >
                        Budget entries
                    </div>
                    <div className="text-lg font-semibold sm:text-xl">
                        {budgets.length}
                    </div>
                </div>
                <div className="border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] rounded-none p-3">
                    <div
                        className="text-xs font-semibold uppercase"
                        style={{ color: "var(--theme-text-secondary)" }}
                    >
                        Next action
                    </div>
                    <div className="text-lg font-semibold sm:text-xl">
                        Add expense
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <GlassCard>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-base font-semibold text-[var(--theme-text)]">
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
                                className="border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] backdrop-blur-[20px] rounded-none transition-colors hover:bg-white/5 active:bg-white/[0.02] px-4 py-2 flex items-center gap-2 text-sm font-medium"
                                style={{ color: "var(--theme-accent)" }}
                                title="Generate due recurring expenses"
                            >
                                <RotateCcw className="w-4 h-4" />
                                <span className="hidden sm:inline">
                                    Generate Recurring
                                </span>
                            </button>
                        </div>
                        <p className="text-xs text-[var(--theme-text-secondary)]">
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
                            <h2 className="mb-4 px-4 pt-4 text-base font-semibold text-[var(--theme-text)]">
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
                                            <div className="mb-3 flex items-center justify-between">
                                                <span
                                                    className="border px-2 py-1 text-xs font-medium"
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
                                                    className="h-2 w-full overflow-hidden border"
                                                    style={{
                                                        backgroundColor:
                                                            "var(--theme-surface)",
                                                        borderColor:
                                                            "var(--theme-text-secondary)",
                                                        borderWidth: "1px",
                                                    }}
                                                >
                                                    <div
                                                        className="h-full transition-all duration-300 ease-out"
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
                                <p className="mt-4 px-4 pb-4 text-sm text-[var(--theme-text-secondary)]">
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
                description="Generate entries from active recurring rules and review before adding."
                actions={
                    recurringModalContent?.showAddButton ? (
                        <button
                            onClick={() => {
                                setShowRecurringModal(false);
                                setShowCreateModal(true);
                            }}
                            className={uiControl.buttonPrimary}
                        >
                            <Plus className="w-4 h-4" />
                            {modalCopy.expense.recurringConfirm}
                        </button>
                    ) : (
                        <button
                            onClick={() => setShowRecurringModal(false)}
                            className={uiControl.button}
                        >
                            {modalCopy.common.close}
                        </button>
                    )
                }
            >
                <p style={{ color: "var(--theme-text)" }}>
                    {recurringModalContent?.message}
                </p>
            </Modal>

            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title={modalCopy.expense.createTitle}
                description="Capture a new expense with type, amount, and optional recurring metadata."
            >
                <ExpenseForm
                    onAdd={(createdExpense) => {
                        addExpense(createdExpense);
                    }}
                />
            </Modal>

            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title={modalCopy.expense.editTitle}
                description="Adjust an existing entry and keep grouped history up to date."
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
                title={modalCopy.expense.deleteTitle}
                description="Permanently removes the selected expense from your records."
                actions={
                    <>
                        <button
                            onClick={() => {
                                setShowDeleteModal(false);
                                setDeletingExpenseId(null);
                            }}
                            className={uiControl.button}
                        >
                            {modalCopy.common.cancel}
                        </button>
                        <button
                            onClick={confirmDelete}
                            className={uiControl.buttonDanger}
                        >
                            {modalCopy.expense.deleteConfirm}
                        </button>
                    </>
                }
            >
                <p style={{ color: "var(--theme-text)" }}>
                    {modalCopy.expense.deleteBody}
                </p>
            </Modal>
        </PageContainer>
    );
}
