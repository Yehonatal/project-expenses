import { Palette } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import type { Theme } from "../contexts/ThemeContext";

const themeOptions: { value: Theme; label: string; preview: string }[] = [
    {
        value: "white",
        label: "White",
        preview: "bg-white border border-gray-300",
    },
    {
        value: "black",
        label: "Black",
        preview: "bg-black border border-gray-700",
    },
    {
        value: "pink",
        label: "Pink",
        preview: "bg-pink-400 border border-pink-600",
    },
    {
        value: "orange",
        label: "Orange",
        preview: "bg-orange-400 border border-orange-600",
    },
    {
        value: "green",
        label: "Green",
        preview: "bg-emerald-400 border border-emerald-600",
    },
];

export default function ThemeSelector() {
    const { theme, setTheme } = useTheme();

    const cycleTheme = () => {
        const currentIndex = themeOptions.findIndex(
            (option) => option.value === theme,
        );
        const nextIndex = (currentIndex + 1) % themeOptions.length;
        setTheme(themeOptions[nextIndex].value);
    };

    return (
        <button
            onClick={cycleTheme}
            className="group relative flex h-10 w-10 cursor-pointer items-center justify-center border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] p-0 backdrop-blur-[20px] transition-transform transition-colors duration-200 hover:-translate-y-0.5 hover:bg-[var(--theme-hover)] active:translate-y-0"
            title={`Theme: ${themeOptions.find((option) => option.value === theme)?.label ?? "Theme"}. Click to cycle`}
            aria-label="Change theme"
        >
            <Palette
                size={18}
                strokeWidth={1.6}
                className="text-[var(--theme-text)] transition-transform duration-300 group-hover:rotate-12"
            />
            <span
                className={`pointer-events-none absolute -bottom-1 -right-1 h-2.5 w-2.5 border border-[var(--theme-border)] ${themeOptions.find((option) => option.value === theme)?.preview}`}
                aria-hidden
            />
        </button>
    );
}
