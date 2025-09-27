export interface Expense {
    id: number;
    date: string;
    description: string;
    amount: number;
    included: boolean;
    type: string;
    createdAt: string;
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
