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
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center text-gray-500 text-sm">
                    No expenses found for this type
                </div>
            </div>
        );
    }

    return (
        <div className="mt-2 ml-6">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                <table className="w-full">
                    <thead>
                        <tr className="bg-sand/50 border-b border-gray-200">
                            <th className="p-3 text-left text-sm font-semibold text-brown w-24">
                                Time
                            </th>
                            <th className="p-3 text-left text-sm font-semibold text-brown">
                                Description
                            </th>
                            <th className="p-3 text-left text-sm font-semibold text-brown">
                                Type
                            </th>
                            <th className="p-3 text-right text-sm font-semibold text-brown w-24">
                                Amount
                            </th>
                            <th className="p-3 text-center text-sm font-semibold text-brown w-20">
                                Included
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
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
