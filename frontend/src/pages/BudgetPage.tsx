import { useState, useEffect } from "react";
import { getBudgets, setBudget, deleteBudget } from "../api/api";
import Loading from "../components/Loading";
import type { Budget } from "../types/expense";

export default function BudgetPage() {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const currentDate = new Date();
    const [startDate, setStartDate] = useState<string>(
        `${currentDate.getFullYear()}-${String(
            currentDate.getMonth() + 1
        ).padStart(2, "0")}`
    );
    const [endDate, setEndDate] = useState<string>(
        `${currentDate.getFullYear()}-${String(
            currentDate.getMonth() + 1
        ).padStart(2, "0")}`
    );
    const [totalBudget, setTotalBudget] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editStartDate, setEditStartDate] = useState<string>("");
    const [editEndDate, setEditEndDate] = useState<string>("");
    const [editTotalBudget, setEditTotalBudget] = useState<number>(0);

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
        const [startYearStr, startMonthStr] = startDate.split("-");
        const [endYearStr, endMonthStr] = endDate.split("-");
        try {
            const res = await setBudget({
                startMonth: parseInt(startMonthStr),
                startYear: parseInt(startYearStr),
                endMonth: parseInt(endMonthStr),
                endYear: parseInt(endYearStr),
                totalBudget,
            });
            setBudgets([...budgets, res.data]);
            setTotalBudget(0);
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
        setEditStartDate(
            `${budget.startYear}-${String(budget.startMonth).padStart(2, "0")}`
        );
        setEditEndDate(
            `${budget.endYear}-${String(budget.endMonth).padStart(2, "0")}`
        );
        setEditTotalBudget(budget.totalBudget);
    };

    const handleSaveEdit = async () => {
        if (!editingId) return;
        const [startYearStr, startMonthStr] = editStartDate.split("-");
        const [endYearStr, endMonthStr] = editEndDate.split("-");
        try {
            const res = await setBudget({
                startMonth: parseInt(startMonthStr),
                startYear: parseInt(startYearStr),
                endMonth: parseInt(endMonthStr),
                endYear: parseInt(endYearStr),
                totalBudget: editTotalBudget,
            });
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

    if (loading) return <Loading />;

    return (
        <div
            className="p-6 max-w-5xl mx-auto"
            style={{
                backgroundColor: "var(--theme-background)",
                color: "var(--theme-text)",
            }}
        >
            <h1 className="text-2xl font-bold mb-6">Budget Goals</h1>
            <div
                className="mb-6 p-4 rounded"
                style={{
                    backgroundColor: "var(--theme-surface)",
                    borderColor: "var(--theme-border)",
                    border: "1px solid",
                }}
            >
                <h2 className="text-lg mb-4">Set Multi-Month Budget</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block mb-1">Start Month</label>
                        <input
                            type="month"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="border p-2 rounded w-full"
                            style={{
                                backgroundColor: "var(--theme-background)",
                                color: "var(--theme-text)",
                                borderColor: "var(--theme-border)",
                            }}
                        />
                    </div>
                    <div>
                        <label className="block mb-1">End Month</label>
                        <input
                            type="month"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="border p-2 rounded w-full"
                            style={{
                                backgroundColor: "var(--theme-background)",
                                color: "var(--theme-text)",
                                borderColor: "var(--theme-border)",
                            }}
                        />
                    </div>
                </div>
                <input
                    type="number"
                    placeholder="Total Budget (e.g., 10000)"
                    value={totalBudget || ""}
                    onChange={(e) => setTotalBudget(Number(e.target.value))}
                    className="border p-2 rounded w-full mb-4"
                    style={{
                        backgroundColor: "var(--theme-background)",
                        color: "var(--theme-text)",
                        borderColor: "var(--theme-border)",
                    }}
                />
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
            <div>
                <h2 className="text-lg mb-4">Your Budgets</h2>
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
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block mb-1">
                                                Start Month
                                            </label>
                                            <input
                                                type="month"
                                                value={editStartDate}
                                                onChange={(e) =>
                                                    setEditStartDate(
                                                        e.target.value
                                                    )
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
                                                End Month
                                            </label>
                                            <input
                                                type="month"
                                                value={editEndDate}
                                                onChange={(e) =>
                                                    setEditEndDate(
                                                        e.target.value
                                                    )
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
                                    <input
                                        type="number"
                                        placeholder="Total Budget"
                                        value={editTotalBudget || ""}
                                        onChange={(e) =>
                                            setEditTotalBudget(
                                                Number(e.target.value)
                                            )
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
                                    <p>
                                        {budget.startMonth}/{budget.startYear} -{" "}
                                        {budget.endMonth}/{budget.endYear}: $
                                        {budget.spent} / ${budget.totalBudget}
                                    </p>
                                    <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
                                        <div
                                            className="h-4 rounded-full"
                                            style={{
                                                width: `${Math.min(
                                                    progress,
                                                    100
                                                )}%`,
                                                backgroundColor: isOverBudget
                                                    ? "#ef4444"
                                                    : "#22c55e", // Red for over, green for under
                                            }}
                                        ></div>
                                    </div>
                                    <p className="mt-2">
                                        {progress.toFixed(1)}% spent
                                    </p>
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            onClick={() => handleEdit(budget)}
                                            className="px-3 py-1 rounded cursor-pointer border-2 transition-colors"
                                            style={{
                                                backgroundColor:
                                                    "var(--theme-surface)",
                                                color: "var(--theme-text)",
                                                borderColor:
                                                    "var(--theme-text)",
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDelete(budget._id)
                                            }
                                            className="px-3 py-1 rounded cursor-pointer border-2 transition-colors"
                                            style={{
                                                backgroundColor:
                                                    "var(--theme-surface)",
                                                color: "var(--theme-text)",
                                                borderColor:
                                                    "var(--theme-error)",
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
