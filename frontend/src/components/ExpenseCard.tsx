import type { Expense } from "../types/expense";
import { Check, X, Edit, Trash2 } from "lucide-react";

type ExpenseCardProps = {
    exp: Expense;
    onEdit?: (expense: Expense) => void;
    onDelete?: (expenseId: string) => void;
};

export default function ExpenseCard({
    exp,
    onEdit,
    onDelete,
}: ExpenseCardProps) {
    return (
        <article className="space-y-2 rounded-xl border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] p-3 backdrop-blur-[24px]">
            <div
                className="flex justify-between items-center text-xs font-mono"
                style={{ color: "var(--theme-text-secondary)" }}
            >
                {new Date(exp.date).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                })}
                <span
                    className="inline-flex items-center space-x-1 rounded-full border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] px-2 py-1 text-xs font-semibold backdrop-blur-[20px] transition-colors hover:bg-white/5"
                    style={{
                        backgroundColor: exp.included
                            ? "var(--theme-accent)"
                            : "var(--theme-error)",
                        color: exp.included
                            ? "var(--theme-background)"
                            : "var(--theme-text)",
                    }}
                >
                    {exp.included ? (
                        <Check className="w-2.5 h-2.5" />
                    ) : (
                        <X className="w-2.5 h-2.5" />
                    )}
                    <span className="hidden sm:inline">
                        {exp.included ? "Included" : "Excluded"}
                    </span>
                </span>
            </div>
            <p
                className="font-semibold text-sm sm:text-base"
                style={{ color: "var(--theme-text)" }}
            >
                {exp.description}
            </p>
            <p
                className="text-xs sm:text-sm capitalize"
                style={{ color: "var(--theme-text-secondary)" }}
            >
                {exp.type}
            </p>
            <p
                className="text-right font-semibold text-sm sm:text-base"
                style={{ color: "var(--theme-text)" }}
            >
                Birr {exp.amount.toFixed(2)}
            </p>
            {(onEdit || onDelete) && (
                <div className="flex justify-end space-x-2 border-t border-[var(--theme-border)]/20 pt-2">
                    {onEdit && (
                        <button
                            onClick={() => onEdit(exp)}
                            className="rounded-lg border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] p-2 backdrop-blur-[20px] transition-colors hover:bg-white/5"
                            style={{ color: "var(--theme-text)" }}
                            title="Edit expense"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={() =>
                                onDelete(exp._id || exp.id?.toString() || "")
                            }
                            className="rounded-lg border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] p-2 backdrop-blur-[20px] transition-colors hover:bg-red-500/20"
                            style={{ color: "#ef4444" }}
                            title="Delete expense"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )}
        </article>
    );
}
