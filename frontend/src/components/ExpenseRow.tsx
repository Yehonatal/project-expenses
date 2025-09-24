import { Check, X } from "lucide-react";
import type { Expense } from "../types/expense";

interface ExpenseRowProps {
    exp: Expense;
}

export default function ExpenseRow({ exp }: ExpenseRowProps) {
    return (
        <tr
            className="transition-colors duration-150"
            style={{ backgroundColor: "var(--theme-hover)" }}
        >
            <td
                className="p-3 align-top font-mono w-24"
                style={{ color: "var(--theme-text-secondary)" }}
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
                {exp.description}
            </td>
            <td
                className="p-3 align-top capitalize"
                style={{ color: "var(--theme-text-secondary)" }}
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
        </tr>
    );
}
