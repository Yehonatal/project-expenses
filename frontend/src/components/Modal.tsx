import { X } from "lucide-react";
import { useEffect } from "react";
import type { ReactNode } from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: ReactNode;
    actions?: ReactNode;
    maxWidthClass?: string;
}

let openModalCount = 0;

export default function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    actions,
    maxWidthClass = "max-w-2xl",
}: ModalProps) {
    useEffect(() => {
        if (!isOpen) return;

        const body = document.body;
        const prevOverflow = body.style.overflow;

        openModalCount += 1;
        body.style.overflow = "hidden";

        return () => {
            openModalCount = Math.max(0, openModalCount - 1);
            if (openModalCount === 0) {
                body.style.overflow = prevOverflow;
            }
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
            <div
                className="absolute inset-0 bg-black/60"
                style={{
                    backdropFilter: "blur(4px)",
                }}
                onClick={onClose}
            />

            <div
                className={`relative mx-2 mb-2 w-[calc(100%-1rem)] max-h-[92vh] overflow-hidden border border-[var(--theme-glass-border)] bg-[var(--theme-background)] shadow-[0_24px_64px_rgba(0,0,0,0.35)] sm:mx-4 sm:mb-0 sm:w-full sm:max-h-[86vh] ${maxWidthClass}`}
            >
                <div
                    className="flex items-center justify-between border-b p-3 sm:p-4"
                    style={{ borderColor: "var(--theme-border)" }}
                >
                    <div className="min-w-0">
                        <h3
                            className="truncate text-sm font-semibold sm:text-base"
                            style={{ color: "var(--theme-text)" }}
                        >
                            {title}
                        </h3>
                        {description && (
                            <p className="mt-0.5 text-xs text-[var(--theme-text-secondary)]">
                                {description}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-10 w-10 cursor-pointer items-center justify-center border border-transparent transition-colors hover:border-[var(--theme-border)] hover:bg-[var(--theme-hover)]"
                        style={{
                            color: "var(--theme-text-secondary)",
                        }}
                        aria-label="Close modal"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="max-h-[calc(92vh-128px)] overflow-y-auto p-3 sm:max-h-[calc(86vh-132px)] sm:p-4">
                    {children}
                </div>

                {actions && (
                    <div
                        className="flex justify-end gap-2 border-t p-3 sm:gap-3 sm:p-4"
                        style={{ borderColor: "var(--theme-border)" }}
                    >
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
}
