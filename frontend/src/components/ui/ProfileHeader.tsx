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
        <div className="flex items-center space-x-4 mb-4">
            {!picture ? (
                <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white text-sm sm:text-base lg:text-base"
                    style={{ backgroundColor: "var(--theme-primary)" }}
                >
                    💰
                </div>
            ) : (
                <img
                    src={picture}
                    alt={name}
                    className="w-16 h-16 rounded-full"
                    onError={onImageError}
                />
            )}
            <div>
                <h3
                    className="text-xs sm:text-sm lg:text-sm font-semibold"
                    style={{ color: "var(--theme-primary)" }}
                >
                    {name}
                </h3>
                <p style={{ color: "var(--theme-textSecondary)" }}>{email}</p>
            </div>
        </div>
    );
}
