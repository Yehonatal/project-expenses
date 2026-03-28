import { useState } from "react";
import type { Expense } from "../types/expense";
import MonthSection from "./MonthSection";

type ExpenseTableProps = {
    expenses: Expense[];
    onEdit: (expense: Expense) => void;
    onDelete: (id: string) => void;
};

export default function ExpenseTable({
    expenses,
    onEdit,
    onDelete,
}: ExpenseTableProps) {
    const includedExpenses = expenses.filter((exp) => exp.included);
    const excludedExpenses = expenses.filter((exp) => !exp.included);

    const includedTotal = includedExpenses.reduce(
        (sum, exp) => sum + exp.amount,
        0,
    );
    const excludedTotal = excludedExpenses.reduce(
        (sum, exp) => sum + exp.amount,
        0,
    );

    const grouped = expenses.reduce<Record<string, Expense[]>>((acc, exp) => {
        const d = new Date(exp.date);
        const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
            2,
            "0",
        )}`;
        if (!acc[ym]) acc[ym] = [];
        acc[ym].push(exp);
        return acc;
    }, {});

    const [expandedMonths, setExpandedMonths] = useState<
        Record<string, boolean>
    >({});
    const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>(
        {},
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
            className="mt-4 space-y-3 font-sans"
            style={{ color: "var(--theme-text)" }}
        >
            <section className="relative overflow-hidden border border-[var(--theme-border)]/40 bg-[var(--theme-surface)] p-3">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.1),transparent_50%)]" />
                <div className="relative grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                    <div className="border border-[var(--theme-border)]/40 bg-[var(--theme-background)] px-2 py-1.5">
                        <p className="text-[10px] uppercase tracking-wide text-[var(--theme-text-secondary)]">
                            Entries
                        </p>
                        <p className="text-sm font-semibold">
                            {expenses.length}
                        </p>
                    </div>
                    <div className="border border-emerald-500/30 bg-emerald-500/10 px-2 py-1.5">
                        <p className="text-[10px] uppercase tracking-wide text-emerald-700">
                            Included
                        </p>
                        <p className="text-sm font-semibold text-emerald-700">
                            Birr {includedTotal.toFixed(0)}
                        </p>
                    </div>
                    <div className="border border-amber-500/30 bg-amber-500/10 px-2 py-1.5">
                        <p className="text-[10px] uppercase tracking-wide text-amber-700">
                            Excluded
                        </p>
                        <p className="text-sm font-semibold text-amber-700">
                            Birr {excludedTotal.toFixed(0)}
                        </p>
                    </div>
                    <div className="border border-[var(--theme-border)]/40 bg-[var(--theme-background)] px-2 py-1.5">
                        <p className="text-[10px] uppercase tracking-wide text-[var(--theme-text-secondary)]">
                            Included Ratio
                        </p>
                        <p className="text-sm font-semibold">
                            {expenses.length
                                ? Math.round(
                                      (includedExpenses.length /
                                          expenses.length) *
                                          100,
                                  )
                                : 0}
                            %
                        </p>
                    </div>
                </div>
            </section>

            {sortedMonths.map((ym) => (
                <MonthSection
                    key={ym}
                    ym={ym}
                    expenses={grouped[ym]}
                    isExpanded={expandedMonths[ym] ?? false}
                    onToggleMonth={toggleMonth}
                    expandedDates={expandedDates}
                    toggleDate={toggleDate}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}
