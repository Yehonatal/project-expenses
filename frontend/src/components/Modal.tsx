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
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={onClose}
            />

            {/* Modal */}
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
                        className="text-lg font-semibold"
                        style={{ color: "var(--theme-text)" }}
                    >
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded hover:opacity-70 transition-opacity"
                        style={{ color: "var(--theme-textSecondary)" }}
                    >
                        <X className="w-5 h-5" />
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
