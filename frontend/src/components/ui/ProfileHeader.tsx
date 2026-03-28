interface Props {
    name: string;
    email: string;
    picture?: string | null;
    onImageError?: () => void;
}

export default function ProfileHeader({
    name,
    email,
    picture,
    onImageError,
}: Props) {
    return (
        <div className="mb-4 flex items-center gap-4">
            {!picture ? (
                <div
                    className="flex h-16 w-16 items-center justify-center border border-[var(--theme-border)] bg-[var(--theme-surface)] text-sm"
                    style={{ backgroundColor: "var(--theme-primary)" }}
                >
                    💰
                </div>
            ) : (
                <img
                    src={picture}
                    alt={name}
                    className="h-16 w-16 border border-[var(--theme-border)] object-cover"
                    onError={onImageError}
                />
            )}
            <div>
                <h3 className="app-heading text-base font-semibold text-[var(--theme-text)]">
                    {name}
                </h3>
                <p className="text-sm text-[var(--theme-text-secondary)]">
                    {email}
                </p>
            </div>
        </div>
    );
}
