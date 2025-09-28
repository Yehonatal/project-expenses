import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import PageContainer from "../components/ui/PageContainer";
import GlassCard from "../components/ui/GlassCard";
import CompactCard from "../components/ui/CompactCard";
import { Trash2, Plus } from "lucide-react";
import API from "../api/api";
import Toast from "../components/Toast";

type Template = {
    id?: string;
    _id?: string;
    description: string;
    type: string;
    price: number | string;
};

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [types, setTypes] = useState<string[]>([]);
    const [toast, setToast] = useState<
        { message: string; type: "success" | "error" | "info" } | undefined
    >(undefined);
    const [form, setForm] = useState({ description: "", type: "", price: "" });

    const load = async () => {
        try {
            const res = await API.get<Template[]>("/templates");
            setTemplates(res.data);
        } catch (err) {
            console.error("Failed to load templates", err);
        }
    };

    useEffect(() => {
        void load();
        let mounted = true;
        (async () => {
            try {
                const r = await API.get<string[]>("/types");
                if (!mounted) return;
                setTypes(r.data || []);
            } catch {
                if (!mounted) return;
                setTypes(["transport", "food", "drink", "internet", "other"]);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target as HTMLInputElement;
        setForm((s) => ({ ...s, [name]: value }));
    };

    const handleAdd = async (e: FormEvent) => {
        e.preventDefault();
        if (!form.description || !form.price) return;
        try {
            const usedType = form.type || "other";
            // ensure the type is persisted server-side (non-fatal)
            try {
                const norm = (usedType || "other").trim().toLowerCase();
                await API.post("/types", { name: norm });
                setToast({ message: `Saved type "${norm}"`, type: "info" });
            } catch {
                // ignore errors creating the type here; server will still accept template
            }

            const res = await API.post<Template>("/templates", {
                description: form.description,
                type: usedType,
                price: Number(form.price),
            });
            // prepend
            setTemplates((ts) => [res.data, ...ts]);
            setForm({ description: "", type: "", price: "" });
            setToast({
                message: "Template added successfully!",
                type: "success",
            });
        } catch (err) {
            console.error("Failed to add template", err);
            setToast({ message: "Failed to add template", type: "error" });
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await API.delete(`/templates/${id}`);
            setTemplates((ts) =>
                ts.filter((t) => String(t._id ?? t.id) !== String(id))
            );
            setToast({
                message: "Template deleted successfully!",
                type: "success",
            });
        } catch (err) {
            console.error("Failed to delete template", err);
            setToast({ message: "Failed to delete template", type: "error" });
        }
    };

    return (
        <PageContainer title="Templates" className="space-y-8">
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
