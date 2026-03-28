import {
    useEffect,
    useMemo,
    useState,
    type ChangeEvent,
    type FormEvent,
} from "react";
import API from "../api/api";
import type { Template } from "../types/template";

const FALLBACK_TYPES = ["transport", "food", "drink", "internet", "other"];

export function useTemplatesPageData() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [types, setTypes] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<
        { message: string; type: "success" | "error" | "info" } | undefined
    >(undefined);
    const [form, setForm] = useState({ description: "", type: "", price: "" });

    useEffect(() => {
        let mounted = true;
        setLoading(true);

        const loadAll = async () => {
            try {
                const [templatesRes, typesRes] = await Promise.allSettled([
                    API.get<Template[]>("/templates"),
                    API.get<string[]>("/types"),
                ]);

                if (!mounted) return;

                if (templatesRes.status === "fulfilled") {
                    setTemplates(templatesRes.value.data || []);
                }

                if (typesRes.status === "fulfilled") {
                    setTypes(typesRes.value.data || []);
                } else {
                    setTypes(FALLBACK_TYPES);
                }
            } catch (err) {
                console.error("Failed to load templates", err);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        void loadAll();

        return () => {
            mounted = false;
        };
    }, []);

    const templateCount = templates.length;
    const typeCount = useMemo(
        () => new Set(templates.map((t) => t.type)).size,
        [templates],
    );

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target as HTMLInputElement;
        setForm((s) => ({ ...s, [name]: value }));
    };

    const handleAdd = async (e: FormEvent) => {
        e.preventDefault();
        if (!form.description || !form.price) return;
        try {
            const usedType = form.type || "other";
            try {
                const norm = usedType.trim().toLowerCase();
                await API.post("/types", { name: norm });
                setToast({ message: `Saved type \"${norm}\"`, type: "info" });
            } catch {
                // non-fatal
            }

            const res = await API.post<Template>("/templates", {
                description: form.description,
                type: usedType,
                price: Number(form.price),
            });

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
                ts.filter((t) => String(t._id ?? t.id) !== String(id)),
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

    return {
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
    };
}
