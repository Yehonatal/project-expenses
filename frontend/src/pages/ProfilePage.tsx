import { useState } from "react";
import { getExpenses } from "../api/api";
import PageSkeleton from "../components/ui/PageSkeleton";
import Modal from "../components/Modal";
import { modalCopy } from "../content/modalCopy";
import ExportControls from "../components/ui/ExportControls";
import StatCard from "../components/ui/StatCard";
import ProfileHeader from "../components/ui/ProfileHeader";
import Papa from "papaparse";
import jsPDF from "jspdf";
import PageContainer from "../components/ui/PageContainer";
import GlassCard from "../components/ui/GlassCard";
import type { ProfileExpense } from "../types/profile";
import { useProfilePageData } from "../hooks/useProfilePageData";

export default function ProfilePage() {
    const { user, stats, loading } = useProfilePageData();
    const [_avatarError, setAvatarError] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [showGoogleDriveModal, setShowGoogleDriveModal] = useState(false);

    const handleCSVExport = async () => {
        setExporting(true);
        try {
            const response = await getExpenses();
            const expenses = response.data;

            const csvData = expenses.map((expense: ProfileExpense) => ({
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
                `expenses_${new Date().toISOString().split("T")[0]}.csv`,
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
                35,
            );
            doc.text(
                `Total Expenses: ${stats?.totalExpenses || "N/A"}`,
                20,
                45,
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

            expenses.slice(0, 20).forEach((expense: ProfileExpense) => {
                if (yPosition > 270) {
                    doc.addPage();
                    yPosition = 20;
                }

                doc.text(
                    new Date(expense.date).toLocaleDateString(),
                    20,
                    yPosition,
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
    if (loading) {
        return <PageSkeleton title="Loading profile" />;
    }

    if (!user || !stats) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Failed to load profile
            </div>
        );
    }

    return (
        <PageContainer
            title="Profile"
            subtitle="Review account insights, monthly summaries, and export your financial data."
            className="space-y-6"
        >
            <div className="border border-[var(--theme-glass-border)] bg-gradient-to-br from-white/60 to-white/10 p-4 sm:p-5">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1 space-y-2">
                        <div
                            className="text-xs uppercase tracking-[0.2em]"
                            style={{ color: "var(--theme-text-secondary)" }}
                        >
                            Account overview
                        </div>
                        <h2 className="font-['Playfair_Display'] text-xl font-semibold tracking-[-0.01em] sm:text-2xl">
                            Welcome back, {user.name}
                        </h2>
                        <p
                            className="text-sm"
                            style={{ color: "var(--theme-text-secondary)" }}
                        >
                            Member since{" "}
                            {new Date(user.createdAt).toLocaleDateString()}.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:flex sm:flex-wrap sm:gap-6">
                        <div>
                            <div
                                className="text-xs uppercase tracking-[0.2em]"
                                style={{ color: "var(--theme-text-secondary)" }}
                            >
                                Total expenses
                            </div>
                            <div className="text-2xl font-semibold">
                                {stats.totalExpenses}
                            </div>
                        </div>
                        <div>
                            <div
                                className="text-xs uppercase tracking-[0.2em]"
                                style={{ color: "var(--theme-text-secondary)" }}
                            >
                                Active types
                            </div>
                            <div className="text-2xl font-semibold">
                                {stats.totalTypes}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div className="border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] rounded-none p-3">
                    <div
                        className="text-xs font-semibold uppercase"
                        style={{ color: "var(--theme-text-secondary)" }}
                    >
                        Most expensive
                    </div>
                    <div className="text-lg font-semibold sm:text-xl">
                        Birr {stats.mostExpensive?.amount.toFixed(2) || "N/A"}
                    </div>
                </div>
                <div className="border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] rounded-none p-3">
                    <div
                        className="text-xs font-semibold uppercase"
                        style={{ color: "var(--theme-text-secondary)" }}
                    >
                        Cheapest
                    </div>
                    <div className="text-lg font-semibold sm:text-xl">
                        Birr {stats.cheapest?.amount.toFixed(2) || "N/A"}
                    </div>
                </div>
                <div className="border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] rounded-none p-3">
                    <div
                        className="text-xs font-semibold uppercase"
                        style={{ color: "var(--theme-text-secondary)" }}
                    >
                        Monthly reports
                    </div>
                    <div className="text-lg font-semibold sm:text-xl">
                        {stats.monthlyAssessment.length}
                    </div>
                </div>
            </div>

            <GlassCard className="mb-6">
                <ProfileHeader
                    name={user.name}
                    email={user.email}
                    picture={user.picture}
                    onImageError={() => setAvatarError(true)}
                />
                <p
                    className="text-sm"
                    style={{ color: "var(--theme-text-secondary)" }}
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
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
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
                            style={{ color: "var(--theme-text-secondary)" }}
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
                            style={{ color: "var(--theme-text-secondary)" }}
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
                            <div className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                                <div>
                                    <p
                                        className="text-sm"
                                        style={{
                                            color: "var(--theme-text-secondary)",
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
                                            color: "var(--theme-text-secondary)",
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
                                            color: "var(--theme-text-secondary)",
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
                                            color: "var(--theme-text-secondary)",
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
                        style={{ color: "var(--theme-text-secondary)" }}
                    >
                        Exporting data...
                    </p>
                )}
            </GlassCard>

            <Modal
                isOpen={showGoogleDriveModal}
                onClose={() => setShowGoogleDriveModal(false)}
                title={modalCopy.profile.syncTitle}
                description="Cloud backup is being prepared to keep your records safe across devices."
                actions={
                    <button
                        onClick={() => setShowGoogleDriveModal(false)}
                        className="border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] backdrop-blur-[20px] rounded-none transition-colors hover:bg-white/5 active:bg-white/[0.02] text-sm rounded-lg transition-all hover:opacity-90"
                        style={{
                            backgroundColor: "var(--theme-primary)",
                            color: "white",
                        }}
                    >
                        {modalCopy.profile.syncConfirm}
                    </button>
                }
            >
                <div className="space-y-4">
                    <p style={{ color: "var(--theme-text)" }}>
                        {modalCopy.profile.syncBody}
                    </p>
                    <ul
                        className="list-disc list-inside space-y-2"
                        style={{ color: "var(--theme-text-secondary)" }}
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
