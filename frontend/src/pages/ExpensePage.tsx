import { useEffect, useMemo, useState } from "react";
import type { Expense, ExpenseFilterPreset } from "../types/expense";
import ExpenseTable from "../components/ExpenseTable";
import ExpenseForm from "../components/ExpenseForm";
import Modal from "../components/Modal";
import {
    RotateCcw,
    Plus,
    Save,
    Star,
    Trash2,
    Loader2,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import PageContainer from "../components/ui/PageContainer";
import GlassCard from "../components/ui/GlassCard";
import { formatBudgetPeriod } from "../utils/dateFormatter";
import PageSkeleton from "../components/ui/PageSkeleton";
import { useExpensePageData } from "../hooks/useExpensePageData";
import { modalCopy } from "../content/modalCopy";
import { uiControl } from "../utils/uiClasses";
import {
    createExpenseFilterPreset,
    deleteExpenseFilterPreset,
    getExpenseFilterPresets,
    setDefaultExpenseFilterPreset,
} from "../api/api";

const DEFAULT_FILTERS = {
    keyword: "",
    fromDate: "",
    toDate: "",
    minAmount: "",
    maxAmount: "",
    includeMode: "all" as "all" | "included" | "excluded",
    recurringMode: "all" as "all" | "recurring" | "non-recurring",
    category: "all",
    tag: "",
};

export default function ExpensePage({
    expenseUpdateTrigger,
}: {
    expenseUpdateTrigger?: number;
}) {
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
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const [debouncedFilters, setDebouncedFilters] = useState(filters);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);
    const [filterPresets, setFilterPresets] = useState<ExpenseFilterPreset[]>(
        [],
    );
    const [presetName, setPresetName] = useState("");
    const [presetStatus, setPresetStatus] = useState("");
    const [presetBusy, setPresetBusy] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedFilters(filters);
        }, 300);

        return () => clearTimeout(timeout);
    }, [filters]);

    useEffect(() => {
        setPage(1);
    }, [debouncedFilters]);

    const toPresetQuery = useMemo(
        () =>
            (current = filters) => ({
                from: current.fromDate || undefined,
                to: current.toDate || undefined,
                included:
                    current.includeMode === "all"
                        ? undefined
                        : current.includeMode === "included",
                type: current.category === "all" ? undefined : current.category,
                tags: current.tag.trim() || undefined,
                minAmount: current.minAmount || undefined,
                maxAmount: current.maxAmount || undefined,
                isRecurring:
                    current.recurringMode === "all"
                        ? undefined
                        : current.recurringMode === "recurring",
                keyword: current.keyword.trim() || undefined,
            }),
        [filters],
    );

    const loadPresets = async () => {
        try {
            const res = await getExpenseFilterPresets();
            const presets = res.data || [];
            setFilterPresets(presets);

            const defaultPreset = presets.find((preset) => preset.isDefault);
            if (defaultPreset) {
                applyPreset(defaultPreset);
            }
        } catch (error) {
            console.error("Failed to load filter presets:", error);
        }
    };

    useEffect(() => {
        void loadPresets();
    }, []);

    const applyPreset = (preset: ExpenseFilterPreset) => {
        const saved = preset.filters || {};
        setFilters({
            keyword: saved.keyword || "",
            fromDate: saved.from || "",
            toDate: saved.to || "",
            minAmount: saved.minAmount || "",
            maxAmount: saved.maxAmount || "",
            includeMode:
                saved.included === undefined
                    ? "all"
                    : saved.included
                      ? "included"
                      : "excluded",
            recurringMode:
                saved.isRecurring === undefined
                    ? "all"
                    : saved.isRecurring
                      ? "recurring"
                      : "non-recurring",
            category: saved.type || "all",
            tag: saved.tags || "",
        });

        if (saved.limit && Number.isFinite(Number(saved.limit))) {
            setPageSize(Number(saved.limit));
        }

        setPage(1);
        setPresetStatus(`Applied \"${preset.name}\" preset.`);
    };

    const handleSavePreset = async () => {
        const name = presetName.trim();
        if (!name) {
            setPresetStatus("Enter a preset name before saving.");
            return;
        }

        setPresetBusy(true);
        try {
            await createExpenseFilterPreset({
                name,
                filters: { ...toPresetQuery(filters), limit: pageSize },
            });
            setPresetName("");
            await loadPresets();
            setPresetStatus(`Saved \"${name}\" preset.`);
        } catch (error) {
            console.error("Failed to save preset:", error);
            setPresetStatus("Could not save preset right now.");
        } finally {
            setPresetBusy(false);
        }
    };

    const handleDeletePreset = async (presetId: string) => {
        setPresetBusy(true);
        try {
            await deleteExpenseFilterPreset(presetId);
            setFilterPresets((prev) =>
                prev.filter((item) => item._id !== presetId),
            );
            setPresetStatus("Preset deleted.");
        } catch (error) {
            console.error("Failed to delete preset:", error);
            setPresetStatus("Could not delete preset right now.");
        } finally {
            setPresetBusy(false);
        }
    };

    const handleSetDefaultPreset = async (presetId: string) => {
        setPresetBusy(true);
        try {
            const res = await setDefaultExpenseFilterPreset(presetId);
            const updated = res.data;
            setFilterPresets((prev) =>
                prev.map((item) => ({
                    ...item,
                    isDefault: item._id === updated._id,
                })),
            );
            setPresetStatus(`\"${updated.name}\" is now your default preset.`);
        } catch (error) {
            console.error("Failed to set default preset:", error);
            setPresetStatus("Could not set default preset right now.");
        } finally {
            setPresetBusy(false);
        }
    };

    const expenseQuery = useMemo(
        () => ({
            from: debouncedFilters.fromDate || undefined,
            to: debouncedFilters.toDate || undefined,
            included:
                debouncedFilters.includeMode === "all"
                    ? undefined
                    : debouncedFilters.includeMode === "included",
            type:
                debouncedFilters.category === "all"
                    ? undefined
                    : debouncedFilters.category,
            tags: debouncedFilters.tag.trim() || undefined,
            minAmount: debouncedFilters.minAmount || undefined,
            maxAmount: debouncedFilters.maxAmount || undefined,
            isRecurring:
                debouncedFilters.recurringMode === "all"
                    ? undefined
                    : debouncedFilters.recurringMode === "recurring",
            keyword: debouncedFilters.keyword.trim() || undefined,
            page,
            limit: pageSize,
        }),
        [debouncedFilters, page, pageSize],
    );

    const {
        expenses,
        total,
        budgets,
        initialLoading,
        isFetching,
        recurringCount,
        pagination,
        addExpense,
        deleteExpense,
        mergeUpdatedExpense,
    } = useExpensePageData(expenseUpdateTrigger, expenseQuery);

    const uniqueCategories = useMemo(
        () => Array.from(new Set(expenses.map((exp) => exp.type))).sort(),
        [expenses],
    );

    const uniqueTags = useMemo(
        () =>
            Array.from(
                new Set(
                    expenses.flatMap((exp) =>
                        (exp.tags || []).map((tag) => tag.toLowerCase()),
                    ),
                ),
            ).sort(),
        [expenses],
    );

    const hasNextPage = page < pagination.totalPages;
    const hasPrevPage = page > 1;

    const visiblePageNumbers = useMemo(() => {
        const totalPages = pagination.totalPages || 1;
        const windowSize = 5;

        if (totalPages <= windowSize) {
            return Array.from({ length: totalPages }, (_, idx) => idx + 1);
        }

        const start = Math.max(1, page - 2);
        const end = Math.min(totalPages, start + windowSize - 1);
        const adjustedStart = Math.max(1, end - windowSize + 1);

        return Array.from(
            { length: end - adjustedStart + 1 },
            (_, idx) => adjustedStart + idx,
        );
    }, [page, pagination.totalPages]);

    const pageStartItem =
        pagination.total === 0 ? 0 : (page - 1) * pageSize + 1;
    const pageEndItem = Math.min(page * pageSize, pagination.total);

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

    if (initialLoading) {
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
                        <h2 className="app-heading text-xl font-semibold tracking-[-0.01em] sm:text-2xl">
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
                        Filtered results
                    </div>
                    <div className="text-lg font-semibold sm:text-xl">
                        {pagination.total}
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
                            Auto-create due recurring expenses • Showing{" "}
                            {expenses.length} entries on this page
                        </p>
                    </GlassCard>

                    <GlassCard className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                            <h3 className="text-sm font-semibold">
                                Advanced Search & Filters
                            </h3>
                            <button
                                type="button"
                                className={uiControl.button}
                                onClick={() => setFilters(DEFAULT_FILTERS)}
                            >
                                Clear filters
                            </button>
                        </div>

                        <div className="space-y-2 border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--theme-text-secondary)]">
                                Saved presets
                            </p>

                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <input
                                    className={`${uiControl.input} mt-0 sm:flex-1`}
                                    value={presetName}
                                    onChange={(e) =>
                                        setPresetName(e.target.value)
                                    }
                                    placeholder="e.g. monthly essentials"
                                />
                                <button
                                    type="button"
                                    className={`${uiControl.buttonPrimary} h-10 px-4 whitespace-nowrap sm:min-w-[140px]`}
                                    onClick={() => void handleSavePreset()}
                                    disabled={presetBusy}
                                >
                                    <Save className="h-4 w-4" />
                                    Save preset
                                </button>
                            </div>

                            {filterPresets.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {filterPresets.map((preset) => (
                                        <div
                                            key={preset._id}
                                            className="inline-flex items-center gap-1 border border-[var(--theme-border)] bg-[var(--theme-background)] p-1"
                                        >
                                            <button
                                                type="button"
                                                className="px-2 py-1 text-xs font-medium hover:bg-[var(--theme-hover)]"
                                                onClick={() =>
                                                    applyPreset(preset)
                                                }
                                            >
                                                {preset.name}
                                                {preset.isDefault
                                                    ? " (default)"
                                                    : ""}
                                            </button>
                                            <button
                                                type="button"
                                                className="inline-flex h-6 w-6 items-center justify-center text-[var(--theme-text-secondary)] hover:bg-[var(--theme-hover)]"
                                                onClick={() =>
                                                    void handleSetDefaultPreset(
                                                        preset._id,
                                                    )
                                                }
                                                aria-label={`Set ${preset.name} as default`}
                                                title={`Set ${preset.name} as default`}
                                                disabled={presetBusy}
                                            >
                                                <Star
                                                    className={`h-3.5 w-3.5 ${preset.isDefault ? "text-amber-500" : ""}`}
                                                />
                                            </button>
                                            <button
                                                type="button"
                                                className="inline-flex h-6 w-6 items-center justify-center text-[var(--theme-text-secondary)] hover:bg-[var(--theme-hover)]"
                                                onClick={() =>
                                                    void handleDeletePreset(
                                                        preset._id,
                                                    )
                                                }
                                                aria-label={`Delete ${preset.name}`}
                                                title={`Delete ${preset.name}`}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-[var(--theme-text-secondary)]">
                                    No presets yet. Save your current filter
                                    setup to reuse it.
                                </p>
                            )}

                            {presetStatus && (
                                <p className="text-xs text-[var(--theme-text-secondary)]">
                                    {presetStatus}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            <div>
                                <label className={uiControl.label}>
                                    Keyword
                                </label>
                                <input
                                    className={uiControl.input}
                                    value={filters.keyword}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            keyword: e.target.value,
                                        }))
                                    }
                                    placeholder="description, type, tag"
                                />
                            </div>

                            <div>
                                <label className={uiControl.label}>
                                    From date
                                </label>
                                <input
                                    type="date"
                                    className={uiControl.input}
                                    value={filters.fromDate}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            fromDate: e.target.value,
                                        }))
                                    }
                                />
                            </div>

                            <div>
                                <label className={uiControl.label}>
                                    To date
                                </label>
                                <input
                                    type="date"
                                    className={uiControl.input}
                                    value={filters.toDate}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            toDate: e.target.value,
                                        }))
                                    }
                                />
                            </div>

                            <div>
                                <label className={uiControl.label}>
                                    Min amount
                                </label>
                                <input
                                    type="number"
                                    className={uiControl.inputRight}
                                    value={filters.minAmount}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            minAmount: e.target.value,
                                        }))
                                    }
                                    placeholder="0"
                                />
                            </div>

                            <div>
                                <label className={uiControl.label}>
                                    Max amount
                                </label>
                                <input
                                    type="number"
                                    className={uiControl.inputRight}
                                    value={filters.maxAmount}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            maxAmount: e.target.value,
                                        }))
                                    }
                                    placeholder="5000"
                                />
                            </div>

                            <div>
                                <label className={uiControl.label}>
                                    Include mode
                                </label>
                                <select
                                    className={uiControl.select}
                                    value={filters.includeMode}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            includeMode: e.target.value as
                                                | "all"
                                                | "included"
                                                | "excluded",
                                        }))
                                    }
                                >
                                    <option value="all">All</option>
                                    <option value="included">
                                        Included only
                                    </option>
                                    <option value="excluded">
                                        Excluded only
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label className={uiControl.label}>
                                    Recurring
                                </label>
                                <select
                                    className={uiControl.select}
                                    value={filters.recurringMode}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            recurringMode: e.target.value as
                                                | "all"
                                                | "recurring"
                                                | "non-recurring",
                                        }))
                                    }
                                >
                                    <option value="all">All</option>
                                    <option value="recurring">
                                        Recurring only
                                    </option>
                                    <option value="non-recurring">
                                        Non-recurring only
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label className={uiControl.label}>
                                    Category
                                </label>
                                <select
                                    className={uiControl.select}
                                    value={filters.category}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            category: e.target.value,
                                        }))
                                    }
                                >
                                    <option value="all">All categories</option>
                                    {uniqueCategories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className={uiControl.label}>Tag</label>
                                <input
                                    list="expense-tag-suggestions"
                                    className={uiControl.input}
                                    value={filters.tag}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            tag: e.target.value,
                                        }))
                                    }
                                    placeholder="e.g. transport"
                                />
                                <datalist id="expense-tag-suggestions">
                                    {uniqueTags.map((tag) => (
                                        <option key={tag} value={tag} />
                                    ))}
                                </datalist>
                            </div>
                        </div>

                        <p className="text-xs text-[var(--theme-text-secondary)]">
                            Live filtering by date range, amount,
                            include/exclude, recurring-only, category, keyword,
                            and tags.
                        </p>
                    </GlassCard>

                    <div className="relative">
                        {isFetching && (
                            <div className="pointer-events-none absolute right-2 top-2 z-10 inline-flex items-center gap-2 border border-[var(--theme-border)] bg-[var(--theme-surface)] px-2 py-1 text-[11px] text-[var(--theme-text-secondary)]">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Updating results...
                            </div>
                        )}
                        <ExpenseTable
                            expenses={expenses}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    </div>

                    <div className="flex flex-col gap-3 border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] p-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-0.5 text-xs text-[var(--theme-text-secondary)]">
                            <p>
                                Showing {pageStartItem}-{pageEndItem} of{" "}
                                {pagination.total} results
                            </p>
                            <p>
                                Page {page} of {pagination.totalPages}
                            </p>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-[var(--theme-text-secondary)]">
                                    Rows
                                </span>
                                <select
                                    className={`${uiControl.select} h-9 min-w-[110px]`}
                                    value={pageSize}
                                    onChange={(e) => {
                                        const nextSize = Number(e.target.value);
                                        setPageSize(nextSize);
                                        setPage(1);
                                    }}
                                >
                                    <option value={25}>25 / page</option>
                                    <option value={50}>50 / page</option>
                                    <option value={100}>100 / page</option>
                                    <option value={200}>200 / page</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    className={`${uiControl.button} h-9 px-2`}
                                    disabled={!hasPrevPage}
                                    onClick={() =>
                                        setPage((current) =>
                                            Math.max(1, current - 1),
                                        )
                                    }
                                    title="Previous page"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>

                                {visiblePageNumbers[0] > 1 && (
                                    <span className="px-1 text-[var(--theme-text-secondary)]">
                                        ...
                                    </span>
                                )}

                                {visiblePageNumbers.map((pageNumber) => (
                                    <button
                                        key={pageNumber}
                                        type="button"
                                        onClick={() => setPage(pageNumber)}
                                        className={`h-9 min-w-9 border px-2 text-xs font-medium transition-colors ${pageNumber === page ? "border-[var(--theme-accent)] bg-[var(--theme-accent)] text-[var(--theme-background)]" : "border-[var(--theme-border)] bg-[var(--theme-surface)] text-[var(--theme-text)] hover:bg-[var(--theme-hover)]"}`}
                                    >
                                        {pageNumber}
                                    </button>
                                ))}

                                {visiblePageNumbers[
                                    visiblePageNumbers.length - 1
                                ] < pagination.totalPages && (
                                    <span className="px-1 text-[var(--theme-text-secondary)]">
                                        ...
                                    </span>
                                )}

                                <button
                                    type="button"
                                    className={`${uiControl.button} h-9 px-2`}
                                    disabled={!hasNextPage}
                                    onClick={() =>
                                        setPage((current) =>
                                            Math.min(
                                                pagination.totalPages,
                                                current + 1,
                                            ),
                                        )
                                    }
                                    title="Next page"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
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
                                                        borderWidth:
                                                            "var(--app-border-width)",
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
                                                        borderWidth:
                                                            "var(--app-border-width)",
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

                    <GlassCard>
                        <h3 className="text-sm font-semibold">
                            Search Snapshot
                        </h3>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                            <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-2">
                                <p className="text-[var(--theme-text-secondary)] uppercase">
                                    Results
                                </p>
                                <p className="text-base font-semibold">
                                    {pagination.total}
                                </p>
                            </div>
                            <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-2">
                                <p className="text-[var(--theme-text-secondary)] uppercase">
                                    Recurring
                                </p>
                                <p className="text-base font-semibold">
                                    {recurringCount}
                                </p>
                            </div>
                        </div>
                    </GlassCard>
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
