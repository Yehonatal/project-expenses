import { useEffect, useState } from "react";
import API from "../api/api";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import type { Expense } from "../types/expense";
import ExpandableExpenseTable from "../components/ExpandableExpenseTable";
import Loading from "../components/Loading";

type Totals = {
    totalIncluded: number;
    totalExcluded: number;
};

type MonthlyBreakdownItem = {
    month: number; // 1-12
    year: number;
    total: number;
};

type TypeBreakdownItem = {
    type: string;
    total: number;
    count: number;
};

type SummaryData = {
    totals: Totals;
    monthlyBreakdown: MonthlyBreakdownItem[];
    typeBreakdown: TypeBreakdownItem[];
};

type TrendsData = {
    currentMonth: { month: number; year: number };
    previousMonth: { month: number; year: number };
    trends: Array<{
        category: string;
        currentMonth: number;
        previousMonth: number;
        percentageChange: number;
        currentCount: number;
        previousCount: number;
    }>;
    summary: {
        currentTotal: number;
        previousTotal: number;
        overallPercentageChange: number;
    };
};

const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

const themePieColors = [
    "var(--theme-secondary)",
    "var(--theme-accent)",
    "var(--theme-surface)",
    "var(--theme-primary)",
    "var(--theme-text-secondary)",
];

export default function SummaryPage() {
    const [summary, setSummary] = useState<SummaryData | null>(null);
    const [trends, setTrends] = useState<TrendsData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedTypes, setExpandedTypes] = useState<Record<string, boolean>>(
        {}
    );
    const [typeExpenses, setTypeExpenses] = useState<Record<string, Expense[]>>(
        {}
    );

    useEffect(() => {
        let mounted = true;
        setLoading(true);

        // Fetch summary data
        API.get<SummaryData>("/expenses/summary")
            .then((res) => {
                if (!mounted) return;
                // defensive defaults
                const data: SummaryData = {
                    totals: {
                        totalIncluded: res.data?.totals?.totalIncluded ?? 0,
                        totalExcluded: res.data?.totals?.totalExcluded ?? 0,
                    },
                    monthlyBreakdown: Array.isArray(res.data?.monthlyBreakdown)
                        ? res.data.monthlyBreakdown
                        : [],
                    typeBreakdown: Array.isArray(res.data?.typeBreakdown)
                        ? res.data.typeBreakdown.filter((t) => t.type)
                        : [],
                };

                // sort monthlyBreakdown chronological (oldest -> newest)
                data.monthlyBreakdown.sort((a, b) =>
                    a.year === b.year ? a.month - b.month : a.year - b.year
                );

                setSummary(data);
                setError(null);
            })
            .catch((err) => {
                console.error("Failed to fetch summary:", err);
                if (mounted) setError("Failed to load summary");
            });

        // Fetch trends data
        API.get<TrendsData>("/expenses/trends")
            .then((res) => {
                if (mounted) {
                    setTrends(res.data);
                }
            })
            .catch((err) => {
                console.error("Failed to fetch trends:", err);
                // Don't set error for trends, it's optional
            })
            .finally(() => mounted && setLoading(false));

        return () => {
            mounted = false;
        };
    }, []);

    const formatMoney = (n: number) =>
        `${n.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })} birr`;

    const toggleType = async (type: string) => {
        const isExpanded = expandedTypes[type];
        if (isExpanded) {
            setExpandedTypes((prev) => ({ ...prev, [type]: false }));
        } else {
            if (!typeExpenses[type]) {
                try {
                    const response = await API.get<Expense[]>(
                        `/expenses?type=${encodeURIComponent(type)}`
                    );
                    setTypeExpenses((prev) => ({
                        ...prev,
                        [type]: response.data,
                    }));
                } catch (err) {
                    console.error(
                        "Failed to fetch expenses for type:",
                        type,
                        err
                    );
                }
            }
            setExpandedTypes((prev) => ({ ...prev, [type]: true }));
        }
    };

    if (loading) {
        return <Loading />;
    }

    if (error || !summary) {
        return (
            <div className="p-6 max-w-5xl mx-auto">
                <div style={{ color: "var(--theme-accent)" }}>
                    {error ?? "No summary available"}
                </div>
            </div>
        );
    }

    const { totals, monthlyBreakdown, typeBreakdown } = summary;

    // Rechart data: map to { name, total } and use short month names
    const chartData = monthlyBreakdown.map((m) => ({
        name: `${monthNames[m.month - 1]} ${m.year}`,
        total: Math.round(m.total * 100) / 100,
    }));

    return (
        <div
            className="p-6 max-w-5xl mx-auto"
            style={{
                backgroundColor: "var(--theme-background)",
                color: "var(--theme-text)",
            }}
        >
            <h1
                className="text-sm sm:text-base lg:text-base font-bold mb-6"
                style={{ color: "var(--theme-primary)" }}
            >
                Summary Dashboard
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                <div
                    className="rounded-lg p-4 shadow-sm"
                    style={{ backgroundColor: "rgba(138,154,91,0.10)" }}
                >
                    <div
                        className="text-xs sm:text-sm font-medium"
                        style={{ color: "var(--theme-textSecondary)" }}
                    >
                        Total Included
                    </div>
                    <div
                        className="mt-2 text-sm sm:text-base font-bold"
                        style={{ color: "var(--theme-primary)" }}
                    >
                        {formatMoney(totals.totalIncluded)}
                    </div>
                </div>

                <div
                    className="rounded-lg p-4 shadow-sm"
                    style={{ backgroundColor: "rgba(216,164,143,0.10)" }}
                >
                    <div
                        className="text-xs sm:text-sm font-medium"
                        style={{ color: "var(--theme-textSecondary)" }}
                    >
                        Total Excluded
                    </div>
                    <div
                        className="mt-2 text-sm sm:text-base font-bold"
                        style={{ color: "var(--theme-primary)" }}
                    >
                        {formatMoney(totals.totalExcluded)}
                    </div>
                </div>

                <div
                    className="rounded-lg p-4 shadow-sm"
                    style={{ backgroundColor: "rgba(92,75,59,0.10)" }}
                >
                    <div
                        className="text-xs sm:text-sm font-medium"
                        style={{ color: "var(--theme-textSecondary)" }}
                    >
                        Total Spent
                    </div>
                    <div
                        className="mt-2 text-sm sm:text-base font-bold"
                        style={{ color: "var(--theme-primary)" }}
                    >
                        {formatMoney(
                            totals.totalIncluded + totals.totalExcluded
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                {typeBreakdown.map((t) => (
                    <div
                        key={t.type}
                        className="rounded-md p-3 shadow-sm flex flex-col items-start"
                        style={{ backgroundColor: "rgba(216,164,143,0.06)" }}
                    >
                        <div
                            className="text-xs sm:text-sm font-medium capitalize"
                            style={{ color: "var(--theme-textSecondary)" }}
                        >
                            {t.type}
                        </div>
                        <div
                            className="mt-1 text-sm sm:text-sm font-semibold"
                            style={{ color: "var(--theme-primary)" }}
                        >
                            {formatMoney(t.total)}
                        </div>
                        <div
                            className="text-xs mt-0.5"
                            style={{ color: "var(--theme-textSecondary)" }}
                        >
                            {t.count} items
                        </div>
                    </div>
                ))}
            </div>

            {trends && trends.trends.length > 0 && (
                <div className="mb-6">
                    <h2
                        className="text-sm sm:text-base lg:text-base font-semibold mb-4"
                        style={{ color: "var(--theme-primary)" }}
                    >
                        Spending Trends
                    </h2>
                    <div
                        className="rounded-lg p-4 shadow-sm mb-4"
                        style={{ backgroundColor: "var(--theme-surface)" }}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                            <div className="text-center">
                                <div
                                    className="text-xs sm:text-sm font-medium"
                                    style={{
                                        color: "var(--theme-textSecondary)",
                                    }}
                                >
                                    Current Month (
                                    {monthNames[trends.currentMonth.month - 1]}{" "}
                                    {trends.currentMonth.year})
                                </div>
                                <div
                                    className="mt-1 text-sm sm:text-base font-bold"
                                    style={{ color: "var(--theme-primary)" }}
                                >
                                    {formatMoney(trends.summary.currentTotal)}
                                </div>
                            </div>
                            <div className="text-center">
                                <div
                                    className="text-xs sm:text-sm font-medium"
                                    style={{
                                        color: "var(--theme-textSecondary)",
                                    }}
                                >
                                    Previous Month (
                                    {monthNames[trends.previousMonth.month - 1]}{" "}
                                    {trends.previousMonth.year})
                                </div>
                                <div
                                    className="mt-1 text-sm sm:text-base font-bold"
                                    style={{
                                        color: "var(--theme-textSecondary)",
                                    }}
                                >
                                    {formatMoney(trends.summary.previousTotal)}
                                </div>
                            </div>
                            <div className="text-center">
                                <div
                                    className="text-xs sm:text-sm font-medium"
                                    style={{
                                        color: "var(--theme-textSecondary)",
                                    }}
                                >
                                    Overall Change
                                </div>
                                <div
                                    className={`mt-1 text-sm sm:text-base font-bold ${
                                        trends.summary.overallPercentageChange >
                                        0
                                            ? "text-red-500"
                                            : trends.summary
                                                  .overallPercentageChange < 0
                                            ? "text-green-500"
                                            : ""
                                    }`}
                                >
                                    {trends.summary.overallPercentageChange > 0
                                        ? "+"
                                        : ""}
                                    {trends.summary.overallPercentageChange.toFixed(
                                        1
                                    )}
                                    %
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3
                                className="text-xs sm:text-sm lg:text-sm font-medium mb-3"
                                style={{ color: "var(--theme-primary)" }}
                            >
                                Category Breakdown
                            </h3>
                            {trends.trends.map((trend) => (
                                <div
                                    key={trend.category}
                                    className="flex items-center justify-between p-3 rounded-md"
                                    style={{
                                        backgroundColor: "var(--theme-hover)",
                                    }}
                                >
                                    <div className="flex-1">
                                        <div
                                            className="text-sm font-medium capitalize"
                                            style={{
                                                color: "var(--theme-text)",
                                            }}
                                        >
                                            {trend.category}
                                        </div>
                                        <div
                                            className="text-xs mt-1"
                                            style={{
                                                color: "var(--theme-textSecondary)",
                                            }}
                                        >
                                            {formatMoney(trend.currentMonth)} vs{" "}
                                            {formatMoney(trend.previousMonth)}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div
                                            className={`text-sm font-semibold ${
                                                trend.percentageChange > 0
                                                    ? "text-red-500"
                                                    : trend.percentageChange < 0
                                                    ? "text-green-500"
                                                    : "text-gray-500"
                                            }`}
                                        >
                                            {trend.percentageChange > 0
                                                ? "+"
                                                : ""}
                                            {trend.percentageChange.toFixed(1)}%
                                        </div>
                                        <div
                                            className="text-xs mt-1"
                                            style={{
                                                color: "var(--theme-textSecondary)",
                                            }}
                                        >
                                            {trend.currentCount} items
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div>
                    <h2
                        className="text-sm sm:text-base lg:text-base font-semibold mb-4"
                        style={{ color: "var(--theme-primary)" }}
                    >
                        Monthly Breakdown
                    </h2>
                    {chartData.length === 0 ? (
                        <div
                            className="text-sm"
                            style={{ color: "var(--theme-textSecondary)" }}
                        >
                            No monthly data to show.
                        </div>
                    ) : (
                        <div className="p-4 ">
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart
                                    data={chartData}
                                    margin={{
                                        top: 10,
                                        right: 16,
                                        left: 0,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 10 }}
                                    />
                                    <YAxis
                                        tickFormatter={(value) => `${value}`}
                                    />
                                    <Tooltip
                                        formatter={(value: number) =>
                                            `${Number(value).toLocaleString(
                                                undefined,
                                                {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                }
                                            )} birr`
                                        }
                                    />
                                    <Bar
                                        dataKey="total"
                                        fill="var(--theme-secondary)"
                                        radius={[6, 6, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                <div>
                    <h2
                        className="text-sm sm:text-base lg:text-base font-semibold mb-4"
                        style={{ color: "var(--theme-primary)" }}
                    >
                        Expense Types Breakdown
                    </h2>
                    {typeBreakdown.length === 0 ? (
                        <div
                            className="text-sm"
                            style={{ color: "var(--theme-textSecondary)" }}
                        >
                            No type data to show.
                        </div>
                    ) : (
                        <div className="p-4">
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                        data={typeBreakdown}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ type, percent }) =>
                                            `${type} ${(
                                                (percent || 0) * 100
                                            ).toFixed(0)}%`
                                        }
                                        outerRadius={80}
                                        fill="var(--theme-secondary)"
                                        dataKey="total"
                                    >
                                        {typeBreakdown.map((_, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={
                                                    themePieColors[
                                                        index %
                                                            themePieColors.length
                                                    ]
                                                }
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number) =>
                                            `${Number(value).toLocaleString(
                                                undefined,
                                                {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                }
                                            )} birr`
                                        }
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-6">
                <h2
                    className="text-xs sm:text-sm lg:text-sm font-semibold mb-3"
                    style={{ color: "var(--theme-primary)" }}
                >
                    Expense Types
                </h2>

                <div className="space-y-3">
                    {typeBreakdown.map((t) => (
                        <div key={t.type}>
                            <div
                                className="w-full flex items-center justify-between rounded-lg p-3 cursor-pointer transition-colors"
                                style={{
                                    backgroundColor: "var(--theme-hover)",
                                }}
                                onClick={() => toggleType(t.type)}
                            >
                                <div className="flex items-center space-x-2">
                                    {expandedTypes[t.type] ? (
                                        <ChevronDown
                                            size={16}
                                            style={{
                                                color: "var(--theme-textSecondary)",
                                            }}
                                        />
                                    ) : (
                                        <ChevronRight
                                            size={16}
                                            style={{
                                                color: "var(--theme-textSecondary)",
                                            }}
                                        />
                                    )}
                                    <div
                                        className="text-sm capitalize"
                                        style={{ color: "var(--theme-text)" }}
                                    >
                                        {t.type}
                                    </div>
                                </div>
                                <div
                                    className="text-sm font-medium"
                                    style={{ color: "var(--theme-primary)" }}
                                >
                                    {formatMoney(t.total)} ({t.count} items)
                                </div>
                            </div>
                            {expandedTypes[t.type] && typeExpenses[t.type] && (
                                <ExpandableExpenseTable
                                    expenses={typeExpenses[t.type]}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-6">
                <h2
                    className="text-xs sm:text-sm lg:text-sm font-semibold mb-3"
                    style={{ color: "var(--theme-primary)" }}
                >
                    Recent months
                </h2>

                <div className="space-y-3">
                    {monthlyBreakdown
                        .slice()
                        .reverse()
                        .map((m) => {
                            const label = `${monthNames[m.month - 1]} ${
                                m.year
                            }`;
                            return (
                                <div
                                    key={`${m.year}-${m.month}`}
                                    className="flex items-center justify-between rounded-lg p-3"
                                    style={{
                                        backgroundColor: "var(--theme-hover)",
                                    }}
                                >
                                    <div
                                        className="text-sm"
                                        style={{ color: "var(--theme-text)" }}
                                    >
                                        {label}
                                    </div>
                                    <div
                                        className="text-sm font-medium"
                                        style={{
                                            color: "var(--theme-primary)",
                                        }}
                                    >
                                        {formatMoney(m.total)}
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>
        </div>
    );
}
