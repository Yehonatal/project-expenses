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
import ExpandableExpenseTable from "../components/ExpandableExpenseTable";
import PageSkeleton from "../components/ui/PageSkeleton";
import PageContainer from "../components/ui/PageContainer";
import { monthNames, useSummaryDashboard } from "../hooks/useSummaryDashboard";
import { formatMoneyBirr } from "../utils/formatters";

const themePieColors = [
    "var(--theme-secondary)",
    "var(--theme-accent)",
    "var(--theme-surface)",
    "var(--theme-primary)",
    "var(--theme-text-secondary)",
];

const accountColors = ["#caa47a", "#8a9a5b", "#b07a5a", "#6b4f3b", "#d08b5b"];

export default function SummaryPage() {
    const {
        summary,
        trends,
        loading,
        error,
        expandedTypes,
        typeExpenses,
        toggleType,
        totalSpent,
        totalCount,
        topTypes,
        updatedLabel,
        nowLabel,
        chartData,
        trendMap,
    } = useSummaryDashboard();

    if (loading) {
        return <PageSkeleton title="Loading overview" />;
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

    const {
        totals,
        monthlyBreakdown,
        typeBreakdown,
        recentExpenses,
        templates,
    } = summary;

    return (
        <PageContainer title="Home" className="space-y-12">
            <div className="dashboard-hero flex flex-col lg:flex-row lg:items-center gap-6">
                <div className="flex-1 space-y-2">
                    <div
                        className="text-xs uppercase tracking-[0.2em]"
                        style={{ color: "var(--theme-text-secondary)" }}
                    >
                        Overview
                    </div>
                    <h1 className="section-title text-2xl sm:text-3xl font-semibold">
                        Good morning
                    </h1>
                    <p
                        className="text-sm"
                        style={{ color: "var(--theme-text-secondary)" }}
                    >
                        It is {nowLabel}. Here is your financial overview.
                        Updated at {updatedLabel}.
                    </p>
                </div>
                <div className="flex flex-wrap gap-6">
                    <div>
                        <div
                            className="text-xs uppercase tracking-[0.2em]"
                            style={{ color: "var(--theme-text-secondary)" }}
                        >
                            Net total
                        </div>
                        <div className="text-2xl font-semibold">
                            {formatMoneyBirr(totalSpent)}
                        </div>
                    </div>
                    <div>
                        <div
                            className="text-xs uppercase tracking-[0.2em]"
                            style={{ color: "var(--theme-text-secondary)" }}
                        >
                            Transactions
                        </div>
                        <div className="text-2xl font-semibold">
                            {totalCount.toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>

            <div className="kpi-strip">
                <div className="kpi-card">
                    <div
                        className="text-xs font-semibold uppercase"
                        style={{ color: "var(--theme-text-secondary)" }}
                    >
                        Total included
                    </div>
                    <div className="text-xl font-semibold">
                        {formatMoneyBirr(totals.totalIncluded)}
                    </div>
                    <div
                        className="text-xs"
                        style={{ color: "var(--theme-text-secondary)" }}
                    >
                        {totals.countIncluded} items
                    </div>
                </div>
                <div className="kpi-card">
                    <div
                        className="text-xs font-semibold uppercase"
                        style={{ color: "var(--theme-text-secondary)" }}
                    >
                        Total excluded
                    </div>
                    <div className="text-xl font-semibold">
                        {formatMoneyBirr(totals.totalExcluded)}
                    </div>
                    <div
                        className="text-xs"
                        style={{ color: "var(--theme-text-secondary)" }}
                    >
                        {totals.countExcluded} items
                    </div>
                </div>
                <div className="kpi-card">
                    <div
                        className="text-xs font-semibold uppercase"
                        style={{ color: "var(--theme-text-secondary)" }}
                    >
                        Total spent
                    </div>
                    <div className="text-xl font-semibold">
                        {formatMoneyBirr(totalSpent)}
                    </div>
                    <div
                        className="text-xs"
                        style={{ color: "var(--theme-text-secondary)" }}
                    >
                        Included + excluded
                    </div>
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="section-title text-lg font-semibold">
                        Accounts
                    </h2>
                    <span className="pill">Tracked types</span>
                </div>
                <div className="account-strip">
                    {topTypes.length === 0 ? (
                        <div className="account-card">
                            <div className="account-title">No accounts yet</div>
                            <div className="account-amount">Add expenses</div>
                            <div className="account-meta">
                                Start tracking to populate this section.
                            </div>
                        </div>
                    ) : (
                        topTypes.map((t, index) => (
                            <div
                                key={t.type}
                                className="account-card"
                                style={{
                                    borderLeftColor:
                                        accountColors[
                                            index % accountColors.length
                                        ],
                                }}
                            >
                                <div className="account-title">{t.type}</div>
                                <div className="account-amount">
                                    {formatMoneyBirr(t.total)}
                                </div>
                                <div className="account-meta">
                                    {t.count} entries
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="stat-row">
                <div className="stat-card">
                    <p className="stat-label">All-time</p>
                    <p className="stat-value">
                        {formatMoneyBirr(totals.totalIncluded)}
                    </p>
                    <p className="stat-sub">Included total</p>
                </div>
                <div className="stat-card">
                    <p className="stat-label">Outgoing</p>
                    <p className="stat-value">
                        {formatMoneyBirr(totals.totalExcluded)}
                    </p>
                    <p className="stat-sub">Excluded total</p>
                </div>
                <div className="stat-card">
                    <p className="stat-label">Monthly</p>
                    <p className="stat-value">
                        {trends
                            ? formatMoneyBirr(trends.summary.currentTotal)
                            : formatMoneyBirr(0)}
                    </p>
                    <p className="stat-sub">This month</p>
                </div>
                <div className="stat-card">
                    <p className="stat-label">Ratio</p>
                    <p className="stat-value">
                        {totals.totalIncluded > 0
                            ? (totalSpent / totals.totalIncluded).toFixed(2)
                            : "0.00"}
                    </p>
                    <p className="stat-sub">Spent vs included</p>
                </div>
            </div>

            <div id="charts" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="section-title text-xl font-semibold">
                                Top categories
                            </h2>
                            <span className="pill">All time</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {topTypes.map((t) => {
                                const trend = trendMap.get(t.type);
                                return (
                                    <div key={t.type} className="soft-card p-4">
                                        <div
                                            className="text-xs uppercase"
                                            style={{
                                                color: "var(--theme-text-secondary)",
                                            }}
                                        >
                                            {t.type}
                                        </div>
                                        <div className="text-lg font-semibold">
                                            {formatMoneyBirr(t.total)}
                                        </div>
                                        <div
                                            className="text-xs"
                                            style={{
                                                color: "var(--theme-text-secondary)",
                                            }}
                                        >
                                            {t.count} items
                                        </div>
                                        {trend && (
                                            <div
                                                className={`text-xs font-semibold mt-2 ${
                                                    trend.percentageChange > 0
                                                        ? "text-red-500"
                                                        : trend.percentageChange <
                                                            0
                                                          ? "text-green-600"
                                                          : "text-gray-500"
                                                }`}
                                            >
                                                {trend.percentageChange > 0
                                                    ? "+"
                                                    : ""}
                                                {trend.percentageChange.toFixed(
                                                    1,
                                                )}
                                                % vs last month
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="soft-card p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="section-title text-lg font-semibold">
                                Monthly breakdown
                            </h2>
                            <span className="pill">Last 6 months</span>
                        </div>
                        {chartData.length === 0 ? (
                            <div
                                className="text-sm"
                                style={{ color: "var(--theme-text-secondary)" }}
                            >
                                No monthly data to show.
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={260}>
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
                                        formatter={(value) =>
                                            `${Number(
                                                value || 0,
                                            ).toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })} birr`
                                        }
                                    />
                                    <Bar
                                        dataKey="total"
                                        fill="var(--theme-secondary)"
                                        radius={[6, 6, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    <div className="soft-card p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="section-title text-lg font-semibold">
                                Expense types breakdown
                            </h2>
                            <span className="pill">Share of spend</span>
                        </div>
                        {typeBreakdown.length === 0 ? (
                            <div
                                className="text-sm"
                                style={{ color: "var(--theme-text-secondary)" }}
                            >
                                No type data to show.
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie
                                        data={typeBreakdown}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ payload, percent }) =>
                                            `${payload?.type ?? ""} ${(
                                                (percent || 0) * 100
                                            ).toFixed(0)}%`
                                        }
                                        outerRadius={90}
                                        fill="var(--theme-secondary)"
                                        dataKey="total"
                                        nameKey="type"
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
                                        formatter={(value) =>
                                            `${Number(
                                                value || 0,
                                            ).toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })} birr`
                                        }
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="soft-card p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="section-title text-base font-semibold">
                                Upcoming recurring transactions
                            </h3>
                            <span className="pill">This month</span>
                        </div>
                        {templates.length === 0 ? (
                            <div className="recurring-empty">
                                <p className="text-sm">
                                    No recurring templates
                                </p>
                                <p className="text-xs">
                                    Track bills, subscriptions, and income by
                                    adding recurring templates.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {templates.map((t) => (
                                    <div
                                        key={t._id ?? t.description}
                                        className="glass-card p-3 rounded-xl"
                                    >
                                        <div className="text-sm font-semibold">
                                            {t.description}
                                        </div>
                                        <div
                                            className="text-xs capitalize"
                                            style={{
                                                color: "var(--theme-text-secondary)",
                                            }}
                                        >
                                            {t.type}
                                        </div>
                                        <div
                                            className="text-sm font-semibold mt-2"
                                            style={{
                                                color: "var(--theme-secondary)",
                                            }}
                                        >
                                            {formatMoneyBirr(Number(t.price))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="soft-card p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="section-title text-base font-semibold">
                                Recent activity
                            </h3>
                            <span className="pill">Latest</span>
                        </div>
                        {recentExpenses.length === 0 ? (
                            <p
                                className="text-sm"
                                style={{ color: "var(--theme-text-secondary)" }}
                            >
                                No recent expenses.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {recentExpenses.map((expense) => (
                                    <div
                                        key={expense._id}
                                        className="flex items-center justify-between"
                                    >
                                        <div>
                                            <div className="text-sm font-medium">
                                                {expense.description}
                                            </div>
                                            <div
                                                className="text-xs capitalize"
                                                style={{
                                                    color: "var(--theme-text-secondary)",
                                                }}
                                            >
                                                {expense.type} •{" "}
                                                {new Date(
                                                    expense.date,
                                                ).toLocaleDateString(
                                                    undefined,
                                                    {
                                                        month: "short",
                                                        day: "numeric",
                                                    },
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-sm font-semibold">
                                            {formatMoneyBirr(expense.amount)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {trends && trends.trends.length > 0 && (
                <div className="soft-card p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="section-title text-lg font-semibold">
                            Spending trends
                        </h2>
                        <span className="pill">This month</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                        <div>
                            <div
                                className="text-xs uppercase"
                                style={{ color: "var(--theme-text-secondary)" }}
                            >
                                Current month
                            </div>
                            <div className="text-base font-semibold">
                                {formatMoneyBirr(trends.summary.currentTotal)}
                            </div>
                        </div>
                        <div>
                            <div
                                className="text-xs uppercase"
                                style={{ color: "var(--theme-text-secondary)" }}
                            >
                                Previous month
                            </div>
                            <div
                                className="text-base font-semibold"
                                style={{ color: "var(--theme-text-secondary)" }}
                            >
                                {formatMoneyBirr(trends.summary.previousTotal)}
                            </div>
                        </div>
                        <div>
                            <div
                                className="text-xs uppercase"
                                style={{ color: "var(--theme-text-secondary)" }}
                            >
                                Overall change
                            </div>
                            <div
                                className={`text-base font-semibold ${
                                    trends.summary.overallPercentageChange > 0
                                        ? "text-red-500"
                                        : trends.summary
                                                .overallPercentageChange < 0
                                          ? "text-green-600"
                                          : ""
                                }`}
                            >
                                {trends.summary.overallPercentageChange > 0
                                    ? "+"
                                    : ""}
                                {trends.summary.overallPercentageChange.toFixed(
                                    1,
                                )}
                                %
                            </div>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {trends.trends.map((trend) => (
                            <div
                                key={trend.category}
                                className="flex items-center justify-between p-3 rounded-md"
                                style={{
                                    backgroundColor: "var(--theme-hover)",
                                }}
                            >
                                <div>
                                    <div className="text-sm font-medium capitalize">
                                        {trend.category}
                                    </div>
                                    <div
                                        className="text-xs"
                                        style={{
                                            color: "var(--theme-text-secondary)",
                                        }}
                                    >
                                        {formatMoneyBirr(trend.currentMonth)} vs{" "}
                                        {formatMoneyBirr(trend.previousMonth)}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div
                                        className={`text-sm font-semibold ${
                                            trend.percentageChange > 0
                                                ? "text-red-500"
                                                : trend.percentageChange < 0
                                                  ? "text-green-600"
                                                  : "text-gray-500"
                                        }`}
                                    >
                                        {trend.percentageChange > 0 ? "+" : ""}
                                        {trend.percentageChange.toFixed(1)}%
                                    </div>
                                    <div
                                        className="text-xs"
                                        style={{
                                            color: "var(--theme-text-secondary)",
                                        }}
                                    >
                                        {trend.currentCount} items
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div>
                <h2 className="section-title text-lg font-semibold mb-3">
                    Expense types
                </h2>
                <div className="space-y-3">
                    {typeBreakdown.map((t) => (
                        <div key={t.type}>
                            <div
                                className="glass-card w-full flex items-center justify-between rounded-xl p-3 cursor-pointer transition-all duration-200 hover:glass-button/80"
                                onClick={() => toggleType(t.type)}
                            >
                                <div className="flex items-center space-x-2">
                                    {expandedTypes[t.type] ? (
                                        <ChevronDown
                                            size={16}
                                            style={{
                                                color: "var(--theme-text-secondary)",
                                            }}
                                        />
                                    ) : (
                                        <ChevronRight
                                            size={16}
                                            style={{
                                                color: "var(--theme-text-secondary)",
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
                                    {formatMoneyBirr(t.total)} ({t.count} items)
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

            <div>
                <h2 className="section-title text-lg font-semibold mb-3">
                    Recent months
                </h2>
                <div className="space-y-3">
                    {monthlyBreakdown
                        .slice()
                        .reverse()
                        .map((m) => {
                            const label = `${monthNames[m.month - 1]} ${m.year}`;
                            return (
                                <div
                                    key={`${m.year}-${m.month}`}
                                    className="glass-card flex items-center justify-between rounded-xl p-3"
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
                                        {formatMoneyBirr(m.total)}
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>
        </PageContainer>
    );
}
