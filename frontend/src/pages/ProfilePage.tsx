import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { authAPI } from "../api/api";
import Loading from "../components/Loading";

interface User {
    _id: string;
    name: string;
    email: string;
    picture: string;
    createdAt: string;
}

interface Expense {
    amount: number;
    description: string;
}

interface MonthlyData {
    _id: string;
    total: number;
    count: number;
    maxExpense: number;
    minExpense: number;
}

interface Stats {
    totalExpenses: number;
    totalTypes: number;
    mostExpensive: Expense | null;
    cheapest: Expense | null;
    monthlyAssessment: MonthlyData[];
}

export default function ProfilePage() {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [avatarError, setAvatarError] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.log("No token found, redirecting to login");
            navigate("/");
            setLoading(false);
            return;
        }

        // Set auth header for API calls
        authAPI.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        API.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        const fetchData = async () => {
            try {
                const [userRes, statsRes] = await Promise.all([
                    authAPI.get("/auth/me"),
                    API.get("/expenses/stats"),
                ]);
                setUser(userRes.data);
                setStats(statsRes.data);
            } catch (err) {
                console.error("Failed to load profile data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate]);

    if (loading) {
        return <Loading />;
    }

    if (!user || !stats) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Failed to load profile
            </div>
        );
    }

    return (
        <div
            className="max-w-5xl mx-auto p-6"
            style={{
                backgroundColor: "var(--theme-background)",
                color: "var(--theme-text)",
            }}
        >
            <h1
                className="text-sm sm:text-base lg:text-base font-bold mb-6"
                style={{ color: "var(--theme-primary)" }}
            >
                Profile
            </h1>

            <div className="p-6 mb-6">
                <div className="flex items-center space-x-4 mb-4">
                    {avatarError || !user.picture ? (
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-sm sm:text-base lg:text-base"
                            style={{ backgroundColor: "var(--theme-primary)" }}
                        >
                            💰
                        </div>
                    ) : (
                        <img
                            src={user.picture}
                            alt={user.name}
                            className="w-16 h-16 rounded-full"
                            onError={() => setAvatarError(true)}
                        />
                    )}
                    <div>
                        <h3
                            className="text-xs sm:text-sm lg:text-sm font-semibold"
                            style={{ color: "var(--theme-primary)" }}
                        >
                            {user.name}
                        </h3>
                        <p style={{ color: "var(--theme-textSecondary)" }}>
                            {user.email}
                        </p>
                    </div>
                </div>
                <p
                    className="text-sm"
                    style={{ color: "var(--theme-textSecondary)" }}
                >
                    Account created:{" "}
                    {new Date(user.createdAt).toLocaleDateString()}
                </p>
            </div>

            <div className="p-6">
                <h2
                    className="text-xs sm:text-sm lg:text-sm font-semibold mb-4"
                    style={{ color: "var(--theme-primary)" }}
                >
                    Expense Statistics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div
                        className="rounded-lg p-4"
                        style={{ backgroundColor: "var(--theme-surface)" }}
                    >
                        <h3
                            className="text-xs sm:text-sm lg:text-sm font-semibold"
                            style={{ color: "var(--theme-primary)" }}
                        >
                            Total Expenses
                        </h3>
                        <p
                            className="text-sm sm:text-base lg:text-base font-bold"
                            style={{ color: "var(--theme-accent)" }}
                        >
                            {stats.totalExpenses}
                        </p>
                    </div>
                    <div
                        className="rounded-lg p-4"
                        style={{ backgroundColor: "var(--theme-surface)" }}
                    >
                        <h3
                            className="text-xs sm:text-sm lg:text-sm font-semibold"
                            style={{ color: "var(--theme-primary)" }}
                        >
                            Total Types
                        </h3>
                        <p
                            className="text-sm sm:text-base lg:text-base font-bold"
                            style={{ color: "var(--theme-accent)" }}
                        >
                            {stats.totalTypes}
                        </p>
                    </div>
                    <div
                        className="rounded-lg p-4"
                        style={{ backgroundColor: "var(--theme-surface)" }}
                    >
                        <h3
                            className="text-xs sm:text-sm lg:text-sm font-semibold"
                            style={{ color: "var(--theme-primary)" }}
                        >
                            Most Expensive
                        </h3>
                        <p
                            className="text-xs sm:text-sm lg:text-sm font-bold"
                            style={{ color: "var(--theme-secondary)" }}
                        >
                            Birr{" "}
                            {stats.mostExpensive?.amount.toFixed(2) || "N/A"}
                        </p>
                        <p
                            className="text-sm"
                            style={{ color: "var(--theme-textSecondary)" }}
                        >
                            {stats.mostExpensive?.description || ""}
                        </p>
                    </div>
                    <div
                        className="rounded-lg p-4"
                        style={{ backgroundColor: "var(--theme-surface)" }}
                    >
                        <h3
                            className="text-xs sm:text-sm lg:text-sm font-semibold"
                            style={{ color: "var(--theme-primary)" }}
                        >
                            Cheapest
                        </h3>
                        <p
                            className="text-xs sm:text-sm lg:text-sm font-bold"
                            style={{ color: "var(--theme-accent)" }}
                        >
                            Birr {stats.cheapest?.amount.toFixed(2) || "N/A"}
                        </p>
                        <p
                            className="text-sm"
                            style={{ color: "var(--theme-textSecondary)" }}
                        >
                            {stats.cheapest?.description || ""}
                        </p>
                    </div>
                </div>

                <h3
                    className="text-xs sm:text-sm lg:text-sm font-semibold mb-4"
                    style={{ color: "var(--theme-primary)" }}
                >
                    Monthly Assessment
                </h3>
                <div className="space-y-4">
                    {stats.monthlyAssessment.map((month) => (
                        <div
                            key={month._id}
                            className="rounded-lg p-4"
                            style={{ border: "1px solid var(--theme-border)" }}
                        >
                            <h4
                                className="text-xs sm:text-sm lg:text-sm font-semibold"
                                style={{ color: "var(--theme-primary)" }}
                            >
                                {month._id}
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                                <div>
                                    <p
                                        className="text-sm"
                                        style={{
                                            color: "var(--theme-textSecondary)",
                                        }}
                                    >
                                        Total Spent
                                    </p>
                                    <p
                                        className="font-bold"
                                        style={{ color: "var(--theme-accent)" }}
                                    >
                                        Birr {month.total.toFixed(2)}
                                    </p>
                                </div>
                                <div>
                                    <p
                                        className="text-sm"
                                        style={{
                                            color: "var(--theme-textSecondary)",
                                        }}
                                    >
                                        Expenses Count
                                    </p>
                                    <p
                                        className="font-bold"
                                        style={{
                                            color: "var(--theme-primary)",
                                        }}
                                    >
                                        {month.count}
                                    </p>
                                </div>
                                <div>
                                    <p
                                        className="text-sm"
                                        style={{
                                            color: "var(--theme-textSecondary)",
                                        }}
                                    >
                                        Highest Expense
                                    </p>
                                    <p
                                        className="font-bold"
                                        style={{
                                            color: "var(--theme-secondary)",
                                        }}
                                    >
                                        Birr {month.maxExpense.toFixed(2)}
                                    </p>
                                </div>
                                <div>
                                    <p
                                        className="text-sm"
                                        style={{
                                            color: "var(--theme-textSecondary)",
                                        }}
                                    >
                                        Lowest Expense
                                    </p>
                                    <p
                                        className="font-bold"
                                        style={{ color: "var(--theme-accent)" }}
                                    >
                                        Birr {month.minExpense.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
