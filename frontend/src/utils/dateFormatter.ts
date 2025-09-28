import type { Budget } from "../types/expense";

export const formatBudgetPeriod = (budget: Budget): string => {
    if (budget.type === "yearly" && budget.year) {
        return `${budget.year}`;
    }

    if (
        budget.startMonth &&
        budget.startYear &&
        budget.endMonth &&
        budget.endYear
    ) {
        const startDate = new Date(budget.startYear, budget.startMonth - 1);
        const endDate = new Date(budget.endYear, budget.endMonth - 1);

        const startMonth = startDate.toLocaleString("default", {
            month: "short",
        });
        const endMonth = endDate.toLocaleString("default", { month: "short" });

        if (budget.startYear === budget.endYear) {
            return `${startMonth} - ${endMonth} ${budget.startYear}`;
        } else {
            return `${startMonth} ${budget.startYear} - ${endMonth} ${budget.endYear}`;
        }
    }

    if (budget.startDate && budget.endDate) {
        const start = new Date(budget.startDate);
        const end = new Date(budget.endDate);
        const startMonth = start.toLocaleString("default", { month: "short" });
        const endMonth = end.toLocaleString("default", { month: "short" });
        return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${start.getFullYear()}`;
    }

    return "Unknown Period";
};

export const formatExpenseDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
        return "Today";
    } else if (diffDays === 2) {
        return "Yesterday";
    } else if (diffDays <= 7) {
        return date.toLocaleString("default", { weekday: "short" });
    } else {
        return date.toLocaleString("default", {
            month: "short",
            day: "numeric",
            year:
                date.getFullYear() !== now.getFullYear()
                    ? "numeric"
                    : undefined,
        });
    }
};
