import { useMemo, useState } from "react";
import { BarChart3, Pencil, Plus, Trash2 } from "lucide-react";
import {
    BarChart,
    Bar,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Legend,
} from "recharts";
import PageSkeleton from "../components/ui/PageSkeleton";
import PageContainer from "../components/ui/PageContainer";
import GlassCard from "../components/ui/GlassCard";
import Toast from "../components/Toast";
import Modal from "../components/Modal";
import BudgetCreateModal from "../components/BudgetCreateModal";
import { useBudgetPageData, type BudgetType } from "../hooks/useBudgetPageData";
import { modalCopy } from "../content/modalCopy";

export default function GoalsPage() {
    const {
        budgets,
        activeTab,
        loading,
        editingId,
        toast,
        weeklyForm,
        monthlyForm,
        multiMonthForm,
        yearlyForm,
        editForm,
        totalBudget,
        totalSpent,
        tabs,
        setActiveTab,
        setWeeklyForm,
        setMonthlyForm,
        setMultiMonthForm,
        setYearlyForm,
        setEditForm,
        handleSetBudget,
        handleDelete,
        handleEdit,
        handleSaveEdit,
        handleCancelEdit,
        formatBudgetPeriod,
    } = useBudgetPageData();

    const [showCreateModal, setShowCreateModal] = useState(false);

    const chartData = useMemo(
        () =>
            budgets.map((budget) => ({
                name: formatBudgetPeriod(budget),
                budget: Number(budget.totalBudget) || 0,
                spent: Number(budget.spent) || 0,
            })),
        [budgets, formatBudgetPeriod],
    );

    if (loading) return <PageSkeleton title="Loading goals" />;

    return (
        <>
            <PageContainer title="Financial Goals" className="space-y-8">
                <div className="border border-[var(--theme-glass-border)] bg-gradient-to-br from-white/60 to-white/10 rounded-none p-4 flex flex-col lg:flex-row lg:items-center gap-6">
                    <div className="flex-1 space-y-2">
                        <div
                            className="text-xs uppercase tracking-[0.2em]"
                            style={{ color: "var(--theme-text-secondary)" }}
                        >
                            Goal planning
                        </div>
                        <h2 className="font-['Playfair_Display'] tracking-[-0.01em] text-2xl font-semibold">
                            Set spending goals by period
                        </h2>
                        <p
                            className="text-sm"
                            style={{ color: "var(--theme-text-secondary)" }}
                        >
                            Keep goals clean and manageable with modal-first
                            actions and progress charts.
                        </p>
                        <button
                            type="button"
                            onClick={() => setShowCreateModal(true)}
                            className="border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] backdrop-blur-[20px] rounded-none transition-colors hover:bg-white/5 active:bg-white/[0.02] mt-2 inline-flex items-center gap-2 text-sm font-medium"
                            style={{
                                backgroundColor: "var(--theme-active)",
                                color: "var(--theme-text)",
                            }}
                        >
                            <Plus size={16} />
                            Create Goal
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-6">
                        <div>
                            <div
                                className="text-xs uppercase tracking-[0.2em]"
                                style={{ color: "var(--theme-text-secondary)" }}
                            >
                                Active goals
                            </div>
                            <div className="text-2xl font-semibold">
                                {budgets.length}
                            </div>
                        </div>
                        <div>
                            <div
                                className="text-xs uppercase tracking-[0.2em]"
                                style={{ color: "var(--theme-text-secondary)" }}
                            >
                                Remaining
                            </div>
                            <div className="text-2xl font-semibold">
                                Birr{" "}
                                {(totalBudget - totalSpent).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="kpi-strip">
                    <div className="border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] rounded-none p-3">
                        <div
                            className="text-xs font-semibold uppercase"
                            style={{ color: "var(--theme-text-secondary)" }}
                        >
                            Total budget
                        </div>
                        <div className="text-xl font-semibold">
                            Birr {totalBudget.toLocaleString()}
                        </div>
                    </div>
                    <div className="border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] rounded-none p-3">
                        <div
                            className="text-xs font-semibold uppercase"
                            style={{ color: "var(--theme-text-secondary)" }}
                        >
                            Total spent
                        </div>
                        <div className="text-xl font-semibold">
                            Birr {totalSpent.toLocaleString()}
                        </div>
                    </div>
                    <div className="border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] rounded-none p-3">
                        <div
                            className="text-xs font-semibold uppercase"
                            style={{ color: "var(--theme-text-secondary)" }}
                        >
                            Average usage
                        </div>
                        <div className="text-xl font-semibold">
                            {totalBudget > 0
                                ? `${((totalSpent / totalBudget) * 100).toFixed(1)}%`
                                : "0.0%"}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <GlassCard className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-['Playfair_Display'] tracking-[-0.01em] text-base font-semibold">
                                    Goals Overview
                                </h3>
                                <span
                                    className="text-xs"
                                    style={{
                                        color: "var(--theme-text-secondary)",
                                    }}
                                >
                                    Budget vs spent
                                </span>
                            </div>
                            {chartData.length === 0 ? (
                                <p
                                    className="text-sm"
                                    style={{
                                        color: "var(--theme-text-secondary)",
                                    }}
                                >
                                    No goals yet. Create your first goal.
                                </p>
                            ) : (
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart
                                        data={chartData}
                                        margin={{
                                            top: 8,
                                            right: 8,
                                            left: 0,
                                            bottom: 0,
                                        }}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="2 2"
                                            vertical={false}
                                        />
                                        <XAxis
                                            dataKey="name"
                                            tick={{ fontSize: 10 }}
                                        />
                                        <YAxis tick={{ fontSize: 10 }} />
                                        <Tooltip
                                            formatter={(value) =>
                                                `Birr ${Number(value || 0).toLocaleString()}`
                                            }
                                        />
                                        <Legend />
                                        <Bar
                                            dataKey="budget"
                                            name="Budget"
                                            fill="var(--theme-secondary)"
                                        />
                                        <Bar
                                            dataKey="spent"
                                            name="Spent"
                                            fill="var(--theme-accent)"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </GlassCard>
                    </div>

                    <div>
                        <GlassCard className="p-4 h-full">
                            <div className="flex items-center gap-2 mb-3">
                                <BarChart3 size={16} />
                                <h3 className="font-['Playfair_Display'] tracking-[-0.01em] text-base font-semibold">
                                    Current Focus
                                </h3>
                            </div>
                            <p
                                className="text-sm"
                                style={{ color: "var(--theme-text-secondary)" }}
                            >
                                {budgets.length > 0
                                    ? "Monitor goals near or above 80% usage and rebalance spending before month end."
                                    : "Create a weekly or monthly goal to start tracking progress."}
                            </p>
                        </GlassCard>
                    </div>
                </div>

                <div className="space-y-4">
                    {budgets.length === 0 && (
                        <GlassCard>
                            <p
                                className="text-sm"
                                style={{ color: "var(--theme-text-secondary)" }}
                            >
                                No goals available.
                            </p>
                        </GlassCard>
                    )}

                    {budgets.map((budget) => {
                        const progress =
                            (budget.spent / Math.max(budget.totalBudget, 1)) *
                            100;
                        const remaining = Math.max(
                            budget.totalBudget - budget.spent,
                            0,
                        );

                        return (
                            <GlassCard key={budget._id} className="p-4">
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                                    <div>
                                        <div className="text-sm font-semibold capitalize">
                                            {budget.type.replace("-", " ")}
                                        </div>
                                        <div
                                            className="text-xs"
                                            style={{
                                                color: "var(--theme-text-secondary)",
                                            }}
                                        >
                                            {formatBudgetPeriod(budget)}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleEdit(budget)}
                                            className="border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] backdrop-blur-[20px] rounded-none transition-colors hover:bg-white/5 active:bg-white/[0.02] inline-flex items-center gap-1 text-xs"
                                            style={{
                                                color: "var(--theme-text)",
                                            }}
                                        >
                                            <Pencil size={12} />
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDelete(budget._id)
                                            }
                                            className="border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] backdrop-blur-[20px] rounded-none transition-colors hover:bg-white/5 active:bg-white/[0.02] inline-flex items-center gap-1 text-xs"
                                            style={{ color: "#b91c1c" }}
                                        >
                                            <Trash2 size={12} />
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3 mb-3">
                                    <div>
                                        <div
                                            className="text-xs"
                                            style={{
                                                color: "var(--theme-text-secondary)",
                                            }}
                                        >
                                            Budget
                                        </div>
                                        <div className="text-sm font-semibold">
                                            {budget.totalBudget.toLocaleString()}
                                        </div>
                                    </div>
                                    <div>
                                        <div
                                            className="text-xs"
                                            style={{
                                                color: "var(--theme-text-secondary)",
                                            }}
                                        >
                                            Spent
                                        </div>
                                        <div className="text-sm font-semibold">
                                            {budget.spent.toLocaleString()}
                                        </div>
                                    </div>
                                    <div>
                                        <div
                                            className="text-xs"
                                            style={{
                                                color: "var(--theme-text-secondary)",
                                            }}
                                        >
                                            Remaining
                                        </div>
                                        <div className="text-sm font-semibold">
                                            {remaining.toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className="h-2 border"
                                    style={{
                                        borderColor: "var(--theme-border)",
                                        backgroundColor: "var(--theme-surface)",
                                    }}
                                >
                                    <div
                                        className="h-full"
                                        style={{
                                            width: `${Math.min(progress, 100)}%`,
                                            backgroundColor:
                                                progress >= 100
                                                    ? "#dc2626"
                                                    : progress >= 80
                                                      ? "#d97706"
                                                      : "#15803d",
                                        }}
                                    />
                                </div>
                                <p
                                    className="text-xs mt-2"
                                    style={{
                                        color: "var(--theme-text-secondary)",
                                    }}
                                >
                                    {progress.toFixed(1)}% used
                                </p>
                            </GlassCard>
                        );
                    })}
                </div>
            </PageContainer>

            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title={modalCopy.goals.createTitle}
                maxWidthClass="max-w-4xl"
            >
                <BudgetCreateModal
                    activeTab={activeTab}
                    tabs={tabs}
                    weeklyForm={weeklyForm}
                    monthlyForm={monthlyForm}
                    multiMonthForm={multiMonthForm}
                    yearlyForm={yearlyForm}
                    setActiveTab={setActiveTab}
                    setWeeklyForm={setWeeklyForm}
                    setMonthlyForm={setMonthlyForm}
                    setMultiMonthForm={setMultiMonthForm}
                    setYearlyForm={setYearlyForm}
                    onCancel={() => setShowCreateModal(false)}
                    onSave={() => {
                        void (async () => {
                            await handleSetBudget();
                            setShowCreateModal(false);
                        })();
                    }}
                />
            </Modal>

            <Modal
                isOpen={Boolean(editingId)}
                onClose={handleCancelEdit}
                title={modalCopy.goals.editTitle}
                maxWidthClass="max-w-3xl"
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-theme-text-secondary">
                            Goal Type
                        </label>
                        <select
                            value={editForm.type}
                            onChange={(e) =>
                                setEditForm({
                                    ...editForm,
                                    type: e.target.value as BudgetType,
                                })
                            }
                            className="w-full border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] backdrop-blur-[20px] rounded-none transition-colors hover:bg-white/5 active:bg-white/[0.02]"
                            style={{ color: "var(--theme-text)" }}
                        >
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="multi-month">Multi-Month</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-theme-text-secondary">
                            Total Budget
                        </label>
                        <input
                            type="number"
                            value={editForm.totalBudget || ""}
                            onChange={(e) =>
                                setEditForm({
                                    ...editForm,
                                    totalBudget: Number(e.target.value),
                                })
                            }
                            className="w-full border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] backdrop-blur-[20px] rounded-none transition-colors hover:bg-white/5 active:bg-white/[0.02]"
                            style={{ color: "var(--theme-text)" }}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] backdrop-blur-[20px] rounded-none transition-colors hover:bg-white/5 active:bg-white/[0.02] text-sm"
                            style={{ color: "var(--theme-text)" }}
                        >
                            {modalCopy.common.cancel}
                        </button>
                        <button
                            type="button"
                            onClick={handleSaveEdit}
                            className="border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] backdrop-blur-[20px] rounded-none transition-colors hover:bg-white/5 active:bg-white/[0.02] text-sm"
                            style={{
                                backgroundColor: "var(--theme-active)",
                                color: "var(--theme-text)",
                            }}
                        >
                            {modalCopy.goals.editConfirm}
                        </button>
                    </div>
                </div>
            </Modal>

            <Toast message={toast?.message} type={toast?.type} />
        </>
    );
}
