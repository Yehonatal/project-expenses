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
        totalAccountBalance,
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
                    <div className="grid grid-cols-3 gap-3 sm:gap-6">
                        <div>
                            <p
                                className="text-[10px] uppercase font-bold tracking-wider"
                                style={{ color: "var(--theme-text-secondary)" }}
                            >
                                Available Balance
                            </p>
                            <p className="text-2xl font-black sm:text-4xl">
                                {totalAccountBalance !== null
                                    ? formatMoneyBirr(totalAccountBalance)
                                    : "..."}
                            </p>
                        </div>
                        <div>
                            <p
                                className="text-[10px] uppercase font-bold tracking-wider"
                                style={{ color: "var(--theme-text-secondary)" }}
                            >
                                Total Spent
                            </p>
                            <p className="text-2xl font-black sm:text-4xl text-rose-600">
                                {formatMoneyBirr(totalSpent)}
                            </p>
                        </div>
                        <div>
                            <p
                                className="text-[10px] uppercase font-bold tracking-wider"
                                style={{ color: "var(--theme-text-secondary)" }}
                            >
                                Transactions
                            </p>
                            <p className="text-2xl font-black sm:text-4xl">
                                {totalCount.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-8">
                <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                    <p
                        className="text-[10px] uppercase font-bold tracking-wider"
                        style={{ color: "var(--theme-text-secondary)" }}
                    >
                        Incoming
                    </p>
                    <p className="text-lg font-black sm:text-xl text-emerald-600">
                        {formatMoneyBirr(totals.totalIncluded)}
                    </p>
                </div>
                <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                    <p
                        className="text-[10px] uppercase font-bold tracking-wider"
                        style={{ color: "var(--theme-text-secondary)" }}
                    >
                        Outgoing
                    </p>
                    <p className="text-lg font-black sm:text-xl text-rose-600">
                        {formatMoneyBirr(totals.totalExcluded)}
                    </p>
                </div>
                <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                    <p
                        className="text-[10px] uppercase font-bold tracking-wider"
                        style={{ color: "var(--theme-text-secondary)" }}
                    >
                        Tracked Items
                    </p>
                    <p className="text-lg font-black sm:text-xl">
                        {totals.countIncluded}
                    </p>
                </div>
                <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                    <p
                        className="text-[10px] uppercase font-bold tracking-wider"
                        style={{ color: "var(--theme-text-secondary)" }}
                    >
                        Excluded Items
                    </p>
                    <p className="text-lg font-black sm:text-xl">
                        {totals.countExcluded}
                    </p>
                </div>
                <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3 col-span-2 md:col-span-4 xl:col-span-4 flex items-center justify-between">
                    <div>
                        <p
                            className="text-[10px] uppercase font-bold tracking-wider"
                            style={{ color: "var(--theme-text-secondary)" }}
                        >
                            Upcoming recurring this month
                        </p>
                        <p className="text-sm font-semibold mt-1">
                            {templates.length} recurring items tracked
                        </p>
                    </div>
                    <Link
                        to="/recurrings"
                        className="border-[2px] border-[var(--theme-text)] bg-[var(--theme-surface)] px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-transform hover:-translate-y-[2px]"
                    >
                        View all
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
                <GlassCard className="p-4 border-2 border-[var(--theme-border)]">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p
                                className="text-[10px] uppercase font-bold tracking-wider inline-flex items-center gap-1"
                                style={{ color: "var(--theme-text-secondary)" }}
                            >
                                Financial Health Score
                                <InfoTooltip label="Why this matters: this score summarizes financial resilience so you can quickly spot whether your spending trend is stable or risky." />
                            </p>
                            <div className="mt-1 flex items-end gap-2">
                                <p className="text-4xl font-black leading-none tracking-tighter">
                                    {health.totalScore}
                                </p>
                                <span
                                    className={`text-sm font-bold uppercase tracking-wide ${healthBandTone[health.band]}`}
                                >
                                    {healthBandLabel[health.band]}
                                </span>
                            </div>
                            <p
                                className="mt-1 text-xs font-medium"
                                style={{ color: "var(--theme-text-secondary)" }}
                            >
                                Blend of spend stability, budget adherence, and
                                savings trend.
                            </p>
                        </div>

                        <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3 md:max-w-[340px]">
                            <div className="border-[2px] border-[var(--theme-border)] bg-[var(--theme-surface)] p-2 transition-all hover:border-[var(--theme-text)] focus-within:border-[var(--theme-accent)]">
                                <p className="text-[10px] uppercase font-bold tracking-wider text-[var(--theme-text-secondary)]">
                                    Stability
                                </p>
                                <p className="text-lg font-black text-[var(--theme-text)]">
                                    {health.spendStabilityScore}
                                </p>
                            </div>
                            <div className="border-[2px] border-[var(--theme-border)] bg-[var(--theme-surface)] p-2 transition-all hover:border-[var(--theme-text)] focus-within:border-[var(--theme-accent)]">
                                <p className="text-[10px] uppercase font-bold tracking-wider text-[var(--theme-text-secondary)]">
                                    Budget
                                </p>
                                <p className="text-lg font-black text-[var(--theme-text)]">
                                    {health.budgetAdherenceScore}
                                </p>
                            </div>
                            <div className="border-[2px] border-[var(--theme-border)] bg-[var(--theme-surface)] p-2 transition-all hover:border-[var(--theme-text)] focus-within:border-[var(--theme-accent)]">
                                <p className="text-[10px] uppercase font-bold tracking-wider text-[var(--theme-text-secondary)]">
                                    Savings
                                </p>
                                <p className="text-lg font-black text-[var(--theme-text)]">
                                    {health.savingsTrendScore}
                                </p>
                            </div>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-4 border-2 border-[var(--theme-border)]">
                    <div className="mb-3 flex items-center justify-between">
                        <div>
                            <h3 className="app-heading text-lg font-black uppercase tracking-tight inline-flex items-center gap-1">
                                Personalized Insights
                                <InfoTooltip label="Why this matters: insight alerts identify anomalies and trend shifts before they become month-end budget problems." />
                            </h3>
                            <p className="text-xs font-semibold text-[var(--theme-text-secondary)]">
                                AI-style tips focused on your trends.
                            </p>
                        </div>
                        <p className="text-[11px] font-bold text-[var(--theme-text-secondary)]">
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
                        <div className="border-[2px] border-dashed border-[var(--theme-border)] bg-[var(--theme-surface)] p-4 text-center text-sm font-bold tracking-wide text-[var(--theme-text-secondary)]">
                            No insight signals yet. Keep tracking expenses.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-2 xl:grid-cols-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                            {insightItems.map((insight) => (
                                <div
                                    key={insight.id}
                                    className="border-[2px] border-[var(--theme-border)] bg-[var(--theme-surface)] p-3 transition-colors hover:border-[var(--theme-text)]"
                                >
                                    <div className="mb-1 flex items-center justify-between gap-2">
                                        <p className="text-sm font-black leading-tight">
                                            {insight.title}
                                        </p>
                                        <span
                                            className={`text-[10px] font-black uppercase tracking-wider ${insightToneClass[insight.severity] || "text-[var(--theme-text-secondary)]"}`}
                                        >
                                            {insight.severity}
                                        </span>
                                    </div>
                                    <p className="text-xs font-medium text-[var(--theme-text-secondary)]">
                                        {insight.message}
                                    </p>
                                    <div className="mt-2 flex items-center justify-between gap-2 text-[11px]">
                                        <span className="text-[var(--theme-text-secondary)] font-bold uppercase tracking-wider">
                                            {insight.metricLabel}
                                        </span>
                                        <span className="font-black text-[var(--theme-text)]">
                                            {Number(
                                                insight.metricValue,
                                            ).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-xs font-bold border-t border-[var(--theme-border)] pt-2 text-[var(--theme-accent)]">
                                        {insight.recommendation}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </GlassCard>
            </div>

            <div>
                <h3 className="app-heading text-lg font-black uppercase tracking-tight mb-2">
                    Cost Categories Overview
                </h3>
                <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 xl:grid-cols-5">
                    {topTypes.length === 0 ? (
                        <GlassCard className="p-4 xl:col-span-5 border-2 border-dashed border-[var(--theme-border)]">
                            <p className="text-sm font-bold text-center uppercase tracking-widest text-[var(--theme-text-secondary)]">
                                No cost categories yet. Add expenses to populate
                                this view.
                            </p>
                        </GlassCard>
                    ) : (
                        topTypes.map((item, index) => (
                            <GlassCard
                                key={item.type}
                                className="min-w-[248px] snap-start p-0 overflow-hidden sm:min-w-0 border-[2px] transition-transform hover:-translate-y-1 hover:border-[var(--theme-text)]"
                                style={{
                                    borderColor:
                                        accountColors[
                                            index % accountColors.length
                                        ],
                                }}
                            >
                                <div
                                    className="h-3 w-full"
                                    style={{
                                        backgroundColor:
                                            accountColors[
                                                index % accountColors.length
                                            ],
                                    }}
                                />
                                <div className="space-y-1 p-4">
                                    <p
                                        className="text-[10px] font-bold uppercase tracking-widest"
                                        style={{
                                            color: "var(--theme-text-secondary)",
                                        }}
                                    >
                                        {item.type}
                                    </p>
                                    <p className="text-3xl font-black leading-none tracking-tighter text-[var(--theme-text)]">
                                        {item.total.toLocaleString()}
                                    </p>
                                    <div className="pt-2 text-xs font-bold uppercase tracking-wider text-[var(--theme-text-secondary)]">
                                        {item.count} trans.
                                    </div>
                                </div>
                            </GlassCard>
                        ))
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
                <GlassCard className="p-4 border-2 border-[var(--theme-border)] overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="app-heading text-lg font-black uppercase tracking-tight">
                            Recent Activity
                        </h3>
                        <Link
                            to="/expenses"
                            className="border-[2px] border-[var(--theme-text)] bg-[var(--theme-background)] px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-transform hover:-translate-y-[2px]"
                        >
                            History
                        </Link>
                    </div>
                    <div className="space-y-2">
                        {recentExpenses.length === 0 ? (
                            <p
                                className="text-sm font-semibold"
                                style={{ color: "var(--theme-text-secondary)" }}
                            >
                                No recent activity found.
                            </p>
                        ) : (
                            recentExpenses.map((expense) => (
                                <div
                                    key={expense._id}
                                    className="group flex items-center justify-between gap-3 border-[2px] border-[var(--theme-border)] bg-[var(--theme-surface)] p-3 transition-colors hover:border-[var(--theme-text)]"
                                >
                                    <div>
                                        <p className="text-sm font-black uppercase tracking-tight text-[var(--theme-text)] group-hover:text-[var(--theme-accent)] transition-colors">
                                            {expense.description}
                                        </p>
                                        <p
                                            className="text-xs font-bold capitalize mt-0.5"
                                            style={{
                                                color: "var(--theme-text-secondary)",
                                            }}
                                        >
                                            {expense.type}
                                        </p>
                                    </div>
                                    <p className="text-sm font-black whitespace-nowrap text-[var(--theme-text)]">
                                        {formatMoneyBirr(expense.amount)}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </GlassCard>

                <GlassCard className="p-4 border-[2px] border-[var(--theme-border)]">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="app-heading text-lg font-black uppercase tracking-tight">
                            Recent Months
                        </h3>
                        <Link
                            to="/charts"
                            className="border-[2px] border-[var(--theme-text)] bg-[var(--theme-background)] px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-transform hover:-translate-y-[2px]"
                        >
                            Charts
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {monthlyBreakdown
                            .slice()
                            .reverse()
                            .slice(0, 6)
                            .map((m) => (
                                <div
                                    key={`${m.year}-${m.month}`}
                                    className="border-[2px] border-[var(--theme-border)] bg-[var(--theme-surface)] p-3 transition-colors hover:border-[var(--theme-text)]"
                                >
                                    <p
                                        className="text-xs font-bold uppercase tracking-widest"
                                        style={{
                                            color: "var(--theme-text-secondary)",
                                        }}
                                    >
                                        {monthNames[m.month - 1]} {m.year}
                                    </p>
                                    <p className="text-base font-black mt-2 text-[var(--theme-text)]">
                                        {formatMoneyBirr(m.total)}
                                    </p>
                                </div>
                            ))}
                    </div>
                </GlassCard>
            </div>

            {forecast && (
                <GlassCard className="p-4 sm:p-5 overflow-hidden border-[2px] border-[var(--theme-border)] bg-[var(--theme-surface)]">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h3 className="app-heading text-lg font-black uppercase tracking-tight inline-flex items-center gap-1">
                                Forecast Highlights
                                <InfoTooltip label="Why this matters: this section summarizes projected net outcomes from recurring income and forecasted spend for month, 6 months, and 12 months." />
                            </h3>
                            <p className="text-xs font-semibold text-[var(--theme-text-secondary)]">
                                Fast view of projected income, spend, and net
                                outcome.
                            </p>
                        </div>
                        <Link
                            to="/forecast"
                            className="inline-flex items-center gap-1 border-[2px] border-[var(--theme-text)] bg-[var(--theme-background)] px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-transform hover:-translate-y-[2px]"
                        >
                            Open forecast
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>

                    <div className="forecast-snap-row -mx-1 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 xl:mx-0 xl:grid xl:grid-cols-3 xl:overflow-visible xl:px-0">
                        <Link
                            to="/forecast"
                            className="forecast-snap-card min-w-[280px] snap-center border-[2px] border-[var(--theme-border)] bg-[linear-gradient(135deg,var(--theme-active),var(--theme-surface)_65%)] p-4 transition-all hover:border-[var(--theme-text)] hover:-translate-y-1 xl:min-w-0"
                        >
                            <p className="text-[10px] uppercase font-bold tracking-widest text-[var(--theme-text-secondary)] inline-flex items-center gap-1">
                                Month-end net
                                <InfoTooltip label="Computed as projected recurring income minus projected spend for the next month." />
                            </p>
                            <p className="mt-2 text-2xl font-black">
                                {formatMoneyBirr(
                                    forecast.summary.projectedCashFlow,
                                )}
                            </p>
                            <p className="mt-2 text-xs font-semibold text-[var(--theme-text-secondary)] border-t border-[var(--theme-border)] pt-2">
                                <span className="font-bold">IN:</span>{" "}
                                {formatMoneyBirr(
                                    forecast.summary.projectedRecurringIncome,
                                )}{" "}
                                |{" "}
                                <span className="font-bold text-rose-600">
                                    OUT:
                                </span>{" "}
                                {formatMoneyBirr(
                                    forecast.summary.projectedSpend,
                                )}
                            </p>
                            <span
                                className={`mt-3 inline-flex items-center gap-1 border-[2px] px-2 py-1 text-[11px] font-black uppercase tracking-widest ${netBadgeClass(forecast.summary.projectedCashFlow)}`}
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
                            className="forecast-snap-card min-w-[280px] snap-center border-[2px] border-[var(--theme-border)] bg-[var(--theme-surface)] p-4 transition-all hover:border-[var(--theme-text)] hover:-translate-y-1 xl:min-w-0"
                        >
                            <p className="text-[10px] uppercase font-bold tracking-widest text-[var(--theme-text-secondary)] inline-flex items-center gap-1">
                                6M net outlook
                                <InfoTooltip label="Six-month net = six-month recurring income minus six-month forecast spend." />
                            </p>
                            <p className="mt-2 text-xl font-black">
                                {formatMoneyBirr(
                                    forecast.summary.next6MonthsNet,
                                )}
                            </p>
                            <p className="mt-2 text-xs font-semibold text-[var(--theme-text-secondary)] border-t border-[var(--theme-border)] pt-2">
                                <span className="font-bold">IN:</span>{" "}
                                {formatMoneyBirr(
                                    forecast.summary.next6MonthsIncome,
                                )}{" "}
                                |{" "}
                                <span className="font-bold text-rose-600">
                                    OUT:
                                </span>{" "}
                                {formatMoneyBirr(
                                    forecast.summary.next6MonthsSpend,
                                )}
                            </p>
                            <span
                                className={`mt-3 inline-flex border-[2px] px-2 py-1 text-[11px] font-black uppercase tracking-widest ${netBadgeClass(forecast.summary.next6MonthsNet)}`}
                            >
                                {forecast.summary.next6MonthsNet >= 0
                                    ? "Positive"
                                    : "Negative"}
                            </span>
                        </Link>

                        <Link
                            to="/forecast"
                            className="forecast-snap-card min-w-[280px] snap-center border-[2px] border-[var(--theme-border)] bg-[var(--theme-surface)] p-4 transition-all hover:border-[var(--theme-text)] hover:-translate-y-1 xl:min-w-0"
                        >
                            <p className="text-[10px] uppercase font-bold tracking-widest text-[var(--theme-text-secondary)] inline-flex items-center gap-1">
                                12M net outlook
                                <InfoTooltip label="Twelve-month net = twelve-month recurring income minus twelve-month forecast spend." />
                            </p>
                            <p className="mt-2 text-xl font-black">
                                {formatMoneyBirr(
                                    forecast.summary.next12MonthsNet,
                                )}
                            </p>
                            <p className="mt-2 text-xs font-semibold text-[var(--theme-text-secondary)] border-t border-[var(--theme-border)] pt-2">
                                <span className="font-bold">IN:</span>{" "}
                                {formatMoneyBirr(
                                    forecast.summary.next12MonthsIncome,
                                )}{" "}
                                |{" "}
                                <span className="font-bold text-rose-600">
                                    OUT:
                                </span>{" "}
                                {formatMoneyBirr(
                                    forecast.summary.next12MonthsSpend,
                                )}
                            </p>
                            <span
                                className={`mt-3 inline-flex border-[2px] px-2 py-1 text-[11px] font-black uppercase tracking-widest ${netBadgeClass(forecast.summary.next12MonthsNet)}`}
                            >
                                {forecast.summary.next12MonthsNet >= 0
                                    ? "Positive"
                                    : "Negative"}
                            </span>
                        </Link>
                    </div>
                </GlassCard>
            )}

            {showImportSection && importSynergy && (
                <GlassCard className="p-4 sm:p-5 border-2 border-[var(--theme-border)] bg-[var(--theme-surface)]">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between border-b border-[var(--theme-border)] pb-4 mb-4">
                        <div>
                            <h3 className="app-heading text-lg font-black uppercase tracking-tight inline-flex items-center gap-1">
                                Data Import Synergy
                                <InfoTooltip label="Imported bank accounts are now wired into Home with account-level drill-down and an all-accounts aggregate mode." />
                            </h3>
                            <p className="text-xs font-semibold text-[var(--theme-text-secondary)] mt-1">
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
                            className="h-10 min-w-[220px] border-[2px] border-[var(--theme-text)] bg-[var(--theme-surface)] px-3 text-sm font-bold tracking-wide uppercase transition-colors focus:border-[var(--theme-accent)] outline-none"
                        >
                            {importSynergy.accountOptions.map((option) => (
                                <option key={option.key} value={option.key}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                        {importSynergy.accounts.map((account, index) => (
                            <button
                                key={account.key}
                                type="button"
                                onClick={() =>
                                    setSelectedImportAccountKey(account.key)
                                }
                                className={`relative min-w-[220px] border-[2px] bg-[var(--theme-surface)] p-4 text-left transition-all ${index === 0 ? "" : "-ml-8"} ${selectedImportAccountKey === account.key ? "z-20 scale-[1.02] border-[var(--theme-text)] shadow-[4px_4px_0_0_var(--theme-text)]" : "z-10 border-[var(--theme-border)] hover:z-20 hover:-translate-y-1 hover:border-[var(--theme-text)] hover:shadow-[4px_4px_0_0_var(--theme-border)]"}`}
                                style={{
                                    borderTopColor:
                                        accountColors[
                                            index % accountColors.length
                                        ],
                                    borderTopWidth: "4px",
                                }}
                            >
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--theme-text-secondary)]">
                                    {account.accountNumber || account.key}
                                </p>
                                <p className="mt-2 text-xl font-black tracking-tight text-[var(--theme-text)]">
                                    {formatMoneyBirr(account.balance || 0)}
                                </p>
                                <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-[var(--theme-text-secondary)] border-t border-[var(--theme-border)] pt-2">
                                    {account.txCount} trans.
                                </p>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-4 mt-6">
                        <div className="border-[2px] border-[var(--theme-text)] bg-[var(--theme-active)] p-4 col-span-2">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--theme-text)]">
                                {selectedImportAccountKey === "ALL"
                                    ? "Aggregate Balance"
                                    : "Selected Balance"}
                            </p>
                            <p className="text-2xl font-black mt-1">
                                {selectedImportAccountKey === "ALL"
                                    ? formatMoneyBirr(
                                          importSynergy.aggregate.totalBalance,
                                      )
                                    : formatMoneyBirr(
                                          selectedImportAccount?.balance || 0,
                                      )}
                            </p>
                        </div>
                        <div className="border-[2px] border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--theme-text-secondary)]">
                                Debits
                            </p>
                            <p className="text-lg font-black text-rose-600 mt-1">
                                {formatMoneyBirr(
                                    importSynergy.aggregate.debitTotal,
                                )}
                            </p>
                        </div>
                        <div className="border-[2px] border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--theme-text-secondary)]">
                                Credits
                            </p>
                            <p className="text-lg font-black text-emerald-600 mt-1">
                                {formatMoneyBirr(
                                    importSynergy.aggregate.creditTotal,
                                )}
                            </p>
                        </div>
                    </div>
                </GlassCard>
            )}
        </PageContainer>
    );
}
