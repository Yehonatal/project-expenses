import { createContext, useState, useEffect, type ReactNode } from "react";

export type Theme = "white" | "black" | "pink" | "orange" | "green";

interface ThemeColors {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    glass: string;
    glassBorder: string;
    text: string;
    textSecondary: string;
    border: string;
    hover: string;
    focus: string;
    active: string;
    auraOne: string;
    auraTwo: string;
    auraThree: string;
    grid: string;
}

const themes: Record<Theme, ThemeColors> = {
    white: {
        primary: "#000000",
        secondary: "#2f2f2f",
        accent: "#2563eb",
        background: "#ffffff",
        surface: "#f7f9fc",
        glass: "rgba(255, 255, 255, 0.7)",
        glassBorder: "rgba(15, 23, 42, 0.12)",
        text: "#000000",
        textSecondary: "#5f6673",
        border: "#dbe3ef",
        hover: "#edf3ff",
        focus: "#dce9ff",
        active: "#d5e5ff",
        auraOne: "rgba(37, 99, 235, 0.14)",
        auraTwo: "rgba(16, 185, 129, 0.1)",
        auraThree: "rgba(249, 115, 22, 0.1)",
        grid: "rgba(59, 130, 246, 0.08)",
    },
    black: {
        primary: "#ffffff",
        secondary: "#d5d5d5",
        accent: "#22d3ee",
        background: "#090909",
        surface: "#151515",
        glass: "rgba(18, 18, 18, 0.72)",
        glassBorder: "rgba(255, 255, 255, 0.16)",
        text: "#f5f5f5",
        textSecondary: "#adadad",
        border: "#2a2a2a",
        hover: "#1e1e1e",
        focus: "#262626",
        active: "#313131",
        auraOne: "rgba(34, 211, 238, 0.18)",
        auraTwo: "rgba(167, 139, 250, 0.14)",
        auraThree: "rgba(236, 72, 153, 0.12)",
        grid: "rgba(255, 255, 255, 0.06)",
    },
    pink: {
        primary: "#5b0b31",
        secondary: "#9d174d",
        accent: "#ec4899",
        background: "#fff7fb",
        surface: "#ffe9f4",
        glass: "rgba(255, 233, 244, 0.78)",
        glassBorder: "rgba(157, 23, 77, 0.18)",
        text: "#4a0930",
        textSecondary: "#831843",
        border: "#f5bfd9",
        hover: "#ffddec",
        focus: "#ffcde4",
        active: "#ffbfdd",
        auraOne: "rgba(236, 72, 153, 0.2)",
        auraTwo: "rgba(244, 63, 94, 0.16)",
        auraThree: "rgba(59, 130, 246, 0.12)",
        grid: "rgba(236, 72, 153, 0.08)",
    },
    orange: {
        primary: "#7c2d12",
        secondary: "#9a3412",
        accent: "#f97316",
        background: "#fff9f3",
        surface: "#ffeddc",
        glass: "rgba(255, 237, 220, 0.76)",
        glassBorder: "rgba(154, 52, 18, 0.18)",
        text: "#5f2a0f",
        textSecondary: "#9a3412",
        border: "#f7c8a5",
        hover: "#ffe2c7",
        focus: "#ffd5af",
        active: "#ffc99a",
        auraOne: "rgba(249, 115, 22, 0.2)",
        auraTwo: "rgba(234, 179, 8, 0.14)",
        auraThree: "rgba(236, 72, 153, 0.1)",
        grid: "rgba(249, 115, 22, 0.08)",
    },
    green: {
        primary: "#14532d",
        secondary: "#166534",
        accent: "#22c55e",
        background: "#f7fff8",
        surface: "#e8fbe9",
        glass: "rgba(232, 251, 233, 0.78)",
        glassBorder: "rgba(22, 101, 52, 0.17)",
        text: "#123826",
        textSecondary: "#166534",
        border: "#b9e9c6",
        hover: "#d9f6df",
        focus: "#ccf2d5",
        active: "#bdecc8",
        auraOne: "rgba(34, 197, 94, 0.2)",
        auraTwo: "rgba(16, 185, 129, 0.16)",
        auraThree: "rgba(59, 130, 246, 0.1)",
        grid: "rgba(22, 163, 74, 0.08)",
    },
};

interface ThemeContextType {
    theme: Theme;
    colors: ThemeColors;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export { ThemeContext };

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem("theme") as Theme;
        // Check if the saved theme is valid, otherwise use default
        return saved && themes[saved] ? saved : "white";
    });

    useEffect(() => {
        localStorage.setItem("theme", theme);
        // Apply theme to document root for CSS custom properties
        const root = document.documentElement;
        const colors = themes[theme] || themes.white;

        root.style.setProperty("--theme-primary", colors.primary);
        root.style.setProperty("--theme-secondary", colors.secondary);
        root.style.setProperty("--theme-accent", colors.accent);
        root.style.setProperty("--theme-background", colors.background);
        root.style.setProperty("--theme-surface", colors.surface);
        root.style.setProperty("--theme-glass", colors.glass);
        root.style.setProperty("--theme-glass-border", colors.glassBorder);
        root.style.setProperty("--theme-text", colors.text);
        root.style.setProperty("--theme-text-secondary", colors.textSecondary);
        root.style.setProperty("--theme-border", colors.border);
        root.style.setProperty("--theme-hover", colors.hover);
        root.style.setProperty("--theme-focus", colors.focus);
        root.style.setProperty("--theme-active", colors.active);
        root.style.setProperty("--theme-aura-one", colors.auraOne);
        root.style.setProperty("--theme-aura-two", colors.auraTwo);
        root.style.setProperty("--theme-aura-three", colors.auraThree);
        root.style.setProperty("--theme-grid", colors.grid);
    }, [theme]);

    return (
        <ThemeContext.Provider
            value={{ theme, colors: themes[theme] || themes.white, setTheme }}
        >
            {children}
        </ThemeContext.Provider>
    );
};
