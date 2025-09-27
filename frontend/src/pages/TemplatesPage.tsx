import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
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
        <div
            className="p-6 max-w-5xl mx-auto"
            style={{
                backgroundColor: "var(--theme-background)",
                color: "var(--theme-text)",
            }}
        >
            <h1
                className="text-sm sm:text-base lg:text-base font-bold mb-6"
                style={{ color: "var(--theme-text)" }}
            >
                Templates
            </h1>

            <form
                onSubmit={handleAdd}
                className="flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center mb-4"
            >
                <input
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Description"
                    className="rounded px-3 py-1.5 flex-1 min-w-[140px] transition-all"
                    style={{
                        backgroundColor: "var(--theme-surface)",
                        borderColor: "var(--theme-border)",
                        color: "var(--theme-text)",
                    }}
                />

                <div className="relative">
                    <input
                        list="template-type-suggestions"
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                        placeholder="Type"
                        className="rounded px-3 py-1.5 w-40 transition-all"
                        style={{
                            backgroundColor: "var(--theme-surface)",
                            borderColor: "var(--theme-border)",
                            color: "var(--theme-text)",
                        }}
                    />
                    <datalist id="template-type-suggestions">
                        {types.map((t) => (
                            <option key={t} value={t} />
                        ))}
                    </datalist>
                </div>

                <input
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="Price"
                    className="rounded px-3 py-1.5 w-24 text-right transition-all"
                    style={{
                        backgroundColor: "var(--theme-surface)",
                        borderColor: "var(--theme-border)",
                        color: "var(--theme-text)",
                    }}
                />

                <div className="w-full sm:w-auto">
                    <button
                        className="px-3 py-1.5 rounded flex items-center gap-2 w-full sm:w-auto justify-center transition-all"
                        style={{
                            backgroundColor: "var(--theme-primary)",
                            color: "white",
                        }}
                    >
                        <Plus className="w-4 h-4" /> Add
                    </button>
                </div>
            </form>
            <Toast message={toast?.message} type={toast?.type} />

            <div className="space-y-2">
                {templates.length === 0 && (
                    <div style={{ color: "var(--theme-text-secondary)" }}>
                        No templates yet.
                    </div>
                )}
                {templates.map((t) => {
                    const safeId = String(t._id ?? t.id ?? Date.now());
                    return (
                        <div
                            key={safeId}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded p-3 gap-2"
                            style={{
                                backgroundColor: "var(--theme-surface)",
                                border: `1px solid var(--theme-border)`,
                            }}
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                <div
                                    className="font-semibold"
                                    style={{ color: "var(--theme-text)" }}
                                >
                                    {t.description}
                                </div>
                                <div
                                    className="text-sm capitalize"
                                    style={{
                                        color: "var(--theme-text-secondary)",
                                    }}
                                >
                                    {t.type}
                                </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-3">
                                <div
                                    className="font-semibold"
                                    style={{ color: "var(--theme-text)" }}
                                >
                                    Birr {String(t.price)}
                                </div>
                                <button
                                    onClick={() => handleDelete(safeId)}
                                    className="transition-colors duration-200"
                                    style={{
                                        color: "var(--theme-text-secondary)",
                                    }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
