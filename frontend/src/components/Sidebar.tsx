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
} from "lucide-react";
import { useState } from "react";
import ThemeSelector from "./ThemeSelector";

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
}

const navItems = [
    { to: "/home", label: "Home", icon: LayoutGrid },
    { to: "/expenses", label: "Expenses", icon: List },
    { to: "/goals", label: "Goals", icon: DollarSign },
    { to: "/recurrings", label: "Recurrings", icon: Repeat },
    { to: "/charts", label: "Charts", icon: PieChart },
    { to: "/profile", label: "Profile", icon: User },
];

export default function Sidebar({ user, onLogout, onOpenGemini }: Props) {
    const [avatarError, setAvatarError] = useState(false);

    return (
        <aside className="sticky top-2 flex h-[calc(100vh-1rem)] flex-col gap-4 border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] p-2">
            <div className="flex flex-col gap-1">
                <span className="text-[15px] font-semibold tracking-[0.03em]">
                    Cashn't
                </span>
                <span className="text-[11px] text-[var(--theme-text-secondary)]">
                    by yonatan
                </span>
            </div>

            <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-[var(--theme-text-secondary)]">
                    Quick access
                </p>
                <nav className="flex flex-col gap-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.label}
                                to={item.to}
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-3 py-2 text-xs transition-colors hover:bg-[var(--theme-hover)] ${
                                        isActive
                                            ? "bg-[var(--theme-active)] font-semibold"
                                            : ""
                                    }`
                                }
                                end={item.to === "/home"}
                            >
                                <Icon size={16} />
                                <span>{item.label}</span>
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            <div className="flex flex-col gap-2">
                <button
                    onClick={onOpenGemini}
                    className="flex items-center gap-2 border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] px-3 py-2 text-xs transition-colors hover:bg-white/5"
                    type="button"
                >
                    <Sparkles size={16} />
                    AI expense
                </button>
            </div>

            <div className="mt-auto flex flex-col gap-4 border-t border-[var(--theme-border)] pt-4">
                <div className="flex items-center gap-3">
                    <div
                        className="flex h-10 w-10 items-center justify-center overflow-hidden border border-[var(--theme-border)]"
                        style={{
                            backgroundColor:
                                avatarError || !user.picture
                                    ? "var(--theme-primary)"
                                    : "transparent",
                        }}
                    >
                        {avatarError || !user.picture ? (
                            <User size={16} className="text-white" />
                        ) : (
                            <img
                                src={user.picture}
                                alt={user.name}
                                className="h-full w-full object-cover"
                                onError={() => setAvatarError(true)}
                            />
                        )}
                    </div>
                    <div>
                        <p className="text-xs font-semibold">{user.name}</p>
                        <p className="text-[11px] text-[var(--theme-text-secondary)]">
                            {user.email}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <ThemeSelector />
                    <button
                        onClick={onLogout}
                        className="inline-flex h-10 w-10 items-center justify-center border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] transition-colors hover:bg-white/5"
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
