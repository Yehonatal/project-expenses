export type Template = {
    id?: string;
    _id?: string;
    description: string;
    type: string;
    price: number | string;
    category?: "expense" | "income";
    frequency?: "daily" | "weekly" | "monthly" | "yearly" | "custom";
    recurrenceRules?: {
        daysOfWeek?: number[]; // [0, 1, 2, 3, 4, 5, 6]
        interval?: number;
        endDate?: string;
        occurrenceCount?: number;
    };
    dayOfMonth?: number;
    startDate?: string;
    endDate?: string;
    provider?: string;
    status?: "active" | "paused";
    isRecurring?: boolean;
    createdAt?: string;
};
