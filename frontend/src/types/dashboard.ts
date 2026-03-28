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

export type InsightItem = {
    id: string;
    kind: "trend" | "anomaly" | "recurring" | "opportunity";
    severity: "high" | "medium" | "low";
    title: string;
    message: string;
    recommendation: string;
    metricLabel: string;
    metricValue: number;
};

export type InsightsData = {
    generatedAt: string;
    summary: {
        insightCount: number;
        monthlyDeltaPercent: number;
    };
    insights: InsightItem[];
};

export type ForecastData = {
    generatedAt: string;
    request: {
        scenario: "conservative" | "baseline" | "aggressive";
        windowMonths: 1 | 3 | 6 | 12;
    };
    summary: {
        baselineSpend: number;
        historicalBaselineSpend: number;
        anchoredBaselineSpend: number;
        projectedRecurringSpend: number;
        projectedRecurringIncome: number;
        projectedSpend: number;
        projectedCashFlow: number;
        monthOverMonthDelta: number;
        confidence: number;
        currentMonthSpend: number;
        dailyRunRate: number;
        daysElapsedInMonth: number;
        daysInMonth: number;
        projectedMin: number;
        projectedMax: number;
        projectedCurrentMonthEndSpend: number;
        next6MonthsSpend: number;
        next12MonthsSpend: number;
        next6MonthsIncome: number;
        next12MonthsIncome: number;
        next6MonthsNet: number;
        next12MonthsNet: number;
        p10: number;
        p50: number;
        p90: number;
    };
    historical: Array<{
        year: number;
        month: number;
        total: number;
    }>;
    forecast: Array<{
        year: number;
        month: number;
        projectedSpend: number;
        projectedRecurringSpend: number;
        projectedRecurringIncome: number;
        projectedNetCashFlow: number;
        min: number;
        max: number;
        p10: number;
        p50: number;
        p90: number;
    }>;
    categories: Array<{
        type: string;
        expected: number;
        min: number;
        max: number;
        recurring: number;
        p10: number;
        p50: number;
        p90: number;
    }>;
    assumptions: {
        model: string;
        distribution: string;
        percentileMethod: string;
        scenarioMultiplier: number;
        windowMonths: number;
        monthlyTrendDrift: number;
        currentMonthProjection: string;
        recurringTreatment: string;
    };
};
