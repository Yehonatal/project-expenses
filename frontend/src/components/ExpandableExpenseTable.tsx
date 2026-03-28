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
                    className="rounded-md border border-[var(--theme-border)] bg-[var(--theme-surface)] p-4 text-center text-sm "
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
            <div className="overflow-hidden rounded-md border border-[var(--theme-border)] bg-[var(--theme-surface)] ">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-[var(--theme-border)]/20 bg-[var(--theme-surface)]  transition-colors hover:bg-white/5">
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
