type Props = {
    title?: string;
};

export default function PageSkeleton({ title = "Loading" }: Props) {
    return (
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

            <p className="skeleton-caption">{title}...</p>
        </div>
    );
}
