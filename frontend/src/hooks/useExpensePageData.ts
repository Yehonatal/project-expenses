import { useEffect, useMemo, useState } from "react";
import API, { getBudgets, getExpensesPaged } from "../api/api";
import type { Budget, Expense, ExpenseFilterParams } from "../types/expense";

const DEFAULT_PAGE_SIZE = 20;

export function useExpensePageData(
    expenseUpdateTrigger?: number,
    expenseQuery?: ExpenseFilterParams,
) {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: DEFAULT_PAGE_SIZE,
        total: 0,
        totalPages: 1,
    });
    const [recurringCount, setRecurringCount] = useState(0);

    const queryKey = useMemo(
        () => JSON.stringify(expenseQuery || {}),
        [expenseQuery],
    );

    useEffect(() => {
        setLoading(true);
        const load = async () => {
            await Promise.all([fetchExpenses(), fetchBudgets()]);
            setLoading(false);
        };
        void load();
    }, [expenseUpdateTrigger, queryKey]);

    const fetchExpenses = async () => {
        try {
            const res = await getExpensesPaged({
                ...expenseQuery,
                page: expenseQuery?.page || 1,
                limit: expenseQuery?.limit || DEFAULT_PAGE_SIZE,
            });
            const paged = res.data;
            setExpenses(paged.items || []);
            setTotal(paged.includedTotal || 0);
            setRecurringCount(paged.recurringCount || 0);
            setPagination({
                page: paged.page || 1,
                limit: paged.limit || DEFAULT_PAGE_SIZE,
                total: paged.total || 0,
                totalPages: paged.totalPages || 1,
            });
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

    const addExpense = async (_expense: Expense) => {
        await fetchExpenses();
    };

    const deleteExpense = async (expenseId: string) => {
        await API.delete(`/expenses/${expenseId}`);
        await fetchExpenses();
    };

    const mergeUpdatedExpense = async (updatedExpense: Expense) => {
        setExpenses((prev) =>
            prev.map((exp) =>
                exp._id === updatedExpense._id ? updatedExpense : exp,
            ),
        );
        await fetchExpenses();
    };

    return {
        expenses,
        total,
        budgets,
        loading,
        recurringCount,
        pagination,
        addExpense,
        deleteExpense,
        mergeUpdatedExpense,
    };
}
