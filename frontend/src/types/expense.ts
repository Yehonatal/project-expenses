export interface Expense {
    id?: number;
    _id?: string;
    date: string;
    description: string;
    amount: number;
    included: boolean;
    type: string;
    createdAt: string;
    // Recurring expense fields
    isRecurring?: boolean;
    frequency?: "weekly" | "monthly";
    nextDueDate?: string;
    parentExpenseId?: string;
}

export interface Budget {
    _id: string;
    userId: string;
    type: "weekly" | "monthly" | "multi-month" | "yearly";
    // For weekly budgets
    startDate?: string;
    endDate?: string;
    // For monthly/multi-month budgets
    startMonth?: number;
    startYear?: number;
    endMonth?: number;
    endYear?: number;
    // For yearly budgets
    year?: number;
    totalBudget: number;
    spent: number;
    createdAt: string;
    updatedAt: string;
}
