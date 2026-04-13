import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { Suspense, lazy, useState } from "react";
import { Keyboard, PanelLeft, ToolCase } from "lucide-react";
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
const ImportDataPage = lazy(() => import("./pages/ImportDataPage.tsx"));

const AccountsPage = lazy(() => import("./pages/AccountsPage"));

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

    const handleToggleQuickAdd = () => {
        window.dispatchEvent(
            new CustomEvent("quick-add:toggle", {
                detail: { source: "top-shortcut" },
            }),
        );
    };

    const shellColumnsClass = isSidebarCollapsed
        ? "lg:[grid-template-columns:92px_minmax(0,1fr)]"
        : "lg:[grid-template-columns:292px_minmax(0,1fr)]";

    return (
        <ThemeProvider>
            {loading ? (
                <AppShellLoading />
            ) : (
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
                                    onClick={() =>
                                        setIsMobileSidebarOpen(false)
                                    }
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
                                <main className="relative z-0 flex min-w-0 flex-col gap-3 overflow-hidden px-1 pb-4 pt-1 sm:px-2 sm:pb-6">
                                    <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--theme-grid)_1px,transparent_1px),linear-gradient(to_bottom,var(--theme-grid)_1px,transparent_1px)] bg-[size:36px_36px] opacity-35" />
                                    <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_15%,var(--theme-aura-one),transparent_28%),radial-gradient(circle_at_80%_80%,var(--theme-aura-two),transparent_30%)] opacity-45" />
                                    <div className="sticky top-2 z-20 flex items-center justify-between border border-[var(--theme-border)] bg-[var(--theme-surface)] px-3 py-2 lg:hidden">
                                        <button
                                            type="button"
                                            className="inline-flex h-8 w-8 items-center justify-center border border-[var(--theme-border)] bg-[var(--theme-surface)]"
                                            onClick={() =>
                                                setIsMobileSidebarOpen(true)
                                            }
                                            aria-label="Open sidebar"
                                        >
                                            <PanelLeft size={16} />
                                        </button>
                                        <div className="quick-shortcut-mobile-row flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={handleToggleQuickAdd}
                                                className="quick-shortcut-chip quick-shortcut-mobile-trigger inline-flex items-center gap-1.5 border px-2 py-1 text-[11px]"
                                                title="Quick add: Ctrl/Cmd+Shift+A"
                                                aria-label="Open quick add using keyboard shortcut"
                                            >
                                                <ToolCase
                                                    size={12}
                                                    className="quick-shortcut-icon"
                                                />
                                                <span className="font-semibold">
                                                    Quick add
                                                </span>
                                                <span className="quick-shortcut-kbd">
                                                    Ctrl/Cmd+Shift+A
                                                </span>
                                            </button>
                                            <div className="theme-selector-slot">
                                                <ThemeSelector />
                                            </div>
                                            <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--theme-text-secondary)]">
                                                Cashn't
                                            </span>
                                        </div>
                                    </div>
                                    <div className="quick-shortcut-slot hidden lg:flex lg:items-center lg:justify-end lg:gap-2 lg:pb-1">
                                        <button
                                            type="button"
                                            onClick={handleToggleQuickAdd}
                                            className="quick-shortcut-chip inline-flex items-center gap-2 border px-3 py-1.5 text-xs"
                                            title="Quick add: Ctrl/Cmd+Shift+A"
                                        >
                                            <Keyboard
                                                size={14}
                                                className="quick-shortcut-icon"
                                            />
                                            <span className="uppercase tracking-[0.12em] font-semibold">
                                                Quick add
                                            </span>
                                            <span className="quick-shortcut-kbd">
                                                Ctrl/Cmd+Shift+A
                                            </span>
                                        </button>
                                        <div className="theme-selector-slot">
                                            <ThemeSelector />
                                        </div>
                                    </div>
                                    <Suspense fallback={<AppShellLoading />}>
                                        <Routes>
                                            <Route
                                                path="/"
                                                element={
                                                    <Navigate
                                                        to="/home"
                                                        replace
                                                    />
                                                }
                                            />
                                            <Route
                                                path="/import-data"
                                                element={<ImportDataPage />}
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
                                                path="/accounts"
                                                element={<AccountsPage />}
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
                                                    <Navigate
                                                        to="/home"
                                                        replace
                                                    />
                                                }
                                            />
                                            <Route
                                                path="/dashboard"
                                                element={
                                                    <Navigate
                                                        to="/home"
                                                        replace
                                                    />
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
                                                    <Navigate
                                                        to="/goals"
                                                        replace
                                                    />
                                                }
                                            />
                                            <Route
                                                path="/profile"
                                                element={<ProfilePage />}
                                            />
                                            <Route
                                                path="*"
                                                element={
                                                    <Navigate
                                                        to="/home"
                                                        replace
                                                    />
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
            )}
            <Toast message={toast?.message} type={toast?.type} />
        </ThemeProvider>
    );
}
