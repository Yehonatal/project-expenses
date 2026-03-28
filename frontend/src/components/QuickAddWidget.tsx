import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Plus, X } from "lucide-react";
import type { Template } from "../types/template";
import { getTemplates } from "../api/api";
import { createExpenseOfflineAware } from "../services/offlineExpenseQueue";
import { uiControl } from "../utils/uiClasses";
import InfoTooltip from "./ui/InfoTooltip";

type QuickAddWidgetProps = {
    onExpenseAdded?: () => void;
    onToast?: (message: string, type: "success" | "error" | "info") => void;
};

type QuickAddForm = {
    date: string;
    description: string;
    amount: string;
    type: string;
    included: boolean;
};

const initialForm = (): QuickAddForm => ({
    date: new Date().toISOString().split("T")[0],
    description: "",
    amount: "",
    type: "",
    included: true,
});

export default function QuickAddWidget({
    onExpenseAdded,
    onToast,
}: QuickAddWidgetProps) {
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState("");
    const [form, setForm] = useState<QuickAddForm>(initialForm);

    useEffect(() => {
        let mounted = true;
        const loadTemplates = async () => {
            try {
                const response = await getTemplates({
                    status: "active",
                    category: "expense",
                });
                if (!mounted) return;
                setTemplates(response.data || []);
            } catch (error) {
                console.error("Failed to load quick-add templates", error);
            }
        };

        void loadTemplates();

        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        const handleShortcut = (event: KeyboardEvent) => {
            const isToggle =
                (event.ctrlKey || event.metaKey) &&
                event.shiftKey &&
                event.key.toLowerCase() === "a";

            if (isToggle) {
                event.preventDefault();
                setOpen((prev) => !prev);
                return;
            }

            if (event.key === "Escape") {
                setOpen(false);
            }
        };

        window.addEventListener("keydown", handleShortcut);
        return () => window.removeEventListener("keydown", handleShortcut);
    }, []);

    useEffect(() => {
        const handleToggleEvent = () => {
            setOpen((prev) => !prev);
        };

        window.addEventListener(
            "quick-add:toggle",
            handleToggleEvent as EventListener,
        );

        return () =>
            window.removeEventListener(
                "quick-add:toggle",
                handleToggleEvent as EventListener,
            );
    }, []);

    const topTemplates = useMemo(() => templates.slice(0, 6), [templates]);

    const applyTemplate = (templateId: string) => {
        setSelectedTemplate(templateId);
        const template = templates.find(
            (item) => (item._id || item.id) === templateId,
        );
        if (!template) return;

        setForm((prev) => ({
            ...prev,
            description: template.description || prev.description,
            type: (template.type || prev.type || "").toLowerCase(),
            amount: String(template.price || prev.amount || ""),
        }));
    };

    const submitQuickAdd = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (submitting) return;

        const amount = Number(form.amount);
        if (!form.description.trim()) {
            onToast?.("Description is required.", "error");
            return;
        }
        if (!form.type.trim()) {
            onToast?.("Type is required.", "error");
            return;
        }
        if (!Number.isFinite(amount) || amount <= 0) {
            onToast?.("Amount must be greater than zero.", "error");
            return;
        }

        setSubmitting(true);
        try {
            const result = await createExpenseOfflineAware({
                date: form.date,
                description: form.description.trim(),
                amount,
                included: form.included,
                type: form.type.trim().toLowerCase(),
                tags: [],
                isRecurring: false,
                frequency: "monthly",
            });

            if (result.queued) {
                onToast?.(
                    "Quick add saved offline and queued for sync.",
                    "info",
                );
            } else {
                onToast?.("Expense added instantly.", "success");
            }

            setForm(initialForm());
            setSelectedTemplate("");
            setOpen(false);
            onExpenseAdded?.();
        } catch (error) {
            console.error("Quick add failed", error);
            onToast?.("Could not quick add expense.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="quick-add-panel-anchor fixed bottom-4 z-40 flex flex-col gap-2 pointer-events-none">
            {open && (
                <div className="pointer-events-auto w-[min(92vw,380px)] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3 shadow-lg ">
                    <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--theme-text-secondary)]">
                                Quick add
                            </p>
                            <h3 className="app-heading text-sm font-semibold">
                                Mini Expense Panel
                            </h3>
                        </div>
                        <button
                            type="button"
                            className={uiControl.button}
                            onClick={() => setOpen(false)}
                            aria-label="Close quick add"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="mb-3">
                        <label className={uiControl.label}>Template</label>
                        <select
                            className={uiControl.select}
                            value={selectedTemplate}
                            onChange={(e) => applyTemplate(e.target.value)}
                        >
                            <option value="">Start blank</option>
                            {topTemplates.map((template) => {
                                const id = template._id || template.id || "";
                                if (!id) return null;
                                return (
                                    <option key={id} value={id}>
                                        {template.description}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    <form onSubmit={submitQuickAdd} className="space-y-2.5">
                        <div>
                            <label className={uiControl.label}>
                                Description
                            </label>
                            <input
                                value={form.description}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        description: e.target.value,
                                    }))
                                }
                                className={uiControl.input}
                                placeholder="Coffee, taxi, groceries"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className={uiControl.label}>
                                    Amount
                                </label>
                                <input
                                    type="number"
                                    step="1"
                                    value={form.amount}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            amount: e.target.value,
                                        }))
                                    }
                                    className={uiControl.inputRight}
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className={uiControl.label}>Type</label>
                                <input
                                    value={form.type}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            type: e.target.value,
                                        }))
                                    }
                                    className={uiControl.input}
                                    placeholder="food"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className={uiControl.label}>Date</label>
                                <input
                                    type="date"
                                    value={form.date}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            date: e.target.value,
                                        }))
                                    }
                                    className={uiControl.input}
                                />
                            </div>
                            <label className="mt-6 inline-flex items-center gap-2 text-xs text-[var(--theme-text-secondary)]">
                                <input
                                    type="checkbox"
                                    checked={!form.included}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            included: !e.target.checked,
                                        }))
                                    }
                                    className={uiControl.checkbox}
                                />
                                Exclude from total
                            </label>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1">
                            <p className="text-[11px] text-[var(--theme-text-secondary)] inline-flex items-center gap-1">
                                Shortcut: Ctrl/Cmd+Shift+A toggle, Enter save,
                                Esc close
                                <InfoTooltip label="Why this matters: keyboard flow helps you log expenses quickly before you forget small transactions." />
                            </p>
                            <button
                                type="submit"
                                className={uiControl.buttonPrimary}
                                disabled={submitting}
                            >
                                <Plus className="h-4 w-4" />
                                {submitting ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
