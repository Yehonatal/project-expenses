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
    onEdit: (expense: Expense) => void;
    onDelete: (id: string) => void;
};

export default function DateGroup({
    dateKey,
    expenses,
    isExpanded,
    onToggle,
    onEdit,
    onDelete,
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
                className="cursor-pointer font-semibold transition-all duration-200 glass-button/30 hover:glass-button/50 border-b border-theme-border/20"
            >
                <td colSpan={6} className="p-0">
                    <div className="flex items-center justify-between px-3 py-2 select-none">
                        <div className="flex items-center space-x-3">
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
                            <span className="text-xs">
                                {formatDateShort(dateKey)}
                            </span>
                        </div>
                        <div
                            className="text-xs font-normal"
                            style={{ color: "var(--theme-text-secondary)" }}
                        >
                            Day Total: Birr {dayTotal.toFixed(2)}
                        </div>
                    </div>
                </td>
            </tr>

            {/* expense rows: render directly as sibling table rows so they align with the parent header columns */}
            {isExpanded &&
                expenses.map((exp, idx) => (
                    <ExpenseRow
                        key={exp.id || `${dateKey}-${idx}`}
                        exp={exp}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
        </>
    );
}
