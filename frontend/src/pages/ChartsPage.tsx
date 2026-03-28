import {
    Area,
    AreaChart,
    CartesianGrid,
    ComposedChart,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Bar,
    Legend,
} from "recharts";
import PageContainer from "../components/ui/PageContainer";
import PageSkeleton from "../components/ui/PageSkeleton";
import GlassCard from "../components/ui/GlassCard";
import { monthNames, useSummaryDashboard } from "../hooks/useSummaryDashboard";

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

export default function ChartsPage() {
    const { loading, error, summary, chartData, trends, topTypes, totalCount } =
        useSummaryDashboard();

    if (loading) return <PageSkeleton title="Loading charts" />;

    if (error || !summary) {
        return (
            <PageContainer title="Charts & Overview">
                <GlassCard>
                    <p>{error || "No chart data available"}</p>
                </GlassCard>
            </PageContainer>
        );
    }

    const recentSeries = summary.monthlyBreakdown.slice(-12).map((m) => ({
        name: `${monthNames[m.month - 1]} ${String(m.year).slice(2)}`,
        total: m.total,
    }));

    const topCategories = summary.typeBreakdown.slice(0, 6).map((t) => ({
        name: t.type,
        total: t.total,
    }));

    const trendSeries = (trends?.trends || []).slice(0, 8).map((t) => ({
        name: t.category,
        current: t.currentMonth,
        previous: t.previousMonth,
    }));

    const providerCards = topTypes.slice(0, 4).map((typeItem, idx) => ({
        id: `${typeItem.type}-${idx}`,
        title: typeItem.type,
        total: typeItem.total,
        count: typeItem.count,
        series: recentSeries.slice(-8).map((point, pointIdx) => ({
            name: point.name,
            value: Math.max(0, point.total * ((idx + 1) / 8) + pointIdx * 50),
        })),
    }));

    const currentBalance =
        summary.totals.totalIncluded - summary.totals.totalExcluded;

    return (
        <PageContainer
            title="Charts & Overview"
            subtitle="Visualize balance movement, category concentration, and monthly performance at a glance."
            className="space-y-5 sm:space-y-6"
        >
            <GlassCard className="space-y-4 p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                        <h2 className="app-heading text-xl font-semibold tracking-[-0.01em] sm:text-2xl">
                            All Providers Messages
                        </h2>
                        <p
                            className="text-xs sm:text-sm"
                            style={{ color: "var(--theme-text-secondary)" }}
                        >
                            Global balance trajectory and activity composition.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:gap-6">
                        <div>
                            <p
                                className="text-[10px] uppercase"
                                style={{ color: "var(--theme-text-secondary)" }}
                            >
                                Processed
                            </p>
                            <p className="text-xl font-semibold sm:text-2xl">
                                {totalCount}
                            </p>
                        </div>
                        <div>
                            <p
                                className="text-[10px] uppercase"
                                style={{ color: "var(--theme-text-secondary)" }}
                            >
                                Current Balance
                            </p>
                            <p className="text-xl font-semibold sm:text-2xl">
                                {currentBalance.toLocaleString()} ETB
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-2">
                        <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                            Total In
                        </p>
                        <p className="text-sm font-semibold sm:text-base">
                            {summary.totals.totalIncluded.toLocaleString()} ETB
                        </p>
                    </div>
                    <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-2">
                        <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                            Total Out
                        </p>
                        <p className="text-sm font-semibold sm:text-base">
                            {summary.totals.totalExcluded.toLocaleString()} ETB
                        </p>
                    </div>
                    <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-2">
                        <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                            Included
                        </p>
                        <p className="text-sm font-semibold sm:text-base">
                            {summary.totals.countIncluded}
                        </p>
                    </div>
                    <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-2">
                        <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                            Excluded
                        </p>
                        <p className="text-sm font-semibold sm:text-base">
                            {summary.totals.countExcluded}
                        </p>
                    </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart
                        data={recentSeries}
                        margin={{ top: 6, right: 6, left: -8, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="2 2" />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 10 }}
                            minTickGap={18}
                        />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip
                            formatter={(value) =>
                                `${Number(value || 0).toLocaleString()} ETB`
                            }
                            {...chartTooltipProps}
                        />
                        <Legend />
                        <Area
                            type="monotone"
                            dataKey="total"
                            fill="rgba(129, 140, 248, 0.15)"
                            stroke="none"
                            name="Area"
                        />
                        <Line
                            type="monotone"
                            dataKey="total"
                            stroke="var(--theme-secondary)"
                            strokeWidth={2}
                            dot={{ r: 2 }}
                            name="Balance"
                        />
                        <Bar
                            dataKey="total"
                            fill="rgba(208, 139, 91, 0.25)"
                            barSize={8}
                            name="Volume"
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </GlassCard>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
                <GlassCard className="p-4">
                    <h3 className="app-heading tracking-[-0.01em] text-lg font-semibold mb-3">
                        Top Categories
                    </h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={topCategories}>
                            <CartesianGrid
                                strokeDasharray="2 2"
                                vertical={false}
                            />
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip
                                formatter={(value) =>
                                    `${Number(value || 0).toLocaleString()} ETB`
                                }
                                {...chartTooltipProps}
                            />
                            <Area
                                type="monotone"
                                dataKey="total"
                                stroke="var(--theme-primary)"
                                fill="rgba(16, 185, 129, 0.2)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </GlassCard>

                <GlassCard className="p-4">
                    <h3 className="app-heading tracking-[-0.01em] text-lg font-semibold mb-3">
                        Current vs Previous Month
                    </h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={trendSeries}>
                            <CartesianGrid
                                strokeDasharray="2 2"
                                vertical={false}
                            />
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip
                                formatter={(value) =>
                                    `${Number(value || 0).toLocaleString()} ETB`
                                }
                                {...chartTooltipProps}
                            />
                            <Line
                                type="monotone"
                                dataKey="current"
                                stroke="var(--theme-secondary)"
                                strokeWidth={2}
                            />
                            <Line
                                type="monotone"
                                dataKey="previous"
                                stroke="var(--theme-text-secondary)"
                                strokeWidth={2}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </GlassCard>
            </div>

            {providerCards.length > 0 && (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {providerCards.map((card) => (
                        <GlassCard key={card.id} className="space-y-3 p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h4 className="app-heading text-lg font-semibold tracking-[-0.01em]">
                                        {card.title}
                                    </h4>
                                    <p className="text-xs text-[var(--theme-text-secondary)]">
                                        {card.count} messages
                                    </p>
                                </div>
                                <p className="text-xl font-semibold">
                                    {card.total.toLocaleString()} ETB
                                </p>
                            </div>
                            <ResponsiveContainer width="100%" height={180}>
                                <LineChart data={card.series}>
                                    <CartesianGrid
                                        strokeDasharray="2 2"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 10 }}
                                        minTickGap={18}
                                    />
                                    <YAxis tick={{ fontSize: 10 }} />
                                    <Tooltip
                                        formatter={(value) =>
                                            `${Number(value || 0).toLocaleString()} ETB`
                                        }
                                        {...chartTooltipProps}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke="var(--theme-secondary)"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </GlassCard>
                    ))}
                </div>
            )}

            <GlassCard className="p-4">
                <h3 className="app-heading tracking-[-0.01em] text-lg font-semibold mb-3">
                    Recent 6-Month Totals
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {chartData.slice(-6).map((item) => (
                        <div
                            key={item.name}
                            className="border p-3"
                            style={{ borderColor: "var(--theme-border)" }}
                        >
                            <p
                                className="text-xs"
                                style={{ color: "var(--theme-text-secondary)" }}
                            >
                                {item.name}
                            </p>
                            <p className="text-sm font-semibold mt-1">
                                {item.total.toLocaleString()} ETB
                            </p>
                        </div>
                    ))}
                </div>
            </GlassCard>
        </PageContainer>
    );
}
