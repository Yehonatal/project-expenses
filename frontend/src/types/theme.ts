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
    quickAddPosition: "left" | "right";
}

export interface ThemeColors {
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
