import type { Expense } from "./expense";

export type Totals = {
    totalIncluded: number;
    totalExcluded: number;
};

export type MonthlyBreakdownItem = {
    month: number;
    year: number;
    total: number;
};

export type TypeBreakdownItem = {
    type: string;
    total: number;
    count: number;
};

export type TemplateSummary = {
    _id?: string;
    description: string;
    type: string;
    price: number;
};

export type DashboardData = {
    totals: Totals & {
        countIncluded: number;
        countExcluded: number;
    };
    monthlyBreakdown: MonthlyBreakdownItem[];
    typeBreakdown: TypeBreakdownItem[];
    recentExpenses: Expense[];
    templates: TemplateSummary[];
    healthScore?: {
        totalScore: number;
        band: "excellent" | "good" | "fair" | "needs-attention";
        spendStabilityScore: number;
        budgetAdherenceScore: number;
        savingsTrendScore: number;
    };
    updatedAt: string;
};

export type TrendsData = {
    currentMonth: { month: number; year: number };
    previousMonth: { month: number; year: number };
    trends: Array<{
        category: string;
        currentMonth: number;
        previousMonth: number;
        percentageChange: number;
        currentCount: number;
        previousCount: number;
    }>;
    summary: {
        currentTotal: number;
        previousTotal: number;
        overallPercentageChange: number;
    };
};
