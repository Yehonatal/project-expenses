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
} from "recharts";
import PageContainer from "../components/ui/PageContainer";
import PageSkeleton from "../components/ui/PageSkeleton";
import GlassCard from "../components/ui/GlassCard";
import { monthNames, useSummaryDashboard } from "../hooks/useSummaryDashboard";

export default function ChartsPage() {
    const { loading, error, summary, chartData, trends } =
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

    return (
        <PageContainer title="Charts & Overview" className="space-y-6">
            <GlassCard className="p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                    <div>
                        <h2 className="font-['Playfair_Display'] tracking-[-0.01em] text-2xl font-semibold">
                            All Providers Messages
                        </h2>
                        <p
                            className="text-sm"
                            style={{ color: "var(--theme-text-secondary)" }}
                        >
                            Timeline and balance trends based on your recorded
                            data.
                        </p>
                    </div>
                    <div className="text-right">
                        <div
                            className="text-xs"
                            style={{ color: "var(--theme-text-secondary)" }}
                        >
                            Current balance
                        </div>
                        <div className="text-3xl font-semibold">
                            {(
                                summary.totals.totalIncluded -
                                summary.totals.totalExcluded
                            ).toLocaleString()}{" "}
                            ETB
                        </div>
                    </div>
                </div>

                <ResponsiveContainer width="100%" height={360}>
                    <ComposedChart data={recentSeries}>
                        <CartesianGrid strokeDasharray="2 2" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip
                            formatter={(value) =>
                                `${Number(value || 0).toLocaleString()} ETB`
                            }
                        />
                        <Area
                            type="monotone"
                            dataKey="total"
                            fill="rgba(129, 140, 248, 0.15)"
                            stroke="none"
                        />
                        <Line
                            type="monotone"
                            dataKey="total"
                            stroke="var(--theme-secondary)"
                            strokeWidth={2}
                            dot={{ r: 2 }}
                        />
                        <Bar
                            dataKey="total"
                            fill="rgba(208, 139, 91, 0.25)"
                            barSize={8}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </GlassCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard className="p-4">
                    <h3 className="font-['Playfair_Display'] tracking-[-0.01em] text-lg font-semibold mb-3">
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
                    <h3 className="font-['Playfair_Display'] tracking-[-0.01em] text-lg font-semibold mb-3">
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

            <GlassCard className="p-4">
                <h3 className="font-['Playfair_Display'] tracking-[-0.01em] text-lg font-semibold mb-3">
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
