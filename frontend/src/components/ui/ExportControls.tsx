// React import not required with the new JSX transform
import { Download, FileText, Cloud } from "lucide-react";

interface Props {
    onCSV: () => void;
    onPDF: () => void;
    onDrive: () => void;
    exporting?: boolean;
}

export default function ExportControls({
    onCSV,
    onPDF,
    onDrive,
    exporting = false,
}: Props) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
                onClick={onCSV}
                disabled={exporting}
                className="flex h-14 items-center justify-center gap-2 border border-[var(--theme-border)] bg-[var(--theme-surface)] px-4  transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ color: "var(--theme-text)" }}
            >
                <Download size={20} />
                <span className="text-sm font-medium">Export Full CSV</span>
            </button>

            <button
                onClick={onPDF}
                disabled={exporting}
                className="flex h-14 items-center justify-center gap-2 border border-[var(--theme-border)] bg-[var(--theme-surface)] px-4  transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ color: "var(--theme-text)" }}
            >
                <FileText size={20} />
                <span className="text-sm font-medium">Export Full PDF</span>
            </button>

            <button
                onClick={onDrive}
                className="flex h-14 items-center justify-center gap-2 border border-[var(--theme-border)] bg-[var(--theme-surface)] px-4  transition-colors hover:bg-white/5"
                style={{ color: "var(--theme-text)" }}
            >
                <Cloud size={20} />
                <span className="text-sm font-medium">Sync to Drive</span>
            </button>
        </div>
    );
}
