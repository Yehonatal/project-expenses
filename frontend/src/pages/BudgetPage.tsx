import { useState, useEffect } from "react";
import { getBudgets, setBudget, deleteBudget } from "../api/api";
import Loading from "../components/Loading";
import type { Budget } from "../types/expense";

type BudgetType = "weekly" | "monthly" | "multi-month" | "yearly";

export default function BudgetPage() {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [activeTab, setActiveTab] = useState<BudgetType>("monthly");
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);

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
    const [editForm, setEditForm] = useState({
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
        let budgetData: {
            type: BudgetType;
            startDate?: string;
            endDate?: string;
            startMonth?: number;
            startYear?: number;
            endMonth?: number;
            endYear?: number;
            year?: number;
            totalBudget: number;
        } = { type: activeTab, totalBudget: 0 };

        switch (activeTab) {
            case "weekly": {
                budgetData = {
                    type: "weekly",
                    startDate: weeklyForm.startDate,
                    endDate: weeklyForm.endDate,
                    totalBudget: weeklyForm.totalBudget,
                };
                break;
            }
            case "monthly": {
                const [year, month] = monthlyForm.month.split("-");
                budgetData = {
                    type: "monthly",
                    startMonth: parseInt(month),
                    startYear: parseInt(year),
                    totalBudget: monthlyForm.totalBudget,
                };
                break;
            }
            case "multi-month": {
                const [startYear, startMonth] =
                    multiMonthForm.startDate.split("-");
                const [endYear, endMonth] = multiMonthForm.endDate.split("-");
                budgetData = {
                    type: "multi-month",
                    startMonth: parseInt(startMonth),
                    startYear: parseInt(startYear),
                    endMonth: parseInt(endMonth),
                    endYear: parseInt(endYear),
                    totalBudget: multiMonthForm.totalBudget,
                };
                break;
            }
            case "yearly": {
                budgetData = {
                    type: "yearly",
                    year: yearlyForm.year,
                    totalBudget: yearlyForm.totalBudget,
                };
                break;
            }
        }

        try {
            const res = await setBudget(budgetData);
            setBudgets([...budgets, res.data]);

            // Reset form
            switch (activeTab) {
                case "weekly":
                    setWeeklyForm({
                        startDate: "",
                        endDate: "",
                        totalBudget: 0,
                    });
                    break;
                case "monthly":
                    setMonthlyForm({
                        month: "",
                        year: new Date().getFullYear(),
                        totalBudget: 0,
                    });
                    break;
                case "multi-month":
                    setMultiMonthForm({
                        startDate: "",
                        endDate: "",
                        totalBudget: 0,
                    });
                    break;
                case "yearly":
                    setYearlyForm({
                        year: new Date().getFullYear(),
                        totalBudget: 0,
                    });
                    break;
            }
        } catch (err) {
            console.error("Failed to set budget", err);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteBudget(id);
            setBudgets(budgets.filter((b) => b._id !== id));
        } catch (err) {
            console.error("Failed to delete budget", err);
        }
    };

    const handleEdit = (budget: Budget) => {
        setEditingId(budget._id);
        setEditForm({
            type: budget.type,
            startDate: budget.startDate || "",
            endDate: budget.endDate || "",
            startMonth: budget.startMonth || 0,
            startYear: budget.startYear || 0,
            endMonth: budget.endMonth || 0,
            endYear: budget.endYear || 0,
            year: budget.year || 0,
            totalBudget: budget.totalBudget,
        });
    };

    const handleSaveEdit = async () => {
        if (!editingId) return;

        try {
            const res = await setBudget(editForm);
            setBudgets(
                budgets.map((b) => (b._id === editingId ? res.data : b))
            );
            setEditingId(null);
        } catch (err) {
            console.error("Failed to update budget", err);
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
    };

    const formatBudgetPeriod = (budget: Budget) => {
        switch (budget.type) {
            case "weekly":
                return `${budget.startDate} - ${budget.endDate}`;
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

    if (loading) return <Loading />;

    return (
        <div
            className="p-6 max-w-5xl mx-auto"
            style={{
                backgroundColor: "var(--theme-background)",
                color: "var(--theme-text)",
            }}
        >
            <h1 className="text-sm sm:text-base lg:text-base font-bold mb-6">
                Budget Goals
            </h1>

            {/* Tabs */}
            <div className="mb-6">
                <div className="flex space-x-1 mb-4">
                    {(
                        [
                            "weekly",
                            "monthly",
                            "multi-month",
                            "yearly",
                        ] as BudgetType[]
                    ).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-t cursor-pointer transition-colors ${
                                activeTab === tab
                                    ? "border-b-2"
                                    : "hover:opacity-80"
                            }`}
                            style={{
                                backgroundColor:
                                    activeTab === tab
                                        ? "var(--theme-surface)"
                                        : "var(--theme-background)",
                                color: "var(--theme-text)",
                                borderColor:
                                    activeTab === tab
                                        ? "var(--theme-primary)"
                                        : "transparent",
                            }}
                        >
                            {tab.charAt(0).toUpperCase() +
                                tab.slice(1).replace("-", " ")}
                        </button>
                    ))}
                </div>

                {/* Budget Form */}
                <div
                    className="p-4 rounded"
                    style={{
                        backgroundColor: "var(--theme-surface)",
                        borderColor: "var(--theme-border)",
                        border: "1px solid",
                    }}
                >
                    {activeTab === "weekly" && (
                        <div>
                            <h2 className="text-xs sm:text-sm lg:text-sm mb-4">
                                Set Weekly Budget
                            </h2>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block mb-1">
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
                                        className="border p-2 rounded w-full"
                                        style={{
                                            backgroundColor:
                                                "var(--theme-background)",
                                            color: "var(--theme-text)",
                                            borderColor: "var(--theme-border)",
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1">
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
                                        className="border p-2 rounded w-full"
                                        style={{
                                            backgroundColor:
                                                "var(--theme-background)",
                                            color: "var(--theme-text)",
                                            borderColor: "var(--theme-border)",
                                        }}
                                    />
                                </div>
                            </div>
                            <input
                                type="number"
                                placeholder="Total Budget (e.g., 500)"
                                value={weeklyForm.totalBudget || ""}
                                onChange={(e) =>
                                    setWeeklyForm({
                                        ...weeklyForm,
                                        totalBudget: Number(e.target.value),
                                    })
                                }
                                className="border p-2 rounded w-full mb-4"
                                style={{
                                    backgroundColor: "var(--theme-background)",
                                    color: "var(--theme-text)",
                                    borderColor: "var(--theme-border)",
                                }}
                            />
                        </div>
                    )}

                    {activeTab === "monthly" && (
                        <div>
                            <h2 className="text-xs sm:text-sm lg:text-sm mb-4">
                                Set Monthly Budget
                            </h2>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block mb-1">Month</label>
                                    <input
                                        type="month"
                                        value={monthlyForm.month}
                                        onChange={(e) =>
                                            setMonthlyForm({
                                                ...monthlyForm,
                                                month: e.target.value,
                                            })
                                        }
                                        className="border p-2 rounded w-full"
                                        style={{
                                            backgroundColor:
                                                "var(--theme-background)",
                                            color: "var(--theme-text)",
                                            borderColor: "var(--theme-border)",
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1">Year</label>
                                    <input
                                        type="number"
                                        value={monthlyForm.year}
                                        onChange={(e) =>
                                            setMonthlyForm({
                                                ...monthlyForm,
                                                year: Number(e.target.value),
                                            })
                                        }
                                        className="border p-2 rounded w-full"
                                        style={{
                                            backgroundColor:
                                                "var(--theme-background)",
                                            color: "var(--theme-text)",
                                            borderColor: "var(--theme-border)",
                                        }}
                                    />
                                </div>
                            </div>
                            <input
                                type="number"
                                placeholder="Total Budget (e.g., 2000)"
                                value={monthlyForm.totalBudget || ""}
                                onChange={(e) =>
                                    setMonthlyForm({
                                        ...monthlyForm,
                                        totalBudget: Number(e.target.value),
                                    })
                                }
                                className="border p-2 rounded w-full mb-4"
                                style={{
                                    backgroundColor: "var(--theme-background)",
                                    color: "var(--theme-text)",
                                    borderColor: "var(--theme-border)",
                                }}
                            />
                        </div>
                    )}

                    {activeTab === "multi-month" && (
                        <div>
                            <h2 className="text-xs sm:text-sm lg:text-sm mb-4">
                                Set Multi-Month Budget
                            </h2>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block mb-1">
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
                                        className="border p-2 rounded w-full"
                                        style={{
                                            backgroundColor:
                                                "var(--theme-background)",
                                            color: "var(--theme-text)",
                                            borderColor: "var(--theme-border)",
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1">
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
                                        className="border p-2 rounded w-full"
                                        style={{
                                            backgroundColor:
                                                "var(--theme-background)",
                                            color: "var(--theme-text)",
                                            borderColor: "var(--theme-border)",
                                        }}
                                    />
                                </div>
                            </div>
                            <input
                                type="number"
                                placeholder="Total Budget (e.g., 10000)"
                                value={multiMonthForm.totalBudget || ""}
                                onChange={(e) =>
                                    setMultiMonthForm({
                                        ...multiMonthForm,
                                        totalBudget: Number(e.target.value),
                                    })
                                }
                                className="border p-2 rounded w-full mb-4"
                                style={{
                                    backgroundColor: "var(--theme-background)",
                                    color: "var(--theme-text)",
                                    borderColor: "var(--theme-border)",
                                }}
                            />
                        </div>
                    )}

                    {activeTab === "yearly" && (
                        <div>
                            <h2 className="text-xs sm:text-sm lg:text-sm mb-4">
                                Set Yearly Budget
                            </h2>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block mb-1">Year</label>
                                    <input
                                        type="number"
                                        value={yearlyForm.year}
                                        onChange={(e) =>
                                            setYearlyForm({
                                                ...yearlyForm,
                                                year: Number(e.target.value),
                                            })
                                        }
                                        className="border p-2 rounded w-full"
                                        style={{
                                            backgroundColor:
                                                "var(--theme-background)",
                                            color: "var(--theme-text)",
                                            borderColor: "var(--theme-border)",
                                        }}
                                    />
                                </div>
                                <div></div>
                            </div>
                            <input
                                type="number"
                                placeholder="Total Budget (e.g., 24000)"
                                value={yearlyForm.totalBudget || ""}
                                onChange={(e) =>
                                    setYearlyForm({
                                        ...yearlyForm,
                                        totalBudget: Number(e.target.value),
                                    })
                                }
                                className="border p-2 rounded w-full mb-4"
                                style={{
                                    backgroundColor: "var(--theme-background)",
                                    color: "var(--theme-text)",
                                    borderColor: "var(--theme-border)",
                                }}
                            />
                        </div>
                    )}

                    <button
                        onClick={handleSetBudget}
                        className="px-4 py-2 rounded cursor-pointer border-2 transition-colors"
                        style={{
                            backgroundColor: "var(--theme-surface)",
                            color: "var(--theme-text)",
                            borderColor: "var(--theme-primary)",
                        }}
                    >
                        Save Budget
                    </button>
                </div>
            </div>

            {/* Budgets List */}
            <div>
                <h2 className="text-xs sm:text-sm lg:text-sm mb-4">
                    Your Budgets
                </h2>
                {budgets.map((budget) => {
                    const progress = (budget.spent / budget.totalBudget) * 100;
                    const isOverBudget = progress > 100;
                    return (
                        <div
                            key={budget._id}
                            className="mb-4 p-4 rounded"
                            style={{
                                backgroundColor: "var(--theme-surface)",
                                borderColor: "var(--theme-border)",
                                border: "1px solid",
                            }}
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
                                            className="border p-2 rounded"
                                            style={{
                                                backgroundColor:
                                                    "var(--theme-background)",
                                                color: "var(--theme-text)",
                                                borderColor:
                                                    "var(--theme-border)",
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
                                                    value={editForm.startDate}
                                                    onChange={(e) =>
                                                        setEditForm({
                                                            ...editForm,
                                                            startDate:
                                                                e.target.value,
                                                        })
                                                    }
                                                    className="border p-2 rounded w-full"
                                                    style={{
                                                        backgroundColor:
                                                            "var(--theme-background)",
                                                        color: "var(--theme-text)",
                                                        borderColor:
                                                            "var(--theme-border)",
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <label className="block mb-1">
                                                    End Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={editForm.endDate}
                                                    onChange={(e) =>
                                                        setEditForm({
                                                            ...editForm,
                                                            endDate:
                                                                e.target.value,
                                                        })
                                                    }
                                                    className="border p-2 rounded w-full"
                                                    style={{
                                                        backgroundColor:
                                                            "var(--theme-background)",
                                                        color: "var(--theme-text)",
                                                        borderColor:
                                                            "var(--theme-border)",
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
                                                        editForm.startYear
                                                    }-${String(
                                                        editForm.startMonth
                                                    ).padStart(2, "0")}`}
                                                    onChange={(e) => {
                                                        const [year, month] =
                                                            e.target.value.split(
                                                                "-"
                                                            );
                                                        setEditForm({
                                                            ...editForm,
                                                            startMonth:
                                                                parseInt(month),
                                                            startYear:
                                                                parseInt(year),
                                                        });
                                                    }}
                                                    className="border p-2 rounded w-full"
                                                    style={{
                                                        backgroundColor:
                                                            "var(--theme-background)",
                                                        color: "var(--theme-text)",
                                                        borderColor:
                                                            "var(--theme-border)",
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
                                                        editForm.startYear
                                                    }-${String(
                                                        editForm.startMonth
                                                    ).padStart(2, "0")}`}
                                                    onChange={(e) => {
                                                        const [year, month] =
                                                            e.target.value.split(
                                                                "-"
                                                            );
                                                        setEditForm({
                                                            ...editForm,
                                                            startMonth:
                                                                parseInt(month),
                                                            startYear:
                                                                parseInt(year),
                                                        });
                                                    }}
                                                    className="border p-2 rounded w-full"
                                                    style={{
                                                        backgroundColor:
                                                            "var(--theme-background)",
                                                        color: "var(--theme-text)",
                                                        borderColor:
                                                            "var(--theme-border)",
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
                                                        editForm.endYear
                                                    }-${String(
                                                        editForm.endMonth
                                                    ).padStart(2, "0")}`}
                                                    onChange={(e) => {
                                                        const [year, month] =
                                                            e.target.value.split(
                                                                "-"
                                                            );
                                                        setEditForm({
                                                            ...editForm,
                                                            endMonth:
                                                                parseInt(month),
                                                            endYear:
                                                                parseInt(year),
                                                        });
                                                    }}
                                                    className="border p-2 rounded w-full"
                                                    style={{
                                                        backgroundColor:
                                                            "var(--theme-background)",
                                                        color: "var(--theme-text)",
                                                        borderColor:
                                                            "var(--theme-border)",
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
                                                    value={editForm.year}
                                                    onChange={(e) =>
                                                        setEditForm({
                                                            ...editForm,
                                                            year: Number(
                                                                e.target.value
                                                            ),
                                                        })
                                                    }
                                                    className="border p-2 rounded w-full"
                                                    style={{
                                                        backgroundColor:
                                                            "var(--theme-background)",
                                                        color: "var(--theme-text)",
                                                        borderColor:
                                                            "var(--theme-border)",
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
                                        className="border p-2 rounded w-full mb-4"
                                        style={{
                                            backgroundColor:
                                                "var(--theme-background)",
                                            color: "var(--theme-text)",
                                            borderColor: "var(--theme-border)",
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
                                <>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-semibold">
                                            {budget.type
                                                .charAt(0)
                                                .toUpperCase() +
                                                budget.type
                                                    .slice(1)
                                                    .replace("-", " ")}
                                            : {formatBudgetPeriod(budget)}
                                        </span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() =>
                                                    handleEdit(budget)
                                                }
                                                className="px-3 py-1 rounded cursor-pointer border-2 transition-colors text-xs"
                                                style={{
                                                    backgroundColor:
                                                        "var(--theme-surface)",
                                                    color: "var(--theme-text)",
                                                    borderColor:
                                                        "var(--theme-primary)",
                                                }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(budget._id)
                                                }
                                                className="px-3 py-1 rounded cursor-pointer border-2 transition-colors text-xs"
                                                style={{
                                                    backgroundColor:
                                                        "var(--theme-surface)",
                                                    color: "var(--theme-text)",
                                                    borderColor:
                                                        "var(--theme-secondary)",
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                    <p className="mb-2">
                                        Spent: Birr {budget.spent.toFixed(2)} /
                                        Budget: Birr{" "}
                                        {budget.totalBudget.toFixed(2)}
                                    </p>
                                    <div className="w-full bg-gray-200 rounded-full h-4">
                                        <div
                                            className="h-4 rounded-full"
                                            style={{
                                                width: `${Math.min(
                                                    progress,
                                                    100
                                                )}%`,
                                                backgroundColor: isOverBudget
                                                    ? "#ef4444"
                                                    : "#22c55e",
                                            }}
                                        ></div>
                                    </div>
                                    <p className="mt-2 text-xs">
                                        {progress.toFixed(1)}% used
                                        {isOverBudget && (
                                            <span className="text-red-500 ml-2">
                                                (Over budget by Birr{" "}
                                                {(
                                                    budget.spent -
                                                    budget.totalBudget
                                                ).toFixed(2)}
                                                )
                                            </span>
                                        )}
                                    </p>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
