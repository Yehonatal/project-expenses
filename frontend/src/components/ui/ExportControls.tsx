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
                className="flex items-center justify-center space-x-2 glass-button rounded-xl p-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ color: "var(--theme-text)" }}
            >
                <Download size={24} />
                <span className="text-sm font-medium">Export CSV</span>
            </button>

            <button
                onClick={onPDF}
                disabled={exporting}
                className="flex items-center justify-center space-x-2 glass-button rounded-xl p-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ color: "var(--theme-text)" }}
            >
                <FileText size={24} />
                <span className="text-sm font-medium">Export PDF</span>
            </button>

            <button
                onClick={onDrive}
                className="flex items-center justify-center space-x-2 glass-button rounded-xl p-4 transition-colors"
                style={{ color: "var(--theme-text)" }}
            >
                <Cloud size={24} />
                <span className="text-sm font-medium">Sync to Drive</span>
            </button>
        </div>
    );
}
