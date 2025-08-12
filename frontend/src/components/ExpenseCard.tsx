import type { Expense } from "../types/expense";
import { Check, X } from "lucide-react";

type ExpenseCardProps = {
    exp: Expense;
};

export default function ExpenseCard({ exp }: ExpenseCardProps) {
    return (
        <article className="border border-taupe rounded-md p-3 bg-white">
            <div className="flex justify-between items-center mb-1 text-xs font-mono text-brown/70">
                {new Date(exp.date).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                })}
                <span
                    className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full font-semibold
            ${exp.included ? "bg-olive/30 text-olive" : "bg-clay/30 text-clay"}
          `}
                >
                    {exp.included ? (
                        <Check className="w-3 h-3" />
                    ) : (
                        <X className="w-3 h-3" />
                    )}
                    <span>{exp.included ? "Included" : "Excluded"}</span>
                </span>
            </div>
            <p className="font-semibold text-brown">{exp.description}</p>
            <p className="text-right font-semibold text-brown">
                Birr {exp.amount.toFixed(2)}
            </p>
        </article>
    );
}
