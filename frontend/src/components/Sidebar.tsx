import { NavLink } from "react-router-dom";
import {
    LayoutGrid,
    List,
    FileText,
    DollarSign,
    PieChart,
    User,
    LogOut,
    Sparkles,
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
    { to: "/", label: "Home", icon: LayoutGrid },
    { to: "/expenses", label: "Expenses", icon: List },
    { to: "/budget", label: "Goals", icon: DollarSign },
    { to: "/templates", label: "Templates", icon: FileText },
    { to: "/profile", label: "Profile", icon: User },
    { to: "/#charts", label: "Charts", icon: PieChart, anchor: true },
];

export default function Sidebar({ user, onLogout, onOpenGemini }: Props) {
    const [avatarError, setAvatarError] = useState(false);

    return (
        <aside className="app-sidebar">
            <div className="sidebar-brand">
                <span className="sidebar-logo">Odit</span>
                <span className="sidebar-tag">Made by robil.work</span>
            </div>

            <div className="sidebar-card">
                <p className="sidebar-card-title">Quick access</p>
                <nav className="sidebar-nav">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        if (item.anchor) {
                            return (
                                <a
                                    key={item.label}
                                    href={item.to}
                                    className="sidebar-link"
                                >
                                    <Icon size={16} />
                                    <span>{item.label}</span>
                                </a>
                            );
                        }
                        return (
                            <NavLink
                                key={item.label}
                                to={item.to}
                                className={({ isActive }) =>
                                    `sidebar-link ${
                                        isActive ? "sidebar-link-active" : ""
                                    }`
                                }
                                end={item.to === "/"}
                            >
                                <Icon size={16} />
                                <span>{item.label}</span>
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            <div className="sidebar-actions">
                <button
                    onClick={onOpenGemini}
                    className="sidebar-action"
                    type="button"
                >
                    <Sparkles size={16} />
                    AI expense
                </button>
            </div>

            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div
                        className="sidebar-avatar"
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
                                onError={() => setAvatarError(true)}
                            />
                        )}
                    </div>
                    <div>
                        <p className="sidebar-user-name">{user.name}</p>
                        <p className="sidebar-user-email">{user.email}</p>
                    </div>
                </div>
                <div className="sidebar-footer-actions">
                    <ThemeSelector />
                    <button
                        onClick={onLogout}
                        className="sidebar-icon-button"
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
