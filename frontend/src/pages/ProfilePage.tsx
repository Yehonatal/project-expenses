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
        <div className="max-w-5xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6 text-brown">Profile</h1>

            <div className="p-6 mb-6">
                <div className="flex items-center space-x-4 mb-4">
                    {avatarError || !user.picture ? (
                        <div className="w-16 h-16 rounded-full bg-brown flex items-center justify-center text-white text-2xl">
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
                        <h3 className="text-xl font-semibold text-brown">
                            {user.name}
                        </h3>
                        <p className="text-gray-600">{user.email}</p>
                    </div>
                </div>
                <p className="text-sm text-gray-500">
                    Account created:{" "}
                    {new Date(user.createdAt).toLocaleDateString()}
                </p>
            </div>

            <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-brown">
                    Expense Statistics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-sand rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-brown">
                            Total Expenses
                        </h3>
                        <p className="text-2xl font-bold text-olive">
                            {stats.totalExpenses}
                        </p>
                    </div>
                    <div className="bg-sand rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-brown">
                            Total Types
                        </h3>
                        <p className="text-2xl font-bold text-olive">
                            {stats.totalTypes}
                        </p>
                    </div>
                    <div className="bg-sand rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-brown">
                            Most Expensive
                        </h3>
                        <p className="text-xl font-bold text-clay">
                            Birr{" "}
                            {stats.mostExpensive?.amount.toFixed(2) || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">
                            {stats.mostExpensive?.description || ""}
                        </p>
                    </div>
                    <div className="bg-sand rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-brown">
                            Cheapest
                        </h3>
                        <p className="text-xl font-bold text-olive">
                            Birr {stats.cheapest?.amount.toFixed(2) || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">
                            {stats.cheapest?.description || ""}
                        </p>
                    </div>
                </div>

                <h3 className="text-lg font-semibold mb-4 text-brown">
                    Monthly Assessment
                </h3>
                <div className="space-y-4">
                    {stats.monthlyAssessment.map((month) => (
                        <div
                            key={month._id}
                            className="border border-taupe rounded-lg p-4"
                        >
                            <h4 className="text-lg font-semibold text-brown">
                                {month._id}
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Total Spent
                                    </p>
                                    <p className="font-bold text-olive">
                                        Birr {month.total.toFixed(2)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Expenses Count
                                    </p>
                                    <p className="font-bold text-brown">
                                        {month.count}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Highest Expense
                                    </p>
                                    <p className="font-bold text-clay">
                                        Birr {month.maxExpense.toFixed(2)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Lowest Expense
                                    </p>
                                    <p className="font-bold text-olive">
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
