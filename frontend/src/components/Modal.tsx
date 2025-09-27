import { X } from "lucide-react";
import type { ReactNode } from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    actions?: ReactNode;
}

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    actions,
}: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 backdrop-blur-xl"
                style={{
                    backdropFilter: "blur(20px)",
                }}
                onClick={onClose}
            />

            <div className="relative max-w-lg w-full mx-4 glass-card rounded-lg shadow-xl border border-theme-glass-border/50">
                <div
                    className="flex items-center justify-between p-4 border-b"
                    style={{ borderColor: "var(--theme-border)" }}
                >
                    <h3
                        className="text-xs sm:text-sm lg:text-sm font-semibold"
                        style={{ color: "var(--theme-text)" }}
                    >
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-theme-surface/50 transition-all duration-200 cursor-pointer"
                        style={{
                            color: "var(--theme-text-secondary)",
                        }}
                        aria-label="Close modal"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-4">{children}</div>

                {actions && (
                    <div
                        className="flex justify-end gap-3 p-4 border-t"
                        style={{ borderColor: "var(--theme-border)" }}
                    >
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
}
