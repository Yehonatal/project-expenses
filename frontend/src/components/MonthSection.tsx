import type { Expense } from "../types/expense";
import { ChevronDown, ChevronRight } from "lucide-react";
import DateGroup from "./DateGroup";

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
};

export default function MonthSection({
    ym,
    expenses,
    isExpanded,
    onToggleMonth,
    expandedDates,
    toggleDate,
}: MonthSectionProps) {
    const [year, monthStr] = ym.split("-");
    const monthIndex = Math.max(0, Math.min(11, parseInt(monthStr, 10) - 1));

    const monthTotal = expenses
        .filter((e) => e.included)
        .reduce((sum, e) => sum + e.amount, 0);

    const groupedByDate = expenses.reduce<Record<string, Expense[]>>(
        (acc, exp) => {
            const d = new Date(exp.date);
            const dateKey = d.toISOString().split("T")[0];
            if (!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push(exp);
            return acc;
        },
        {}
    );

    return (
        <section
            className="rounded-md shadow-sm"
            style={{
                border: `1px solid var(--theme-border)`,
                backgroundColor: "var(--theme-surface)",
            }}
            key={ym}
        >
            <header
                onClick={() => onToggleMonth(ym)}
                className="flex items-center justify-between cursor-pointer select-none px-5 py-3"
                aria-expanded={isExpanded}
                aria-controls={`month-${ym}`}
            >
                <div
                    className="flex items-center space-x-2 font-semibold text-lg"
                    style={{ color: "var(--theme-text)" }}
                >
                    {isExpanded ? (
                        <ChevronDown
                            className="w-4 h-4"
                            style={{ color: "var(--theme-accent)" }}
                        />
                    ) : (
                        <ChevronRight
                            className="w-4 h-4"
                            style={{ color: "var(--theme-accent)" }}
                        />
                    )}
                    <span>
                        {monthNames[monthIndex]} {year}
                    </span>
                    <span
                        className="ml-3 text-sm font-normal"
                        style={{ color: "var(--theme-text-secondary)" }}
                    >
                        Included: Birr {monthTotal.toFixed(2)}
                    </span>
                </div>
            </header>

            {isExpanded && (
                <div
                    id={`month-${ym}`}
                    style={{ borderTop: `1px solid var(--theme-border)` }}
                >
                    {/* desktop table: use fixed layout and explicit widths so headers align with rows */}
                    <table
                        className="hidden md:table table-fixed w-full text-left text-sm"
                        style={{ color: "var(--theme-text)" }}
                    >
                        <thead
                            style={{
                                color: "var(--theme-text-secondary)",
                                borderBottom: `1px solid var(--theme-border)`,
                            }}
                        >
                            <tr>
                                <th className="p-3 w-24">Date</th>
                                <th className="p-3">Description</th>
                                <th className="p-3">Type</th>
                                <th className="p-3 text-right w-24">Amount</th>
                                <th className="p-3 text-center w-20">
                                    Included
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
                                            expandedDates[`${ym}|${dateKey}`] ??
                                            false
                                        }
                                        onToggle={() => toggleDate(ym, dateKey)}
                                    />
                                )
                            )}
                        </tbody>
                    </table>

                    <div className="flex flex-col md:hidden p-4 space-y-3">
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
                                        className="space-y-2"
                                    >
                                        <header
                                            onClick={() =>
                                                toggleDate(ym, dateKey)
                                            }
                                            className="cursor-pointer flex items-center justify-between space-x-2 font-semibold text-brown bg-sand rounded px-3 py-1 select-none hover:bg-olive/20 transition-colors duration-200"
                                        >
                                            <div className="flex items-center space-x-2">
                                                {isExpandedDate ? (
                                                    <ChevronDown className="w-4 h-4 text-olive" />
                                                ) : (
                                                    <ChevronRight className="w-4 h-4 text-olive" />
                                                )}
                                                <span>
                                                    {
                                                        monthNames[
                                                            new Date(
                                                                dateKey
                                                            ).getMonth()
                                                        ]
                                                    }{" "}
                                                    {new Date(
                                                        dateKey
                                                    ).getDate()}
                                                </span>
                                            </div>
                                            <div className="text-sm font-normal text-brown/70">
                                                Day Total: Birr{" "}
                                                {dayTotal.toFixed(2)}
                                            </div>
                                        </header>
                                        {isExpandedDate &&
                                            exps.map((exp) => (
                                                <ExpenseCard
                                                    key={exp.id}
                                                    exp={exp}
                                                />
                                            ))}
                                    </section>
                                );
                            }
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}

import ExpenseCard from "./ExpenseCard";
