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
        <article
            className="border rounded-md p-2 sm:p-3"
            style={{
                borderColor: "var(--theme-border)",
                backgroundColor: "var(--theme-surface)",
            }}
        >
            <div
                className="flex justify-between items-center mb-1 text-xs font-mono"
                style={{ color: "var(--theme-text-secondary)" }}
            >
                {new Date(exp.date).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                })}
                <span
                    className="inline-flex items-center space-x-1 px-1.5 py-0.5 text-xs rounded-full font-semibold"
                    style={{
                        backgroundColor: exp.included
                            ? "var(--theme-secondary)"
                            : "var(--theme-error)",
                        color: exp.included
                            ? "var(--theme-text)"
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
                <div
                    className="flex justify-end space-x-1 mt-1.5 pt-1.5 border-t"
                    style={{ borderColor: "var(--theme-border)" }}
                >
                    {onEdit && (
                        <button
                            onClick={() => onEdit(exp)}
                            className="p-1 rounded hover:opacity-70 transition-opacity"
                            style={{ color: "var(--theme-textSecondary)" }}
                            title="Edit expense"
                        >
                            <Edit className="w-3.5 h-3.5" />
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={() =>
                                onDelete(exp._id || exp.id?.toString() || "")
                            }
                            className="p-1 rounded hover:opacity-70 transition-opacity"
                            style={{ color: "var(--theme-textSecondary)" }}
                            title="Delete expense"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            )}
        </article>
    );
}
