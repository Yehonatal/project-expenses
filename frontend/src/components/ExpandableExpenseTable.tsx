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
                    className="rounded-lg shadow-sm border p-4 text-center text-sm"
                    style={{
                        backgroundColor: "var(--theme-surface)",
                        borderColor: "var(--theme-border)",
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
            <div
                className="rounded-lg overflow-hidden border"
                style={{
                    backgroundColor: "var(--theme-surface)",
                    borderColor: "var(--theme-border)",
                }}
            >
                <table className="w-full">
                    <thead>
                        <tr
                            className="border-b"
                            style={{
                                backgroundColor: "var(--theme-hover)",
                                borderColor: "var(--theme-border)",
                            }}
                        >
                            <th
                                className="p-3 text-left text-sm font-semibold w-24"
                                style={{ color: "var(--theme-text)" }}
                            >
                                Time
                            </th>
                            <th
                                className="p-3 text-left text-sm font-semibold"
                                style={{ color: "var(--theme-text)" }}
                            >
                                Description
                            </th>
                            <th
                                className="p-3 text-left text-sm font-semibold"
                                style={{ color: "var(--theme-text)" }}
                            >
                                Type
                            </th>
                            <th
                                className="p-3 text-right text-sm font-semibold w-24"
                                style={{ color: "var(--theme-text)" }}
                            >
                                Amount
                            </th>
                            <th
                                className="p-3 text-center text-sm font-semibold w-20"
                                style={{ color: "var(--theme-text)" }}
                            >
                                Included
                            </th>
                        </tr>
                    </thead>
                    <tbody
                        className="divide-y"
                        style={{ borderColor: "var(--theme-border)" }}
                    >
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
