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
    startMonth: number;
    startYear: number;
    endMonth: number;
    endYear: number;
    totalBudget: number;
    spent: number;
    createdAt: string;
    updatedAt: string;
}
