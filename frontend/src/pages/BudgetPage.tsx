import { useState, useEffect } from "react";
// motion removed; PageContainer handles page-level animation
import { getBudgets, setBudget, deleteBudget } from "../api/api";
import Loading from "../components/Loading";
import PageContainer from "../components/ui/PageContainer";
import GlassCard from "../components/ui/GlassCard";
import SegmentedControl from "../components/ui/SegmentedControl";
import Toast from "../components/Toast";
import type { Budget } from "../types/expense";

type BudgetType = "weekly" | "monthly" | "multi-month" | "yearly";

// Edit form and payload types for stricter typing
type EditForm = Partial<Budget> & { type: BudgetType; totalBudget?: number };
type BudgetPayload = Partial<Budget> & {
    type: BudgetType;
    totalBudget: number;
};

export default function BudgetPage() {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [activeTab, setActiveTab] = useState<BudgetType>("monthly");
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [toast, setToast] = useState<
        { message: string; type: "success" | "error" | "info" } | undefined
    >(undefined);

    // Form states for different budget types
    const [weeklyForm, setWeeklyForm] = useState({
        startDate: "",
        endDate: "",
        totalBudget: 0,
    });

    const [monthlyForm, setMonthlyForm] = useState({
        month: "",
        year: new Date().getFullYear(),
        totalBudget: 0,
    });

    const [multiMonthForm, setMultiMonthForm] = useState({
        startDate: "",
        endDate: "",
        totalBudget: 0,
    });

    const [yearlyForm, setYearlyForm] = useState({
        year: new Date().getFullYear(),
        totalBudget: 0,
    });

    // Edit form states
    const [editForm, setEditForm] = useState<EditForm>({
        type: "monthly" as BudgetType,
        startDate: "",
        endDate: "",
        startMonth: 0,
        startYear: 0,
        endMonth: 0,
        endYear: 0,
        year: 0,
        totalBudget: 0,
    });

    useEffect(() => {
        fetchBudgets();
    }, []);

    const fetchBudgets = async () => {
        try {
            const res = await getBudgets();
            setBudgets(res.data);
        } catch (err) {
            console.error("Failed to load budgets", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSetBudget = async () => {
        let budgetData: BudgetPayload = { type: activeTab, totalBudget: 0 };

        try {
            switch (activeTab) {
                case "weekly":
                    budgetData = {
                        type: "weekly",
                        startDate: weeklyForm.startDate,
                        endDate: weeklyForm.endDate,
                        totalBudget: weeklyForm.totalBudget,
                    };
                    break;
                case "monthly": {
                    const [year, month] = monthlyForm.month.split("-");
                    budgetData = {
                        type: "monthly",
                        startMonth: parseInt(month || "0"),
                        startYear: parseInt(year || "0"),
                        totalBudget: monthlyForm.totalBudget,
                    };
                    break;
                }
                case "multi-month": {
                    const [startYear, startMonth] = multiMonthForm.startDate
                        ? multiMonthForm.startDate.split("-")
                        : ["0", "0"];
                    const [endYear, endMonth] = multiMonthForm.endDate
                        ? multiMonthForm.endDate.split("-")
                        : ["0", "0"];
                    budgetData = {
                        type: "multi-month",
                        startMonth: parseInt(startMonth || "0"),
                        startYear: parseInt(startYear || "0"),
                        endMonth: parseInt(endMonth || "0"),
                        endYear: parseInt(endYear || "0"),
                        totalBudget: multiMonthForm.totalBudget,
                    };
                    break;
                }
                case "yearly":
                    budgetData = {
                        type: "yearly",
                        year: yearlyForm.year,
                        totalBudget: yearlyForm.totalBudget,
                    };
                    break;
            }

            const res = await setBudget(budgetData);
            setBudgets((prev) => [...prev, res.data]);

            // Reset form
            setWeeklyForm({ startDate: "", endDate: "", totalBudget: 0 });
            setMonthlyForm({
                month: "",
                year: new Date().getFullYear(),
                totalBudget: 0,
            });
            setMultiMonthForm({ startDate: "", endDate: "", totalBudget: 0 });
            setYearlyForm({ year: new Date().getFullYear(), totalBudget: 0 });

            setToast({
                message: `${
                    activeTab.charAt(0).toUpperCase() +
                    activeTab.slice(1).replace("-", " ")
                } budget created successfully!`,
                type: "success",
            });
        } catch (err) {
            console.error("Failed to set budget", err);
            setToast({
                message: "Failed to create budget. Please try again.",
                type: "error",
            });
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteBudget(id);
            setBudgets((prev) => prev.filter((b) => b._id !== id));
            setToast({
                message: "Budget deleted successfully!",
                type: "success",
            });
        } catch (err) {
            console.error("Failed to delete budget", err);
            setToast({
                message: "Failed to delete budget. Please try again.",
                type: "error",
            });
        }
    };

    const handleEdit = (budget: Budget) => {
        setEditingId(budget._id);
        setEditForm({ ...budget });
    };

    const handleSaveEdit = async () => {
        if (!editingId) return;
        try {
            const payload: BudgetPayload = {
                type: editForm.type,
                totalBudget: editForm.totalBudget ?? 0,
                startDate: editForm.startDate,
                endDate: editForm.endDate,
                startMonth: editForm.startMonth,
                startYear: editForm.startYear,
                endMonth: editForm.endMonth,
                endYear: editForm.endYear,
                year: editForm.year,
            };
            const res = await setBudget(payload);
            setBudgets((prev) =>
                prev.map((b) => (b._id === editingId ? res.data : b))
            );
            setEditingId(null);
            setToast({
                message: "Budget updated successfully!",
                type: "success",
            });
        } catch (err) {
            console.error("Failed to update budget", err);
            setToast({
                message: "Failed to update budget. Please try again.",
                type: "error",
            });
        }
    };

    const handleCancelEdit = () => setEditingId(null);

    const formatBudgetPeriod = (budget: Budget) => {
        switch (budget.type) {
            case "weekly":
                if (budget.startDate && budget.endDate) {
                    const start = new Date(budget.startDate).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric" }
                    );
                    const end = new Date(budget.endDate).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric", year: "numeric" }
                    );
                    return `${start} - ${end}`;
                }
                return "Invalid dates";
            case "monthly":
                return `${budget.startMonth}/${budget.startYear}`;
            case "multi-month":
                return `${budget.startMonth}/${budget.startYear} - ${budget.endMonth}/${budget.endYear}`;
            case "yearly":
                return `${budget.year}`;
            default:
                return "Unknown";
        }
    };

    // Segmented control helpers
    const tabs: BudgetType[] = ["weekly", "monthly", "multi-month", "yearly"];
    // refs are handled inside SegmentedControl now

    // keyboard handling moved into SegmentedControl

    if (loading) return <Loading />;

    return (
        <>
            <PageContainer title="Budget Goals" className="space-y-6">
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
                                                    startDate: e.target.value,
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
                                                    endDate: e.target.value,
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
                                        value={weeklyForm.totalBudget || ""}
                                        onChange={(e) =>
                                            setWeeklyForm({
                                                ...weeklyForm,
                                                totalBudget: Number(
                                                    e.target.value
                                                ),
                                            })
                                        }
                                        className="w-full glass-button rounded-xl"
                                        style={{ color: "var(--theme-text)" }}
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
                                        style={{ color: "var(--theme-text)" }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-theme-text-secondary">
                                        Total Budget
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="Enter total budget"
                                        value={monthlyForm.totalBudget || ""}
                                        onChange={(e) =>
                                            setMonthlyForm({
                                                ...monthlyForm,
                                                totalBudget: Number(
                                                    e.target.value
                                                ),
                                            })
                                        }
                                        className="w-full glass-button rounded-xl"
                                        style={{ color: "var(--theme-text)" }}
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
                                            value={multiMonthForm.startDate}
                                            onChange={(e) =>
                                                setMultiMonthForm({
                                                    ...multiMonthForm,
                                                    startDate: e.target.value,
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
                                            value={multiMonthForm.endDate}
                                            onChange={(e) =>
                                                setMultiMonthForm({
                                                    ...multiMonthForm,
                                                    endDate: e.target.value,
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
                                        value={multiMonthForm.totalBudget || ""}
                                        onChange={(e) =>
                                            setMultiMonthForm({
                                                ...multiMonthForm,
                                                totalBudget: Number(
                                                    e.target.value
                                                ),
                                            })
                                        }
                                        className="w-full glass-button rounded-xl"
                                        style={{ color: "var(--theme-text)" }}
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
                                                year: Number(e.target.value),
                                            })
                                        }
                                        className="w-full glass-button rounded-xl"
                                        style={{ color: "var(--theme-text)" }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-theme-text-secondary">
                                        Total Budget
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="Enter total budget"
                                        value={yearlyForm.totalBudget || ""}
                                        onChange={(e) =>
                                            setYearlyForm({
                                                ...yearlyForm,
                                                totalBudget: Number(
                                                    e.target.value
                                                ),
                                            })
                                        }
                                        className="w-full glass-button rounded-xl"
                                        style={{ color: "var(--theme-text)" }}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="pt-4">
                            <button
                                onClick={handleSetBudget}
                                className="glass-button rounded-xl font-medium px-6 py-3 w-full sm:w-auto"
                                style={{
                                    backgroundColor: "var(--theme-accent)",
                                    color: "var(--theme-background)",
                                }}
                            >
                                Save Budget
                            </button>
                        </div>
                    </div>
                </GlassCard>

                <div>
                    <h2 className="text-xs sm:text-sm lg:text-sm mb-4">
                        Your Budgets
                    </h2>
                    {budgets.map((budget) => {
                        const progress =
                            (budget.spent / Math.max(budget.totalBudget, 1)) *
                            100;
                        const isOverBudget = progress > 100;
                        return (
                            <GlassCard key={budget._id} className="mb-6">
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
                                                            setEditForm({
                                                                ...editForm,
                                                                startDate:
                                                                    e.target
                                                                        .value,
                                                            })
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
                                                            setEditForm({
                                                                ...editForm,
                                                                endDate:
                                                                    e.target
                                                                        .value,
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

                                        {editForm.type === "monthly" && (
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
                                                                1
                                                        ).padStart(2, "0")}`}
                                                        onChange={(e) => {
                                                            const [
                                                                year,
                                                                month,
                                                            ] =
                                                                e.target.value.split(
                                                                    "-"
                                                                );
                                                            setEditForm({
                                                                ...editForm,
                                                                startMonth:
                                                                    parseInt(
                                                                        month
                                                                    ),
                                                                startYear:
                                                                    parseInt(
                                                                        year
                                                                    ),
                                                            });
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

                                        {editForm.type === "multi-month" && (
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
                                                                1
                                                        ).padStart(2, "0")}`}
                                                        onChange={(e) => {
                                                            const [
                                                                year,
                                                                month,
                                                            ] =
                                                                e.target.value.split(
                                                                    "-"
                                                                );
                                                            setEditForm({
                                                                ...editForm,
                                                                startMonth:
                                                                    parseInt(
                                                                        month
                                                                    ),
                                                                startYear:
                                                                    parseInt(
                                                                        year
                                                                    ),
                                                            });
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
                                                                1
                                                        ).padStart(2, "0")}`}
                                                        onChange={(e) => {
                                                            const [
                                                                year,
                                                                month,
                                                            ] =
                                                                e.target.value.split(
                                                                    "-"
                                                                );
                                                            setEditForm({
                                                                ...editForm,
                                                                endMonth:
                                                                    parseInt(
                                                                        month
                                                                    ),
                                                                endYear:
                                                                    parseInt(
                                                                        year
                                                                    ),
                                                            });
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
                                                            setEditForm({
                                                                ...editForm,
                                                                year: Number(
                                                                    e.target
                                                                        .value
                                                                ),
                                                            })
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
                                            value={editForm.totalBudget || ""}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    totalBudget: Number(
                                                        e.target.value
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
                                                onClick={handleCancelEdit}
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
                                        {/* Header with type and actions */}
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
                                                            .replace("-", " ")}
                                                </h3>
                                                <span
                                                    className="text-xs px-2 py-0.5 rounded-full text-center min-w-[80px]"
                                                    style={{
                                                        backgroundColor:
                                                            "var(--theme-surface)",
                                                        color: "var(--theme-text-secondary)",
                                                    }}
                                                >
                                                    {formatBudgetPeriod(budget)}
                                                </span>
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() =>
                                                        handleEdit(budget)
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
                                                        handleDelete(budget._id)
                                                    }
                                                    className="glass-button text-xs px-2 py-1 rounded-md transition-all hover:bg-red-500/20"
                                                    style={{ color: "#ef4444" }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>

                                        {/* Budget amounts in one line */}
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
                                                    className={`text-lg font-bold ${
                                                        budget.spent >
                                                        budget.totalBudget
                                                            ? "text-red-500"
                                                            : "text-green-500"
                                                    }`}
                                                >
                                                    {Math.abs(
                                                        budget.totalBudget -
                                                            budget.spent
                                                    ).toLocaleString("en-US", {
                                                        minimumFractionDigits: 0,
                                                        maximumFractionDigits: 0,
                                                    })}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Progress bar with percentage */}
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
                                                                : progress > 80
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
            </PageContainer>
            <Toast message={toast?.message} type={toast?.type} />
        </>
    );
}
