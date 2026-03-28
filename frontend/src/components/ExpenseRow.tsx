import { Check, X, RotateCcw, Edit, Trash2 } from "lucide-react";
import type { Expense } from "../types/expense";

interface ExpenseRowProps {
    exp: Expense;
    onEdit?: (expense: Expense) => void;
    onDelete?: (expenseId: string) => void;
}

export default function ExpenseRow({ exp, onEdit, onDelete }: ExpenseRowProps) {
    const displayTime = new Date(exp.createdAt || exp.date).toLocaleTimeString(
        [],
        {
            hour: "2-digit",
            minute: "2-digit",
        },
    );

    return (
        <tr className="border-b border-[var(--theme-border)]/20 bg-[var(--theme-background)]/40 transition-colors hover:bg-[var(--theme-hover)]">
            <td
                className="w-24 px-2 py-1.5 align-middle font-mono text-[11px]"
                style={{ color: "var(--theme-text-secondary)" }}
            >
                {displayTime}
            </td>
            <td
                className="px-2 py-1.5 align-middle text-xs"
                style={{ color: "var(--theme-text)" }}
            >
                <div className="flex items-center gap-2">
                    <span
                        className="h-2 w-2 shrink-0"
                        style={{
                            backgroundColor: exp.included
                                ? "#10b981"
                                : "#f59e0b",
                        }}
                    />
                    <span className="max-w-[320px] truncate font-semibold tracking-tight">
                        {exp.description}
                    </span>
                    {exp.isRecurring && (
                        <span className="inline-flex items-center gap-1 bg-[var(--theme-surface)] px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-[var(--theme-text-secondary)]">
                            <RotateCcw
                                className="h-2.5 w-2.5"
                                style={{ color: "var(--theme-accent)" }}
                            />
                            auto
                        </span>
                    )}
                    {(exp.tags || []).slice(0, 2).map((tag) => (
                        <span
                            key={tag}
                            className="inline-flex items-center bg-[var(--theme-background)] px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-[var(--theme-text-secondary)]"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            </td>
            <td
                className="px-2 py-1.5 align-middle capitalize text-xs"
                style={{ color: "var(--theme-text-secondary)" }}
            >
                <span className="inline-flex bg-[var(--theme-surface)] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide">
                    {exp.type}
                </span>
            </td>
            <td
                className="w-24 px-2 py-1.5 align-middle text-right text-xs font-semibold"
                style={{ color: exp.included ? "#15803d" : "#b45309" }}
            >
                Birr {exp.amount.toFixed(2)}
            </td>
            <td className="w-20 px-2 py-1.5 text-center font-semibold">
                {exp.included ? (
                    <span className="inline-flex items-center justify-center border border-emerald-500/40 bg-emerald-500/10 p-0.5 text-emerald-600">
                        <Check className="h-2.5 w-2.5" />
                    </span>
                ) : (
                    <span className="inline-flex items-center justify-center border border-amber-500/40 bg-amber-500/10 p-0.5 text-amber-600">
                        <X className="h-2.5 w-2.5" />
                    </span>
                )}
            </td>
            <td className="w-24 px-2 py-1.5 text-center">
                <div className="flex items-center justify-center gap-1">
                    {onEdit && (
                        <button
                            onClick={() => onEdit(exp)}
                            className="border border-[var(--theme-border)]/50 bg-[var(--theme-surface)] p-1 transition-colors hover:bg-[var(--theme-hover)]"
                            style={{ color: "var(--theme-text)" }}
                            title="Edit expense"
                        >
                            <Edit className="h-3 w-3" />
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={() =>
                                onDelete(exp._id || exp.id?.toString() || "")
                            }
                            className="border border-red-500/30 bg-red-500/10 p-1 transition-colors hover:bg-red-500/20"
                            style={{ color: "#ef4444" }}
                            title="Delete expense"
                        >
                            <Trash2 className="h-3 w-3" />
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
}
