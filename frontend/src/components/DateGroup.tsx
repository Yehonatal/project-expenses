import type { Expense } from "../types/expense";
import { ChevronDown, ChevronRight } from "lucide-react";
import ExpenseRow from "./ExpenseRow";
import useToggleHeight from "../hooks/useToggleHeight";

const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

type DateGroupProps = {
    ym: string;
    dateKey: string;
    expenses: Expense[];
    isExpanded: boolean;
    onToggle: () => void;
};

export default function DateGroup({
    dateKey,
    expenses,
    isExpanded,
    onToggle,
}: DateGroupProps) {
    const { ref, height } = useToggleHeight(isExpanded);

    const dayTotal = expenses
        .filter((e) => e.included)
        .reduce((sum, e) => sum + e.amount, 0);

    const formatDateShort = (dateStr: string) => {
        const d = new Date(dateStr);
        return `${monthNames[d.getMonth()]} ${d.getDate()}`;
    };

    return (
        <>
            <tr
                onClick={onToggle}
                className="cursor-pointer bg-sand font-semibold text-brown hover:bg-olive/20 transition-colors duration-200"
            >
                <td
                    colSpan={5}
                    className="p-3 select-none flex justify-between items-center"
                >
                    <div className="flex items-center space-x-2">
                        {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-olive" />
                        ) : (
                            <ChevronRight className="w-4 h-4 text-olive" />
                        )}
                        <span>{formatDateShort(dateKey)}</span>
                    </div>
                    <div className="text-sm font-normal text-brown/70">
                        Day Total: Birr {dayTotal.toFixed(2)}
                    </div>
                </td>
            </tr>

            <tr>
                <td colSpan={5} className="p-0">
                    <div
                        ref={ref}
                        style={{
                            height,
                            overflow: "hidden",
                            transition: "height 300ms ease",
                        }}
                    >
                        <table className="w-full">
                            <tbody>
                                {expenses.map((exp) => (
                                    <ExpenseRow key={exp.id} exp={exp} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </td>
            </tr>
        </>
    );
}
