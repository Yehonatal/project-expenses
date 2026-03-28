import PageSkeleton from "../components/ui/PageSkeleton";
import PageContainer from "../components/ui/PageContainer";
import GlassCard from "../components/ui/GlassCard";
import SegmentedControl from "../components/ui/SegmentedControl";
import Toast from "../components/Toast";
import { useBudgetPageData } from "../hooks/useBudgetPageData";

export default function BudgetPage() {
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

    if (loading) return <PageSkeleton title="Loading budgets" />;

    return (
        <>
            <PageContainer title="Financial Goals" className="space-y-8">
                <div className="dashboard-hero flex flex-col lg:flex-row lg:items-center gap-6">
                    <div className="flex-1 space-y-2">
                        <div
                            className="text-xs uppercase tracking-[0.2em]"
                            style={{ color: "var(--theme-text-secondary)" }}
                        >
                            Budget planning
                        </div>
                        <h2 className="section-title text-2xl font-semibold">
                            Track your goals by period
                        </h2>
                        <p
                            className="text-sm"
                            style={{ color: "var(--theme-text-secondary)" }}
                        >
                            Keep monthly, weekly, and yearly budgets aligned
                            with your spending patterns.
                        </p>
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
                                Total budget
                            </div>
                            <div className="text-2xl font-semibold">
                                Birr {totalBudget.toLocaleString()}
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
                            Total spent
                        </div>
                        <div className="text-xl font-semibold">
                            Birr {totalSpent.toLocaleString()}
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div
                            className="text-xs font-semibold uppercase"
                            style={{ color: "var(--theme-text-secondary)" }}
                        >
                            Remaining
                        </div>
                        <div className="text-xl font-semibold">
                            Birr {(totalBudget - totalSpent).toLocaleString()}
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div
                            className="text-xs font-semibold uppercase"
                            style={{ color: "var(--theme-text-secondary)" }}
                        >
                            Active period
                        </div>
                        <div className="text-xl font-semibold capitalize">
                            {activeTab.replace("-", " ")}
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="space-y-6 lg:col-span-2">
                        <GlassCard>
                            <div className="mb-6">
                                <SegmentedControl
                                    options={tabs}
                                    value={activeTab}
                                    onChange={setActiveTab}
                                />
                            </div>

                            <div className="space-y-6">
                                {activeTab === "weekly" && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-theme-text-secondary">
                                                    Start Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={weeklyForm.startDate}
                                                    onChange={(e) =>
                                                        setWeeklyForm({
                                                            ...weeklyForm,
                                                            startDate:
                                                                e.target.value,
                                                        })
                                                    }
                                                    className="w-full glass-button rounded-xl"
                                                    style={{
                                                        color: "var(--theme-text)",
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-theme-text-secondary">
                                                    End Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={weeklyForm.endDate}
                                                    onChange={(e) =>
                                                        setWeeklyForm({
                                                            ...weeklyForm,
                                                            endDate:
                                                                e.target.value,
                                                        })
                                                    }
                                                    className="w-full glass-button rounded-xl"
                                                    style={{
                                                        color: "var(--theme-text)",
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-theme-text-secondary">
                                                Total Budget
                                            </label>
                                            <input
                                                type="number"
                                                placeholder="Enter total budget"
                                                value={
                                                    weeklyForm.totalBudget || ""
                                                }
                                                onChange={(e) =>
                                                    setWeeklyForm({
                                                        ...weeklyForm,
                                                        totalBudget: Number(
                                                            e.target.value,
                                                        ),
                                                    })
                                                }
                                                className="w-full glass-button rounded-xl"
                                                style={{
                                                    color: "var(--theme-text)",
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeTab === "monthly" && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-theme-text-secondary">
                                                Month
                                            </label>
                                            <input
                                                type="month"
                                                value={monthlyForm.month}
                                                onChange={(e) =>
                                                    setMonthlyForm({
                                                        ...monthlyForm,
                                                        month: e.target.value,
                                                    })
                                                }
                                                className="w-full glass-button rounded-xl"
                                                style={{
                                                    color: "var(--theme-text)",
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-theme-text-secondary">
                                                Total Budget
                                            </label>
                                            <input
                                                type="number"
                                                placeholder="Enter total budget"
                                                value={
                                                    monthlyForm.totalBudget ||
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    setMonthlyForm({
                                                        ...monthlyForm,
                                                        totalBudget: Number(
                                                            e.target.value,
                                                        ),
                                                    })
                                                }
                                                className="w-full glass-button rounded-xl"
                                                style={{
                                                    color: "var(--theme-text)",
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeTab === "multi-month" && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-theme-text-secondary">
                                                    Start Month
                                                </label>
                                                <input
                                                    type="month"
                                                    value={
                                                        multiMonthForm.startDate
                                                    }
                                                    onChange={(e) =>
                                                        setMultiMonthForm({
                                                            ...multiMonthForm,
                                                            startDate:
                                                                e.target.value,
                                                        })
                                                    }
                                                    className="w-full glass-button rounded-xl"
                                                    style={{
                                                        color: "var(--theme-text)",
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-theme-text-secondary">
                                                    End Month
                                                </label>
                                                <input
                                                    type="month"
                                                    value={
                                                        multiMonthForm.endDate
                                                    }
                                                    onChange={(e) =>
                                                        setMultiMonthForm({
                                                            ...multiMonthForm,
                                                            endDate:
                                                                e.target.value,
                                                        })
                                                    }
                                                    className="w-full glass-button rounded-xl"
                                                    style={{
                                                        color: "var(--theme-text)",
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-theme-text-secondary">
                                                Total Budget
                                            </label>
                                            <input
                                                type="number"
                                                placeholder="Enter total budget"
                                                value={
                                                    multiMonthForm.totalBudget ||
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    setMultiMonthForm({
                                                        ...multiMonthForm,
                                                        totalBudget: Number(
                                                            e.target.value,
                                                        ),
                                                    })
                                                }
                                                className="w-full glass-button rounded-xl"
                                                style={{
                                                    color: "var(--theme-text)",
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeTab === "yearly" && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-theme-text-secondary">
                                                Year
                                            </label>
                                            <input
                                                type="number"
                                                value={yearlyForm.year}
                                                onChange={(e) =>
                                                    setYearlyForm({
                                                        ...yearlyForm,
                                                        year: Number(
                                                            e.target.value,
                                                        ),
                                                    })
                                                }
                                                className="w-full glass-button rounded-xl"
                                                style={{
                                                    color: "var(--theme-text)",
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-theme-text-secondary">
                                                Total Budget
                                            </label>
                                            <input
                                                type="number"
                                                placeholder="Enter total budget"
                                                value={
                                                    yearlyForm.totalBudget || ""
                                                }
                                                onChange={(e) =>
                                                    setYearlyForm({
                                                        ...yearlyForm,
                                                        totalBudget: Number(
                                                            e.target.value,
                                                        ),
                                                    })
                                                }
                                                className="w-full glass-button rounded-xl"
                                                style={{
                                                    color: "var(--theme-text)",
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="pt-4">
                                    <button
                                        onClick={handleSetBudget}
                                        className="glass-button rounded-xl font-medium text-sm px-6 py-3 w-full sm:w-auto"
                                        style={{
                                            backgroundColor:
                                                "var(--theme-accent)",
                                            color: "var(--theme-background)",
                                        }}
                                    >
                                        Save Budget
                                    </button>
                                </div>
                            </div>
                        </GlassCard>
                    </div>

                    <div className="space-y-6 lg:col-span-2">
                        <div>
                            {budgets.map((budget) => {
                                const progress =
                                    (budget.spent /
                                        Math.max(budget.totalBudget, 1)) *
                                    100;
                                const isOverBudget = progress > 100;
                                return (
                                    <GlassCard
                                        key={budget._id}
                                        className="mb-6"
                                    >
                                        {editingId === budget._id ? (
                                            <div>
                                                <div className="mb-4">
                                                    <label className="block mb-2">
                                                        Budget Type
                                                    </label>
                                                    <select
                                                        value={editForm.type}
                                                        onChange={(e) =>
                                                            setEditForm({
                                                                ...editForm,
                                                                type: e.target
                                                                    .value as BudgetType,
                                                            })
                                                        }
                                                        className="glass-button rounded"
                                                        style={{
                                                            color: "var(--theme-text)",
                                                        }}
                                                    >
                                                        <option value="weekly">
                                                            Weekly
                                                        </option>
                                                        <option value="monthly">
                                                            Monthly
                                                        </option>
                                                        <option value="multi-month">
                                                            Multi-Month
                                                        </option>
                                                        <option value="yearly">
                                                            Yearly
                                                        </option>
                                                    </select>
                                                </div>

                                                {editForm.type === "weekly" && (
                                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                                        <div>
                                                            <label className="block mb-1">
                                                                Start Date
                                                            </label>
                                                            <input
                                                                type="date"
                                                                value={
                                                                    editForm.startDate ||
                                                                    ""
                                                                }
                                                                onChange={(e) =>
                                                                    setEditForm(
                                                                        {
                                                                            ...editForm,
                                                                            startDate:
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                        },
                                                                    )
                                                                }
                                                                className="w-full glass-button rounded-xl"
                                                                style={{
                                                                    color: "var(--theme-text)",
                                                                }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block mb-1">
                                                                End Date
                                                            </label>
                                                            <input
                                                                type="date"
                                                                value={
                                                                    editForm.endDate ||
                                                                    ""
                                                                }
                                                                onChange={(e) =>
                                                                    setEditForm(
                                                                        {
                                                                            ...editForm,
                                                                            endDate:
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                        },
                                                                    )
                                                                }
                                                                className="w-full glass-button rounded-xl"
                                                                style={{
                                                                    color: "var(--theme-text)",
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {editForm.type ===
                                                    "monthly" && (
                                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                                        <div>
                                                            <label className="block mb-1">
                                                                Month
                                                            </label>
                                                            <input
                                                                type="month"
                                                                value={`${
                                                                    editForm.startYear ||
                                                                    new Date().getFullYear()
                                                                }-${String(
                                                                    editForm.startMonth ||
                                                                        1,
                                                                ).padStart(
                                                                    2,
                                                                    "0",
                                                                )}`}
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    const [
                                                                        year,
                                                                        month,
                                                                    ] =
                                                                        e.target.value.split(
                                                                            "-",
                                                                        );
                                                                    setEditForm(
                                                                        {
                                                                            ...editForm,
                                                                            startMonth:
                                                                                parseInt(
                                                                                    month,
                                                                                ),
                                                                            startYear:
                                                                                parseInt(
                                                                                    year,
                                                                                ),
                                                                        },
                                                                    );
                                                                }}
                                                                className="w-full glass-button rounded-xl"
                                                                style={{
                                                                    color: "var(--theme-text)",
                                                                }}
                                                            />
                                                        </div>
                                                        <div></div>
                                                    </div>
                                                )}

                                                {editForm.type ===
                                                    "multi-month" && (
                                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                                        <div>
                                                            <label className="block mb-1">
                                                                Start Month
                                                            </label>
                                                            <input
                                                                type="month"
                                                                value={`${
                                                                    editForm.startYear ||
                                                                    new Date().getFullYear()
                                                                }-${String(
                                                                    editForm.startMonth ||
                                                                        1,
                                                                ).padStart(
                                                                    2,
                                                                    "0",
                                                                )}`}
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    const [
                                                                        year,
                                                                        month,
                                                                    ] =
                                                                        e.target.value.split(
                                                                            "-",
                                                                        );
                                                                    setEditForm(
                                                                        {
                                                                            ...editForm,
                                                                            startMonth:
                                                                                parseInt(
                                                                                    month,
                                                                                ),
                                                                            startYear:
                                                                                parseInt(
                                                                                    year,
                                                                                ),
                                                                        },
                                                                    );
                                                                }}
                                                                className="w-full glass-button rounded-xl"
                                                                style={{
                                                                    color: "var(--theme-text)",
                                                                }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block mb-1">
                                                                End Month
                                                            </label>
                                                            <input
                                                                type="month"
                                                                value={`${
                                                                    editForm.endYear ||
                                                                    new Date().getFullYear()
                                                                }-${String(
                                                                    editForm.endMonth ||
                                                                        1,
                                                                ).padStart(
                                                                    2,
                                                                    "0",
                                                                )}`}
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    const [
                                                                        year,
                                                                        month,
                                                                    ] =
                                                                        e.target.value.split(
                                                                            "-",
                                                                        );
                                                                    setEditForm(
                                                                        {
                                                                            ...editForm,
                                                                            endMonth:
                                                                                parseInt(
                                                                                    month,
                                                                                ),
                                                                            endYear:
                                                                                parseInt(
                                                                                    year,
                                                                                ),
                                                                        },
                                                                    );
                                                                }}
                                                                className="w-full glass-button rounded-xl"
                                                                style={{
                                                                    color: "var(--theme-text)",
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {editForm.type === "yearly" && (
                                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                                        <div>
                                                            <label className="block mb-1">
                                                                Year
                                                            </label>
                                                            <input
                                                                type="number"
                                                                value={
                                                                    editForm.year ||
                                                                    new Date().getFullYear()
                                                                }
                                                                onChange={(e) =>
                                                                    setEditForm(
                                                                        {
                                                                            ...editForm,
                                                                            year: Number(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            ),
                                                                        },
                                                                    )
                                                                }
                                                                className="w-full glass-button rounded-xl"
                                                                style={{
                                                                    color: "var(--theme-text)",
                                                                }}
                                                            />
                                                        </div>
                                                        <div></div>
                                                    </div>
                                                )}

                                                <input
                                                    type="number"
                                                    placeholder="Total Budget"
                                                    value={
                                                        editForm.totalBudget ||
                                                        ""
                                                    }
                                                    onChange={(e) =>
                                                        setEditForm({
                                                            ...editForm,
                                                            totalBudget: Number(
                                                                e.target.value,
                                                            ),
                                                        })
                                                    }
                                                    className="w-full mb-4 glass-button rounded-xl"
                                                    style={{
                                                        color: "var(--theme-text)",
                                                    }}
                                                />

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleSaveEdit}
                                                        className="px-3 py-1 rounded cursor-pointer border-2 transition-colors"
                                                        style={{
                                                            backgroundColor:
                                                                "var(--theme-surface)",
                                                            color: "var(--theme-text)",
                                                            borderColor:
                                                                "var(--theme-primary)",
                                                        }}
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={
                                                            handleCancelEdit
                                                        }
                                                        className="px-3 py-1 rounded cursor-pointer border-2 transition-colors"
                                                        style={{
                                                            backgroundColor:
                                                                "var(--theme-surface)",
                                                            color: "var(--theme-text)",
                                                            borderColor:
                                                                "var(--theme-border)",
                                                        }}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <h3
                                                            className="text-base font-semibold"
                                                            style={{
                                                                color: "var(--theme-text)",
                                                            }}
                                                        >
                                                            {budget.type
                                                                .charAt(0)
                                                                .toUpperCase() +
                                                                budget.type
                                                                    .slice(1)
                                                                    .replace(
                                                                        "-",
                                                                        " ",
                                                                    )}
                                                        </h3>
                                                        <span
                                                            className="text-xs px-2 py-0.5 rounded-full text-center min-w-20"
                                                            style={{
                                                                backgroundColor:
                                                                    "var(--theme-surface)",
                                                                color: "var(--theme-text-secondary)",
                                                            }}
                                                        >
                                                            {formatBudgetPeriod(
                                                                budget,
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() =>
                                                                handleEdit(
                                                                    budget,
                                                                )
                                                            }
                                                            className="glass-button text-xs px-2 py-1 rounded-md transition-all hover:bg-theme-surface/50"
                                                            style={{
                                                                color: "var(--theme-text)",
                                                            }}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    budget._id,
                                                                )
                                                            }
                                                            className="glass-button text-xs px-2 py-1 rounded-md transition-all hover:bg-red-500/20"
                                                            style={{
                                                                color: "#ef4444",
                                                            }}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between">
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
                                                            className="text-lg font-bold"
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
                                                            className="text-lg font-bold"
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
                                                            className={`text-lg font-bold ${
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
                                                                    : progress >
                                                                        80
                                                                      ? "text-yellow-500"
                                                                      : "text-green-500"
                                                            }`}
                                                        >
                                                            {progress.toFixed(
                                                                0,
                                                            )}
                                                            %
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
                                        )}
                                    </GlassCard>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </PageContainer>
            <Toast message={toast?.message} type={toast?.type} />
        </>
    );
}
