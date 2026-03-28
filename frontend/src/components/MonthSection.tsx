import type { Expense } from "../types/expense";
import { ChevronDown, ChevronRight } from "lucide-react";
import DateGroup from "./DateGroup";
import ExpenseCard from "./ExpenseCard";

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

type MonthSectionProps = {
    ym: string;
    expenses: Expense[];
    isExpanded: boolean;
    onToggleMonth: (ym: string) => void;
    expandedDates: Record<string, boolean>;
    toggleDate: (ym: string, date: string) => void;
    onEdit: (expense: Expense) => void;
    onDelete: (id: string) => void;
};

export default function MonthSection({
    ym,
    expenses,
    isExpanded,
    onToggleMonth,
    expandedDates,
    toggleDate,
    onEdit,
    onDelete,
}: MonthSectionProps) {
    const [year, monthStr] = ym.split("-");
    const monthIndex = Math.max(0, Math.min(11, parseInt(monthStr, 10) - 1));

    const monthTotal = expenses
        .filter((e) => e.included)
        .reduce((sum, e) => sum + e.amount, 0);
    const monthCount = expenses.length;

    const groupedByDate = expenses.reduce<Record<string, Expense[]>>(
        (acc, exp) => {
            const d = new Date(exp.date);
            const dateKey = d.toISOString().split("T")[0];
            if (!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push(exp);
            return acc;
        },
        {},
    );

    return (
        <section
            className="overflow-hidden border border-[var(--theme-border)]/40 bg-[var(--theme-surface)]"
            key={ym}
        >
            <header
                onClick={() => onToggleMonth(ym)}
                className="cursor-pointer select-none border-b border-[var(--theme-border)]/40 bg-[var(--theme-background)] px-3 py-2.5 transition-colors hover:bg-[var(--theme-hover)]"
                aria-expanded={isExpanded}
                aria-controls={`month-${ym}`}
            >
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div
                        className="flex items-center gap-2 font-semibold"
                        style={{ color: "var(--theme-text)" }}
                    >
                        {isExpanded ? (
                            <ChevronDown
                                className="h-4 w-4"
                                style={{ color: "var(--theme-accent)" }}
                            />
                        ) : (
                            <ChevronRight
                                className="h-4 w-4"
                                style={{ color: "var(--theme-accent)" }}
                            />
                        )}
                        <span className="text-sm font-semibold sm:text-base">
                            {monthNames[monthIndex]} {year}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <span className="border border-[var(--theme-border)] bg-[var(--theme-surface)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--theme-text-secondary)]">
                            {monthCount} entries
                        </span>
                        <span className="border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 font-semibold text-emerald-700">
                            Included Birr {monthTotal.toFixed(2)}
                        </span>
                    </div>
                </div>
            </header>
            {isExpanded && (
                <div id={`month-${ym}`} className="space-y-2 p-2">
                    <div className="hidden overflow-x-auto md:block">
                        <table
                            className="w-full min-w-[740px] table-fixed text-left text-xs"
                            style={{ color: "var(--theme-text)" }}
                        >
                            <thead
                                className="border-y border-[var(--theme-border)]/40 bg-[var(--theme-background)]"
                                style={{
                                    color: "var(--theme-text-secondary)",
                                    fontSize: "0.75rem",
                                }}
                            >
                                <tr>
                                    <th className="w-24 px-2 py-1.5 align-middle text-[11px] font-medium">
                                        Date
                                    </th>
                                    <th className="px-2 py-1.5 align-middle text-[11px] font-medium">
                                        Description
                                    </th>
                                    <th className="px-2 py-1.5 align-middle text-[11px] font-medium">
                                        Type
                                    </th>
                                    <th className="w-28 px-2 py-1.5 text-right align-middle text-[11px] font-medium">
                                        Amount
                                    </th>
                                    <th className="w-20 px-2 py-1.5 text-center align-middle text-[11px] font-medium">
                                        Included
                                    </th>
                                    <th className="w-20 px-2 py-1.5 text-center align-middle text-[11px] font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(groupedByDate).map(
                                    ([dateKey, exps], idx) => (
                                        <DateGroup
                                            key={idx}
                                            ym={ym}
                                            dateKey={dateKey}
                                            expenses={exps}
                                            isExpanded={
                                                expandedDates[
                                                    `${ym}|${dateKey}`
                                                ] ?? false
                                            }
                                            onToggle={() =>
                                                toggleDate(ym, dateKey)
                                            }
                                            onEdit={onEdit}
                                            onDelete={onDelete}
                                        />
                                    ),
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col space-y-1.5 md:hidden">
                        {Object.entries(groupedByDate).map(
                            ([dateKey, exps]) => {
                                const isExpandedDate =
                                    expandedDates[`${ym}|${dateKey}`] ?? false;
                                const dayTotal = exps
                                    .filter((e) => e.included)
                                    .reduce((sum, e) => sum + e.amount, 0);

                                return (
                                    <section
                                        key={dateKey}
                                        className="space-y-1.5 border border-[var(--theme-border)]/40 bg-[var(--theme-background)] p-1.5"
                                    >
                                        <header
                                            onClick={() =>
                                                toggleDate(ym, dateKey)
                                            }
                                            className="cursor-pointer select-none border border-[var(--theme-border)]/40 bg-[var(--theme-surface)] px-2.5 py-1.5 font-semibold transition-colors hover:bg-[var(--theme-hover)]"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center space-x-2">
                                                    {isExpandedDate ? (
                                                        <ChevronDown
                                                            className="w-3.5 h-3.5"
                                                            style={{
                                                                color: "var(--theme-accent)",
                                                            }}
                                                        />
                                                    ) : (
                                                        <ChevronRight
                                                            className="w-3.5 h-3.5"
                                                            style={{
                                                                color: "var(--theme-accent)",
                                                            }}
                                                        />
                                                    )}
                                                    <span className="text-xs">
                                                        {
                                                            monthNames[
                                                                new Date(
                                                                    dateKey,
                                                                ).getMonth()
                                                            ]
                                                        }{" "}
                                                        {new Date(
                                                            dateKey,
                                                        ).getDate()}
                                                    </span>
                                                    <span className="border border-[var(--theme-border)]/40 bg-[var(--theme-background)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--theme-text-secondary)]">
                                                        {exps.length}
                                                    </span>
                                                </div>
                                                <div className="text-[11px] font-semibold text-emerald-700">
                                                    Birr {dayTotal.toFixed(2)}
                                                </div>
                                            </div>
                                        </header>
                                        {isExpandedDate &&
                                            exps.map((exp, id) => (
                                                <ExpenseCard
                                                    key={id}
                                                    exp={exp}
                                                    onEdit={onEdit}
                                                    onDelete={onDelete}
                                                />
                                            ))}
                                    </section>
                                );
                            },
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
