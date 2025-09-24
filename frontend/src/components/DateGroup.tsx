import type { Expense } from "../types/expense";
import { ChevronDown, ChevronRight } from "lucide-react";
import ExpenseRow from "./ExpenseRow";

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

type DateGroupProps = {
    ym: string;
    dateKey: string;
    expenses: Expense[];
    isExpanded: boolean;
    onToggle: () => void;
};

export default function DateGroup({
    dateKey,
    expenses,
    isExpanded,
    onToggle,
}: DateGroupProps) {
    const dayTotal = expenses
        .filter((e) => e.included)
        .reduce((sum, e) => sum + e.amount, 0);

    const formatDateShort = (dateStr: string) => {
        const d = new Date(dateStr);
        return `${monthNames[d.getMonth()]} ${d.getDate()}`;
    };

    return (
        <>
            {/* date header row - spans the table but keep it a single td so clickable area covers table width */}
            <tr
                onClick={onToggle}
                className="cursor-pointer bg-sand font-semibold text-brown hover:bg-olive/20 transition-colors duration-200"
            >
                <td colSpan={5} className="p-0">
                    <div className="flex items-center justify-between p-3 select-none">
                        <div className="flex items-center space-x-2">
                            {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-olive" />
                            ) : (
                                <ChevronRight className="w-4 h-4 text-olive" />
                            )}
                            <span>{formatDateShort(dateKey)}</span>
                        </div>
                        <div className="text-sm font-normal text-brown/70">
                            Day Total: Birr {dayTotal.toFixed(2)}
                        </div>
                    </div>
                </td>
            </tr>

            {/* expense rows: render directly as sibling table rows so they align with the parent header columns */}
            {isExpanded &&
                expenses.map((exp) => (
                    <ExpenseRow
                        key={
                            exp.id ??
                            `${dateKey}-${exp.amount}-${exp.description}`
                        }
                        exp={exp}
                    />
                ))}
        </>
    );
}
