import { useState } from "react";
import Papa from "papaparse";
import jsPDF from "jspdf";
import { getExpenses } from "../api/api";
import PageSkeleton from "../components/ui/PageSkeleton";
import Modal from "../components/Modal";
import { modalCopy } from "../content/modalCopy";
import ExportControls from "../components/ui/ExportControls";
import ProfileHeader from "../components/ui/ProfileHeader";
import PageContainer from "../components/ui/PageContainer";
import GlassCard from "../components/ui/GlassCard";
import type { Expense } from "../types/expense";
import { useProfilePageData } from "../hooks/useProfilePageData";
import { uiControl } from "../utils/uiClasses";

export default function ProfilePage() {
    const { user, stats, loading } = useProfilePageData();
    const [, setAvatarError] = useState(false);
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
                Recurring: expense.isRecurring ? "Yes" : "No",
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
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);
            doc.text(`Total Expenses: ${stats?.totalExpenses || "N/A"}`, 20, 45);

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

                doc.text(new Date(expense.date).toLocaleDateString(), 20, yPosition);
                doc.text(expense.description.substring(0, 25), 60, yPosition);
                doc.text(`Birr ${expense.amount.toFixed(2)}`, 140, yPosition);
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

    const monthlySeries = stats.monthlyAssessment || [];
    const monthlyTotal = monthlySeries.reduce((sum, month) => sum + month.total, 0);
    const monthlyCount = monthlySeries.length;
    const monthlyTransactionCount = monthlySeries.reduce(
        (sum, month) => sum + month.count,
        0,
    );
    const avgMonthlySpend = monthlyCount ? monthlyTotal / monthlyCount : 0;
    const avgTransactionSize = monthlyTransactionCount
        ? monthlyTotal / monthlyTransactionCount
        : 0;

    const mostActiveMonth = monthlySeries.reduce(
        (current, month) => (month.count > current.count ? month : current),
        monthlySeries[0] || {
            _id: "-",
            total: 0,
            count: 0,
            maxExpense: 0,
            minExpense: 0,
        },
    );

    const latestMonth = monthlySeries[monthlySeries.length - 1];

    return (
        <PageContainer
            title="Profile"
            subtitle="Review account insights, monthly summaries, and export your financial data."
            className="space-y-6"
        >
            <GlassCard className="p-5">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
                    <div>
                        <div className="text-xs uppercase tracking-[0.2em] text-[var(--theme-text-secondary)]">
                            Account overview
                        </div>
                        <h2 className="app-heading mt-2 text-2xl font-semibold tracking-[-0.01em] sm:text-3xl">
                            Welcome back, {user.name}
                        </h2>
                        <p className="mt-2 text-sm text-[var(--theme-text-secondary)]">
                            Member since {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="border border-[var(--theme-border)] bg-[var(--theme-background)] p-3">
                            <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                                Total expenses
                            </p>
                            <p className="mt-1 text-2xl font-semibold">{stats.totalExpenses}</p>
                        </div>
                        <div className="border border-[var(--theme-border)] bg-[var(--theme-background)] p-3">
                            <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                                Active types
                            </p>
                            <p className="mt-1 text-2xl font-semibold">{stats.totalTypes}</p>
                        </div>
                        <div className="border border-[var(--theme-border)] bg-[var(--theme-background)] p-3">
                            <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                                Avg monthly spend
                            </p>
                            <p className="mt-1 text-lg font-semibold">Birr {avgMonthlySpend.toFixed(0)}</p>
                        </div>
                        <div className="border border-[var(--theme-border)] bg-[var(--theme-background)] p-3">
                            <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                                Avg expense size
                            </p>
                            <p className="mt-1 text-lg font-semibold">Birr {avgTransactionSize.toFixed(0)}</p>
                        </div>
                    </div>
                </div>
            </GlassCard>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <GlassCard className="p-4">
                    <ProfileHeader
                        name={user.name}
                        email={user.email}
                        picture={user.picture}
                        onImageError={() => setAvatarError(true)}
                    />
                    <div className="border border-[var(--theme-border)] bg-[var(--theme-background)] p-3 text-sm text-[var(--theme-text-secondary)]">
                        Account created {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                </GlassCard>

                <GlassCard className="p-4 lg:col-span-2">
                    <h3 className="app-heading text-lg font-semibold">Spending highlights</h3>
                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <div className="border border-[var(--theme-border)] bg-[var(--theme-background)] p-3">
                            <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                                Highest expense
                            </p>
                            <p className="mt-1 text-lg font-semibold">
                                Birr {stats.mostExpensive?.amount.toFixed(2) || "N/A"}
                            </p>
                            <p className="text-xs text-[var(--theme-text-secondary)] truncate">
                                {stats.mostExpensive?.description || "No data"}
                            </p>
                        </div>
                        <div className="border border-[var(--theme-border)] bg-[var(--theme-background)] p-3">
                            <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                                Lowest expense
                            </p>
                            <p className="mt-1 text-lg font-semibold">
                                Birr {stats.cheapest?.amount.toFixed(2) || "N/A"}
                            </p>
                            <p className="text-xs text-[var(--theme-text-secondary)] truncate">
                                {stats.cheapest?.description || "No data"}
                            </p>
                        </div>
                        <div className="border border-[var(--theme-border)] bg-[var(--theme-background)] p-3">
                            <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                                Most active month
                            </p>
                            <p className="mt-1 text-lg font-semibold">{mostActiveMonth?._id || "-"}</p>
                            <p className="text-xs text-[var(--theme-text-secondary)]">
                                {mostActiveMonth?.count || 0} expenses logged
                            </p>
                        </div>
                        <div className="border border-[var(--theme-border)] bg-[var(--theme-background)] p-3">
                            <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                                Latest month total
                            </p>
                            <p className="mt-1 text-lg font-semibold">
                                Birr {latestMonth ? latestMonth.total.toFixed(2) : "0.00"}
                            </p>
                            <p className="text-xs text-[var(--theme-text-secondary)]">
                                {latestMonth ? latestMonth.count : 0} expenses
                            </p>
                        </div>
                    </div>
                </GlassCard>
            </div>

            <GlassCard className="p-4">
                <h3 className="app-heading text-lg font-semibold">Recent monthly assessment</h3>
                <div className="mt-3 space-y-2">
                    {monthlySeries.length === 0 ? (
                        <p className="text-sm text-[var(--theme-text-secondary)]">
                            No monthly data yet.
                        </p>
                    ) : (
                        monthlySeries
                            .slice()
                            .reverse()
                            .slice(0, 6)
                            .map((month) => (
                                <div
                                    key={month._id}
                                    className="grid grid-cols-2 gap-2 border border-[var(--theme-border)] bg-[var(--theme-background)] p-3 text-sm md:grid-cols-5"
                                >
                                    <div>
                                        <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                                            Month
                                        </p>
                                        <p className="font-semibold">{month._id}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                                            Total
                                        </p>
                                        <p className="font-semibold">Birr {month.total.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                                            Count
                                        </p>
                                        <p className="font-semibold">{month.count}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                                            Max
                                        </p>
                                        <p className="font-semibold">Birr {month.maxExpense.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase text-[var(--theme-text-secondary)]">
                                            Min
                                        </p>
                                        <p className="font-semibold">Birr {month.minExpense.toFixed(2)}</p>
                                    </div>
                                </div>
                            ))
                    )}
                </div>
            </GlassCard>

            <GlassCard className="p-4">
                <h3 className="app-heading text-lg font-semibold">Export & Sync</h3>
                <p className="mt-1 text-sm text-[var(--theme-text-secondary)]">
                    Download your spending data or prepare cloud sync backup.
                </p>
                <div className="mt-4">
                    <ExportControls
                        onCSV={handleCSVExport}
                        onPDF={handlePDFExport}
                        onDrive={handleGoogleDriveSync}
                        exporting={exporting}
                    />
                </div>
                {exporting && (
                    <p className="mt-2 text-sm text-[var(--theme-text-secondary)]">
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
                        className={uiControl.buttonPrimary}
                    >
                        {modalCopy.profile.syncConfirm}
                    </button>
                }
            >
                <div className="space-y-4">
                    <p className="text-[var(--theme-text)]">{modalCopy.profile.syncBody}</p>
                    <ul className="list-disc list-inside space-y-2 text-[var(--theme-text-secondary)]">
                        <li>Automatically backup your expense data to Google Drive</li>
                        <li>Sync data across multiple devices</li>
                        <li>Restore your data if needed</li>
                        <li>Share expense reports with others</li>
                    </ul>
                    <p className="text-[var(--theme-text)]">
                        This feature is currently in development and will be available in a future update.
                    </p>
                </div>
            </Modal>
        </PageContainer>
    );
}
