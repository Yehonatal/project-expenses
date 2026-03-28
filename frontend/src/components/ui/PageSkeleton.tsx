type Props = {
    title?: string;
};

export default function PageSkeleton({ title = "Loading" }: Props) {
    return (
        <div className="relative overflow-hidden border border-[var(--theme-border)] bg-[var(--theme-surface)] p-4 sm:p-5">
            <div className="pointer-events-none absolute -left-16 -top-16 h-44 w-44 rounded-full bg-[var(--theme-aura-one)] blur-3xl skeleton-float" />
            <div className="pointer-events-none absolute -bottom-16 right-10 h-44 w-44 rounded-full bg-[var(--theme-aura-two)] blur-3xl skeleton-float" />

            <div className="relative flex flex-col gap-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-2">
                        <div className="h-3 w-28 skeleton-shimmer" />
                        <div className="h-5 w-52 skeleton-shimmer" />
                    </div>
                    <div className="h-7 w-24 skeleton-shimmer" />
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="h-20 skeleton-shimmer" />
                    <div className="h-20 skeleton-shimmer" />
                    <div className="h-20 skeleton-shimmer" />
                </div>

                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                    <div className="h-52 skeleton-shimmer" />
                    <div className="h-52 skeleton-shimmer" />
                </div>

                <p className="text-xs text-[var(--theme-text-secondary)]">
                    {title}...
                </p>
            </div>
        </div>
    );
}
