import { useEffect, useState } from "react";
import API from "../api/api";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import type { Expense } from "../types/expense";
import ExpandableExpenseTable from "../components/ExpandableExpenseTable";
import Loading from "../components/Loading";

type Totals = {
    totalIncluded: number;
    totalExcluded: number;
};

type MonthlyBreakdownItem = {
    month: number; // 1-12
    year: number;
    total: number;
};

type TypeBreakdownItem = {
    type: string;
    total: number;
    count: number;
};

type SummaryData = {
    totals: Totals;
    monthlyBreakdown: MonthlyBreakdownItem[];
    typeBreakdown: TypeBreakdownItem[];
};

const monthNames = [
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

const clay = "#D8A48F";
const brown = "#5C4B3B";

const pieColors = ["#D8A48F", "#8A9E5B", "#E3D4B9", "#5C4B3B", "#F4E1D2"];

export default function SummaryPage() {
    const [summary, setSummary] = useState<SummaryData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedTypes, setExpandedTypes] = useState<Record<string, boolean>>(
        {}
    );
    const [typeExpenses, setTypeExpenses] = useState<Record<string, Expense[]>>(
        {}
    );

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        API.get<SummaryData>("/expenses/summary")
            .then((res) => {
                if (!mounted) return;
                // defensive defaults
                const data: SummaryData = {
                    totals: {
                        totalIncluded: res.data?.totals?.totalIncluded ?? 0,
                        totalExcluded: res.data?.totals?.totalExcluded ?? 0,
                    },
                    monthlyBreakdown: Array.isArray(res.data?.monthlyBreakdown)
                        ? res.data.monthlyBreakdown
                        : [],
                    typeBreakdown: Array.isArray(res.data?.typeBreakdown)
                        ? res.data.typeBreakdown.filter((t) => t.type)
                        : [],
                };

                // sort monthlyBreakdown chronological (oldest -> newest)
                data.monthlyBreakdown.sort((a, b) =>
                    a.year === b.year ? a.month - b.month : a.year - b.year
                );

                setSummary(data);
                setError(null);
            })
            .catch((err) => {
                console.error("Failed to fetch summary:", err);
                if (mounted) setError("Failed to load summary");
            })
            .finally(() => mounted && setLoading(false));

        return () => {
            mounted = false;
        };
    }, []);

    const formatMoney = (n: number) =>
        `${n.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })} birr`;

    const toggleType = async (type: string) => {
        const isExpanded = expandedTypes[type];
        if (isExpanded) {
            setExpandedTypes((prev) => ({ ...prev, [type]: false }));
        } else {
            if (!typeExpenses[type]) {
                try {
                    const response = await API.get<Expense[]>(
                        `/expenses?type=${encodeURIComponent(type)}`
                    );
                    setTypeExpenses((prev) => ({
                        ...prev,
                        [type]: response.data,
                    }));
                } catch (err) {
                    console.error(
                        "Failed to fetch expenses for type:",
                        type,
                        err
                    );
                }
            }
            setExpandedTypes((prev) => ({ ...prev, [type]: true }));
        }
    };

    if (loading) {
        return <Loading />;
    }

    if (error || !summary) {
        return (
            <div className="p-6 max-w-5xl mx-auto">
                <div className="text-red-600">
                    {error ?? "No summary available"}
                </div>
            </div>
        );
    }

    const { totals, monthlyBreakdown, typeBreakdown } = summary;

    // Rechart data: map to { name, total } and use short month names
    const chartData = monthlyBreakdown.map((m) => ({
        name: `${monthNames[m.month - 1]} ${m.year}`,
        total: Math.round(m.total * 100) / 100,
    }));

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-6" style={{ color: brown }}>
                Summary Dashboard
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                <div
                    className="rounded-lg p-4 shadow-sm"
                    style={{ backgroundColor: "rgba(138,154,91,0.10)" }}
                >
                    <div className="text-sm font-medium text-gray-600">
                        Total Included
                    </div>
                    <div
                        className="mt-2 text-2xl font-bold"
                        style={{ color: brown }}
                    >
                        {formatMoney(totals.totalIncluded)}
                    </div>
                </div>

                <div
                    className="rounded-lg p-4 shadow-sm"
                    style={{ backgroundColor: "rgba(216,164,143,0.10)" }}
                >
                    <div className="text-sm font-medium text-gray-600">
                        Total Excluded
                    </div>
                    <div
                        className="mt-2 text-2xl font-bold"
                        style={{ color: brown }}
                    >
                        {formatMoney(totals.totalExcluded)}
                    </div>
                </div>

                <div
                    className="rounded-lg p-4 shadow-sm"
                    style={{ backgroundColor: "rgba(92,75,59,0.10)" }}
                >
                    <div className="text-sm font-medium text-gray-600">
                        Total Spent
                    </div>
                    <div
                        className="mt-2 text-2xl font-bold"
                        style={{ color: brown }}
                    >
                        {formatMoney(
                            totals.totalIncluded + totals.totalExcluded
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                {typeBreakdown.map((t) => (
                    <div
                        key={t.type}
                        className="rounded-md p-3 shadow-sm flex flex-col items-start"
                        style={{ backgroundColor: "rgba(216,164,143,0.06)" }}
                    >
                        <div className="text-sm font-medium text-gray-600 capitalize">
                            {t.type}
                        </div>
                        <div
                            className="mt-1 text-base font-semibold"
                            style={{ color: brown }}
                        >
                            {formatMoney(t.total)}
                        </div>
                        <div className="text-sm text-gray-500 mt-0.5">
                            {t.count} items
                        </div>
                    </div>
                ))}
            </div>

            <div className="mb-6">
                <h2
                    className="text-xl font-semibold mb-4"
                    style={{ color: brown }}
                >
                    Monthly Breakdown
                </h2>
                {chartData.length === 0 ? (
                    <div className="text-sm text-gray-500">
                        No monthly data to show.
                    </div>
                ) : (
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <ResponsiveContainer width="100%" height={320}>
                            <BarChart
                                data={chartData}
                                margin={{
                                    top: 10,
                                    right: 16,
                                    left: 0,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis tickFormatter={(value) => `${value}`} />
                                <Tooltip
                                    formatter={(value: any) =>
                                        `${Number(value).toLocaleString(
                                            undefined,
                                            {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }
                                        )} birr`
                                    }
                                />
                                <Bar
                                    dataKey="total"
                                    fill={clay}
                                    radius={[6, 6, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            <div className="mb-6">
                <h2
                    className="text-xl font-semibold mb-4"
                    style={{ color: brown }}
                >
                    Expense Types Breakdown
                </h2>
                {typeBreakdown.length === 0 ? (
                    <div className="text-sm text-gray-500">
                        No type data to show.
                    </div>
                ) : (
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <ResponsiveContainer width="100%" height={320}>
                            <PieChart>
                                <Pie
                                    data={typeBreakdown}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ type, percent }) =>
                                        `${type} ${(
                                            (percent || 0) * 100
                                        ).toFixed(0)}%`
                                    }
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="total"
                                >
                                    {typeBreakdown.map((_, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={
                                                pieColors[
                                                    index % pieColors.length
                                                ]
                                            }
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: any) =>
                                        `${Number(value).toLocaleString(
                                            undefined,
                                            {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }
                                        )} birr`
                                    }
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            <div className="mt-6">
                <h2
                    className="text-lg font-semibold mb-3"
                    style={{ color: brown }}
                >
                    Expense Types
                </h2>

                <div className="space-y-3">
                    {typeBreakdown.map((t) => (
                        <div key={t.type}>
                            <div
                                className="w-full flex items-center justify-between rounded-lg p-3 cursor-pointer hover:bg-opacity-20 transition-colors"
                                style={{
                                    backgroundColor: "rgba(227,212,185,0.06)",
                                }}
                                onClick={() => toggleType(t.type)}
                            >
                                <div className="flex items-center space-x-2">
                                    {expandedTypes[t.type] ? (
                                        <ChevronDown
                                            size={16}
                                            className="text-gray-500"
                                        />
                                    ) : (
                                        <ChevronRight
                                            size={16}
                                            className="text-gray-500"
                                        />
                                    )}
                                    <div className="text-sm text-gray-700 capitalize">
                                        {t.type}
                                    </div>
                                </div>
                                <div
                                    className="text-sm font-medium"
                                    style={{ color: brown }}
                                >
                                    {formatMoney(t.total)} ({t.count} items)
                                </div>
                            </div>
                            {expandedTypes[t.type] && typeExpenses[t.type] && (
                                <ExpandableExpenseTable
                                    expenses={typeExpenses[t.type]}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-6">
                <h2
                    className="text-lg font-semibold mb-3"
                    style={{ color: brown }}
                >
                    Recent months
                </h2>

                <div className="space-y-3">
                    {monthlyBreakdown
                        .slice()
                        .reverse()
                        .map((m) => {
                            const label = `${monthNames[m.month - 1]} ${
                                m.year
                            }`;
                            return (
                                <div
                                    key={`${m.year}-${m.month}`}
                                    className="flex items-center justify-between rounded-lg p-3"
                                    style={{
                                        backgroundColor:
                                            "rgba(227,212,185,0.06)",
                                    }}
                                >
                                    <div className="text-sm text-gray-700">
                                        {label}
                                    </div>
                                    <div
                                        className="text-sm font-medium"
                                        style={{ color: brown }}
                                    >
                                        {formatMoney(m.total)}
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>
        </div>
    );
}
