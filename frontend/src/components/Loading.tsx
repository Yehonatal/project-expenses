import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{
                backgroundColor: "var(--theme-background)",
                opacity: 0.9,
            }}
        >
            <div className="animate-spin">
                <Loader2 size={45} style={{ color: "var(--theme-primary)" }} />
            </div>
        </div>
    );
}
