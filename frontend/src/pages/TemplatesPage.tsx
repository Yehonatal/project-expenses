import PageContainer from "../components/ui/PageContainer";
import GlassCard from "../components/ui/GlassCard";
import CompactCard from "../components/ui/CompactCard";
import { Trash2, Plus } from "lucide-react";
import Toast from "../components/Toast";
import PageSkeleton from "../components/ui/PageSkeleton";
import { useTemplatesPageData } from "../hooks/useTemplatesPageData";

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
        <PageContainer title="Templates" className="space-y-8">
            <div className="dashboard-hero flex flex-col lg:flex-row lg:items-center gap-6">
                <div className="flex-1 space-y-2">
                    <div
                        className="text-xs uppercase tracking-[0.2em]"
                        style={{ color: "var(--theme-text-secondary)" }}
                    >
                        Recurring presets
                    </div>
                    <h2 className="section-title text-2xl font-semibold">
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
                <div className="flex flex-wrap gap-6">
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

            <div className="kpi-strip">
                <div className="kpi-card">
                    <div
                        className="text-xs font-semibold uppercase"
                        style={{ color: "var(--theme-text-secondary)" }}
                    >
                        Last update
                    </div>
                    <div className="text-xl font-semibold">
                        {templates.length > 0 ? "Active" : "Add template"}
                    </div>
                </div>
                <div className="kpi-card">
                    <div
                        className="text-xs font-semibold uppercase"
                        style={{ color: "var(--theme-text-secondary)" }}
                    >
                        Suggested types
                    </div>
                    <div className="text-xl font-semibold">{types.length}</div>
                </div>
                <div className="kpi-card">
                    <div
                        className="text-xs font-semibold uppercase"
                        style={{ color: "var(--theme-text-secondary)" }}
                    >
                        Next action
                    </div>
                    <div className="text-xl font-semibold">Create template</div>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleAdd} className="space-y-4">
                        <GlassCard>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label
                                        className="text-sm font-medium"
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
                                        className="w-full glass-button rounded-xl"
                                        style={{ color: "var(--theme-text)" }}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label
                                        className="text-sm font-medium"
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
                                            className="w-full glass-button rounded-xl"
                                            style={{
                                                color: "var(--theme-text)",
                                            }}
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
                                        className="text-sm font-medium"
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
                                        className="w-full glass-button rounded-xl"
                                        style={{ color: "var(--theme-text)" }}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    className="glass-button rounded-xl flex items-center gap-2 font-medium transition-all duration-200 hover:glass-button/80"
                                    style={{
                                        backgroundColor: "var(--theme-accent)",
                                        color: "var(--theme-background)",
                                    }}
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
                                                className="w-10 h-10 rounded-full flex items-center justify-center glass-button hover:bg-red-500/20 transition-all duration-200 cursor-pointer"
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
