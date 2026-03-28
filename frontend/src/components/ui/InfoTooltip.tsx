import { CircleHelp } from "lucide-react";

type InfoTooltipProps = {
    label: string;
    className?: string;
};

export default function InfoTooltip({ label, className = "" }: InfoTooltipProps) {
    return (
        <span
            className={`group relative inline-flex items-center ${className}`.trim()}
            tabIndex={0}
            aria-label={label}
        >
            <CircleHelp className="h-3.5 w-3.5 text-[var(--theme-text-secondary)]" />
            <span
                role="tooltip"
                className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-50 w-56 -translate-x-1/2 border border-[var(--theme-border)] bg-[var(--theme-background)] p-2 text-[11px] leading-snug text-[var(--theme-text)] opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus:opacity-100"
            >
                {label}
            </span>
        </span>
    );
}
