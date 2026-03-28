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
    const count = expenses.length;

    const formatDateShort = (dateStr: string) => {
        const d = new Date(dateStr);
        return `${monthNames[d.getMonth()]} ${d.getDate()}`;
    };

    return (
        <>
            <tr
                onClick={onToggle}
                className="cursor-pointer border-b border-[var(--theme-border)]/30 bg-[var(--theme-surface)] font-semibold transition-colors hover:bg-[var(--theme-hover)]"
            >
                <td colSpan={6} className="p-0">
                    <div className="flex items-center justify-between px-2.5 py-1.5 select-none">
                        <div className="flex items-center gap-3">
                            {isExpanded ? (
                                <ChevronDown
                                    className="h-3.5 w-3.5"
                                    style={{ color: "var(--theme-accent)" }}
                                />
                            ) : (
                                <ChevronRight
                                    className="h-3.5 w-3.5"
                                    style={{ color: "var(--theme-accent)" }}
                                />
                            )}
                            <span className="text-xs font-semibold tracking-wide">
                                {formatDateShort(dateKey)}
                            </span>
                            <span className="border border-[var(--theme-border)]/50 bg-[var(--theme-background)] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--theme-text-secondary)]">
                                {count} item{count !== 1 ? "s" : ""}
                            </span>
                        </div>
                        <div className="border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                            Birr {dayTotal.toFixed(2)}
                        </div>
                    </div>
                </td>
            </tr>

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
