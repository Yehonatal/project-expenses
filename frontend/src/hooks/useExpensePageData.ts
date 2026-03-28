import { useEffect, useMemo, useState } from "react";
import API, { getBudgets } from "../api/api";
import type { Budget, Expense } from "../types/expense";

export function useExpensePageData(expenseUpdateTrigger?: number) {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const load = async () => {
            await Promise.all([fetchExpenses(), fetchBudgets()]);
            setLoading(false);
        };
        void load();
    }, [expenseUpdateTrigger]);

    const fetchExpenses = async () => {
        try {
            const res = await API.get<Expense[]>("/expenses");
            const next = res.data || [];
            setExpenses(next);
            const includedTotal = next
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

    const recurringCount = useMemo(
        () => expenses.filter((e) => e.isRecurring).length,
        [expenses],
    );

    const addExpense = (expense: Expense) => {
        setExpenses((prev) => [expense, ...prev]);
        if (expense.included) setTotal((prev) => prev + expense.amount);
    };

    const deleteExpense = async (expenseId: string) => {
        await API.delete(`/expenses/${expenseId}`);
        setExpenses((prev) => {
            const next = prev.filter((e) => e._id !== expenseId);
            const included = next.filter((e) => e.included);
            setTotal(included.reduce((s, e) => s + e.amount, 0));
            return next;
        });
    };

    const mergeUpdatedExpense = (updatedExpense: Expense) => {
        setExpenses((prev) =>
            prev.map((exp) =>
                exp._id === updatedExpense._id ? updatedExpense : exp,
            ),
        );

        const oldExpense = expenses.find((e) => e._id === updatedExpense._id);
        if (!oldExpense) return;

        const oldIncluded = oldExpense.included;
        const newIncluded = updatedExpense.included;

        if (oldIncluded !== newIncluded) {
            setTotal((prev) =>
                newIncluded
                    ? prev + updatedExpense.amount
                    : prev - updatedExpense.amount,
            );
        } else if (oldIncluded && oldExpense.amount !== updatedExpense.amount) {
            setTotal(
                (prev) => prev - oldExpense.amount + updatedExpense.amount,
            );
        }
    };

    return {
        expenses,
        total,
        budgets,
        loading,
        recurringCount,
        addExpense,
        deleteExpense,
        mergeUpdatedExpense,
    };
}
