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
            className={`glass-card overflow-hidden ${
                isExpanded ? "rounded-md" : "rounded-t-md"
            }`}
            key={ym}
        >
            <header
                onClick={() => onToggleMonth(ym)}
                className="px-4 select-none  py-2 transition-all duration-200"
                aria-expanded={isExpanded}
                aria-controls={`month-${ym}`}
            >
                <div
                    className="flex items-center space-x-3 font-semibold text-sm"
                    style={{ color: "var(--theme-text)" }}
                >
                    {isExpanded ? (
                        <ChevronDown
                            className="w-5 h-5"
                            style={{ color: "var(--theme-accent)" }}
                        />
                    ) : (
                        <ChevronRight
                            className="w-5 h-5"
                            style={{ color: "var(--theme-accent)" }}
                        />
                    )}
                    <span>
                        {monthNames[monthIndex]} {year}
                    </span>
                    <span
                        className="ml-3 text-xs font-semibold"
                        style={{ color: "#2563eb" }}
                    >
                        Included: Birr {monthTotal.toFixed(2)}
                    </span>
                </div>
            </header>{" "}
            {isExpanded && (
                <div
                    id={`month-${ym}`}
                    style={{ borderTop: `1px solid var(--theme-border)` }}
                >
                    <table
                        className="hidden md:table table-fixed w-full text-left text-xs"
                        style={{ color: "var(--theme-text)" }}
                    >
                        <thead
                            className="glass-button/50"
                            style={{
                                color: "var(--theme-text-secondary)",
                                fontSize: "0.75rem",
                            }}
                        >
                            <tr>
                                <th className="px-3 py-2 w-24 font-medium text-xs align-middle">
                                    Date
                                </th>
                                <th className="px-3 py-2 font-medium text-xs align-middle">
                                    Description
                                </th>
                                <th className="px-3 py-2 font-medium text-xs align-middle">
                                    Type
                                </th>
                                <th className="px-3 py-2 text-right w-24 font-medium text-xs align-middle">
                                    Amount
                                </th>
                                <th className="px-3 py-2 text-center w-20 font-medium text-xs align-middle">
                                    Included
                                </th>
                                <th className="px-3 py-2 text-center w-20 font-medium text-xs align-middle">
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
                                            expandedDates[`${ym}|${dateKey}`] ??
                                            false
                                        }
                                        onToggle={() => toggleDate(ym, dateKey)}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
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
                                            className="cursor-pointer flex items-center justify-between space-x-3 font-semibold rounded-md px-4 py-3 select-none glass-button transition-all duration-200 hover:glass-button/80"
                                        >
                                            <div className="flex items-center space-x-3">
                                                {isExpandedDate ? (
                                                    <ChevronDown
                                                        className="w-4 h-4"
                                                        style={{
                                                            color: "var(--theme-accent)",
                                                        }}
                                                    />
                                                ) : (
                                                    <ChevronRight
                                                        className="w-4 h-4"
                                                        style={{
                                                            color: "var(--theme-accent)",
                                                        }}
                                                    />
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
                                            <div
                                                className="text-xs font-semibold"
                                                style={{
                                                    color: "#2563eb",
                                                }}
                                            >
                                                Day Total: Birr{" "}
                                                {dayTotal.toFixed(2)}
                                            </div>
                                        </header>
                                        {isExpandedDate &&
                                            exps.map((exp) => (
                                                <ExpenseCard
                                                    key={exp.id}
                                                    exp={exp}
                                                    onEdit={onEdit}
                                                    onDelete={onDelete}
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
