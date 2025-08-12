import React, { useState } from "react";

export type Expense = {
    _id: string;
    date: string;
    description: string;
    amount: number;
    included: boolean;
};

type ExpenseTableProps = {
    expenses: Expense[];
};

const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

// Example earthy tints to cycle through for months
const monthTints = [
    "rgba(216,164,143,0.08)", // clay
    "rgba(138,154,91,0.08)", // olive
    "rgba(227,212,185,0.08)", // sand
    "rgba(92,75,59,0.06)", // brown
    "rgba(207,195,178,0.06)", // taupe
];

export default function ExpenseTable({ expenses }: ExpenseTableProps) {
    // Group expenses by year-month string: YYYY-MM
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

    // State to track which months are expanded (default true)
    const [expandedMonths, setExpandedMonths] = useState<
        Record<string, boolean>
    >({});

    const toggleMonth = (ym: string) => {
        setExpandedMonths((prev) => ({ ...prev, [ym]: !prev[ym] }));
    };

    // Sort keys descending (most recent first)
    const sortedMonths = Object.keys(grouped).sort((a, b) => (a < b ? 1 : -1));

    return (
        <div className="w-full mt-4 overflow-hidden rounded-md border border-gray-200">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-taupe text-brown font-semibold">
                        <th className="p-3 text-left">Date</th>
                        <th className="p-3 text-left">Description</th>
                        <th className="p-3 text-right">Amount</th>
                        <th className="p-3 text-center">Included</th>
                    </tr>
                </thead>

                <tbody>
                    {sortedMonths.length === 0 && (
                        <tr>
                            <td
                                colSpan={4}
                                className="p-4 text-center text-sm text-gray-500"
                            >
                                No expenses yet
                            </td>
                        </tr>
                    )}

                    {sortedMonths.map((ym, i) => {
                        const [year, monthStr] = ym.split("-");
                        const monthIndex = Math.max(
                            0,
                            Math.min(11, parseInt(monthStr, 10) - 1 || 0)
                        );
                        const monthExpenses = grouped[ym] || [];
                        const monthTotal = monthExpenses
                            .filter((e) => e.included)
                            .reduce((sum, e) => sum + e.amount, 0);

                        const isExpanded = expandedMonths[ym] ?? true;

                        return (
                            <React.Fragment key={ym}>
                                <tr
                                    onClick={() => toggleMonth(ym)}
                                    style={{
                                        backgroundColor:
                                            monthTints[i % monthTints.length],
                                    }}
                                    className="cursor-pointer select-none"
                                >
                                    <td colSpan={4} className="p-3">
                                        <div className="flex items-center justify-between">
                                            <div className="font-semibold text-brown">
                                                {monthNames[monthIndex]} {year}
                                                <span className="ml-3 text-sm text-gray-600 font-normal">
                                                    — Included total: Birr{" "}
                                                    {monthTotal.toFixed(2)}
                                                </span>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleMonth(ym);
                                                }}
                                                aria-expanded={isExpanded}
                                                aria-controls={`month-${ym}`}
                                                className="text-clay font-bold px-3 py-1 rounded hover:bg-opacity-10"
                                            >
                                                {isExpanded ? "−" : "+"}
                                            </button>
                                        </div>
                                    </td>
                                </tr>

                                {/* Expense rows (conditionally rendered) */}
                                {isExpanded &&
                                    monthExpenses.map((exp) => (
                                        <tr
                                            key={exp._id}
                                            className="hover:bg-sand"
                                        >
                                            <td className="p-3 align-top">
                                                {new Date(
                                                    exp.date
                                                ).toLocaleDateString()}
                                            </td>
                                            <td className="p-3 align-top">
                                                {exp.description}
                                            </td>
                                            <td className="p-3 text-right align-top">
                                                Birr {exp.amount.toFixed(2)}
                                            </td>
                                            <td className="p-3 text-center align-top">
                                                {exp.included ? "Yes" : "No"}
                                            </td>
                                        </tr>
                                    ))}
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
