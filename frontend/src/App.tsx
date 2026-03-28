import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import GeminiModal from "./components/GeminiModal";
import ExpensePage from "./pages/ExpensePage";
import SummaryPage from "./pages/SummaryPage";
import TemplatesPage from "./pages/TemplatesPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import GoalsPage from "./pages/GoalsPage";
import RecurringPage from "./pages/RecurringPage";
import ChartsPage from "./pages/ChartsPage";
import AppShellLoading from "./components/ui/AppShellLoading";
import { ThemeProvider } from "./contexts/ThemeContext";
import Toast from "./components/Toast";
import { useAuthSession } from "./hooks/useAuthSession";
import ScrollToTop from "./components/ScrollToTop";

export default function App() {
    const { user, loading, logout } = useAuthSession();
    const [showGeminiModal, setShowGeminiModal] = useState(false);
    const [toast, setToast] = useState<
        { message: string; type: "success" | "error" | "info" } | undefined
    >();

    const handleOpenGemini = () => {
        setShowGeminiModal(true);
    };

    const handleCloseGemini = () => {
        setShowGeminiModal(false);
    };

    const handleToast = (
        message: string,
        type: "success" | "error" | "info",
    ) => {
        setToast({ message, type });
    };

    // This will be passed to ExpensePage to handle expenses added from AI
    const [expenseUpdateTrigger, setExpenseUpdateTrigger] = useState(0);

    const handleExpensesAdded = () => {
        // Trigger a re-fetch of expenses in ExpensePage
        setExpenseUpdateTrigger((prev) => prev + 1);
    };

    if (loading) {
        return <AppShellLoading />;
    }

    return (
        <ThemeProvider>
            <Router>
                {!user ? (
                    <LoginPage />
                ) : (
                    <div className="relative min-h-screen bg-[linear-gradient(135deg,var(--theme-background),var(--theme-surface))] text-[var(--theme-text)] font-['Lexend'] transition-colors">
                        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,rgba(208,139,91,0.08)_0%,transparent_55%),radial-gradient(circle_at_85%_10%,rgba(92,75,59,0.06)_0%,transparent_50%),radial-gradient(circle_at_80%_80%,rgba(138,154,91,0.05)_0%,transparent_55%)]" />
                        <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_right,rgba(92,75,59,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(92,75,59,0.04)_1px,transparent_1px)] bg-[size:32px_32px]" />
                        <div className="grid min-h-screen grid-cols-1 gap-2 p-2 lg:grid-cols-[174px_1fr]">
                            <ScrollToTop />
                            <Sidebar
                                user={user}
                                onLogout={logout}
                                onOpenGemini={handleOpenGemini}
                            />
                            <main className="flex flex-col gap-4 px-2 pb-6 pt-1">
                                <Routes>
                                    <Route
                                        path="/"
                                        element={
                                            <Navigate to="/home" replace />
                                        }
                                    />
                                    <Route
                                        path="/home"
                                        element={<SummaryPage />}
                                    />
                                    <Route
                                        path="/charts"
                                        element={<ChartsPage />}
                                    />
                                    <Route
                                        path="/recurrings"
                                        element={<RecurringPage />}
                                    />
                                    <Route
                                        path="/expenses"
                                        element={
                                            <ExpensePage
                                                expenseUpdateTrigger={
                                                    expenseUpdateTrigger
                                                }
                                            />
                                        }
                                    />
                                    <Route
                                        path="/summary"
                                        element={
                                            <Navigate to="/home" replace />
                                        }
                                    />
                                    <Route
                                        path="/dashboard"
                                        element={
                                            <Navigate to="/home" replace />
                                        }
                                    />
                                    <Route
                                        path="/templates"
                                        element={<TemplatesPage />}
                                    />
                                    <Route
                                        path="/goals"
                                        element={<GoalsPage />}
                                    />
                                    <Route
                                        path="/budget"
                                        element={
                                            <Navigate to="/goals" replace />
                                        }
                                    />
                                    <Route
                                        path="/profile"
                                        element={<ProfilePage />}
                                    />
                                    <Route
                                        path="*"
                                        element={
                                            <Navigate to="/home" replace />
                                        }
                                    />
                                </Routes>
                            </main>
                        </div>

                        <GeminiModal
                            isOpen={showGeminiModal}
                            onClose={handleCloseGemini}
                            onAddExpenses={handleExpensesAdded}
                            onToast={handleToast}
                        />
                    </div>
                )}
            </Router>
            <Toast message={toast?.message} type={toast?.type} />
        </ThemeProvider>
    );
}
