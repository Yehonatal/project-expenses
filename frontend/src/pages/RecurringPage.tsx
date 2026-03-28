import { Pause, Pencil, Plus, Play, Trash2 } from "lucide-react";
import Modal from "../components/Modal";
import PageContainer from "../components/ui/PageContainer";
import GlassCard from "../components/ui/GlassCard";
import PageSkeleton from "../components/ui/PageSkeleton";
import Toast from "../components/Toast";
import { useRecurringPageData } from "../hooks/useRecurringPageData";
import { modalCopy } from "../content/modalCopy";
import { uiControl } from "../utils/uiClasses";
import InfoTooltip from "../components/ui/InfoTooltip";

function getDueLabel(startDate?: string, frequency?: string) {
    if (!startDate) return "Schedule not set";
    const date = new Date(startDate);
    return `${frequency || "monthly"} from ${date.toLocaleDateString()}`;
}

export default function RecurringPage() {
    const {
        loading,
        templates,
        filteredTemplates,
        providers,
        counts,
        categoryFilter,
        statusFilter,
        showCreateModal,
        editingTemplate,
        form,
        toast,
        setCategoryFilter,
        setStatusFilter,
        setForm,
        openCreateModal,
        openEditModal,
        closeModal,
        submitForm,
        toggleStatus,
        remove,
    } = useRecurringPageData();

    if (loading) return <PageSkeleton title="Loading recurring transactions" />;

    const recurringIncomeTotal = templates
        .filter((template) => (template.category || "expense") === "income")
        .reduce((sum, template) => sum + Number(template.price || 0), 0);

    const recurringExpenseTotal = templates
        .filter((template) => (template.category || "expense") === "expense")
        .reduce((sum, template) => sum + Number(template.price || 0), 0);

    const recurringNet = recurringIncomeTotal - recurringExpenseTotal;
    const recurringNetPositive = recurringNet >= 0;

    return (
        <>
            <PageContainer
                title="Recurring Transactions"
                subtitle="Manage repeating income and expenses with status, timing, and provider tracking."
                className="space-y-6"
            >
                <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                            <h2 className="app-heading text-xl font-semibold tracking-[-0.01em] sm:text-2xl inline-flex items-center gap-1">
                                Recurring Transactions
                                <InfoTooltip label="Why this matters: recurring entries anchor your monthly baseline and directly affect forecast confidence." />
                            </h2>
                            <p
                                className="text-sm mt-1"
                                style={{ color: "var(--theme-text-secondary)" }}
                            >
                                Keep all recurring income and expenses in one
                                timeline.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="inline-flex w-full items-center justify-center gap-2 border border-[var(--theme-border)] bg-[var(--theme-surface)] px-3 py-2 text-sm font-medium  transition-colors hover:bg-white/5 sm:w-auto"
                            style={{
                                backgroundColor: "var(--theme-active)",
                                color: "var(--theme-text)",
                            }}
                        >
                            <Plus size={15} />
                            Add Recurring
                        </button>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            className={`inline-flex items-center px-2.5 py-1.5 border border-[var(--theme-border)] bg-[var(--theme-surface)]  transition-colors hover:bg-white/5 active:bg-white/[0.02] text-xs ${categoryFilter === "all" ? "bg-[var(--theme-active)] font-semibold" : ""}`}
                            onClick={() => setCategoryFilter("all")}
                        >
                            All ({counts.all})
                        </button>
                        <button
                            type="button"
                            className={`inline-flex items-center px-2.5 py-1.5 border border-[var(--theme-border)] bg-[var(--theme-surface)]  transition-colors hover:bg-white/5 active:bg-white/[0.02] text-xs ${categoryFilter === "expense" ? "bg-[var(--theme-active)] font-semibold" : ""}`}
                            onClick={() => setCategoryFilter("expense")}
                        >
                            Expenses ({counts.expense})
                        </button>
                        <button
                            type="button"
                            className={`inline-flex items-center px-2.5 py-1.5 border border-[var(--theme-border)] bg-[var(--theme-surface)]  transition-colors hover:bg-white/5 active:bg-white/[0.02] text-xs ${categoryFilter === "income" ? "bg-[var(--theme-active)] font-semibold" : ""}`}
                            onClick={() => setCategoryFilter("income")}
                        >
                            Income ({counts.income})
                        </button>

                        <div className="flex w-full items-center gap-2 sm:ml-auto sm:w-auto">
                            <button
                                type="button"
                                className={`inline-flex items-center px-2.5 py-1.5 border border-[var(--theme-border)] bg-[var(--theme-surface)]  transition-colors hover:bg-white/5 active:bg-white/[0.02] text-xs ${statusFilter === "active" ? "bg-[var(--theme-active)] font-semibold" : ""}`}
                                onClick={() => setStatusFilter("active")}
                            >
                                Active
                            </button>
                            <button
                                type="button"
                                className={`inline-flex items-center px-2.5 py-1.5 border border-[var(--theme-border)] bg-[var(--theme-surface)]  transition-colors hover:bg-white/5 active:bg-white/[0.02] text-xs ${statusFilter === "paused" ? "bg-[var(--theme-active)] font-semibold" : ""}`}
                                onClick={() => setStatusFilter("paused")}
                            >
                                Paused
                            </button>
                            <button
                                type="button"
                                className={`inline-flex items-center px-2.5 py-1.5 border border-[var(--theme-border)] bg-[var(--theme-surface)]  transition-colors hover:bg-white/5 active:bg-white/[0.02] text-xs ${statusFilter === "all" ? "bg-[var(--theme-active)] font-semibold" : ""}`}
                                onClick={() => setStatusFilter("all")}
                            >
                                All
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-8">
                    <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                        <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                            Recurring input
                        </p>
                        <p className="text-lg font-semibold text-emerald-600 sm:text-xl">
                            {recurringIncomeTotal.toLocaleString()} ETB
                        </p>
                    </div>
                    <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                        <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                            Recurring output
                        </p>
                        <p className="text-lg font-semibold text-rose-600 sm:text-xl">
                            {recurringExpenseTotal.toLocaleString()} ETB
                        </p>
                    </div>
                    <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                        <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                            Recurring net
                        </p>
                        <p
                            className={`text-lg font-semibold sm:text-xl ${recurringNetPositive ? "text-emerald-600" : "text-rose-600"}`}
                        >
                            {recurringNet.toLocaleString()} ETB
                        </p>
                    </div>
                    <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3 col-span-2 md:col-span-1 xl:col-span-5 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                                Recurring mix
                            </p>
                            <p className="text-sm mt-1 text-[var(--theme-text-secondary)]">
                                Income: {counts.income} | Expense:{" "}
                                {counts.expense}
                            </p>
                        </div>
                        <span
                            className={`inline-flex border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] ${recurringNetPositive ? "border-emerald-600/30 bg-emerald-600/12 text-emerald-600" : "border-rose-600/30 bg-rose-600/12 text-rose-600"}`}
                        >
                            {recurringNetPositive ? "Positive" : "Negative"}
                        </span>
                    </div>
                </div>

                {filteredTemplates.length === 0 ? (
                    <GlassCard className="p-12 text-center">
                        <p className="text-xl font-semibold">
                            No recurring transactions found
                        </p>
                        <p
                            className="text-sm mt-2"
                            style={{ color: "var(--theme-text-secondary)" }}
                        >
                            Start by adding recurring income or recurring bills.
                        </p>
                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="border border-[var(--theme-border)] bg-[var(--theme-surface)]  rounded-none transition-colors hover:bg-white/5 active:bg-white/[0.02] mt-4 inline-flex items-center gap-2 text-sm"
                            style={{
                                backgroundColor: "var(--theme-active)",
                                color: "var(--theme-text)",
                            }}
                        >
                            <Plus size={15} />
                            Add Your First Recurring Transaction
                        </button>
                    </GlassCard>
                ) : (
                    <div className="space-y-4">
                        {filteredTemplates.map((template) => (
                            <GlassCard
                                key={template._id || template.id}
                                className="p-4 sm:p-5"
                            >
                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr] lg:items-stretch">
                                    <div className="space-y-3">
                                        <div className="text-lg font-semibold sm:text-xl">
                                            {template.description}
                                        </div>
                                        <div className="mt-2 text-2xl font-semibold sm:text-3xl">
                                            {Number(
                                                template.price,
                                            ).toLocaleString()}{" "}
                                            ETB
                                        </div>
                                        <div className="mt-2 flex items-center gap-2 text-xs">
                                            <span className="inline-flex items-center gap-1 bg-[var(--theme-surface)] px-2 py-1 text-[10px] font-semibold capitalize">
                                                {template.category || "expense"}
                                            </span>
                                            <span className="inline-flex items-center gap-1 bg-[var(--theme-surface)] px-2 py-1 text-[10px] font-semibold capitalize">
                                                {template.frequency ||
                                                    "monthly"}
                                            </span>
                                            <span className="inline-flex items-center gap-1 bg-[var(--theme-surface)] px-2 py-1 text-[10px] font-semibold">
                                                {template.provider || "any"}
                                            </span>
                                        </div>
                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openEditModal(template)
                                                }
                                                className={`${uiControl.button} px-2.5 py-1.5 text-xs`}
                                            >
                                                <Pencil size={12} /> Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleStatus(template)
                                                }
                                                className={`${uiControl.button} px-2.5 py-1.5 text-xs`}
                                            >
                                                {(template.status ||
                                                    "active") === "active" ? (
                                                    <>
                                                        <Pause size={12} />{" "}
                                                        Pause
                                                    </>
                                                ) : (
                                                    <>
                                                        <Play size={12} />{" "}
                                                        Resume
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    template._id &&
                                                    remove(template._id)
                                                }
                                                className={`${uiControl.buttonDanger} px-2.5 py-1.5 text-xs`}
                                            >
                                                <Trash2 size={12} /> Delete
                                            </button>
                                        </div>
                                    </div>

                                    <div className="lg:pl-3">
                                        <div
                                            className="h-8"
                                            style={{
                                                background:
                                                    "linear-gradient(90deg, rgba(16,185,129,0.16) 0%, rgba(245,158,11,0.12) 55%, rgba(239,68,68,0.12) 100%)",
                                            }}
                                        />
                                        <div
                                            className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs"
                                            style={{
                                                color: "var(--theme-text-secondary)",
                                            }}
                                        >
                                            <span>
                                                {getDueLabel(
                                                    template.startDate,
                                                    template.frequency,
                                                )}
                                            </span>
                                            <span>
                                                {(
                                                    template.status || "active"
                                                ).toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                )}
            </PageContainer>

            <Modal
                isOpen={showCreateModal}
                onClose={closeModal}
                title={
                    editingTemplate
                        ? modalCopy.recurring.editTitle
                        : modalCopy.recurring.createTitle
                }
                description="Define schedule, amount, and provider so entries can be generated reliably."
                maxWidthClass="max-w-4xl"
            >
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-medium">Name *</label>
                        <input
                            className={uiControl.input}
                            value={form.description}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    description: e.target.value,
                                }))
                            }
                            placeholder="Rent, Salary, Internet"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-medium">Type *</label>
                        <input
                            className={uiControl.input}
                            value={form.type}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    type: e.target.value,
                                }))
                            }
                            placeholder="internet, salary, transport"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium">
                                Category *
                            </label>
                            <select
                                className={uiControl.select}
                                value={form.category}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        category: e.target.value as
                                            | "expense"
                                            | "income",
                                    }))
                                }
                            >
                                <option value="expense">Expense</option>
                                <option value="income">Income</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium">
                                Amount (ETB) *
                            </label>
                            <input
                                type="number"
                                className={uiControl.input}
                                value={form.price}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        price: e.target.value,
                                    }))
                                }
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium">
                                Frequency *
                            </label>
                            <select
                                className={uiControl.select}
                                value={form.frequency}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        frequency: e.target.value as any,
                                    }))
                                }
                            >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                                <option value="custom">Custom</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium">
                                Every (Interval)
                            </label>
                            <input
                                type="number"
                                min={1}
                                className={uiControl.input}
                                value={form.recurrenceRules.interval}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        recurrenceRules: {
                                            ...prev.recurrenceRules,
                                            interval:
                                                parseInt(e.target.value) || 1,
                                        },
                                    }))
                                }
                            />
                        </div>
                    </div>

                    {form.frequency === "weekly" && (
                        <div className="space-y-2">
                            <label className="text-xs font-medium">
                                On Days
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    "Sun",
                                    "Mon",
                                    "Tue",
                                    "Wed",
                                    "Thu",
                                    "Fri",
                                    "Sat",
                                ].map((day, idx) => (
                                    <button
                                        key={day}
                                        type="button"
                                        onClick={() => {
                                            const current =
                                                form.recurrenceRules.daysOfWeek;
                                            const next = current.includes(idx)
                                                ? current.filter(
                                                      (d) => d !== idx,
                                                  )
                                                : [...current, idx];
                                            setForm((f) => ({
                                                ...f,
                                                recurrenceRules: {
                                                    ...f.recurrenceRules,
                                                    daysOfWeek: next,
                                                },
                                            }));
                                        }}
                                        className={`px-3 py-1.5 text-[11px] border transition-colors ${
                                            form.recurrenceRules.daysOfWeek.includes(
                                                idx,
                                            )
                                                ? "bg-[var(--theme-accent)] text-white border-[var(--theme-accent)]"
                                                : "bg-[var(--theme-surface)] text-[var(--theme-text-secondary)] border-[var(--theme-border)]"
                                        }`}
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium">
                                Stop After (Occurrences)
                            </label>
                            <input
                                type="number"
                                placeholder="Optional"
                                className={uiControl.input}
                                value={form.recurrenceRules.occurrenceCount}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        recurrenceRules: {
                                            ...prev.recurrenceRules,
                                            occurrenceCount: e.target.value,
                                        },
                                    }))
                                }
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium">
                                Day Of Month
                            </label>
                            <input
                                type="number"
                                min={1}
                                max={31}
                                className={uiControl.input}
                                value={form.dayOfMonth}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        dayOfMonth: e.target.value,
                                    }))
                                }
                                disabled={form.frequency !== "monthly"}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium">
                                Start Date *
                            </label>
                            <input
                                type="date"
                                className={uiControl.input}
                                value={form.startDate}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        startDate: e.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium">
                                End Date
                            </label>
                            <input
                                type="date"
                                className={uiControl.input}
                                value={form.endDate}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        endDate: e.target.value,
                                    }))
                                }
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-medium">Provider</label>
                        <div className="flex items-center gap-2 flex-wrap mt-1">
                            {providers.map((provider) => (
                                <button
                                    type="button"
                                    key={provider}
                                    onClick={() =>
                                        setForm((prev) => ({
                                            ...prev,
                                            provider,
                                        }))
                                    }
                                    className={`px-2 py-1 text-xs ${uiControl.button} ${form.provider === provider ? "border-[var(--theme-accent)] bg-[var(--theme-accent)] text-[var(--theme-background)]" : ""}`}
                                >
                                    {provider}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={closeModal}
                            className={uiControl.button}
                        >
                            {modalCopy.common.cancel}
                        </button>
                        <button
                            type="button"
                            onClick={submitForm}
                            className={uiControl.buttonPrimary}
                        >
                            {editingTemplate
                                ? modalCopy.recurring.editConfirm
                                : modalCopy.recurring.createConfirm}
                        </button>
                    </div>
                </div>
            </Modal>

            <Toast message={toast?.message} type={toast?.type} />
        </>
    );
}
