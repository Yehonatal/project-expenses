import { Palette } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import type { Theme } from "../contexts/ThemeContext";

const themeOptions: { value: Theme; label: string; preview: string }[] = [
    {
        value: "light",
        label: "Light",
        preview: "bg-white border border-gray-300",
    },
    {
        value: "cafe",
        label: "Cafe",
        preview: "bg-[#f3e8dc] border border-[#d9c7b7]",
    },
    {
        value: "gray",
        label: "Gray",
        preview: "bg-gray-100 border border-gray-300",
    },
    {
        value: "dark",
        label: "Dark",
        preview: "bg-black border border-gray-700",
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
            className="flex h-10 w-10 cursor-pointer items-center justify-center border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] p-0 backdrop-blur-[20px] transition-colors hover:bg-white/5 active:bg-white/[0.02]"
            title="Change theme"
            aria-label="Change theme"
        >
            <Palette
                size={18}
                strokeWidth={1.6}
                className="text-[var(--theme-text)]"
            />
        </button>
    );
}
