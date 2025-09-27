import type { Expense } from "../types/expense";
import { Check, X } from "lucide-react";

type ExpenseCardProps = {
    exp: Expense;
};

export default function ExpenseCard({ exp }: ExpenseCardProps) {
    return (
        <article
            className="border rounded-md p-3"
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
                    className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full font-semibold"
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
                        <Check className="w-3 h-3" />
                    ) : (
                        <X className="w-3 h-3" />
                    )}
                    <span>{exp.included ? "Included" : "Excluded"}</span>
                </span>
            </div>
            <p className="font-semibold" style={{ color: "var(--theme-text)" }}>
                {exp.description}
            </p>
            <p
                className="text-sm capitalize"
                style={{ color: "var(--theme-text-secondary)" }}
            >
                {exp.type}
            </p>
            <p
                className="text-right font-semibold"
                style={{ color: "var(--theme-text)" }}
            >
                Birr {exp.amount.toFixed(2)}
            </p>
        </article>
    );
}
