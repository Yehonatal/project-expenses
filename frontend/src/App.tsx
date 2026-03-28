import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { Suspense, lazy, useState } from "react";
import { PanelLeft } from "lucide-react";
import Sidebar from "./components/Sidebar";
import LoginPage from "./pages/LoginPage";
import AppShellLoading from "./components/ui/AppShellLoading";
import { ThemeProvider } from "./contexts/ThemeContext";
import Toast from "./components/Toast";
import { useAuthSession } from "./hooks/useAuthSession";
import ScrollToTop from "./components/ScrollToTop";
import ThemeSelector from "./components/ThemeSelector";
import QuickAddWidget from "./components/QuickAddWidget";

const GeminiModal = lazy(() => import("./components/GeminiModal.tsx"));
const ExpensePage = lazy(() => import("./pages/ExpensePage.tsx"));
const SummaryPage = lazy(() => import("./pages/SummaryPage.tsx"));
const TemplatesPage = lazy(() => import("./pages/TemplatesPage.tsx"));
const ProfilePage = lazy(() => import("./pages/ProfilePage.tsx"));
const GoalsPage = lazy(() => import("./pages/GoalsPage.tsx"));
const RecurringPage = lazy(() => import("./pages/RecurringPage.tsx"));
const ChartsPage = lazy(() => import("./pages/ChartsPage.tsx"));
const WorkspacesPage = lazy(() => import("./pages/WorkspacesPage.tsx"));
const QueuedExpensesPage = lazy(() => import("./pages/QueuedExpensesPage.tsx"));
const ForecastPage = lazy(() => import("./pages/ForecastPage.tsx"));

export default function App() {
    const { user, loading, logout } = useAuthSession();
    const [showGeminiModal, setShowGeminiModal] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
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

    const shellColumnsClass = isSidebarCollapsed
        ? "lg:[grid-template-columns:92px_minmax(0,1fr)]"
        : "lg:[grid-template-columns:292px_minmax(0,1fr)]";

    if (loading) {
        return <AppShellLoading />;
    }

    return (
        <ThemeProvider>
            <Router>
                {!user ? (
                    <LoginPage />
                ) : (
                    <div className="relative min-h-screen bg-[var(--theme-background)] text-[var(--theme-text)] transition-colors duration-300">
                        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_100%_0%,var(--theme-aura-one)_0%,transparent_32%),radial-gradient(circle_at_0%_100%,var(--theme-aura-two)_0%,transparent_34%)]" />
                        <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_right,var(--theme-grid)_1px,transparent_1px),linear-gradient(to_bottom,var(--theme-grid)_1px,transparent_1px)] bg-[size:44px_44px] opacity-55" />
                        {isMobileSidebarOpen && (
                            <button
                                type="button"
                                aria-label="Close sidebar"
                                className="fixed inset-0 z-30 bg-black/30 lg:hidden"
                                onClick={() => setIsMobileSidebarOpen(false)}
                            />
                        )}

                        <div
                            className={`grid min-h-screen grid-cols-1 gap-2 p-2 ${shellColumnsClass}`}
                        >
                            <ScrollToTop />
                            <Sidebar
                                user={user}
                                onLogout={logout}
                                onOpenGemini={handleOpenGemini}
                                collapsed={isSidebarCollapsed}
                                mobileOpen={isMobileSidebarOpen}
                                onToggleCollapse={() =>
                                    setIsSidebarCollapsed((prev) => !prev)
                                }
                                onCloseMobile={() =>
                                    setIsMobileSidebarOpen(false)
                                }
                            />
                            <main className="flex min-w-0 flex-col gap-3 px-1 pb-4 pt-1 sm:px-2 sm:pb-6">
                                <div className="sticky top-2 z-20 flex items-center justify-between border border-[var(--theme-border)] bg-[var(--theme-surface)] px-3 py-2 lg:hidden">
                                    <button
                                        type="button"
                                        className="inline-flex h-8 w-8 items-center justify-center border border-[var(--theme-border)] bg-[var(--theme-glass)]"
                                        onClick={() =>
                                            setIsMobileSidebarOpen(true)
                                        }
                                        aria-label="Open sidebar"
                                    >
                                        <PanelLeft size={16} />
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <ThemeSelector />
                                        <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--theme-text-secondary)]">
                                            Cashn't
                                        </span>
                                    </div>
                                </div>
                                <div className="hidden lg:flex lg:justify-end lg:pb-1">
                                    <ThemeSelector />
                                </div>
                                <Suspense fallback={<AppShellLoading />}>
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
                                            path="/forecast"
                                            element={<ForecastPage />}
                                        />
                                        <Route
                                            path="/recurrings"
                                            element={<RecurringPage />}
                                        />
                                        <Route
                                            path="/workspaces"
                                            element={<WorkspacesPage />}
                                        />
                                        <Route
                                            path="/queued-expenses"
                                            element={<QueuedExpensesPage />}
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
                                </Suspense>
                            </main>
                        </div>

                        {showGeminiModal && (
                            <Suspense fallback={null}>
                                <GeminiModal
                                    isOpen={showGeminiModal}
                                    onClose={handleCloseGemini}
                                    onAddExpenses={handleExpensesAdded}
                                    onToast={handleToast}
                                />
                            </Suspense>
                        )}

                        <QuickAddWidget
                            onExpenseAdded={handleExpensesAdded}
                            onToast={handleToast}
                        />
                    </div>
                )}
            </Router>
            <Toast message={toast?.message} type={toast?.type} />
        </ThemeProvider>
    );
}
