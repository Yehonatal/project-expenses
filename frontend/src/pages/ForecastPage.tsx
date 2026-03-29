import { useEffect, useMemo, useState } from "react";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Line,
    LineChart,
} from "recharts";
import { Link } from "react-router-dom";
import PageContainer from "../components/ui/PageContainer";
import PageSkeleton from "../components/ui/PageSkeleton";
import GlassCard from "../components/ui/GlassCard";
import { monthNames } from "../hooks/useSummaryDashboard";
import { getExpenseForecast, getImportSynergyOverview } from "../api/api";
import type { ForecastData, ImportSynergyOverview } from "../types/dashboard";
import { formatMoneyBirr } from "../utils/formatters";
import { Loader2, Wallet } from "lucide-react";
import InfoTooltip from "../components/ui/InfoTooltip";

const chartTooltipProps = {
    contentStyle: {
        backgroundColor: "var(--theme-surface)",
        border: "1px solid var(--theme-border)",
        color: "var(--theme-text)",
        borderRadius: 0,
        boxShadow: "none",
    },
    labelStyle: {
        color: "var(--theme-text)",
    },
    wrapperStyle: {
        zIndex: 40,
    },
    cursor: {
        stroke: "var(--theme-border)",
        strokeWidth: 1,
    },
} as const;

type ForecastState = {
    data: ForecastData | null;
    loading: boolean;
    refreshing: boolean;
    error: string | null;
};

export default function ForecastPage() {
    const [windowMonths, setWindowMonths] = useState<1 | 3 | 6 | 12>(6);
    const [projectionHorizon, setProjectionHorizon] = useState<6 | 12>(6);
    const [chartViewMode, setChartViewMode] = useState<
        "range" | "probabilistic"
    >("probabilistic");
    const [scenario, setScenario] = useState<
        "conservative" | "baseline" | "aggressive"
    >("baseline");
    const [contentVisible, setContentVisible] = useState(false);
    const [state, setState] = useState<ForecastState>({
        data: null,
        loading: true,
        refreshing: false,
        error: null,
    });
    const [importOverview, setImportOverview] =
        useState<ImportSynergyOverview | null>(null);
    const [importAccountKey, setImportAccountKey] = useState("ALL");
    const [importOverviewLoading, setImportOverviewLoading] = useState(false);

    useEffect(() => {
        let mounted = true;

        setState((prev) => ({
            ...prev,
            loading: !prev.data,
            refreshing: !!prev.data,
            error: null,
        }));

        const load = async () => {
            try {
                const response = await getExpenseForecast({
                    window: windowMonths,
                    scenario,
                });
                if (!mounted) return;
                setState({
                    data: response.data,
                    loading: false,
                    refreshing: false,
                    error: null,
                });
            } catch (error) {
                console.error("Failed to load forecast", error);
                if (!mounted) return;
                setState((prev) => ({
                    data: prev.data,
                    loading: false,
                    refreshing: false,
                    error: "Unable to load forecast right now.",
                }));
            }
        };

        void load();
        return () => {
            mounted = false;
        };
    }, [windowMonths, scenario]);

    useEffect(() => {
        if (!state.data || state.loading) return;
        setContentVisible(false);
        const timeout = setTimeout(() => setContentVisible(true), 70);
        return () => clearTimeout(timeout);
    }, [state.data, state.loading, windowMonths, scenario]);

    useEffect(() => {
        let mounted = true;

        const loadImportOverview = async () => {
            try {
                setImportOverviewLoading(true);
                const res = await getImportSynergyOverview({
                    accountKey: importAccountKey,
                });
                if (!mounted) return;
                setImportOverview(res.data);
            } catch (err) {
                if (!mounted) return;
                setImportOverview(null);
                console.error("Failed to load import forecast overlay", err);
            } finally {
                if (mounted) setImportOverviewLoading(false);
            }
        };

        void loadImportOverview();

        return () => {
            mounted = false;
        };
    }, [importAccountKey]);

    const forecastSeries = useMemo(
        () =>
            (state.data?.forecast || []).map((point) => ({
                label: `${monthNames[point.month - 1]} ${String(point.year).slice(2)}`,
                projected: point.projectedSpend,
                recurring: point.projectedRecurringSpend,
                min: point.min,
                max: point.max,
                p10: point.p10,
                p50: point.p50,
                p90: point.p90,
            })),
        [state.data],
    );

    const projectionSeries = useMemo(
        () => forecastSeries.slice(0, projectionHorizon),
        [forecastSeries, projectionHorizon],
    );

    const historicalSeries = useMemo(
        () =>
            (state.data?.historical || []).map((point) => ({
                label: `${monthNames[point.month - 1]} ${String(point.year).slice(2)}`,
                actual: point.total,
            })),
        [state.data],
    );

    const revealStyle = (delayMs: number) => ({
        transition: `opacity 420ms ease ${delayMs}ms, transform 420ms ease ${delayMs}ms`,
    });

    const revealClass = contentVisible
        ? "opacity-100 translate-y-0"
        : "opacity-0 translate-y-2";

    if (state.loading && !state.data) {
        return <PageSkeleton title="Loading forecast model" />;
    }

    if (!state.data) {
        return (
            <PageContainer title="Forecast Dashboard">
                <GlassCard>
                    <p>{state.error || "No forecast available"}</p>
                </GlassCard>
            </PageContainer>
        );
    }

    const { summary, generatedAt, categories, request, assumptions } =
        state.data;

    const monthNetPositive = summary.projectedCashFlow >= 0;

    const netBadge = (value: number) =>
        value >= 0
            ? "border-emerald-600/30 bg-emerald-600/12 text-emerald-600"
            : "border-rose-600/30 bg-rose-600/12 text-rose-600";

    return (
        <PageContainer
            title="Forecast Dashboard"
            subtitle="Understand month-end projection and forward spending using your selected history window."
            className="space-y-5 sm:space-y-6"
        >
            <div
                className={`border border-[var(--theme-border)] bg-[var(--theme-surface)] p-4 sm:p-5 ${revealClass}`}
                style={revealStyle(0)}
            >
                <div className="grid grid-cols-1 gap-2 xl:grid-cols-4">
                    <div className="border border-[var(--theme-border)] bg-[linear-gradient(135deg,var(--theme-active),var(--theme-surface)_62%)] p-4 xl:col-span-2">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--theme-text-secondary)]">
                                    Most important
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                    <Wallet className="h-5 w-5" />
                                    <h2 className="app-heading text-xl font-semibold sm:text-2xl">
                                        End-of-month net outcome
                                    </h2>
                                </div>
                            </div>
                            <span
                                className={`inline-flex border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] ${netBadge(summary.projectedCashFlow)}`}
                            >
                                {summary.projectedCashFlow >= 0
                                    ? "Positive"
                                    : "Negative"}
                            </span>
                        </div>

                        <p
                            className={`mt-2 text-3xl font-semibold sm:text-4xl ${monthNetPositive ? "text-emerald-600" : "text-rose-600"}`}
                        >
                            {formatMoneyBirr(summary.projectedCashFlow)}
                        </p>
                        <p className="mt-1 text-xs text-[var(--theme-text-secondary)]">
                            Recurring income minus projected spend for the next
                            month.
                        </p>

                        <div className="mt-3 grid grid-cols-3 gap-2">
                            <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-2">
                                <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                                    Income
                                </p>
                                <p className="text-sm font-semibold text-emerald-600">
                                    {formatMoneyBirr(
                                        summary.projectedRecurringIncome,
                                    )}
                                </p>
                            </div>
                            <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-2">
                                <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                                    Spend
                                </p>
                                <p className="text-sm font-semibold text-rose-600">
                                    {formatMoneyBirr(summary.projectedSpend)}
                                </p>
                            </div>
                            <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-2">
                                <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                                    Net
                                </p>
                                <p
                                    className={`text-sm font-semibold ${monthNetPositive ? "text-emerald-600" : "text-rose-600"}`}
                                >
                                    {formatMoneyBirr(summary.projectedCashFlow)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                        <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                            6M net outlook
                        </p>
                        <p className="mt-1 text-lg font-semibold">
                            {formatMoneyBirr(summary.next6MonthsNet)}
                        </p>
                        <p className="mt-1 text-xs text-[var(--theme-text-secondary)]">
                            Income {formatMoneyBirr(summary.next6MonthsIncome)}
                        </p>
                        <p className="text-xs text-[var(--theme-text-secondary)]">
                            Spend {formatMoneyBirr(summary.next6MonthsSpend)}
                        </p>
                        <span
                            className={`mt-2 inline-flex border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] ${netBadge(summary.next6MonthsNet)}`}
                        >
                            {summary.next6MonthsNet >= 0
                                ? "Positive"
                                : "Negative"}
                        </span>
                    </div>

                    <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                        <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                            12M net outlook
                        </p>
                        <p className="mt-1 text-lg font-semibold">
                            {formatMoneyBirr(summary.next12MonthsNet)}
                        </p>
                        <p className="mt-1 text-xs text-[var(--theme-text-secondary)]">
                            Income {formatMoneyBirr(summary.next12MonthsIncome)}
                        </p>
                        <p className="text-xs text-[var(--theme-text-secondary)]">
                            Spend {formatMoneyBirr(summary.next12MonthsSpend)}
                        </p>
                        <span
                            className={`mt-2 inline-flex border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] ${netBadge(summary.next12MonthsNet)}`}
                        >
                            {summary.next12MonthsNet >= 0
                                ? "Positive"
                                : "Negative"}
                        </span>
                    </div>
                </div>
            </div>

            <div
                className={`border border-[var(--theme-border)] bg-[var(--theme-surface)] p-4 sm:p-5 ${revealClass}`}
                style={revealStyle(70)}
            >
                {importOverview && (
                    <div className="mb-4 border border-[var(--theme-border)] bg-[var(--theme-background)] p-3 sm:p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                                    Imported cashflow baseline
                                </p>
                                <p className="text-xs text-[var(--theme-text-secondary)]">
                                    Forecast signal generated from imported
                                    credits and debits.
                                </p>
                            </div>
                            <select
                                value={importAccountKey}
                                onChange={(event) =>
                                    setImportAccountKey(event.target.value)
                                }
                                className="h-9 min-w-[220px] border border-[var(--theme-border)] bg-[var(--theme-surface)] px-3 text-xs"
                            >
                                {importOverview.accountOptions.map((option) => (
                                    <option key={option.key} value={option.key}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                            <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-2">
                                <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                                    Baseline monthly net
                                </p>
                                <p className="text-sm font-semibold">
                                    {formatMoneyBirr(
                                        importOverview.forecast
                                            .baselineMonthlyNet,
                                    )}
                                </p>
                            </div>
                            <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-2">
                                <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                                    Next month projected net
                                </p>
                                <p className="text-sm font-semibold">
                                    {formatMoneyBirr(
                                        importOverview.forecast
                                            .nextMonthProjectedNet,
                                    )}
                                </p>
                            </div>
                            <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-2">
                                <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                                    Next 6 months projected net
                                </p>
                                <p className="text-sm font-semibold">
                                    {formatMoneyBirr(
                                        importOverview.forecast
                                            .next6MonthsProjectedNet,
                                    )}
                                </p>
                            </div>
                        </div>

                        {importOverviewLoading && (
                            <p className="mt-2 text-xs text-[var(--theme-text-secondary)]">
                                Updating import forecast signal...
                            </p>
                        )}
                    </div>
                )}

                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                            Generated
                        </p>
                        <p className="text-sm">
                            {new Date(generatedAt).toLocaleString([], {
                                month: "short",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </p>
                        <h2 className="app-heading mt-2 text-2xl font-semibold tracking-[-0.01em] sm:text-3xl">
                            Next month estimate:{" "}
                            {formatMoneyBirr(summary.projectedSpend)}
                        </h2>
                        <p className="mt-1 text-xs text-[var(--theme-text-secondary)]">
                            Blends this month-end run-rate with last{" "}
                            {request.windowMonths === 1
                                ? "1 completed month"
                                : `${request.windowMonths} completed months`}{" "}
                            using {request.scenario} scenario.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:gap-6">
                        <div>
                            <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                                Next vs month-end
                            </p>
                            <p
                                className={`text-xl font-semibold ${summary.monthOverMonthDelta > 0 ? "text-rose-600" : "text-emerald-600"}`}
                            >
                                {summary.monthOverMonthDelta > 0 ? "+" : ""}
                                {summary.monthOverMonthDelta.toFixed(1)}%
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                                Confidence
                            </p>
                            <p className="text-xl font-semibold">
                                {summary.confidence}%
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-2">
                        {(
                            [
                                { label: "Last month", value: 1 },
                                { label: "Last 3", value: 3 },
                                { label: "Last 6", value: 6 },
                                { label: "Last year", value: 12 },
                            ] as const
                        ).map((item) => (
                            <button
                                key={item.value}
                                type="button"
                                onClick={() => setWindowMonths(item.value)}
                                className={`px-2.5 py-1.5 text-xs border transition-colors ${windowMonths === item.value ? "border-[var(--theme-accent)] bg-[var(--theme-accent)] text-[var(--theme-background)]" : "border-[var(--theme-border)] bg-[var(--theme-background)] hover:bg-[var(--theme-hover)]"}`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {(
                            [
                                {
                                    label: "Conservative (-45%)",
                                    value: "conservative",
                                },
                                {
                                    label: "Baseline",
                                    value: "baseline",
                                },
                                {
                                    label: "Aggressive (+60%)",
                                    value: "aggressive",
                                },
                            ] as const
                        ).map((item) => (
                            <button
                                key={item.value}
                                type="button"
                                onClick={() => setScenario(item.value)}
                                className={`px-2.5 py-1.5 text-xs border transition-colors ${scenario === item.value ? "border-[var(--theme-accent)] bg-[var(--theme-accent)] text-[var(--theme-background)]" : "border-[var(--theme-border)] bg-[var(--theme-background)] hover:bg-[var(--theme-hover)]"}`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                {state.refreshing && (
                    <div className="mt-3 inline-flex items-center gap-2 text-xs text-[var(--theme-text-secondary)]">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Recomputing forecast...
                    </div>
                )}
                {state.error && (
                    <p className="mt-2 text-xs text-rose-600">{state.error}</p>
                )}
            </div>

            <div
                className={`grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-6 ${revealClass}`}
                style={revealStyle(140)}
            >
                <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                    <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                        This month spent so far
                    </p>
                    <p className="text-lg font-semibold sm:text-xl">
                        {formatMoneyBirr(summary.currentMonthSpend)}
                    </p>
                </div>
                <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                    <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                        Daily run-rate
                    </p>
                    <p className="text-lg font-semibold sm:text-xl">
                        {formatMoneyBirr(summary.dailyRunRate)}
                    </p>
                </div>
                <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                    <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                        Current month end
                    </p>
                    <p className="text-lg font-semibold sm:text-xl">
                        {formatMoneyBirr(summary.projectedCurrentMonthEndSpend)}
                    </p>
                </div>
                <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                    <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                        Next month estimate
                    </p>
                    <p className="text-lg font-semibold sm:text-xl">
                        {formatMoneyBirr(summary.projectedSpend)}
                    </p>
                </div>
                <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                    <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                        Recurring income (next month)
                    </p>
                    <p className="text-lg font-semibold text-emerald-600 sm:text-xl">
                        {formatMoneyBirr(summary.projectedRecurringIncome)}
                    </p>
                </div>
                <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                    <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                        Next 6 months
                    </p>
                    <p className="text-lg font-semibold sm:text-xl">
                        {formatMoneyBirr(summary.next6MonthsSpend)}
                    </p>
                </div>
                <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                    <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                        Next 12 months
                    </p>
                    <p className="text-lg font-semibold sm:text-xl">
                        {formatMoneyBirr(summary.next12MonthsSpend)}
                    </p>
                </div>
                <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3 col-span-2 md:col-span-2 xl:col-span-2 flex items-center justify-between gap-2">
                    <div>
                        <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                            Take action
                        </p>
                        <p className="text-xs text-[var(--theme-text-secondary)]">
                            Review recurring plans and check advanced model
                            outputs below.
                        </p>
                    </div>
                    <Link
                        to="/recurrings"
                        className="border border-[var(--theme-border)] bg-[var(--theme-background)] px-2 py-1 text-xs transition-colors hover:bg-[var(--theme-hover)]"
                    >
                        Review recurring
                    </Link>
                </div>
            </div>

            <div
                className={`grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6 ${revealClass}`}
                style={revealStyle(220)}
            >
                <GlassCard className="p-4">
                    <h3 className="app-heading tracking-[-0.01em] text-lg font-semibold mb-3">
                        Historical Spend (
                        {request.windowMonths === 1
                            ? "1 completed month"
                            : `${request.windowMonths} completed months`}
                        )
                    </h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={historicalSeries}>
                            <CartesianGrid
                                strokeDasharray="2 2"
                                vertical={false}
                            />
                            <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip
                                formatter={(value) =>
                                    formatMoneyBirr(Number(value || 0))
                                }
                                {...chartTooltipProps}
                            />
                            <Area
                                type="monotone"
                                dataKey="actual"
                                stroke="var(--theme-secondary)"
                                fill="rgba(59,130,246,0.15)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </GlassCard>

                <GlassCard className="p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                        <h3 className="app-heading tracking-[-0.01em] text-lg font-semibold">
                            Forward Projection
                        </h3>
                        <div className="inline-flex flex-wrap items-center gap-1">
                            <button
                                type="button"
                                onClick={() => setProjectionHorizon(6)}
                                className={`px-2 py-1 text-[11px] border ${projectionHorizon === 6 ? "border-[var(--theme-accent)] bg-[var(--theme-accent)] text-[var(--theme-background)]" : "border-[var(--theme-border)] bg-[var(--theme-surface)]"}`}
                            >
                                6M
                            </button>
                            <button
                                type="button"
                                onClick={() => setProjectionHorizon(12)}
                                className={`px-2 py-1 text-[11px] border ${projectionHorizon === 12 ? "border-[var(--theme-accent)] bg-[var(--theme-accent)] text-[var(--theme-background)]" : "border-[var(--theme-border)] bg-[var(--theme-surface)]"}`}
                            >
                                12M
                            </button>
                            <button
                                type="button"
                                onClick={() => setChartViewMode("range")}
                                className={`px-2 py-1 text-[11px] border ${chartViewMode === "range" ? "border-[var(--theme-accent)] bg-[var(--theme-accent)] text-[var(--theme-background)]" : "border-[var(--theme-border)] bg-[var(--theme-surface)]"}`}
                            >
                                Range
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    setChartViewMode("probabilistic")
                                }
                                className={`px-2 py-1 text-[11px] border ${chartViewMode === "probabilistic" ? "border-[var(--theme-accent)] bg-[var(--theme-accent)] text-[var(--theme-background)]" : "border-[var(--theme-border)] bg-[var(--theme-surface)]"}`}
                            >
                                Probabilistic
                            </button>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={projectionSeries}>
                            <CartesianGrid
                                strokeDasharray="2 2"
                                vertical={false}
                            />
                            <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip
                                formatter={(value) =>
                                    formatMoneyBirr(Number(value || 0))
                                }
                                {...chartTooltipProps}
                            />
                            {chartViewMode === "probabilistic" ? (
                                <>
                                    <Line
                                        type="monotone"
                                        dataKey="p10"
                                        stroke="rgba(244,114,182,0.55)"
                                        strokeWidth={1.5}
                                        strokeDasharray="4 4"
                                        dot={false}
                                        name="P10"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="p50"
                                        stroke="var(--theme-accent)"
                                        strokeWidth={2.5}
                                        dot={{ r: 3 }}
                                        name="P50"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="p90"
                                        stroke="rgba(16,185,129,0.6)"
                                        strokeWidth={1.5}
                                        strokeDasharray="4 4"
                                        dot={false}
                                        name="P90"
                                    />
                                </>
                            ) : (
                                <>
                                    <Line
                                        type="monotone"
                                        dataKey="min"
                                        stroke="rgba(244,114,182,0.55)"
                                        strokeWidth={1.5}
                                        strokeDasharray="4 4"
                                        dot={false}
                                        name="Min"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="projected"
                                        stroke="var(--theme-accent)"
                                        strokeWidth={2.5}
                                        dot={{ r: 3 }}
                                        name="Expected"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="max"
                                        stroke="rgba(16,185,129,0.6)"
                                        strokeWidth={1.5}
                                        strokeDasharray="4 4"
                                        dot={false}
                                        name="Max"
                                    />
                                </>
                            )}
                            <Line
                                type="monotone"
                                dataKey="recurring"
                                stroke="var(--theme-primary)"
                                strokeWidth={2}
                                strokeDasharray="5 4"
                                dot={{ r: 2 }}
                                name="Recurring"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                    <p className="mt-2 text-xs text-[var(--theme-text-secondary)]">
                        Projection horizon is based on your selected history
                        window and scenario. Use 6M or 12M to inspect cumulative
                        impact.
                    </p>
                </GlassCard>
            </div>

            <div className={revealClass} style={revealStyle(220)}>
                <GlassCard className="p-4">
                    <h3 className="app-heading tracking-[-0.01em] text-lg font-semibold mb-2">
                        Advanced Model Outputs
                    </h3>
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
                        <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                            <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                                History-only baseline
                            </p>
                            <p className="text-sm font-semibold">
                                {formatMoneyBirr(
                                    summary.historicalBaselineSpend,
                                )}
                            </p>
                        </div>
                        <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                            <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                                Blended baseline
                            </p>
                            <p className="text-sm font-semibold">
                                {formatMoneyBirr(summary.anchoredBaselineSpend)}
                            </p>
                        </div>
                        <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                            <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                                Recurring (next month)
                            </p>
                            <p className="text-sm font-semibold">
                                {formatMoneyBirr(
                                    summary.projectedRecurringSpend,
                                )}
                            </p>
                            <p className="mt-1 text-[10px] text-[var(--theme-text-secondary)]">
                                Plus income{" "}
                                {formatMoneyBirr(
                                    summary.projectedRecurringIncome,
                                )}
                            </p>
                        </div>
                        <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                            <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                                Range (min/max)
                            </p>
                            <p className="text-sm font-semibold">
                                {formatMoneyBirr(summary.projectedMin)} -{" "}
                                {formatMoneyBirr(summary.projectedMax)}
                            </p>
                        </div>
                        <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                            <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                                P10/P50/P90
                            </p>
                            <p className="text-sm font-semibold">
                                {formatMoneyBirr(summary.p10)} /{" "}
                                {formatMoneyBirr(summary.p50)} /{" "}
                                {formatMoneyBirr(summary.p90)}
                            </p>
                            <p className="mt-1 text-[10px] text-[var(--theme-text-secondary)]">
                                Scenario-adjusted expected:{" "}
                                {formatMoneyBirr(summary.baselineSpend)}
                            </p>
                        </div>
                    </div>
                </GlassCard>
            </div>

            <div className={revealClass} style={revealStyle(250)}>
                <GlassCard className="p-4">
                    <h3 className="app-heading tracking-[-0.01em] text-lg font-semibold mb-3">
                        Category Forecast Decomposition
                    </h3>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
                        {categories.length === 0 ? (
                            <p className="text-sm text-[var(--theme-text-secondary)]">
                                Add more categorized expenses to unlock
                                decomposition insights.
                            </p>
                        ) : (
                            categories.map((category) => (
                                <div
                                    key={category.type}
                                    className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3"
                                >
                                    <p className="text-sm font-semibold capitalize">
                                        {category.type}
                                    </p>
                                    <p className="mt-1 text-xs text-[var(--theme-text-secondary)]">
                                        Expected:{" "}
                                        {formatMoneyBirr(category.expected)}
                                    </p>
                                    <p className="text-xs text-[var(--theme-text-secondary)]">
                                        Range: {formatMoneyBirr(category.min)} -{" "}
                                        {formatMoneyBirr(category.max)}
                                    </p>
                                    <p className="text-xs text-[var(--theme-text-secondary)]">
                                        Probabilistic:{" "}
                                        {formatMoneyBirr(category.p10)} /{" "}
                                        {formatMoneyBirr(category.p50)} /{" "}
                                        {formatMoneyBirr(category.p90)}
                                    </p>
                                    <p className="text-xs text-[var(--theme-text-secondary)]">
                                        Recurring share:{" "}
                                        {formatMoneyBirr(category.recurring)}
                                    </p>
                                    <div className="mt-2 h-20 w-full">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <BarChart
                                                data={[
                                                    {
                                                        label: "P10",
                                                        value: category.p10,
                                                    },
                                                    {
                                                        label: "P50",
                                                        value: category.p50,
                                                    },
                                                    {
                                                        label: "P90",
                                                        value: category.p90,
                                                    },
                                                ]}
                                                margin={{
                                                    top: 2,
                                                    right: 0,
                                                    left: 0,
                                                    bottom: 0,
                                                }}
                                            >
                                                <XAxis
                                                    dataKey="label"
                                                    tick={{ fontSize: 9 }}
                                                />
                                                <Tooltip
                                                    formatter={(value) =>
                                                        formatMoneyBirr(
                                                            Number(value || 0),
                                                        )
                                                    }
                                                    {...chartTooltipProps}
                                                />
                                                <Bar
                                                    dataKey="value"
                                                    fill="var(--theme-accent)"
                                                    radius={0}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </GlassCard>
            </div>

            <div className={revealClass} style={revealStyle(320)}>
                <GlassCard className="p-4">
                    <h3 className="app-heading tracking-[-0.01em] text-lg font-semibold mb-3">
                        Forecast Assumptions
                    </h3>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3 text-xs text-[var(--theme-text-secondary)]">
                            <p className="font-semibold text-[var(--theme-text)] inline-flex items-center gap-1">
                                Model
                                <InfoTooltip label="Why this matters: model choice controls how strongly recent months influence your forecast baseline." />
                            </p>
                            <p className="mt-1">{assumptions.model}</p>
                            <p className="mt-2">{assumptions.distribution}</p>
                        </div>
                        <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3 text-xs text-[var(--theme-text-secondary)]">
                            <p className="font-semibold text-[var(--theme-text)] inline-flex items-center gap-1">
                                Percentiles
                                <InfoTooltip label="Why this matters: percentile bands represent uncertainty bounds around expected spending." />
                            </p>
                            <p className="mt-1">
                                {assumptions.percentileMethod}
                            </p>
                            <p className="mt-2">
                                Scenario multiplier:{" "}
                                {assumptions.scenarioMultiplier.toFixed(2)}
                            </p>
                        </div>
                        <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3 text-xs text-[var(--theme-text-secondary)]">
                            <p className="font-semibold text-[var(--theme-text)] inline-flex items-center gap-1">
                                History window
                                <InfoTooltip label="Why this matters: shorter windows react faster, longer windows smooth seasonality and one-off spikes." />
                            </p>
                            <p className="mt-1">
                                {assumptions.windowMonths} month(s) used for
                                baseline fitting.
                            </p>
                            <p className="mt-2">
                                Monthly drift assumption:{" "}
                                {(assumptions.monthlyTrendDrift * 100).toFixed(
                                    1,
                                )}
                                %
                            </p>
                        </div>
                        <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3 text-xs text-[var(--theme-text-secondary)]">
                            <p className="font-semibold text-[var(--theme-text)] inline-flex items-center gap-1">
                                Current month estimate
                                <InfoTooltip label="Why this matters: end-of-month projection blends spend run-rate and baseline to avoid overreacting to early-month noise." />
                            </p>
                            <p className="mt-1">
                                {assumptions.currentMonthProjection}
                            </p>
                            <p className="mt-2">
                                Elapsed: {summary.daysElapsedInMonth}/
                                {summary.daysInMonth} days
                            </p>
                        </div>
                        <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3 text-xs text-[var(--theme-text-secondary)]">
                            <p className="font-semibold text-[var(--theme-text)] inline-flex items-center gap-1">
                                Recurring treatment
                                <InfoTooltip label="Why this matters: recurring commitments can dominate near-term forecasts, so frequency expansion affects cash-flow realism." />
                            </p>
                            <p className="mt-1">
                                {assumptions.recurringTreatment}
                            </p>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </PageContainer>
    );
}
