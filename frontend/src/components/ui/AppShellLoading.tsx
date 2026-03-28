export default function AppShellLoading() {
    return (
        <div className="app-shell app-shell-loading">
            <aside className="app-sidebar skeleton-sidebar">
                <div className="skeleton-line w-28" />
                <div className="skeleton-panel" />
                <div className="skeleton-panel" />
            </aside>
            <main className="app-content">
                <div className="page-skeleton">
                    <div className="skeleton-hero">
                        <div className="skeleton-line w-40" />
                        <div className="skeleton-line w-72" />
                        <div className="skeleton-line w-64" />
                    </div>
                    <div className="skeleton-kpis">
                        <div className="skeleton-card" />
                        <div className="skeleton-card" />
                        <div className="skeleton-card" />
                    </div>
                    <div className="skeleton-grid">
                        <div className="skeleton-panel" />
                        <div className="skeleton-panel" />
                    </div>
                </div>
            </main>
        </div>
    );
}
