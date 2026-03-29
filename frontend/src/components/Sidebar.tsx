import { NavLink } from "react-router-dom";
import {
    LayoutGrid,
    List,
    DollarSign,
    PieChart,
    User,
    LogOut,
    Sparkles,
    Repeat,
    Users,
    CloudUpload,
    TrendingUp,
    FileJson,
    PanelLeftClose,
    PanelLeftOpen,
    X,
} from "lucide-react";
import { useState } from "react";

interface UserData {
    _id: string;
    name: string;
    email: string;
    picture?: string | null;
}

interface Props {
    user: UserData;
    onLogout: () => void;
    onOpenGemini?: () => void;
    collapsed: boolean;
    mobileOpen: boolean;
    onToggleCollapse: () => void;
    onCloseMobile: () => void;
}

const navItems = [
    { to: "/home", label: "Home", icon: LayoutGrid },
    { to: "/expenses", label: "Expenses", icon: List },
    { to: "/goals", label: "Goals", icon: DollarSign },
    { to: "/recurrings", label: "Recurrings", icon: Repeat },
    { to: "/workspaces", label: "Workspaces", icon: Users },
    { to: "/queued-expenses", label: "Queued", icon: CloudUpload },
    { to: "/import-data", label: "Import", icon: FileJson },
    { to: "/forecast", label: "Forecast", icon: TrendingUp },
    { to: "/charts", label: "Charts", icon: PieChart },
];

export default function Sidebar({
    user,
    onLogout,
    onOpenGemini,
    collapsed,
    mobileOpen,
    onToggleCollapse,
    onCloseMobile,
}: Props) {
    const [avatarError, setAvatarError] = useState(false);

    return (
        <aside
            className={`fixed inset-y-2 left-2 z-40 flex h-[calc(100vh-1rem)] flex-col gap-3 border border-[var(--theme-border)] bg-[var(--theme-surface)] p-2 shadow-xl transition-transform duration-300 lg:sticky lg:top-2 lg:z-10 lg:translate-x-0 lg:bg-[var(--theme-surface)] lg:shadow-none ${
                mobileOpen ? "translate-x-0" : "-translate-x-[110%]"
            } ${collapsed ? "w-[88px] lg:w-[78px]" : "w-[292px] lg:w-[292px]"}`}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-[14px] font-semibold tracking-[0.03em]">
                        {collapsed ? "" : "Cashn't"}
                    </span>
                    {!collapsed && (
                        <span className="truncate text-[10px] text-[var(--theme-text-secondary)]">
                            by yonatan
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        aria-label={
                            collapsed ? "Expand sidebar" : "Collapse sidebar"
                        }
                        onClick={onToggleCollapse}
                        className="hidden h-8 w-8 items-center justify-center border border-[var(--theme-border)] bg-[var(--theme-surface)] text-[var(--theme-text-secondary)] transition-colors hover:bg-[var(--theme-hover)] lg:inline-flex"
                    >
                        {collapsed ? (
                            <PanelLeftOpen size={14} />
                        ) : (
                            <PanelLeftClose size={14} />
                        )}
                    </button>
                    <button
                        type="button"
                        aria-label="Close sidebar"
                        onClick={onCloseMobile}
                        className="inline-flex h-8 w-8 items-center justify-center border border-[var(--theme-border)] bg-[var(--theme-surface)] text-[var(--theme-text-secondary)] transition-colors hover:bg-[var(--theme-hover)] lg:hidden"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>

            <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-2">
                <div className="mb-2">
                    <button
                        onClick={onOpenGemini}
                        className={`flex w-full border border-[var(--theme-border)] bg-[var(--theme-surface)] px-3 py-2 text-xs transition-colors hover:bg-white/5 ${
                            collapsed
                                ? "items-center justify-center"
                                : "items-center justify-start gap-2"
                        }`}
                        type="button"
                        title="Open Smart Expense Assistant"
                    >
                        <Sparkles size={16} />
                        {!collapsed && (
                            <div className="min-w-0 text-left">
                                <p className="truncate text-xs font-medium">
                                    Smart expense assistant
                                </p>
                                <p className="truncate text-[10px] text-[var(--theme-text-secondary)]">
                                    Draft entries using AI
                                </p>
                            </div>
                        )}
                    </button>
                </div>

                <nav className="flex flex-col gap-1.5">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.label}
                                to={item.to}
                                onClick={onCloseMobile}
                                className={({ isActive }) =>
                                    `flex items-center px-3 py-2 text-xs transition-colors hover:bg-[var(--theme-hover)] ${
                                        collapsed
                                            ? "justify-center"
                                            : "justify-start gap-2"
                                    } ${
                                        isActive
                                            ? "bg-[var(--theme-active)] font-semibold"
                                            : ""
                                    }`
                                }
                                end={item.to === "/home"}
                            >
                                <Icon size={16} />
                                {!collapsed && <span>{item.label}</span>}
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto flex flex-col gap-3 pt-3">
                <div
                    className={`flex items-center ${
                        collapsed ? "justify-center gap-2" : "gap-2"
                    }`}
                >
                    <NavLink
                        to="/profile"
                        onClick={onCloseMobile}
                        className={({ isActive }) =>
                            `flex items-center border border-[var(--theme-border)] bg-[var(--theme-surface)] transition-colors hover:bg-[var(--theme-hover)] ${
                                collapsed
                                    ? "h-10 w-10 justify-center"
                                    : "min-w-0 flex-1 gap-3 px-2 py-1.5"
                            } ${isActive ? "bg-[var(--theme-active)]" : ""}`
                        }
                        title="Open profile"
                    >
                        <div
                            className="flex h-8 w-8 items-center justify-center overflow-hidden border border-[var(--theme-border)]"
                            style={{
                                backgroundColor:
                                    avatarError || !user.picture
                                        ? "var(--theme-primary)"
                                        : "transparent",
                            }}
                        >
                            {avatarError || !user.picture ? (
                                <User size={14} className="text-white" />
                            ) : (
                                <img
                                    src={user.picture}
                                    alt={user.name}
                                    className="h-full w-full object-cover"
                                    onError={() => setAvatarError(true)}
                                />
                            )}
                        </div>
                        {!collapsed && (
                            <div className="min-w-0">
                                <p className="truncate text-xs font-semibold">
                                    {user.name}
                                </p>
                                <p className="truncate text-[11px] text-[var(--theme-text-secondary)]">
                                    {user.email}
                                </p>
                            </div>
                        )}
                    </NavLink>

                    <button
                        onClick={onLogout}
                        className="inline-flex h-10 w-10 items-center justify-center border border-[var(--theme-border)] bg-[var(--theme-surface)] transition-colors hover:bg-white/5"
                        type="button"
                        aria-label="Logout"
                        title="Logout"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </aside>
    );
}
