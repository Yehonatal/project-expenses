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
            const res = await API.post<Template>("/templates", {
                description: form.description,
                type: form.type || "other",
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

                <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="border border-olive rounded px-3 py-1.5 bg-sand text-brown"
                >
                    <option value="">Type</option>
                    <option value="transport">Transport</option>
                    <option value="food">Food</option>
                    <option value="drink">Drink</option>
                    <option value="internet">Internet</option>
                    <option value="other">Other</option>
                </select>

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
