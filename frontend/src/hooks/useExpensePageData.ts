import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import API, { getBudgets, getExpensesPaged } from "../api/api";
import type { Budget, Expense, ExpenseFilterParams } from "../types/expense";

const DEFAULT_PAGE_SIZE = 50;

export function useExpensePageData(
    expenseUpdateTrigger?: number,
    expenseQuery?: ExpenseFilterParams,
) {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [isFetching, setIsFetching] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: DEFAULT_PAGE_SIZE,
        total: 0,
        totalPages: 1,
    });
    const [recurringCount, setRecurringCount] = useState(0);
    const latestRequestIdRef = useRef(0);

    const queryKey = useMemo(
        () => JSON.stringify(expenseQuery || {}),
        [expenseQuery],
    );

    const fetchExpenses = useCallback(async () => {
        const requestId = latestRequestIdRef.current + 1;
        latestRequestIdRef.current = requestId;
        setIsFetching(true);
        try {
            const res = await getExpensesPaged({
                ...expenseQuery,
                page: expenseQuery?.page || 1,
                limit: expenseQuery?.limit || DEFAULT_PAGE_SIZE,
            });

            if (requestId !== latestRequestIdRef.current) {
                return;
            }

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
        } finally {
            if (requestId === latestRequestIdRef.current) {
                setIsFetching(false);
                setInitialLoading(false);
            }
        }
    }, [expenseQuery]);

    const fetchBudgets = useCallback(async () => {
        try {
            const res = await getBudgets();
            setBudgets(res.data || []);
        } catch (error) {
            console.error("Failed to fetch budgets:", error);
        }
    }, []);

    useEffect(() => {
        void fetchExpenses();
    }, [expenseUpdateTrigger, queryKey, fetchExpenses]);

    useEffect(() => {
        let mounted = true;

        const loadBudgets = async () => {
            await fetchBudgets();
            if (!mounted) return;
        };

        void loadBudgets();

        return () => {
            mounted = false;
        };
    }, [fetchBudgets]);

    const addExpense = async (_expense: Expense) => {
        await fetchExpenses();
        await fetchBudgets();
    };

    const deleteExpense = async (expenseId: string) => {
        await API.delete(`/expenses/${expenseId}`);
        await fetchExpenses();
        await fetchBudgets();
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
        loading: initialLoading,
        initialLoading,
        isFetching,
        recurringCount,
        pagination,
        addExpense,
        deleteExpense,
        mergeUpdatedExpense,
    };
}
