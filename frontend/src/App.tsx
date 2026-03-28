import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import GeminiModal from "./components/GeminiModal";
import ExpensePage from "./pages/ExpensePage";
import SummaryPage from "./pages/SummaryPage";
import TemplatesPage from "./pages/TemplatesPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import BudgetPage from "./pages/BudgetPage";
import AppShellLoading from "./components/ui/AppShellLoading";
import { ThemeProvider } from "./contexts/ThemeContext";
import Toast from "./components/Toast";
import { useAuthSession } from "./hooks/useAuthSession";

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
                    <div className="app-shell">
                        <Sidebar
                            user={user}
                            onLogout={logout}
                            onOpenGemini={handleOpenGemini}
                        />
                        <main className="app-content">
                            <Routes>
                                <Route path="/" element={<SummaryPage />} />
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
                                    element={<SummaryPage />}
                                />
                                <Route
                                    path="/templates"
                                    element={<TemplatesPage />}
                                />
                                <Route
                                    path="/budget"
                                    element={<BudgetPage />}
                                />
                                <Route
                                    path="/profile"
                                    element={<ProfilePage />}
                                />
                            </Routes>
                        </main>

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
