export default function AppShellLoading() {
    return (
        <div className="grid min-h-screen grid-cols-1 gap-2 p-2 lg:grid-cols-[174px_1fr]">
            <aside className="flex animate-pulse flex-col gap-3 border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] p-2">
                <div className="h-3 w-28 bg-[var(--theme-border)]" />
                <div className="h-56 border border-[var(--theme-border)] bg-[var(--theme-surface)]" />
                <div className="h-56 border border-[var(--theme-border)] bg-[var(--theme-surface)]" />
            </aside>
            <main className="flex flex-col gap-4 px-2 pb-6 pt-1">
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
                </div>
            </main>
        </div>
    );
}
