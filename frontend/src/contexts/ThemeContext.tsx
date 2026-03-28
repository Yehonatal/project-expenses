import { createContext, useState, useEffect, type ReactNode } from "react";

export type Theme =
    | "classic-cream"
    | "ocean-breeze"
    | "midnight"
    | "deep-forest"
    | "standard-dark"
    | "earthy-tones"
    | "github-style"
    | "elegant-pink";

export interface FontOption {
    id: string;
    label: string;
    cssFamily: string;
}

export interface AppearanceSettings {
    baseFontSize: number;
    cornerRadius: number;
    borderWidth: number;
    shadowIntensity: number;
    headingFont: string;
    bodyFont: string;
}

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
    shadowRgb: string;
}

const themes: Record<Theme, ThemeColors> = {
    "classic-cream": {
        primary: "#0f2f28",
        secondary: "#2c4a43",
        accent: "#0f4f42",
        background: "#f3efe6",
        surface: "#f8f4ec",
        glass: "rgba(248, 244, 236, 0.82)",
        glassBorder: "rgba(15, 47, 40, 0.16)",
        text: "#183630",
        textSecondary: "#55726a",
        border: "#d8d0c2",
        hover: "#ece4d5",
        focus: "#e2d7c5",
        active: "#d7c9b3",
        auraOne: "rgba(15, 79, 66, 0.16)",
        auraTwo: "rgba(143, 99, 66, 0.1)",
        auraThree: "rgba(30, 101, 76, 0.12)",
        grid: "rgba(15, 79, 66, 0.08)",
        shadowRgb: "22, 34, 28",
    },
    "ocean-breeze": {
        primary: "#0f3057",
        secondary: "#315d7d",
        accent: "#3b82f6",
        background: "#f0f8ff",
        surface: "#e6f2ff",
        glass: "rgba(230, 242, 255, 0.78)",
        glassBorder: "rgba(15, 48, 87, 0.16)",
        text: "#15334f",
        textSecondary: "#4d6f8a",
        border: "#c7deef",
        hover: "#dbeeff",
        focus: "#cfe7ff",
        active: "#c1dfff",
        auraOne: "rgba(59, 130, 246, 0.18)",
        auraTwo: "rgba(34, 211, 238, 0.14)",
        auraThree: "rgba(99, 102, 241, 0.1)",
        grid: "rgba(59, 130, 246, 0.09)",
        shadowRgb: "10, 46, 82",
    },
    midnight: {
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
        shadowRgb: "0, 0, 0",
    },
    "deep-forest": {
        primary: "#ecfdf5",
        secondary: "#b7e4cd",
        accent: "#10b981",
        background: "#042217",
        surface: "#083127",
        glass: "rgba(8, 49, 39, 0.76)",
        glassBorder: "rgba(167, 243, 208, 0.18)",
        text: "#dcfce7",
        textSecondary: "#9dd8bc",
        border: "#1f5d4f",
        hover: "#0f4638",
        focus: "#125141",
        active: "#14624f",
        auraOne: "rgba(16, 185, 129, 0.2)",
        auraTwo: "rgba(45, 212, 191, 0.14)",
        auraThree: "rgba(52, 211, 153, 0.12)",
        grid: "rgba(167, 243, 208, 0.08)",
        shadowRgb: "0, 0, 0",
    },
    "standard-dark": {
        primary: "#f9fafb",
        secondary: "#d1d5db",
        accent: "#60a5fa",
        background: "#111827",
        surface: "#1f2937",
        glass: "rgba(31, 41, 55, 0.74)",
        glassBorder: "rgba(209, 213, 219, 0.14)",
        text: "#f3f4f6",
        textSecondary: "#9ca3af",
        border: "#374151",
        hover: "#263346",
        focus: "#2b3b52",
        active: "#30425c",
        auraOne: "rgba(96, 165, 250, 0.17)",
        auraTwo: "rgba(59, 130, 246, 0.12)",
        auraThree: "rgba(147, 197, 253, 0.1)",
        grid: "rgba(148, 163, 184, 0.08)",
        shadowRgb: "0, 0, 0",
    },
    "earthy-tones": {
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
        shadowRgb: "90, 36, 14",
    },
    "github-style": {
        primary: "#111827",
        secondary: "#374151",
        accent: "#2563eb",
        background: "#f6f8fa",
        surface: "#ffffff",
        glass: "rgba(255, 255, 255, 0.8)",
        glassBorder: "rgba(17, 24, 39, 0.12)",
        text: "#111827",
        textSecondary: "#4b5563",
        border: "#d0d7de",
        hover: "#eef2f7",
        focus: "#e2e8f0",
        active: "#dbe5f1",
        auraOne: "rgba(37, 99, 235, 0.14)",
        auraTwo: "rgba(30, 64, 175, 0.1)",
        auraThree: "rgba(14, 116, 144, 0.08)",
        grid: "rgba(30, 41, 59, 0.07)",
        shadowRgb: "15, 23, 42",
    },
    "elegant-pink": {
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
        shadowRgb: "91, 11, 49",
    },
};

export const fontOptions: FontOption[] = [
    {
        id: "playfair",
        label: "Playfair Display",
        cssFamily: '"Playfair Display", "Times New Roman", serif',
    },
    {
        id: "georgia",
        label: "Georgia",
        cssFamily: 'Georgia, "Times New Roman", serif',
    },
    {
        id: "inter",
        label: "Inter",
        cssFamily:
            'Inter, "Segoe UI", "Helvetica Neue", Arial, "Noto Sans", sans-serif',
    },
    {
        id: "geistsans",
        label: "Geist Sans",
        cssFamily:
            '"Geist Sans", "Segoe UI", "Helvetica Neue", Arial, "Noto Sans", sans-serif',
    },
    {
        id: "ibmplex",
        label: "IBM Plex Sans",
        cssFamily:
            '"IBM Plex Sans", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    },
    {
        id: "nunito",
        label: "Nunito Sans",
        cssFamily:
            '"Nunito Sans", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    },
];

const defaultAppearance: AppearanceSettings = {
    baseFontSize: 14,
    cornerRadius: 0,
    borderWidth: 0.25,
    shadowIntensity: 1,
    headingFont: "playfair",
    bodyFont: "geistsans",
};

interface ThemeContextType {
    theme: Theme;
    colors: ThemeColors;
    appearance: AppearanceSettings;
    fontOptions: FontOption[];
    setTheme: (theme: Theme) => void;
    updateAppearance: (partial: Partial<AppearanceSettings>) => void;
    resetAppearance: () => void;
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
        return saved && themes[saved] ? saved : "classic-cream";
    });

    const [appearance, setAppearance] = useState<AppearanceSettings>(() => {
        const raw = localStorage.getItem("appearance-settings");
        if (!raw) return defaultAppearance;

        try {
            const parsed = JSON.parse(raw) as Partial<AppearanceSettings>;
            return {
                baseFontSize:
                    typeof parsed.baseFontSize === "number"
                        ? parsed.baseFontSize
                        : defaultAppearance.baseFontSize,
                cornerRadius:
                    typeof parsed.cornerRadius === "number"
                        ? parsed.cornerRadius
                        : defaultAppearance.cornerRadius,
                borderWidth:
                    typeof parsed.borderWidth === "number"
                        ? parsed.borderWidth
                        : defaultAppearance.borderWidth,
                shadowIntensity:
                    typeof parsed.shadowIntensity === "number"
                        ? parsed.shadowIntensity
                        : defaultAppearance.shadowIntensity,
                headingFont:
                    typeof parsed.headingFont === "string"
                        ? parsed.headingFont
                        : defaultAppearance.headingFont,
                bodyFont:
                    typeof parsed.bodyFont === "string"
                        ? parsed.bodyFont
                        : defaultAppearance.bodyFont,
            };
        } catch {
            return defaultAppearance;
        }
    });

    const updateAppearance = (partial: Partial<AppearanceSettings>) => {
        setAppearance((prev) => ({
            ...prev,
            ...partial,
        }));
    };

    const resetAppearance = () => {
        setAppearance(defaultAppearance);
    };

    useEffect(() => {
        localStorage.setItem("theme", theme);
        localStorage.setItem("appearance-settings", JSON.stringify(appearance));

        // Apply theme to document root for CSS custom properties
        const root = document.documentElement;
        const colors = themes[theme] || themes["classic-cream"];
        const headingOption =
            fontOptions.find(
                (option) => option.id === appearance.headingFont,
            ) || fontOptions[0];
        const bodyOption =
            fontOptions.find((option) => option.id === appearance.bodyFont) ||
            fontOptions[1];

        const baseFontSize = Math.min(
            18,
            Math.max(12, appearance.baseFontSize),
        );
        const cornerRadius = Math.min(
            1.5,
            Math.max(0, appearance.cornerRadius),
        );
        const borderWidth = Math.min(2, Math.max(0.25, appearance.borderWidth));
        const shadowIntensity = Math.min(
            2,
            Math.max(0, appearance.shadowIntensity),
        );

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
        root.style.setProperty("--app-font-size", `${baseFontSize}px`);
        root.style.setProperty("--app-radius", `${cornerRadius}rem`);
        root.style.setProperty("--app-border-width", `${borderWidth}px`);
        root.style.setProperty("--app-shadow-intensity", `${shadowIntensity}`);
        root.style.setProperty("--app-heading-font", headingOption.cssFamily);
        root.style.setProperty("--app-body-font", bodyOption.cssFamily);
        root.style.setProperty("--app-shadow-rgb", colors.shadowRgb);
    }, [theme, appearance]);

    return (
        <ThemeContext.Provider
            value={{
                theme,
                colors: themes[theme] || themes["classic-cream"],
                appearance,
                fontOptions,
                setTheme,
                updateAppearance,
                resetAppearance,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};
