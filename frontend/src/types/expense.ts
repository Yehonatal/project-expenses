export interface Expense {
    id: number;
    date: string;
    description: string;
    amount: number;
    included: boolean;
    type: string;
    createdAt: string;
}
