import { useEffect, useMemo, useState } from "react";
import { deleteBudget, getBudgets, setBudget } from "../api/api";
import type { Budget } from "../types/expense";

export type BudgetType = "weekly" | "monthly" | "multi-month" | "yearly";

type EditForm = Partial<Budget> & { type: BudgetType; totalBudget?: number };

type BudgetPayload = Partial<Budget> & {
    type: BudgetType;
    totalBudget: number;
};

export function useBudgetPageData() {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [activeTab, setActiveTab] = useState<BudgetType>("monthly");
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [toast, setToast] = useState<
        { message: string; type: "success" | "error" | "info" } | undefined
    >(undefined);

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

    const [editForm, setEditForm] = useState<EditForm>({
        type: "monthly",
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
        void fetchBudgets();
    }, []);

    const totalBudget = useMemo(
        () =>
            budgets.reduce((sum, budget) => sum + (budget.totalBudget || 0), 0),
        [budgets],
    );

    const totalSpent = useMemo(
        () => budgets.reduce((sum, budget) => sum + (budget.spent || 0), 0),
        [budgets],
    );

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
                prev.map((b) => (b._id === editingId ? res.data : b)),
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
                        {
                            month: "short",
                            day: "numeric",
                        },
                    );
                    const end = new Date(budget.endDate).toLocaleDateString(
                        "en-US",
                        {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        },
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

    return {
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
        tabs: ["weekly", "monthly", "multi-month", "yearly"] as BudgetType[],
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
    };
}
