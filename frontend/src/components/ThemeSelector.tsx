import { useMemo, useState } from "react";
import {
    CircleOff,
    Github,
    Leaf,
    Monitor,
    Moon,
    Palette,
    Sun,
    Waves,
    X,
} from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import type { Theme } from "../contexts/ThemeContext";
import { uiControl } from "../utils/uiClasses";

const themeOptions: {
    value: Theme;
    label: string;
    subtitle: string;
    icon: typeof Sun;
    preview: string;
}[] = [
    {
        value: "classic-cream",
        label: "Classic Cream",
        subtitle: "Warm cream and deep green",
        icon: Sun,
        preview: "bg-[#f3efe6] border-[#173a33]",
    },
    {
        value: "ocean-breeze",
        label: "Ocean Breeze",
        subtitle: "Fresh blue and soft white",
        icon: Waves,
        preview: "bg-[#f0f8ff] border-[#3b82f6]",
    },
    {
        value: "midnight",
        label: "Midnight",
        subtitle: "Deep blue and neon accents",
        icon: Moon,
        preview: "bg-[#090909] border-[#22d3ee]",
    },
    {
        value: "deep-forest",
        label: "Deep Forest",
        subtitle: "Dark green and earthy tones",
        icon: Leaf,
        preview: "bg-[#042217] border-[#10b981]",
    },
    {
        value: "standard-dark",
        label: "Standard Dark",
        subtitle: "Neutral dark mode",
        icon: Monitor,
        preview: "bg-[#111827] border-[#60a5fa]",
    },
    {
        value: "earthy-tones",
        label: "Earthy Tones",
        subtitle: "Warm browns and greens",
        icon: CircleOff,
        preview: "bg-[#fff9f3] border-[#f97316]",
    },
    {
        value: "github-style",
        label: "GitHub Style",
        subtitle: "Clean developer aesthetic",
        icon: Github,
        preview: "bg-[#f6f8fa] border-[#2563eb]",
    },
    {
        value: "elegant-pink",
        label: "Elegant Pink",
        subtitle: "Soft rose and modern accents",
        icon: Palette,
        preview: "bg-[#fff7fb] border-[#ec4899]",
    },
];

export default function ThemeSelector() {
    const [open, setOpen] = useState(false);
    const {
        theme,
        setTheme,
        appearance,
        updateAppearance,
        resetAppearance,
        fontOptions,
    } = useTheme();

    const activeTheme = useMemo(
        () => themeOptions.find((option) => option.value === theme),
        [theme],
    );

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="group relative flex h-10 w-10 cursor-pointer items-center justify-center border border-[var(--theme-border)] bg-[var(--theme-surface)] p-0  transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--theme-hover)] active:translate-y-0"
                title={`Appearance: ${activeTheme?.label ?? "Theme"}`}
                aria-label="Open appearance settings"
            >
                <Palette
                    size={18}
                    strokeWidth={1.6}
                    className="text-[var(--theme-text)] transition-transform duration-300 group-hover:rotate-12"
                />
                <span
                    className={`pointer-events-none absolute -bottom-1 -right-1 h-2.5 w-2.5 border border-[var(--theme-border)] ${activeTheme?.preview}`}
                    aria-hidden
                />
            </button>

            {open && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 px-4 py-8 ">
                    <div className="w-full max-w-[960px] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-0 shadow-xl">
                        <div className="flex items-start justify-between border-b border-[var(--theme-border)] px-5 py-4">
                            <div>
                                <h2 className="app-heading text-[30px] leading-none">
                                    Appearance
                                </h2>
                                <p className="mt-2 text-sm text-[var(--theme-text-secondary)]">
                                    Customize your experience with different
                                    themes and styles.
                                </p>
                            </div>
                            <button
                                type="button"
                                className={uiControl.button}
                                onClick={() => setOpen(false)}
                                aria-label="Close appearance settings"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="space-y-6 px-5 py-4">
                            <section className="space-y-3">
                                <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--theme-text-secondary)]">
                                    Theme Presets
                                </p>
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    {themeOptions.map((option) => {
                                        const Icon = option.icon;
                                        const isActive = option.value === theme;

                                        return (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() =>
                                                    setTheme(option.value)
                                                }
                                                className={`flex items-center gap-3 border p-3 text-left transition-colors ${isActive ? "bg-[var(--theme-active)]" : "bg-[var(--theme-background)] hover:bg-[var(--theme-hover)]"}`}
                                                style={{
                                                    borderColor:
                                                        "var(--theme-border)",
                                                }}
                                            >
                                                <span
                                                    className={`inline-flex h-8 w-8 items-center justify-center border ${option.preview}`}
                                                >
                                                    <Icon className="h-4 w-4" />
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="block truncate text-sm font-semibold">
                                                        {option.label}
                                                    </span>
                                                    <span className="block truncate text-[11px] text-[var(--theme-text-secondary)]">
                                                        {option.subtitle}
                                                    </span>
                                                </span>
                                                {isActive && (
                                                    <span className="text-xs font-semibold text-[var(--theme-accent)]">
                                                        Active
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </section>

                            <section className="space-y-4">
                                <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--theme-text-secondary)]">
                                    Fine-tune Styles
                                </p>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <label className="block text-xs text-[var(--theme-text-secondary)]">
                                        Base Font Size (
                                        {appearance.baseFontSize}px)
                                        <input
                                            type="range"
                                            min={12}
                                            max={18}
                                            step={1}
                                            value={appearance.baseFontSize}
                                            onChange={(e) =>
                                                updateAppearance({
                                                    baseFontSize: Number(
                                                        e.target.value,
                                                    ),
                                                })
                                            }
                                            className="mt-2 w-full accent-[var(--theme-accent)]"
                                        />
                                    </label>

                                    <label className="block text-xs text-[var(--theme-text-secondary)]">
                                        Corner Radius (
                                        {appearance.cornerRadius.toFixed(2)}rem)
                                        <input
                                            type="range"
                                            min={0}
                                            max={1.5}
                                            step={0.05}
                                            value={appearance.cornerRadius}
                                            onChange={(e) =>
                                                updateAppearance({
                                                    cornerRadius: Number(
                                                        e.target.value,
                                                    ),
                                                })
                                            }
                                            className="mt-2 w-full accent-[var(--theme-accent)]"
                                        />
                                    </label>

                                    <label className="block text-xs text-[var(--theme-text-secondary)]">
                                        Border Width (
                                        {appearance.borderWidth.toFixed(2)}px)
                                        <input
                                            type="range"
                                            min={0.25}
                                            max={2}
                                            step={0.05}
                                            value={appearance.borderWidth}
                                            onChange={(e) =>
                                                updateAppearance({
                                                    borderWidth: Number(
                                                        e.target.value,
                                                    ),
                                                })
                                            }
                                            className="mt-2 w-full accent-[var(--theme-accent)]"
                                        />
                                    </label>

                                    <label className="block text-xs text-[var(--theme-text-secondary)]">
                                        Shadow Intensity (
                                        {appearance.shadowIntensity.toFixed(2)})
                                        <input
                                            type="range"
                                            min={0}
                                            max={2}
                                            step={0.05}
                                            value={appearance.shadowIntensity}
                                            onChange={(e) =>
                                                updateAppearance({
                                                    shadowIntensity: Number(
                                                        e.target.value,
                                                    ),
                                                })
                                            }
                                            className="mt-2 w-full accent-[var(--theme-accent)]"
                                        />
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <label className="block text-xs text-[var(--theme-text-secondary)]">
                                        Heading Font
                                        <select
                                            className={uiControl.select}
                                            value={appearance.headingFont}
                                            onChange={(e) =>
                                                updateAppearance({
                                                    headingFont: e.target.value,
                                                })
                                            }
                                        >
                                            {fontOptions.map((font) => (
                                                <option
                                                    key={font.id}
                                                    value={font.id}
                                                >
                                                    {font.label}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className="block text-xs text-[var(--theme-text-secondary)]">
                                        Body Font
                                        <select
                                            className={uiControl.select}
                                            value={appearance.bodyFont}
                                            onChange={(e) =>
                                                updateAppearance({
                                                    bodyFont: e.target.value,
                                                })
                                            }
                                        >
                                            {fontOptions.map((font) => (
                                                <option
                                                    key={font.id}
                                                    value={font.id}
                                                >
                                                    {font.label}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <div className="block text-xs text-[var(--theme-text-secondary)]">
                                        Quick Add Chip Position
                                        <div className="mt-2 inline-flex w-full border border-[var(--theme-border)] bg-[var(--theme-background)] p-1">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateAppearance({
                                                        quickAddPosition:
                                                            "left",
                                                    })
                                                }
                                                className={`flex-1 px-3 py-1.5 text-xs font-semibold transition-colors ${
                                                    appearance.quickAddPosition ===
                                                    "left"
                                                        ? "bg-[var(--theme-accent)] text-[var(--theme-background)]"
                                                        : "text-[var(--theme-text-secondary)] hover:bg-[var(--theme-hover)]"
                                                }`}
                                            >
                                                Left
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateAppearance({
                                                        quickAddPosition:
                                                            "right",
                                                    })
                                                }
                                                className={`flex-1 px-3 py-1.5 text-xs font-semibold transition-colors ${
                                                    appearance.quickAddPosition ===
                                                    "right"
                                                        ? "bg-[var(--theme-accent)] text-[var(--theme-background)]"
                                                        : "text-[var(--theme-text-secondary)] hover:bg-[var(--theme-hover)]"
                                                }`}
                                            >
                                                Right
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <div className="flex items-center justify-between border-t border-[var(--theme-border)] px-5 py-4">
                            <button
                                type="button"
                                className={uiControl.button}
                                onClick={resetAppearance}
                            >
                                Reset
                            </button>
                            <button
                                type="button"
                                className={uiControl.buttonPrimary}
                                onClick={() => setOpen(false)}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
