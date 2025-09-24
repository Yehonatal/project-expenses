import { useState } from "react";
import type { Expense } from "../types/expense";
import MonthSection from "./MonthSection";

type ExpenseTableProps = {
    expenses: Expense[];
};

export default function ExpenseTable({ expenses }: ExpenseTableProps) {
    const grouped = expenses.reduce<Record<string, Expense[]>>((acc, exp) => {
        const d = new Date(exp.date);
        const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
            2,
            "0"
        )}`;
        if (!acc[ym]) acc[ym] = [];
        acc[ym].push(exp);
        return acc;
    }, {});

    const [expandedMonths, setExpandedMonths] = useState<
        Record<string, boolean>
    >({});
    const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>(
        {}
    );

    const toggleMonth = (ym: string) => {
        setExpandedMonths((prev) => {
            const newVal = !prev[ym];
            if (!newVal) {
                setExpandedDates((datesPrev) => {
                    const filtered = { ...datesPrev };
                    Object.keys(filtered).forEach((key) => {
                        if (key.startsWith(ym + "|")) delete filtered[key];
                    });
                    return filtered;
                });
            }
            return { ...prev, [ym]: newVal };
        });
    };

    const toggleDate = (ym: string, date: string) => {
        const key = `${ym}|${date}`;
        setExpandedDates((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const sortedMonths = Object.keys(grouped).sort((a, b) => (a < b ? 1 : -1));

    if (sortedMonths.length === 0)
        return (
            <p
                className="text-center text-sm mt-6 font-sans"
                style={{ color: "var(--theme-text-secondary)" }}
            >
                No expenses yet
            </p>
        );

    return (
        <div
            className="mt-6 space-y-6 font-sans"
            style={{ color: "var(--theme-text)" }}
        >
            {sortedMonths.map((ym) => (
                <MonthSection
                    key={ym}
                    ym={ym}
                    expenses={grouped[ym]}
                    isExpanded={expandedMonths[ym] ?? false}
                    onToggleMonth={toggleMonth}
                    expandedDates={expandedDates}
                    toggleDate={toggleDate}
                />
            ))}
        </div>
    );
}
