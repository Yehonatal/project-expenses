export default function AppShellLoading() {
    return (
        <div className="relative grid min-h-screen grid-cols-1 gap-2 p-2 lg:grid-cols-[174px_1fr]">
            <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_100%_0%,var(--theme-aura-one)_0%,transparent_36%),radial-gradient(circle_at_0%_100%,var(--theme-aura-two)_0%,transparent_40%)]" />

            <aside className="flex flex-col gap-3 border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] p-2">
                <div className="h-3 w-28 skeleton-shimmer" />
                <div className="h-36 skeleton-shimmer" />
                <div className="h-36 skeleton-shimmer" />
            </aside>
            <main className="flex flex-col gap-4 px-2 pb-6 pt-1">
                <div className="relative overflow-hidden border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] p-4 sm:p-5">
                    <div className="pointer-events-none absolute -left-14 -top-14 h-36 w-36 rounded-full bg-[var(--theme-aura-one)] blur-3xl skeleton-float" />
                    <div className="pointer-events-none absolute -right-12 bottom-0 h-32 w-32 rounded-full bg-[var(--theme-aura-two)] blur-3xl skeleton-float" />

                    <div className="relative flex flex-col gap-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="space-y-2">
                                <div className="h-3 w-36 skeleton-shimmer" />
                                <div className="h-5 w-64 skeleton-shimmer" />
                            </div>
                            <div className="h-8 w-24 skeleton-shimmer" />
                        </div>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                            <div className="h-22 skeleton-shimmer" />
                            <div className="h-22 skeleton-shimmer" />
                            <div className="h-22 skeleton-shimmer" />
                        </div>

                        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                            <div className="h-52 skeleton-shimmer" />
                            <div className="h-52 skeleton-shimmer" />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
