export const uiControl = {
    label: "text-sm font-medium text-[var(--theme-text-secondary)]",
    input: "mt-1 h-10 w-full border border-[var(--theme-border)] bg-[var(--theme-surface)] px-3 text-sm text-[var(--theme-text)] outline-none placeholder:text-[var(--theme-text-secondary)] transition-colors focus:border-[var(--theme-accent)] focus:ring-2 focus:ring-[var(--theme-accent)]/20",
    inputRight:
        "mt-1 h-10 w-full border border-[var(--theme-border)] bg-[var(--theme-surface)] px-3 text-right text-sm text-[var(--theme-text)] outline-none placeholder:text-[var(--theme-text-secondary)] transition-colors focus:border-[var(--theme-accent)] focus:ring-2 focus:ring-[var(--theme-accent)]/20",
    select: "mt-1 h-10 w-full appearance-none border border-[var(--theme-border)] bg-[var(--theme-surface)] px-3 pr-9 text-sm text-[var(--theme-text)] outline-none transition-colors focus:border-[var(--theme-accent)] focus:ring-2 focus:ring-[var(--theme-accent)]/20",
    textarea:
        "mt-1 w-full resize-none border border-[var(--theme-border)] bg-[var(--theme-surface)] px-3 py-2 text-sm text-[var(--theme-text)] outline-none placeholder:text-[var(--theme-text-secondary)] transition-colors focus:border-[var(--theme-accent)] focus:ring-2 focus:ring-[var(--theme-accent)]/20",
    button: "inline-flex items-center justify-center gap-2 border border-[var(--theme-border)] bg-[var(--theme-surface)] px-3 py-2 text-sm font-medium text-[var(--theme-text)] transition-colors hover:bg-[var(--theme-hover)] disabled:cursor-not-allowed disabled:opacity-60",
    buttonPrimary:
        "inline-flex items-center justify-center gap-2 border border-[var(--theme-accent)] bg-[var(--theme-accent)] px-3 py-2 text-sm font-medium text-[var(--theme-background)] transition-colors hover:brightness-[0.96] disabled:cursor-not-allowed disabled:opacity-60",
    buttonDanger:
        "inline-flex items-center justify-center gap-2 border border-red-600 bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700",
    checkbox:
        "h-4 w-4 cursor-pointer border border-[var(--theme-border)] bg-[var(--theme-surface)]",
};
