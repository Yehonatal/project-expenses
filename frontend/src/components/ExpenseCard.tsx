import type { Expense } from "../types/expense";
import { Check, X, Edit, Trash2, RotateCcw } from "lucide-react";

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
    const displayTime = new Date(exp.createdAt || exp.date).toLocaleTimeString(
        [],
        {
            hour: "2-digit",
            minute: "2-digit",
        },
    );

    return (
        <article className="relative overflow-hidden border border-[var(--theme-border)]/40 bg-[var(--theme-surface)] p-2.5">
            <div
                className="pointer-events-none absolute inset-y-0 left-0 w-1"
                style={{
                    backgroundColor: exp.included ? "#10b981" : "#f59e0b",
                }}
            />
            <div className="space-y-1.5 pl-1">
                <div className="flex items-start justify-between gap-2">
                    <p
                        className="truncate pr-1 text-sm font-semibold tracking-tight"
                        style={{ color: "var(--theme-text)" }}
                    >
                        {exp.description}
                    </p>
                    <p
                        className="shrink-0 text-sm font-semibold"
                        style={{ color: exp.included ? "#15803d" : "#b45309" }}
                    >
                        Birr {exp.amount.toFixed(2)}
                    </p>
                </div>

                <div className="flex items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5">
                        <span
                            className="font-mono text-[10px]"
                            style={{ color: "var(--theme-text-secondary)" }}
                        >
                            {displayTime}
                        </span>
                        <span className="inline-flex border border-[var(--theme-border)]/50 bg-[var(--theme-background)] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--theme-text-secondary)]">
                            {exp.type}
                        </span>
                        {exp.isRecurring && (
                            <span className="inline-flex items-center gap-1 border border-[var(--theme-border)]/50 bg-[var(--theme-background)] px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-[var(--theme-text-secondary)]">
                                <RotateCcw className="h-2.5 w-2.5" /> auto
                            </span>
                        )}
                    </div>
                    <span
                        className="inline-flex items-center gap-1 border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                        style={{
                            backgroundColor: exp.included
                                ? "rgba(16, 185, 129, 0.12)"
                                : "rgba(245, 158, 11, 0.12)",
                            borderColor: exp.included
                                ? "rgba(16, 185, 129, 0.4)"
                                : "rgba(245, 158, 11, 0.4)",
                            color: exp.included ? "#047857" : "#b45309",
                        }}
                    >
                        {exp.included ? (
                            <Check className="h-2.5 w-2.5" />
                        ) : (
                            <X className="h-2.5 w-2.5" />
                        )}
                        {exp.included ? "in" : "out"}
                    </span>
                </div>
            </div>

            {(onEdit || onDelete) && (
                <div className="mt-2 flex justify-end space-x-1.5 border-t border-[var(--theme-border)]/20 pt-1.5">
                    {onEdit && (
                        <button
                            onClick={() => onEdit(exp)}
                            className="border border-[var(--theme-border)]/50 bg-[var(--theme-background)] p-1.5 transition-colors hover:bg-[var(--theme-hover)]"
                            style={{ color: "var(--theme-text)" }}
                            title="Edit expense"
                        >
                            <Edit className="h-3.5 w-3.5" />
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={() =>
                                onDelete(exp._id || exp.id?.toString() || "")
                            }
                            className="border border-red-500/30 bg-red-500/10 p-1.5 transition-colors hover:bg-red-500/20"
                            style={{ color: "#ef4444" }}
                            title="Delete expense"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
            )}
        </article>
    );
}
