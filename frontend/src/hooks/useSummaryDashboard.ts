import { useEffect, useMemo, useState } from "react";
import API, {
    getExpenseForecast,
    getExpenseInsights,
    getImportSynergyOverview,
    getBankAccounts,
} from "../api/api";
import type { Expense } from "../types/expense";
import type {
    DashboardData,
    ForecastData,
    ImportSynergyOverview,
    InsightsData,
    TrendsData,
} from "../types/dashboard";

export const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

export function useSummaryDashboard() {
    const [summary, setSummary] = useState<DashboardData | null>(null);
    const [trends, setTrends] = useState<TrendsData | null>(null);
    const [insights, setInsights] = useState<InsightsData | null>(null);
    const [forecast, setForecast] = useState<ForecastData | null>(null);
    const [importSynergy, setImportSynergy] =
        useState<ImportSynergyOverview | null>(null);
    const [selectedImportAccountKey, setSelectedImportAccountKey] =
        useState<string>("ALL");
    const [importSynergyLoading, setImportSynergyLoading] =
        useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedTypes, setExpandedTypes] = useState<Record<string, boolean>>(
        {},
    );
    const [typeExpenses, setTypeExpenses] = useState<Record<string, Expense[]>>(
        {},
    );
    const [totalAccountBalance, setTotalAccountBalance] = useState<
        number | null
    >(null);

    useEffect(() => {
        let mounted = true;
        setLoading(true);

        const load = async () => {
            try {
                const [
                    dashboardRes,
                    trendsRes,
                    insightsRes,
                    forecastRes,
                    accountsRes,
                ] = await Promise.allSettled([
                    API.get<DashboardData>("/expenses/dashboard"),
                    API.get<TrendsData>("/expenses/trends"),
                    getExpenseInsights(),
                    getExpenseForecast({ scenario: "baseline", window: 6 }),
                    getBankAccounts(),
                ]);

                if (!mounted) return;

                if (
                    dashboardRes.status === "fulfilled" &&
                    dashboardRes.value?.data
                ) {
                    const res = dashboardRes.value;
                    const data: DashboardData = {
                        totals: {
                            totalIncluded: res.data?.totals?.totalIncluded ?? 0,
                            totalExcluded: res.data?.totals?.totalExcluded ?? 0,
                            countIncluded: res.data?.totals?.countIncluded ?? 0,
                            countExcluded: res.data?.totals?.countExcluded ?? 0,
                        },
                        monthlyBreakdown: Array.isArray(
                            res.data?.monthlyBreakdown,
                        )
                            ? res.data.monthlyBreakdown
                            : [],
                        typeBreakdown: Array.isArray(res.data?.typeBreakdown)
                            ? res.data.typeBreakdown.filter((t) => t.type)
                            : [],
                        recentExpenses: Array.isArray(res.data?.recentExpenses)
                            ? res.data.recentExpenses
                            : [],
                        templates: Array.isArray(res.data?.templates)
                            ? res.data.templates
                            : [],
                        healthScore: {
                            totalScore: res.data?.healthScore?.totalScore ?? 50,
                            band: res.data?.healthScore?.band ?? "fair",
                            spendStabilityScore:
                                res.data?.healthScore?.spendStabilityScore ??
                                50,
                            budgetAdherenceScore:
                                res.data?.healthScore?.budgetAdherenceScore ??
                                50,
                            savingsTrendScore:
                                res.data?.healthScore?.savingsTrendScore ?? 50,
                        },
                        updatedAt:
                            res.data?.updatedAt ?? new Date().toISOString(),
                    };

                    data.monthlyBreakdown.sort((a, b) =>
                        a.year === b.year ? a.month - b.month : a.year - b.year,
                    );

                    setSummary(data);
                    setError(null);
                } else {
                    setError("Failed to load summary");
                }

                if (trendsRes.status === "fulfilled") {
                    setTrends(trendsRes.value.data);
                }

                if (insightsRes.status === "fulfilled") {
                    setInsights(insightsRes.value.data);
                }

                if (forecastRes.status === "fulfilled") {
                    setForecast(forecastRes.value.data);
                }

                if (accountsRes.status === "fulfilled") {
                    const accounts = accountsRes.value.data || [];
                    const computedBalance = accounts.reduce(
                        (acc: number, a: any) => acc + (a.balance || 0),
                        0,
                    );
                    setTotalAccountBalance(computedBalance);
                }
            } catch (err) {
                if (mounted) setError("Failed to load summary");
                console.error("Failed to fetch summary:", err);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        void load();

        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        let mounted = true;

        const loadImportSynergy = async () => {
            try {
                setImportSynergyLoading(true);
                const response = await getImportSynergyOverview({
                    accountKey: selectedImportAccountKey,
                });

                if (!mounted) return;
                setImportSynergy(response.data);
            } catch (err) {
                if (!mounted) return;
                setImportSynergy(null);
                console.error("Failed to fetch import synergy overview:", err);
            } finally {
                if (mounted) setImportSynergyLoading(false);
            }
        };

        void loadImportSynergy();

        return () => {
            mounted = false;
        };
    }, [selectedImportAccountKey]);

    const toggleType = async (type: string) => {
        const isExpanded = expandedTypes[type];
        if (isExpanded) {
            setExpandedTypes((prev) => ({ ...prev, [type]: false }));
            return;
        }

        if (!typeExpenses[type]) {
            try {
                const response = await API.get<Expense[]>(
                    `/expenses?type=${encodeURIComponent(type)}`,
                );
                setTypeExpenses((prev) => ({
                    ...prev,
                    [type]: response.data,
                }));
            } catch (err) {
                console.error("Failed to fetch expenses for type:", type, err);
            }
        }

        setExpandedTypes((prev) => ({ ...prev, [type]: true }));
    };

    const derived = useMemo(() => {
        if (!summary) {
            return {
                totalSpent: 0,
                totalCount: 0,
                topTypes: [],
                updatedLabel: "",
                nowLabel: "",
                chartData: [] as Array<{ name: string; total: number }>,
                trendMap: new Map(),
            };
        }

        const totalSpent =
            summary.totals.totalIncluded + summary.totals.totalExcluded;
        const totalCount =
            summary.totals.countIncluded + summary.totals.countExcluded;

        return {
            totalSpent,
            totalCount,
            topTypes: summary.typeBreakdown.slice(0, 5),
            insightsFeed: insights?.insights || [],
            insightsSummary: insights?.summary,
            insightsUpdatedAt: insights?.generatedAt || "",
            updatedLabel: new Date(summary.updatedAt).toLocaleTimeString(
                undefined,
                {
                    hour: "2-digit",
                    minute: "2-digit",
                },
            ),
            nowLabel: new Date().toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
            }),
            chartData: summary.monthlyBreakdown.map((m) => ({
                name: `${monthNames[m.month - 1]} ${m.year}`,
                total: Math.round(m.total * 100) / 100,
            })),
            trendMap: new Map(
                (trends?.trends || []).map((trend) => [trend.category, trend]),
            ),
        };
    }, [summary, trends, insights]);

    return {
        summary,
        trends,
        insights,
        forecast,
        importSynergy,
        importSynergyLoading,
        selectedImportAccountKey,
        setSelectedImportAccountKey,
        totalAccountBalance,
        loading,
        error,
        expandedTypes,
        typeExpenses,
        toggleType,
        ...derived,
    };
}
