import { Check, X } from "lucide-react";
import type { Expense } from "../types/expense";

interface ExpenseRowProps {
    exp: Expense;
}

export default function ExpenseRow({ exp }: ExpenseRowProps) {
    return (
        <tr className="hover:bg-sand transition-colors duration-150">
            <td className="p-3 align-top font-mono text-brown/80 w-24">
                {new Date(exp.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                })}
            </td>
            <td className="p-3 align-top">{exp.description}</td>
            <td className="p-3 align-top capitalize text-gray-600">
                {exp.type}
            </td>
            <td className="p-3 text-right font-semibold text-brown w-24">
                Birr {exp.amount.toFixed(2)}
            </td>
            <td className="p-3 text-center font-semibold flex justify-center items-center space-x-1 w-20">
                {exp.included ? (
                    <>
                        <Check className="w-4 h-4 text-olive" />
                    </>
                ) : (
                    <>
                        <X className="w-4 h-4 text-clay" />
                    </>
                )}
            </td>
        </tr>
    );
}
