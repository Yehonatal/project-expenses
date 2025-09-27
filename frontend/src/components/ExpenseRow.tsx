import { Check, X, RotateCcw, Edit, Trash2 } from "lucide-react";
import type { Expense } from "../types/expense";

interface ExpenseRowProps {
    exp: Expense;
    onEdit?: (expense: Expense) => void;
    onDelete?: (expenseId: string) => void;
}

export default function ExpenseRow({ exp, onEdit, onDelete }: ExpenseRowProps) {
    return (
        <tr className="transition-all duration-200 hover:glass-button/20 border-b border-gray-200 border-theme-border/10">
            <td
                className="px-3 py-2 align-middle font-mono w-24 text-xs"
                style={{ color: "var(--theme-text-secondary)" }}
            >
                {new Date(exp.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                })}
            </td>
            <td
                className="px-3 py-2 align-middle text-xs"
                style={{ color: "var(--theme-text)" }}
            >
                <div className="flex items-center gap-2">
                    {exp.description}
                    {exp.isRecurring && (
                        <RotateCcw
                            className="w-3 h-3"
                            style={{ color: "var(--theme-accent)" }}
                        />
                    )}
                </div>
            </td>
            <td
                className="px-3 py-2 align-middle capitalize text-xs"
                style={{ color: "var(--theme-text-secondary)" }}
            >
                {exp.type}
            </td>
            <td
                className="px-3 py-2 align-middle text-right font-semibold w-24 text-xs"
                style={{ color: "var(--theme-text)" }}
            >
                Birr {exp.amount.toFixed(2)}
            </td>
            <td className="px-3 py-2 text-center font-semibold pl-10 space-x-1 w-20">
                {exp.included ? (
                    <>
                        <Check
                            className="w-3 h-3"
                            style={{ color: "var(--theme-accent)" }}
                        />
                    </>
                ) : (
                    <>
                        <X
                            className="w-3 h-3"
                            style={{ color: "var(--theme-primary)" }}
                        />
                    </>
                )}
            </td>
            <td className="px-3 py-2 text-center w-24">
                <div className="flex items-center justify-center space-x-1">
                    {onEdit && (
                        <button
                            onClick={() => onEdit(exp)}
                            className="p-1 rounded hover:bg-theme-surface/50 transition-all duration-200"
                            style={{ color: "var(--theme-text)" }}
                            title="Edit expense"
                        >
                            <Edit className="w-3 h-3" />
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={() =>
                                onDelete(exp._id || exp.id?.toString() || "")
                            }
                            className="p-1 rounded hover:bg-red-500/20 transition-all duration-200"
                            style={{ color: "#ef4444" }}
                            title="Delete expense"
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
}
