import type { Expense } from "../types/expense";
import ExpenseRow from "./ExpenseRow";

interface ExpandableExpenseTableProps {
    expenses: Expense[];
}

export default function ExpandableExpenseTable({
    expenses,
}: ExpandableExpenseTableProps) {
    if (!expenses || expenses.length === 0) {
        return (
            <div className="mt-2 ml-6">
                <div
                    className="glass-card rounded-md p-4 text-center text-sm"
                    style={{
                        color: "var(--theme-text-secondary)",
                    }}
                >
                    No expenses found for this type
                </div>
            </div>
        );
    }

    return (
        <div className="mt-2 ml-6">
            <div className="glass-card rounded-md overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="glass-button/50 border-b border-theme-border/20">
                            <th
                                className="px-3 py-2 text-left text-xs font-semibold w-24 align-middle"
                                style={{ color: "var(--theme-text)" }}
                            >
                                Time
                            </th>
                            <th
                                className="px-3 py-2 text-left text-xs font-semibold align-middle"
                                style={{ color: "var(--theme-text)" }}
                            >
                                Description
                            </th>
                            <th
                                className="px-3 py-2 text-left text-xs font-semibold align-middle"
                                style={{ color: "var(--theme-text)" }}
                            >
                                Type
                            </th>
                            <th
                                className="px-3 py-2 text-right text-xs font-semibold w-24 align-middle"
                                style={{ color: "var(--theme-text)" }}
                            >
                                Amount
                            </th>
                            <th
                                className="px-3 py-2 text-center text-xs font-semibold w-20 align-middle"
                                style={{ color: "var(--theme-text)" }}
                            >
                                Included
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {expenses.map((expense, index) => (
                            <ExpenseRow
                                key={expense.id || `expense-${index}`}
                                exp={expense}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
