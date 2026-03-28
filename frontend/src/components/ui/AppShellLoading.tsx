import { useEffect, useState } from "react";
import { Banknote, CreditCard, PiggyBank, Receipt, Wallet } from "lucide-react";

const loadingIcons = [Wallet, Receipt, CreditCard, PiggyBank, Banknote];

export default function AppShellLoading() {
    const [iconIndex, setIconIndex] = useState(0);

    useEffect(() => {
        const timer = window.setInterval(() => {
            setIconIndex((prev) => (prev + 1) % loadingIcons.length);
        }, 1100);

        return () => window.clearInterval(timer);
    }, []);

    const ActiveIcon = loadingIcons[iconIndex];

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--theme-background)] p-4 text-[var(--theme-text)]">
            <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_100%_0%,var(--theme-aura-one)_0%,transparent_36%),radial-gradient(circle_at_0%_100%,var(--theme-aura-two)_0%,transparent_40%)]" />
            <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_right,var(--theme-grid)_1px,transparent_1px),linear-gradient(to_bottom,var(--theme-grid)_1px,transparent_1px)] bg-[size:44px_44px] opacity-45" />

            <div className="pointer-events-none absolute top-8 left-1/2 flex -translate-x-1/2 items-center gap-3 text-[var(--theme-text-secondary)]">
                {loadingIcons.map((Icon, idx) => (
                    <span
                        key={idx}
                        className={`inline-flex h-8 w-8 items-center justify-center border border-[var(--theme-border)] bg-[var(--theme-surface)] transition-all duration-300 ${
                            idx === iconIndex
                                ? "scale-110 text-[var(--theme-accent)]"
                                : "opacity-50"
                        }`}
                    >
                        <Icon size={15} />
                    </span>
                ))}
            </div>

            <div className="w-full max-w-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] px-6 py-8 text-center ">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center border border-[var(--theme-border)] bg-[var(--theme-surface)] text-[var(--theme-accent)] loading-logo-pulse">
                    <ActiveIcon size={26} />
                </div>
                <h1 className="app-heading text-3xl font-semibold tracking-[-0.01em]">
                    Cashn't
                </h1>
                <p className="mt-1 text-sm text-[var(--theme-text-secondary)]">
                    Preparing your expenses dashboard
                </p>

                <div className="mx-auto mt-6 h-2 w-full max-w-md overflow-hidden border border-[var(--theme-border)] bg-[var(--theme-surface)]">
                    <div className="h-full w-[42%] loading-progress-bar" />
                </div>
            </div>
        </div>
    );
}
