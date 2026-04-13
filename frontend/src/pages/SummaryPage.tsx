import { Link } from "react-router-dom";
import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react";
import PageSkeleton from "../components/ui/PageSkeleton";
import PageContainer from "../components/ui/PageContainer";
import GlassCard from "../components/ui/GlassCard";
import { monthNames, useSummaryDashboard } from "../hooks/useSummaryDashboard";
import { formatMoneyBirr } from "../utils/formatters";
import InfoTooltip from "../components/ui/InfoTooltip";

const accountColors = ["#1f4f8f", "#2b7a4b", "#c06a22", "#8a3a2f", "#4d5b8a"];

export default function SummaryPage() {
    const {
        summary,
        loading,
        error,
        totalSpent,
        totalCount,
        topTypes,
        insightsFeed,
        insightsUpdatedAt,
        forecast,
        importSynergy,
        importSynergyLoading,
        selectedImportAccountKey,
        setSelectedImportAccountKey,
        updatedLabel,
        nowLabel,
    } = useSummaryDashboard();

    if (loading) return <PageSkeleton title="Loading overview" />;

    if (error || !summary) {
        return (
            <PageContainer title="Home">
                <GlassCard>
                    <p>{error ?? "No summary available"}</p>
                </GlassCard>
            </PageContainer>
        );
    }

    const { totals, monthlyBreakdown, recentExpenses, templates } = summary;
    const health = summary.healthScore || {
        totalScore: 50,
        band: "fair",
        spendStabilityScore: 50,
        budgetAdherenceScore: 50,
        savingsTrendScore: 50,
    };

    const healthBandLabel: Record<string, string> = {
        excellent: "Excellent",
        good: "Good",
        fair: "Fair",
        "needs-attention": "Needs Attention",
    };

    const healthBandTone: Record<string, string> = {
        excellent: "text-emerald-600",
        good: "text-teal-600",
        fair: "text-amber-600",
        "needs-attention": "text-rose-600",
    };
    const hour = new Date().getHours();
    const greeting =
        hour < 12
            ? "Good morning"
            : hour < 17
              ? "Good afternoon"
              : "Good evening";
    const insightItems = insightsFeed || [];

    const insightToneClass: Record<string, string> = {
        high: "text-rose-600",
        medium: "text-amber-600",
        low: "text-emerald-600",
    };

    const netBadgeClass = (value: number) =>
        value >= 0
            ? "border-emerald-600/40 bg-emerald-600/12 text-emerald-600"
            : "border-rose-600/40 bg-rose-600/12 text-rose-600";

    const selectedImportAccount = importSynergy?.accounts?.find(
        (account) => account.key === selectedImportAccountKey,
    );
    const showImportSection = Boolean(importSynergy && !importSynergyLoading);

    return (
        <PageContainer
            title="Home"
            subtitle="Your live financial overview with recent activity and recurring signals."
            className="space-y-5 sm:space-y-6"
        >
            <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-4 sm:p-5">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                        <h1 className="app-heading text-3xl font-semibold tracking-[-0.01em] sm:text-5xl">
                            {greeting}
                        </h1>
                        <p
                            className="mt-2 text-xs sm:text-sm"
                            style={{ color: "var(--theme-text-secondary)" }}
                        >
                            It is {nowLabel} and your financial overview was
                            updated {updatedLabel}.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-5 sm:gap-8">
                        <div>
                            <p
                                className="text-[10px] uppercase"
                                style={{ color: "var(--theme-text-secondary)" }}
                            >
                                Total Spent
                            </p>
                            <p className="text-3xl font-semibold sm:text-5xl">
                                {formatMoneyBirr(totalSpent)}
                            </p>
                        </div>
                        <div>
                            <p
                                className="text-[10px] uppercase"
                                style={{ color: "var(--theme-text-secondary)" }}
                            >
                                Total Expenses
                            </p>
                            <p className="text-3xl font-semibold sm:text-5xl">
                                {totalCount.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {showImportSection && importSynergy && (
                <GlassCard className="space-y-4 p-4 sm:p-5">
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <h3 className="app-heading text-lg font-semibold tracking-[-0.01em] inline-flex items-center gap-1">
                                Imported Accounts Intelligence
                                <InfoTooltip label="Imported bank accounts are now wired into Home with account-level drill-down and an all-accounts aggregate mode." />
                            </h3>
                            <p className="text-xs text-[var(--theme-text-secondary)]">
                                Source:{" "}
                                {importSynergy.batch.sourceFileName ||
                                    "Imported JSON"}{" "}
                                | Imported {updatedLabel}
                            </p>
                        </div>

                        <select
                            value={selectedImportAccountKey}
                            onChange={(event) =>
                                setSelectedImportAccountKey(event.target.value)
                            }
                            className="h-10 min-w-[220px] border border-[var(--theme-border)] bg-[var(--theme-surface)] px-3 text-sm"
                        >
                            {importSynergy.accountOptions.map((option) => (
                                <option key={option.key} value={option.key}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-4">
                        {importSynergy.accounts.map((account, index) => (
                            <button
                                key={account.key}
                                type="button"
                                onClick={() =>
                                    setSelectedImportAccountKey(account.key)
                                }
                                className={`relative min-w-[220px] border bg-[var(--theme-surface)] p-3 text-left transition-transform ${index === 0 ? "" : "-ml-8"} ${selectedImportAccountKey === account.key ? "z-20 scale-[1.02] border-[var(--theme-accent)]" : "z-10 border-[var(--theme-border)] hover:z-20 hover:scale-[1.01]"}`}
                                style={{
                                    boxShadow: `inset 0 3px 0 ${accountColors[index % accountColors.length]}`,
                                }}
                            >
                                <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                                    {account.accountNumber || account.key}
                                </p>
                                <p className="mt-1 text-xl font-semibold">
                                    {formatMoneyBirr(account.balance || 0)}
                                </p>
                                <p className="mt-1 text-[11px] text-[var(--theme-text-secondary)]">
                                    {account.txCount} imported transactions
                                </p>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-8">
                        <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3 col-span-2">
                            <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                                {selectedImportAccountKey === "ALL"
                                    ? "Aggregate account balance"
                                    : "Selected account balance"}
                            </p>
                            <p className="text-xl font-semibold">
                                {selectedImportAccountKey === "ALL"
                                    ? formatMoneyBirr(
                                          importSynergy.aggregate.totalBalance,
                                      )
                                    : formatMoneyBirr(
                                          selectedImportAccount?.balance || 0,
                                      )}
                            </p>
                        </div>
                        <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                            <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                                Imported Debits
                            </p>
                            <p className="text-lg font-semibold">
                                {formatMoneyBirr(
                                    importSynergy.aggregate.debitTotal,
                                )}
                            </p>
                        </div>
                        <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                            <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                                Imported Credits
                            </p>
                            <p className="text-lg font-semibold">
                                {formatMoneyBirr(
                                    importSynergy.aggregate.creditTotal,
                                )}
                            </p>
                        </div>
                        <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                            <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                                Imported Net Flow
                            </p>
                            <p className="text-lg font-semibold">
                                {formatMoneyBirr(
                                    importSynergy.aggregate.netFlow,
                                )}
                            </p>
                        </div>
                        <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                            <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                                Next Month Net
                            </p>
                            <p className="text-lg font-semibold">
                                {formatMoneyBirr(
                                    importSynergy.forecast
                                        .nextMonthProjectedNet,
                                )}
                            </p>
                        </div>
                        <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                            <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                                6M Net Projection
                            </p>
                            <p className="text-lg font-semibold">
                                {formatMoneyBirr(
                                    importSynergy.forecast
                                        .next6MonthsProjectedNet,
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="border border-[var(--theme-border)] bg-[var(--theme-background)] p-3">
                        <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                            Expense Card (Existing app data)
                        </p>
                        <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm">
                                This month:{" "}
                                {formatMoneyBirr(
                                    importSynergy.expenseOverlay
                                        .currentMonthExpenseTotal,
                                )}{" "}
                                across{" "}
                                {
                                    importSynergy.expenseOverlay
                                        .currentMonthExpenseCount
                                }{" "}
                                expenses
                            </p>
                            <p className="text-xs text-[var(--theme-text-secondary)]">
                                Latest:{" "}
                                {importSynergy.expenseOverlay.recentExpense
                                    ?.description || "-"}
                            </p>
                        </div>
                    </div>
                </GlassCard>
            )}

            <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 xl:grid-cols-5">
                {topTypes.length === 0 ? (
                    <GlassCard className="p-4 xl:col-span-5">
                        <p
                            className="text-sm"
                            style={{ color: "var(--theme-text-secondary)" }}
                        >
                            No account cards yet. Add expenses to populate this
                            view.
                        </p>
                    </GlassCard>
                ) : (
                    topTypes.map((item, index) => (
                        <GlassCard
                            key={item.type}
                            className="min-w-[248px] snap-start p-0 overflow-hidden sm:min-w-0"
                        >
                            <div
                                className="h-2"
                                style={{
                                    backgroundColor:
                                        accountColors[
                                            index % accountColors.length
                                        ],
                                }}
                            />
                            <div className="space-y-2 p-3">
                                <p
                                    className="text-[10px] uppercase"
                                    style={{
                                        color: "var(--theme-text-secondary)",
                                    }}
                                >
                                    {item.type}
                                </p>
                                <p className="text-4xl leading-none">
                                    {item.total.toLocaleString()}
                                </p>
                                <div className=" pt-2 text-xs text-[var(--theme-text-secondary)]">
                                    {item.count} transactions
                                </div>
                            </div>
                        </GlassCard>
                    ))
                )}
            </div>

            <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-8">
                <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                    <p
                        className="text-[10px] uppercase"
                        style={{ color: "var(--theme-text-secondary)" }}
                    >
                        Incoming
                    </p>
                    <p className="text-lg font-semibold sm:text-xl">
                        {formatMoneyBirr(totals.totalIncluded)}
                    </p>
                </div>
                <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                    <p
                        className="text-[10px] uppercase"
                        style={{ color: "var(--theme-text-secondary)" }}
                    >
                        Outgoing
                    </p>
                    <p className="text-lg font-semibold sm:text-xl">
                        {formatMoneyBirr(totals.totalExcluded)}
                    </p>
                </div>
                <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                    <p
                        className="text-[10px] uppercase"
                        style={{ color: "var(--theme-text-secondary)" }}
                    >
                        Included Count
                    </p>
                    <p className="text-lg font-semibold sm:text-xl">
                        {totals.countIncluded}
                    </p>
                </div>
                <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                    <p
                        className="text-[10px] uppercase"
                        style={{ color: "var(--theme-text-secondary)" }}
                    >
                        Excluded Count
                    </p>
                    <p className="text-lg font-semibold sm:text-xl">
                        {totals.countExcluded}
                    </p>
                </div>
                <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3 col-span-2 md:col-span-2 xl:col-span-4 flex items-center justify-between">
                    <div>
                        <p
                            className="text-[10px] uppercase"
                            style={{ color: "var(--theme-text-secondary)" }}
                        >
                            Upcoming recurring this month
                        </p>
                        <p className="text-sm mt-1">
                            {templates.length} recurring items tracked
                        </p>
                    </div>
                    <Link
                        to="/recurrings"
                        className="border border-[var(--theme-border)] bg-[var(--theme-background)] px-2 py-1 text-xs transition-colors hover:bg-[var(--theme-hover)]"
                    >
                        View all
                    </Link>
                </div>
            </div>

            {forecast && (
                <GlassCard className="p-4 sm:p-5 overflow-hidden">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h3 className="app-heading tracking-[-0.01em] text-lg font-semibold inline-flex items-center gap-1">
                                Forecast Highlights
                                <InfoTooltip label="Why this matters: this section summarizes projected net outcomes from recurring income and forecasted spend for month, 6 months, and 12 months." />
                            </h3>
                            <p className="text-xs text-[var(--theme-text-secondary)]">
                                Fast view of projected income, spend, and net
                                outcome.
                            </p>
                        </div>
                        <Link
                            to="/forecast"
                            className="inline-flex items-center gap-1 border border-[var(--theme-border)] bg-[var(--theme-background)] px-3 py-1.5 text-xs transition-colors hover:bg-[var(--theme-hover)]"
                        >
                            Open full forecast
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>

                    <div className="forecast-snap-row -mx-1 mt-3 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1 xl:mx-0 xl:grid xl:grid-cols-3 xl:overflow-visible xl:px-0">
                        <Link
                            to="/forecast"
                            className="forecast-snap-card min-w-[280px] snap-center border border-[var(--theme-border)] bg-[linear-gradient(135deg,var(--theme-active),var(--theme-surface)_65%)] p-3 transition-colors hover:bg-[var(--theme-hover)] xl:min-w-0"
                        >
                            <p className="text-[10px] uppercase text-[var(--theme-text-secondary)] inline-flex items-center gap-1">
                                Month-end net
                                <InfoTooltip label="Computed as projected recurring income minus projected spend for the next month." />
                            </p>
                            <p className="mt-1 text-xl font-semibold">
                                {formatMoneyBirr(
                                    forecast.summary.projectedCashFlow,
                                )}
                            </p>
                            <p className="mt-1 text-xs text-[var(--theme-text-secondary)]">
                                Income{" "}
                                {formatMoneyBirr(
                                    forecast.summary.projectedRecurringIncome,
                                )}{" "}
                                | Spend{" "}
                                {formatMoneyBirr(
                                    forecast.summary.projectedSpend,
                                )}
                            </p>
                            <span
                                className={`mt-2 inline-flex items-center gap-1 border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] ${netBadgeClass(forecast.summary.projectedCashFlow)}`}
                            >
                                {forecast.summary.projectedCashFlow >= 0 ? (
                                    <TrendingUp className="h-3.5 w-3.5" />
                                ) : (
                                    <TrendingDown className="h-3.5 w-3.5" />
                                )}
                                {forecast.summary.projectedCashFlow >= 0
                                    ? "Positive"
                                    : "Negative"}
                            </span>
                        </Link>

                        <Link
                            to="/forecast"
                            className="forecast-snap-card min-w-[280px] snap-center border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3 transition-colors hover:bg-[var(--theme-hover)] xl:min-w-0"
                        >
                            <p className="text-[10px] uppercase text-[var(--theme-text-secondary)] inline-flex items-center gap-1">
                                6M net outlook
                                <InfoTooltip label="Six-month net = six-month recurring income minus six-month forecast spend." />
                            </p>
                            <p className="mt-1 text-lg font-semibold">
                                {formatMoneyBirr(
                                    forecast.summary.next6MonthsNet,
                                )}
                            </p>
                            <p className="mt-1 text-xs text-[var(--theme-text-secondary)]">
                                Income{" "}
                                {formatMoneyBirr(
                                    forecast.summary.next6MonthsIncome,
                                )}{" "}
                                | Spend{" "}
                                {formatMoneyBirr(
                                    forecast.summary.next6MonthsSpend,
                                )}
                            </p>
                            <span
                                className={`mt-2 inline-flex border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] ${netBadgeClass(forecast.summary.next6MonthsNet)}`}
                            >
                                {forecast.summary.next6MonthsNet >= 0
                                    ? "Positive"
                                    : "Negative"}
                            </span>
                        </Link>

                        <Link
                            to="/forecast"
                            className="forecast-snap-card min-w-[280px] snap-center border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3 transition-colors hover:bg-[var(--theme-hover)] xl:min-w-0"
                        >
                            <p className="text-[10px] uppercase text-[var(--theme-text-secondary)] inline-flex items-center gap-1">
                                12M net outlook
                                <InfoTooltip label="Twelve-month net = twelve-month recurring income minus twelve-month forecast spend." />
                            </p>
                            <p className="mt-1 text-lg font-semibold">
                                {formatMoneyBirr(
                                    forecast.summary.next12MonthsNet,
                                )}
                            </p>
                            <p className="mt-1 text-xs text-[var(--theme-text-secondary)]">
                                Income{" "}
                                {formatMoneyBirr(
                                    forecast.summary.next12MonthsIncome,
                                )}{" "}
                                | Spend{" "}
                                {formatMoneyBirr(
                                    forecast.summary.next12MonthsSpend,
                                )}
                            </p>
                            <span
                                className={`mt-2 inline-flex border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] ${netBadgeClass(forecast.summary.next12MonthsNet)}`}
                            >
                                {forecast.summary.next12MonthsNet >= 0
                                    ? "Positive"
                                    : "Negative"}
                            </span>
                        </Link>
                    </div>
                </GlassCard>
            )}

            <GlassCard className="p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p
                            className="text-[10px] uppercase inline-flex items-center gap-1"
                            style={{ color: "var(--theme-text-secondary)" }}
                        >
                            Financial Health Score
                            <InfoTooltip label="Why this matters: this score summarizes financial resilience so you can quickly spot whether your spending trend is stable or risky." />
                        </p>
                        <div className="mt-1 flex items-end gap-2">
                            <p className="text-4xl font-semibold leading-none">
                                {health.totalScore}
                            </p>
                            <span
                                className={`text-sm font-semibold ${healthBandTone[health.band]}`}
                            >
                                {healthBandLabel[health.band]}
                            </span>
                        </div>
                        <p
                            className="mt-1 text-xs"
                            style={{ color: "var(--theme-text-secondary)" }}
                        >
                            Blend of spend stability, budget adherence, and
                            savings trend.
                        </p>
                    </div>

                    <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3 md:max-w-[560px]">
                        <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-2">
                            <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                                Stability
                            </p>
                            <p className="text-lg font-semibold">
                                {health.spendStabilityScore}
                            </p>
                        </div>
                        <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-2">
                            <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                                Budget Adherence
                            </p>
                            <p className="text-lg font-semibold">
                                {health.budgetAdherenceScore}
                            </p>
                        </div>
                        <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-2">
                            <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                                Savings Trend
                            </p>
                            <p className="text-lg font-semibold">
                                {health.savingsTrendScore}
                            </p>
                        </div>
                    </div>
                </div>
            </GlassCard>

            <GlassCard className="p-4">
                <div className="mb-3 flex items-center justify-between">
                    <div>
                        <h3 className="app-heading tracking-[-0.01em] text-lg font-semibold inline-flex items-center gap-1">
                            Personalized Insights Feed
                            <InfoTooltip label="Why this matters: insight alerts identify anomalies and trend shifts before they become month-end budget problems." />
                        </h3>
                        <p className="text-xs text-[var(--theme-text-secondary)]">
                            AI-style tips from anomalies and trend shifts.
                        </p>
                    </div>
                    <p className="text-[11px] text-[var(--theme-text-secondary)]">
                        Updated{" "}
                        {new Date(
                            insightsUpdatedAt || Date.now(),
                        ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </p>
                </div>

                {insightItems.length === 0 ? (
                    <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3 text-sm text-[var(--theme-text-secondary)]">
                        No insight signals yet. Keep tracking expenses to unlock
                        personalized tips.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
                        {insightItems.map((insight) => (
                            <div
                                key={insight.id}
                                className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3"
                            >
                                <div className="mb-1 flex items-center justify-between gap-2">
                                    <p className="text-sm font-semibold leading-tight">
                                        {insight.title}
                                    </p>
                                    <span
                                        className={`text-[10px] font-semibold uppercase ${insightToneClass[insight.severity] || "text-[var(--theme-text-secondary)]"}`}
                                    >
                                        {insight.severity}
                                    </span>
                                </div>
                                <p className="text-xs text-[var(--theme-text-secondary)]">
                                    {insight.message}
                                </p>
                                <div className="mt-2 flex items-center justify-between gap-2 text-[11px]">
                                    <span className="text-[var(--theme-text-secondary)]">
                                        {insight.metricLabel}
                                    </span>
                                    <span className="font-semibold">
                                        {Number(
                                            insight.metricValue,
                                        ).toLocaleString()}
                                    </span>
                                </div>
                                <p className="mt-2 text-xs">
                                    {insight.recommendation}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </GlassCard>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
                <GlassCard className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="app-heading tracking-[-0.01em] text-lg font-semibold">
                            Recent Activity
                        </h3>
                        <Link
                            to="/expenses"
                            className="border border-[var(--theme-border)] bg-[var(--theme-background)] px-2 py-1 text-xs transition-colors hover:bg-[var(--theme-hover)]"
                        >
                            Open expenses
                        </Link>
                    </div>
                    <div className="space-y-2">
                        {recentExpenses.length === 0 ? (
                            <p
                                className="text-sm"
                                style={{ color: "var(--theme-text-secondary)" }}
                            >
                                No recent expenses.
                            </p>
                        ) : (
                            recentExpenses.map((expense) => (
                                <div
                                    key={expense._id}
                                    className="flex items-center justify-between gap-3 border p-2"
                                    style={{
                                        borderColor: "var(--theme-border)",
                                    }}
                                >
                                    <div>
                                        <p className="text-sm font-semibold leading-tight">
                                            {expense.description}
                                        </p>
                                        <p
                                            className="text-xs capitalize"
                                            style={{
                                                color: "var(--theme-text-secondary)",
                                            }}
                                        >
                                            {expense.type}
                                        </p>
                                    </div>
                                    <p className="text-sm font-semibold">
                                        {formatMoneyBirr(expense.amount)}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </GlassCard>

                <GlassCard className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="app-heading tracking-[-0.01em] text-lg font-semibold">
                            Recent Months
                        </h3>
                        <Link
                            to="/charts"
                            className="border border-[var(--theme-border)] bg-[var(--theme-background)] px-2 py-1 text-xs transition-colors hover:bg-[var(--theme-hover)]"
                        >
                            Open charts
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {monthlyBreakdown
                            .slice()
                            .reverse()
                            .slice(0, 6)
                            .map((m) => (
                                <div
                                    key={`${m.year}-${m.month}`}
                                    className="border p-2"
                                    style={{
                                        borderColor: "var(--theme-border)",
                                    }}
                                >
                                    <p
                                        className="text-xs"
                                        style={{
                                            color: "var(--theme-text-secondary)",
                                        }}
                                    >
                                        {monthNames[m.month - 1]} {m.year}
                                    </p>
                                    <p className="text-sm font-semibold mt-1">
                                        {formatMoneyBirr(m.total)}
                                    </p>
                                </div>
                            ))}
                    </div>
                </GlassCard>
            </div>
        </PageContainer>
    );
}
