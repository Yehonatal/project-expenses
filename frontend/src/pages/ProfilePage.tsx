import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { authAPI, getExpenses } from "../api/api";
import Loading from "../components/Loading";
import Modal from "../components/Modal";
import ExportControls from "../components/ui/ExportControls";
import StatCard from "../components/ui/StatCard";
import ProfileHeader from "../components/ui/ProfileHeader";
import Papa from "papaparse";
import jsPDF from "jspdf";
import PageContainer from "../components/ui/PageContainer";
import GlassCard from "../components/ui/GlassCard";

interface User {
    _id: string;
    name: string;
    email: string;
    picture: string;
    createdAt: string;
}

interface Expense {
    _id: string;
    amount: number;
    description: string;
    type: string;
    date: string;
    recurring: boolean;
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
    const [_avatarError, setAvatarError] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [showGoogleDriveModal, setShowGoogleDriveModal] = useState(false);

    const handleCSVExport = async () => {
        setExporting(true);
        try {
            const response = await getExpenses();
            const expenses = response.data;

            const csvData = expenses.map((expense: Expense) => ({
                Date: new Date(expense.date).toLocaleDateString(),
                Description: expense.description,
                Amount: expense.amount,
                Type: expense.type,
                Recurring: expense.recurring ? "Yes" : "No",
            }));

            const csv = Papa.unparse(csvData);
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute(
                "download",
                `expenses_${new Date().toISOString().split("T")[0]}.csv`
            );
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Failed to export CSV:", error);
            alert("Failed to export CSV. Please try again.");
        } finally {
            setExporting(false);
        }
    };

    const handlePDFExport = async () => {
        setExporting(true);
        try {
            const response = await getExpenses();
            const expenses = response.data;

            const doc = new jsPDF();
            doc.setFontSize(20);
            doc.text("Expense Report", 20, 20);

            doc.setFontSize(12);
            doc.text(
                `Generated on: ${new Date().toLocaleDateString()}`,
                20,
                35
            );
            doc.text(
                `Total Expenses: ${stats?.totalExpenses || "N/A"}`,
                20,
                45
            );

            let yPosition = 65;
            doc.setFontSize(10);
            doc.text("Date", 20, yPosition);
            doc.text("Description", 60, yPosition);
            doc.text("Amount", 140, yPosition);
            doc.text("Type", 170, yPosition);

            yPosition += 10;
            doc.line(20, yPosition, 190, yPosition);
            yPosition += 5;

            expenses.slice(0, 20).forEach((expense: Expense) => {
                if (yPosition > 270) {
                    doc.addPage();
                    yPosition = 20;
                }

                doc.text(
                    new Date(expense.date).toLocaleDateString(),
                    20,
                    yPosition
                );
                doc.text(expense.description.substring(0, 25), 60, yPosition);
                doc.text(`$${expense.amount.toFixed(2)}`, 140, yPosition);
                doc.text(expense.type, 170, yPosition);
                yPosition += 8;
            });

            doc.save(`expenses_${new Date().toISOString().split("T")[0]}.pdf`);
        } catch (error) {
            console.error("Failed to export PDF:", error);
            alert("Failed to export PDF. Please try again.");
        } finally {
            setExporting(false);
        }
    };

    const handleGoogleDriveSync = () => {
        setShowGoogleDriveModal(true);
    };

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
        <PageContainer title="Profile" className="space-y-6">
            <GlassCard className="mb-6">
                <ProfileHeader
                    name={user.name}
                    email={user.email}
                    picture={user.picture}
                    onImageError={() => setAvatarError(true)}
                />
                <p
                    className="text-sm"
                    style={{ color: "var(--theme-textSecondary)" }}
                >
                    Account created:{" "}
                    {new Date(user.createdAt).toLocaleDateString()}
                </p>
            </GlassCard>

            <GlassCard>
                <h2
                    className="text-xs sm:text-sm lg:text-sm font-semibold mb-4"
                    style={{ color: "var(--theme-primary)" }}
                >
                    Expense Statistics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <StatCard
                        title="Total Expenses"
                        value={stats.totalExpenses}
                    />
                    <StatCard title="Total Types" value={stats.totalTypes} />
                    <StatCard title="Most Expensive">
                        <p
                            className="text-lg sm:text-xl lg:text-xl font-bold"
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
                    </StatCard>
                    <StatCard title="Cheapest">
                        <p
                            className="text-lg sm:text-xl lg:text-xl font-bold"
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
                    </StatCard>
                </div>
            </GlassCard>

            <GlassCard>
                <h3
                    className="text-xs sm:text-sm lg:text-sm font-semibold mb-4"
                    style={{ color: "var(--theme-primary)" }}
                >
                    Monthly Assessment
                </h3>
                <div className="space-y-4">
                    {stats.monthlyAssessment.map((month) => (
                        <GlassCard key={month._id} className="p-4">
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
                                        className="text-lg font-bold"
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
                        </GlassCard>
                    ))}
                </div>
            </GlassCard>

            <GlassCard>
                <h3
                    className="text-xs sm:text-sm lg:text-sm font-semibold mb-4"
                    style={{ color: "var(--theme-primary)" }}
                >
                    Export & Sync
                </h3>
                <ExportControls
                    onCSV={handleCSVExport}
                    onPDF={handlePDFExport}
                    onDrive={handleGoogleDriveSync}
                    exporting={exporting}
                />
                {exporting && (
                    <p
                        className="text-sm mt-2"
                        style={{ color: "var(--theme-textSecondary)" }}
                    >
                        Exporting data...
                    </p>
                )}
            </GlassCard>

            <Modal
                isOpen={showGoogleDriveModal}
                onClose={() => setShowGoogleDriveModal(false)}
                title="Google Drive Sync - Coming Soon"
                actions={
                    <button
                        onClick={() => setShowGoogleDriveModal(false)}
                        className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        style={{
                            backgroundColor: "var(--theme-primary)",
                            color: "white",
                        }}
                    >
                        Got it
                    </button>
                }
            >
                <div className="space-y-4">
                    <p style={{ color: "var(--theme-text)" }}>
                        We're working hard to bring you Google Drive
                        synchronization for your expense data. This feature will
                        allow you to:
                    </p>
                    <ul
                        className="list-disc list-inside space-y-2"
                        style={{ color: "var(--theme-textSecondary)" }}
                    >
                        <li>
                            Automatically backup your expense data to Google
                            Drive
                        </li>
                        <li>Sync data across multiple devices</li>
                        <li>Restore your data if needed</li>
                        <li>Share expense reports with others</li>
                    </ul>
                    <p style={{ color: "var(--theme-text)" }}>
                        This feature is currently in development and will be
                        available in a future update. Stay tuned for more
                        information!
                    </p>
                </div>
            </Modal>
        </PageContainer>
    );
}
