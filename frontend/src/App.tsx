import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import NavBar from "./components/NavBar";
import GeminiModal from "./components/GeminiModal";
import ExpensePage from "./pages/ExpensePage";
import SummaryPage from "./pages/SummaryPage";
import TemplatesPage from "./pages/TemplatesPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import BudgetPage from "./pages/BudgetPage";
import API, { authAPI } from "./api/api";
import Loading from "./components/Loading";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Github } from "lucide-react";
import Toast from "./components/Toast";

interface UserData {
    _id: string;
    name: string;
    email: string;
    picture: string;
}

export default function App() {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showGeminiModal, setShowGeminiModal] = useState(false);
    const [toast, setToast] = useState<
        { message: string; type: "success" | "error" | "info" } | undefined
    >();

    useEffect(() => {
        // Check for token in URL query params (from OAuth callback)
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get("token");
        if (tokenFromUrl) {
            localStorage.setItem("token", tokenFromUrl);
            // Remove token from URL
            window.history.replaceState(
                {},
                document.title,
                window.location.pathname
            );
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            authAPI.defaults.headers.common[
                "Authorization"
            ] = `Bearer ${token}`;
            authAPI
                .get("/auth/me")
                .then((res) => setUser(res.data))
                .catch(() => {
                    localStorage.removeItem("token");
                    delete API.defaults.headers.common["Authorization"];
                    delete authAPI.defaults.headers.common["Authorization"];
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        delete API.defaults.headers.common["Authorization"];
        delete authAPI.defaults.headers.common["Authorization"];
        setUser(null);
    };

    const handleOpenGemini = () => {
        setShowGeminiModal(true);
    };

    const handleCloseGemini = () => {
        setShowGeminiModal(false);
    };

    const handleToast = (
        message: string,
        type: "success" | "error" | "info"
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
        return <Loading />;
    }

    return (
        <ThemeProvider>
            <Router>
                {!user ? (
                    <LoginPage />
                ) : (
                    <div className="min-h-screen">
                        <NavBar
                            user={user}
                            onLogout={handleLogout}
                            onOpenGemini={handleOpenGemini}
                        />
                        <main className="pt-24 px-6 max-w-6xl mx-auto">
                            <Routes>
                                <Route
                                    path="/"
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
                        <footer
                            className="text-center py-8 text-sm opacity-60 flex items-center justify-center gap-2"
                            style={{ color: "var(--theme-text-secondary)" }}
                        >
                            Built for my broke a**
                            <a
                                href="https://github.com/Yehonatal/project-expenses"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:opacity-80 transition-opacity"
                                aria-label="View on GitHub"
                            >
                                <Github size={16} />
                            </a>
                        </footer>
                    </div>
                )}
            </Router>
            <Toast message={toast?.message} type={toast?.type} />
        </ThemeProvider>
    );
}
