export type Template = {
    id?: string;
    _id?: string;
    description: string;
    type: string;
    price: number | string;
    category?: "expense" | "income";
    frequency?: "weekly" | "monthly" | "yearly";
    dayOfMonth?: number;
    startDate?: string;
    endDate?: string;
    provider?: string;
    status?: "active" | "paused";
    isRecurring?: boolean;
    createdAt?: string;
};
