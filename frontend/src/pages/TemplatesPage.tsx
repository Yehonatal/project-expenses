import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Trash2, Plus } from "lucide-react";
import API from "../api/api";

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
                await API.post("/types", { name: usedType });
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
        } catch (err) {
            console.error("Failed to add template", err);
            alert("Failed to add template");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await API.delete(`/templates/${id}`);
            setTemplates((ts) =>
                ts.filter((t) => String(t._id ?? t.id) !== String(id))
            );
        } catch (err) {
            console.error("Failed to delete template", err);
            alert("Failed to delete template");
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-xl font-semibold text-brown mb-3">Templates</h1>

            <form onSubmit={handleAdd} className="flex gap-3 items-center mb-4">
                <input
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Description"
                    className="border border-olive rounded px-3 py-1.5 bg-sand text-brown"
                />

                <div className="relative">
                    <input
                        list="template-type-suggestions"
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                        placeholder="Type"
                        className="border border-olive rounded px-3 py-1.5 bg-sand text-brown"
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
                    className="border border-olive rounded px-3 py-1.5 bg-sand text-brown w-24 text-right"
                />

                <button className="bg-clay text-white px-3 py-1.5 rounded flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add
                </button>
            </form>

            <div className="space-y-2">
                {templates.length === 0 && (
                    <div className="text-brown/60">No templates yet.</div>
                )}
                {templates.map((t) => {
                    const safeId = String(t._id ?? t.id ?? Date.now());
                    return (
                        <div
                            key={safeId}
                            className="flex items-center justify-between bg-white border border-sand rounded p-2"
                        >
                            <div className="flex items-center gap-4">
                                <div className="font-semibold text-brown">
                                    {t.description}
                                </div>
                                <div className="text-sm text-gray-600 capitalize">
                                    {t.type}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="font-semibold text-brown">
                                    Birr {String(t.price)}
                                </div>
                                <button
                                    onClick={() => handleDelete(safeId)}
                                    className="text-clay"
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
