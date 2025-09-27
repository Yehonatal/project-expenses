import { Check, X, RotateCcw, Edit, Trash2 } from "lucide-react";
import type { Expense } from "../types/expense";

interface ExpenseRowProps {
    exp: Expense;
    onEdit?: (expense: Expense) => void;
    onDelete?: (expenseId: string) => void;
}

export default function ExpenseRow({ exp, onEdit, onDelete }: ExpenseRowProps) {
    return (
        <tr
            className="transition-colors duration-150"
            style={{ backgroundColor: "var(--theme-hover)" }}
        >
            <td
                className="p-3 align-top font-mono w-24"
                style={{ color: "var(--theme-textSecondary)" }}
            >
                {new Date(exp.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                })}
            </td>
            <td
                className="p-3 align-top"
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
                className="p-3 align-top capitalize"
                style={{ color: "var(--theme-textSecondary)" }}
            >
                {exp.type}
            </td>
            <td
                className="p-3 text-right font-semibold w-24"
                style={{ color: "var(--theme-text)" }}
            >
                Birr {exp.amount.toFixed(2)}
            </td>
            <td className="p-3 text-center font-semibold flex justify-center items-center space-x-1 w-20">
                {exp.included ? (
                    <>
                        <Check
                            className="w-4 h-4"
                            style={{ color: "var(--theme-accent)" }}
                        />
                    </>
                ) : (
                    <>
                        <X
                            className="w-4 h-4"
                            style={{ color: "var(--theme-primary)" }}
                        />
                    </>
                )}
            </td>
            <td className="p-3 text-center w-16">
                <div className="flex items-center justify-center space-x-1">
                    {onEdit && (
                        <button
                            onClick={() => onEdit(exp)}
                            className="p-1 rounded hover:opacity-70 transition-opacity"
                            style={{ color: "var(--theme-textSecondary)" }}
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
                            className="p-1 rounded hover:opacity-70 transition-opacity"
                            style={{ color: "var(--theme-textSecondary)" }}
                            title="Delete expense"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
}
