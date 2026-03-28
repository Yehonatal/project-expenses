export interface Expense {
    id?: number;
    _id?: string;
    date: string;
    description: string;
    amount: number;
    included: boolean;
    type: string;
    tags?: string[];
    workspaceId?:
        | string
        | {
              _id: string;
              name: string;
              inviteCode?: string;
          }
        | null;
    createdBy?: {
        _id: string;
        name: string;
        email?: string;
        picture?: string | null;
    };
    createdAt: string;
    // Recurring expense fields
    isRecurring?: boolean;
    frequency?: "daily" | "weekly" | "monthly" | "yearly" | "custom";
    recurrenceRules?: {
        daysOfWeek?: number[]; // [0, 1, 2, 3, 4, 5, 6]
        interval?: number;
        endDate?: string;
        occurrenceCount?: number;
    };
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

export interface ExpenseFilterParams {
    from?: string;
    to?: string;
    included?: boolean;
    type?: string;
    tags?: string;
    minAmount?: string;
    maxAmount?: string;
    isRecurring?: boolean;
    keyword?: string;
    scope?: "all" | "personal" | "shared";
    workspaceId?: string;
    memberId?: string;
    page?: number;
    limit?: number;
}

export interface PaginatedExpensesResponse {
    items: Expense[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    includedTotal: number;
    recurringCount: number;
}

export interface ExpenseFilterPreset {
    _id: string;
    userId: string;
    name: string;
    filters: ExpenseFilterParams;
    isDefault?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ExpenseFilterPresetPayload {
    name: string;
    filters: ExpenseFilterParams;
    isDefault?: boolean;
}
