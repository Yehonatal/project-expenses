import { Link } from "react-router-dom";
import PageSkeleton from "../components/ui/PageSkeleton";
import PageContainer from "../components/ui/PageContainer";
import GlassCard from "../components/ui/GlassCard";
import { monthNames, useSummaryDashboard } from "../hooks/useSummaryDashboard";
import { formatMoneyBirr } from "../utils/formatters";

const accountColors = ["#c06ecf", "#3f4ea3", "#b0764e", "#8da84d", "#d89fa0"];

export default function SummaryPage() {
    const {
        summary,
        loading,
        error,
        totalSpent,
        totalCount,
        topTypes,
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
    const hour = new Date().getHours();
    const greeting =
        hour < 12
            ? "Good morning"
            : hour < 17
              ? "Good afternoon"
              : "Good evening";

    return (
        <PageContainer
            title="Home"
            subtitle="Your live financial overview with recent activity and recurring signals."
            className="space-y-5 sm:space-y-6"
        >
            <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-4 sm:p-5">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                        <h1 className="font-['Playfair_Display'] text-3xl font-semibold tracking-[-0.01em] sm:text-5xl">
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
                                Net worth
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
                                Messages
                            </p>
                            <p className="text-3xl font-semibold sm:text-5xl">
                                {totalCount.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

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
                                <div className="border-t border-[var(--theme-border)] pt-2 text-xs text-[var(--theme-text-secondary)]">
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

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
                <GlassCard className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-['Playfair_Display'] tracking-[-0.01em] text-lg font-semibold">
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
                        <h3 className="font-['Playfair_Display'] tracking-[-0.01em] text-lg font-semibold">
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
