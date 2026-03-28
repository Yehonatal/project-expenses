type Props = {
    title?: string;
};

export default function PageSkeleton({ title = "Loading" }: Props) {
    return (
        <div className="flex animate-pulse flex-col gap-6">
            <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-6">
                <div className="mb-3 h-3 w-40 bg-[var(--theme-border)]" />
                <div className="mb-3 h-3 w-72 bg-[var(--theme-border)]" />
                <div className="h-3 w-64 bg-[var(--theme-border)]" />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="h-28 border border-[var(--theme-border)] bg-[var(--theme-surface)]" />
                <div className="h-28 border border-[var(--theme-border)] bg-[var(--theme-surface)]" />
                <div className="h-28 border border-[var(--theme-border)] bg-[var(--theme-surface)]" />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="h-64 border border-[var(--theme-border)] bg-[var(--theme-surface)]" />
                <div className="h-64 border border-[var(--theme-border)] bg-[var(--theme-surface)]" />
            </div>

            <p className="text-xs text-[var(--theme-text-secondary)]">
                {title}...
            </p>
        </div>
    );
}
