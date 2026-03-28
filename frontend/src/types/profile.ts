export interface ProfileUser {
    _id: string;
    name: string;
    email: string;
    picture: string;
    createdAt: string;
}

export interface ProfileExpense {
    _id: string;
    amount: number;
    description: string;
    type: string;
    date: string;
    recurring: boolean;
}

export interface MonthlyData {
    _id: string;
    total: number;
    count: number;
    maxExpense: number;
    minExpense: number;
}

export interface ProfileStats {
    totalExpenses: number;
    totalTypes: number;
    mostExpensive: ProfileExpense | null;
    cheapest: ProfileExpense | null;
    monthlyAssessment: MonthlyData[];
}
