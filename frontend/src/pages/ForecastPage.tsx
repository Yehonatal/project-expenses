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
import { getExpenseForecast } from "../api/api";
import type { ForecastData } from "../types/dashboard";
import { formatMoneyBirr } from "../utils/formatters";
import { Loader2 } from "lucide-react";
import InfoTooltip from "../components/ui/InfoTooltip";

type ForecastState = {
    data: ForecastData | null;
    loading: boolean;
    refreshing: boolean;
    error: string | null;
};

export default function ForecastPage() {
    const [windowMonths, setWindowMonths] = useState<1 | 3 | 6 | 12>(6);
    const [projectionHorizon, setProjectionHorizon] = useState<6 | 12>(6);
    const [chartViewMode, setChartViewMode] = useState<"range" | "probabilistic">(
        "probabilistic",
    );
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

    const { summary, generatedAt, categories, request, assumptions } = state.data;

    return (
        <PageContainer
            title="Forecast Dashboard"
            subtitle="Predict next-month spend and cash flow from recent patterns and recurring commitments."
            className="space-y-5 sm:space-y-6"
        >
            <div
                className={`border border-[var(--theme-border)] bg-[var(--theme-surface)] p-4 sm:p-5 ${revealClass}`}
                style={revealStyle(0)}
            >
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
                            Projected spend:{" "}
                            {formatMoneyBirr(summary.projectedSpend)}
                        </h2>
                        <p className="mt-1 text-xs text-[var(--theme-text-secondary)]">
                            Based on last {request.windowMonths === 1 ? "month" : `${request.windowMonths} months`} using {request.scenario} scenario.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:gap-6">
                        <div>
                            <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                                MoM delta
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
                        {([
                            { label: "Last month", value: 1 },
                            { label: "Last 3", value: 3 },
                            { label: "Last 6", value: 6 },
                            { label: "Last year", value: 12 },
                        ] as const).map((item) => (
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
                        {([
                            { label: "Conservative", value: "conservative" },
                            { label: "Baseline", value: "baseline" },
                            { label: "Aggressive", value: "aggressive" },
                        ] as const).map((item) => (
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
                className={`grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-8 ${revealClass}`}
                style={revealStyle(90)}
            >
                <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                    <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                        Baseline spend
                    </p>
                    <p className="text-lg font-semibold sm:text-xl">
                        {formatMoneyBirr(summary.baselineSpend)}
                    </p>
                </div>
                <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                    <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                        Recurring projection
                    </p>
                    <p className="text-lg font-semibold sm:text-xl">
                        {formatMoneyBirr(summary.projectedRecurringSpend)}
                    </p>
                </div>
                <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                    <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                        Cash flow
                    </p>
                    <p className="text-lg font-semibold sm:text-xl">
                        {formatMoneyBirr(summary.projectedCashFlow)}
                    </p>
                </div>
                <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                    <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                        Min projection
                    </p>
                    <p className="text-lg font-semibold sm:text-xl">
                        {formatMoneyBirr(summary.projectedMin)}
                    </p>
                </div>
                <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                    <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                        Max projection
                    </p>
                    <p className="text-lg font-semibold sm:text-xl">
                        {formatMoneyBirr(summary.projectedMax)}
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
                <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                    <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                        P10
                    </p>
                    <p className="text-lg font-semibold sm:text-xl">
                        {formatMoneyBirr(summary.p10)}
                    </p>
                </div>
                <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                    <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                        P50
                    </p>
                    <p className="text-lg font-semibold sm:text-xl">
                        {formatMoneyBirr(summary.p50)}
                    </p>
                </div>
                <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                    <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                        P90
                    </p>
                    <p className="text-lg font-semibold sm:text-xl">
                        {formatMoneyBirr(summary.p90)}
                    </p>
                </div>
                <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3 col-span-2 md:col-span-2 xl:col-span-2 flex items-center justify-between gap-2">
                    <div>
                        <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                            Take action
                        </p>
                        <p className="text-xs text-[var(--theme-text-secondary)]">
                            Tune recurring and category controls.
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
                style={revealStyle(170)}
            >
                <GlassCard className="p-4">
                    <h3 className="app-heading tracking-[-0.01em] text-lg font-semibold mb-3">
                        Historical Spend ({request.windowMonths === 1 ? "1 month" : `${request.windowMonths} months`})
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
                            Projection with Confidence Bands
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
                                onClick={() => setChartViewMode("probabilistic")}
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
                                Add more categorized expenses to unlock decomposition insights.
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
                                        Expected: {formatMoneyBirr(category.expected)}
                                    </p>
                                    <p className="text-xs text-[var(--theme-text-secondary)]">
                                        Range: {formatMoneyBirr(category.min)} - {formatMoneyBirr(category.max)}
                                    </p>
                                    <p className="text-xs text-[var(--theme-text-secondary)]">
                                        Probabilistic: {formatMoneyBirr(category.p10)} / {formatMoneyBirr(category.p50)} / {formatMoneyBirr(category.p90)}
                                    </p>
                                    <p className="text-xs text-[var(--theme-text-secondary)]">
                                        Recurring share: {formatMoneyBirr(category.recurring)}
                                    </p>
                                    <div className="mt-2 h-20 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={[
                                                    { label: "P10", value: category.p10 },
                                                    { label: "P50", value: category.p50 },
                                                    { label: "P90", value: category.p90 },
                                                ]}
                                                margin={{ top: 2, right: 0, left: 0, bottom: 0 }}
                                            >
                                                <XAxis dataKey="label" tick={{ fontSize: 9 }} />
                                                <Tooltip
                                                    formatter={(value) =>
                                                        formatMoneyBirr(Number(value || 0))
                                                    }
                                                />
                                                <Bar dataKey="value" fill="var(--theme-accent)" radius={0} />
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
                                <p className="mt-1">{assumptions.percentileMethod}</p>
                                <p className="mt-2">Scenario multiplier: {assumptions.scenarioMultiplier.toFixed(2)}</p>
                            </div>
                            <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3 text-xs text-[var(--theme-text-secondary)]">
                                <p className="font-semibold text-[var(--theme-text)] inline-flex items-center gap-1">
                                    History window
                                    <InfoTooltip label="Why this matters: shorter windows react faster, longer windows smooth seasonality and one-off spikes." />
                                </p>
                                <p className="mt-1">{assumptions.windowMonths} month(s) used for baseline fitting.</p>
                                <p className="mt-2">Monthly drift assumption: {(assumptions.monthlyTrendDrift * 100).toFixed(1)}%</p>
                            </div>
                            <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3 text-xs text-[var(--theme-text-secondary)]">
                                <p className="font-semibold text-[var(--theme-text)] inline-flex items-center gap-1">
                                    Current month estimate
                                    <InfoTooltip label="Why this matters: end-of-month projection blends spend run-rate and baseline to avoid overreacting to early-month noise." />
                                </p>
                                <p className="mt-1">{assumptions.currentMonthProjection}</p>
                            </div>
                            <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3 text-xs text-[var(--theme-text-secondary)]">
                                <p className="font-semibold text-[var(--theme-text)] inline-flex items-center gap-1">
                                    Recurring treatment
                                    <InfoTooltip label="Why this matters: recurring commitments can dominate near-term forecasts, so frequency expansion affects cash-flow realism." />
                                </p>
                                <p className="mt-1">{assumptions.recurringTreatment}</p>
                            </div>
                        </div>
                    </GlassCard>
                </div>
        </PageContainer>
    );
}
