import PageContainer from "../components/ui/PageContainer";
import GlassCard from "../components/ui/GlassCard";
import CompactCard from "../components/ui/CompactCard";
import { Trash2, Plus } from "lucide-react";
import Toast from "../components/Toast";
import PageSkeleton from "../components/ui/PageSkeleton";
import { useTemplatesPageData } from "../hooks/useTemplatesPageData";
import { uiControl } from "../utils/uiClasses";

export default function TemplatesPage() {
    const {
        templates,
        types,
        loading,
        toast,
        form,
        templateCount,
        typeCount,
        handleChange,
        handleAdd,
        handleDelete,
    } = useTemplatesPageData();

    if (loading) {
        return <PageSkeleton title="Loading templates" />;
    }

    return (
        <PageContainer
            title="Templates"
            subtitle="Save reusable entries for subscriptions, bills, and repeating payments."
            className="space-y-6 sm:space-y-8"
        >
            <div className="border border-[var(--theme-glass-border)] bg-gradient-to-br from-white/60 to-white/10 p-4 sm:p-5">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1 space-y-2">
                        <div
                            className="text-xs uppercase tracking-[0.2em]"
                            style={{ color: "var(--theme-text-secondary)" }}
                        >
                            Recurring presets
                        </div>
                        <h2 className="app-heading text-xl font-semibold tracking-[-0.01em] sm:text-2xl">
                            Save recurring expenses as templates
                        </h2>
                        <p
                            className="text-sm"
                            style={{ color: "var(--theme-text-secondary)" }}
                        >
                            Reuse templates for subscriptions, utilities, or
                            recurring payments.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:flex sm:flex-wrap sm:gap-6">
                        <div>
                            <div
                                className="text-xs uppercase tracking-[0.2em]"
                                style={{ color: "var(--theme-text-secondary)" }}
                            >
                                Templates
                            </div>
                            <div className="text-2xl font-semibold">
                                {templateCount}
                            </div>
                        </div>
                        <div>
                            <div
                                className="text-xs uppercase tracking-[0.2em]"
                                style={{ color: "var(--theme-text-secondary)" }}
                            >
                                Types covered
                            </div>
                            <div className="text-2xl font-semibold">
                                {typeCount}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div className="border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] rounded-none p-3">
                    <div
                        className="text-xs font-semibold uppercase"
                        style={{ color: "var(--theme-text-secondary)" }}
                    >
                        Last update
                    </div>
                    <div className="text-lg font-semibold sm:text-xl">
                        {templates.length > 0 ? "Active" : "Add template"}
                    </div>
                </div>
                <div className="border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] rounded-none p-3">
                    <div
                        className="text-xs font-semibold uppercase"
                        style={{ color: "var(--theme-text-secondary)" }}
                    >
                        Suggested types
                    </div>
                    <div className="text-lg font-semibold sm:text-xl">
                        {types.length}
                    </div>
                </div>
                <div className="border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] rounded-none p-3">
                    <div
                        className="text-xs font-semibold uppercase"
                        style={{ color: "var(--theme-text-secondary)" }}
                    >
                        Next action
                    </div>
                    <div className="text-lg font-semibold sm:text-xl">
                        Create template
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleAdd} className="space-y-4">
                        <GlassCard>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label
                                        className={uiControl.label}
                                        style={{
                                            color: "var(--theme-text-secondary)",
                                        }}
                                    >
                                        Description
                                    </label>
                                    <input
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        placeholder="Description"
                                        className={uiControl.input}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label
                                        className={uiControl.label}
                                        style={{
                                            color: "var(--theme-text-secondary)",
                                        }}
                                    >
                                        Type
                                    </label>
                                    <div className="relative">
                                        <input
                                            list="template-type-suggestions"
                                            name="type"
                                            value={form.type}
                                            onChange={handleChange}
                                            placeholder="Type"
                                            className={uiControl.input}
                                        />
                                        <datalist id="template-type-suggestions">
                                            {types.map((t) => (
                                                <option key={t} value={t} />
                                            ))}
                                        </datalist>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label
                                        className={uiControl.label}
                                        style={{
                                            color: "var(--theme-text-secondary)",
                                        }}
                                    >
                                        Price
                                    </label>
                                    <input
                                        name="price"
                                        value={form.price}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        type="number"
                                        step="0.01"
                                        className={uiControl.input}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    className={`w-full sm:w-auto ${uiControl.buttonPrimary}`}
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Template
                                </button>
                            </div>
                        </GlassCard>
                    </form>
                </div>

                <div className="space-y-6">
                    <Toast message={toast?.message} type={toast?.type} />

                    <div className="space-y-4">
                        {templates.length === 0 && (
                            <GlassCard>
                                <div
                                    className="text-center text-sm"
                                    style={{
                                        color: "var(--theme-text-secondary)",
                                    }}
                                >
                                    No templates yet.
                                </div>
                            </GlassCard>
                        )}
                        {templates.map((t) => {
                            const safeId = String(t._id ?? t.id ?? Date.now());
                            return (
                                <CompactCard key={safeId}>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                            <div
                                                className="text-xs sm:text-sm font-semibold"
                                                style={{
                                                    color: "var(--theme-text)",
                                                }}
                                            >
                                                {t.description}
                                            </div>
                                            <div
                                                className="text-xs capitalize"
                                                style={{
                                                    color: "var(--theme-text-secondary)",
                                                }}
                                            >
                                                {t.type}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between sm:justify-end gap-3">
                                            <div
                                                className="text-xs sm:text-sm font-semibold"
                                                style={{
                                                    color: "var(--theme-text)",
                                                }}
                                            >
                                                Birr {String(t.price)}
                                            </div>
                                            <button
                                                onClick={() =>
                                                    handleDelete(safeId)
                                                }
                                                className="flex h-10 w-10 items-center justify-center border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] backdrop-blur-[20px] transition-colors hover:bg-red-500/20"
                                                style={{ color: "#ef4444" }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </CompactCard>
                            );
                        })}
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}
