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
                className="absolute inset-0 backdrop-blur-lg"
                style={{
                    backgroundColor: "var(--theme-background)",
                    opacity: 0.8,
                    backdropFilter: "blur(12px)",
                }}
                onClick={onClose}
            />

            <div
                className="relative max-w-md w-full mx-4 rounded-lg shadow-lg"
                style={{
                    backgroundColor: "var(--theme-surface)",
                    border: "1px solid var(--theme-border)",
                }}
            >
                {/* Header */}
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
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
                        style={{
                            backgroundColor: "var(--theme-surface)",
                            border: "none",
                            color: "var(--theme-text-secondary)",
                        }}
                        aria-label="Close modal"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4">{children}</div>

                {/* Actions */}
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
