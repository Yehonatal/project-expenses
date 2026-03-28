import { useEffect, useMemo, useState } from "react";
import {
    createTemplate,
    getTemplates,
    removeTemplate,
    updateTemplate,
} from "../api/api";
import type { Template } from "../types/template";

const DEFAULT_PROVIDER = "any";

const getToday = () => new Date().toISOString().split("T")[0];

export type RecurringForm = {
    description: string;
    type: string;
    price: string;
    category: "expense" | "income";
    frequency: "weekly" | "monthly" | "yearly";
    dayOfMonth: string;
    startDate: string;
    endDate: string;
    provider: string;
    status: "active" | "paused";
};

const emptyForm: RecurringForm = {
    description: "",
    type: "other",
    price: "",
    category: "expense",
    frequency: "monthly",
    dayOfMonth: String(new Date().getDate()),
    startDate: getToday(),
    endDate: "",
    provider: DEFAULT_PROVIDER,
    status: "active",
};

export function useRecurringPageData() {
    const [loading, setLoading] = useState(true);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [categoryFilter, setCategoryFilter] = useState<
        "all" | "expense" | "income"
    >("all");
    const [statusFilter, setStatusFilter] = useState<
        "all" | "active" | "paused"
    >("active");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(
        null,
    );
    const [form, setForm] = useState<RecurringForm>(emptyForm);
    const [toast, setToast] = useState<
        { message: string; type: "success" | "error" | "info" } | undefined
    >();

    const fetchTemplates = async () => {
        try {
            const res = await getTemplates();
            setTemplates(
                (res.data || []).filter((t) => t.isRecurring !== false),
            );
        } catch (error) {
            console.error("Failed to load recurring templates", error);
            setToast({
                message: "Failed to load recurring transactions",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchTemplates();
    }, []);

    const providers = useMemo(() => {
        const next = new Set<string>();
        templates.forEach((t) => {
            if (t.provider) next.add(t.provider);
        });
        if (!next.size) next.add(DEFAULT_PROVIDER);
        return Array.from(next);
    }, [templates]);

    const filteredTemplates = useMemo(() => {
        return templates.filter((t) => {
            const categoryMatch =
                categoryFilter === "all"
                    ? true
                    : (t.category || "expense") === categoryFilter;
            const statusMatch =
                statusFilter === "all"
                    ? true
                    : (t.status || "active") === statusFilter;
            return categoryMatch && statusMatch;
        });
    }, [templates, categoryFilter, statusFilter]);

    const counts = useMemo(() => {
        const expenseCount = templates.filter(
            (t) => (t.category || "expense") === "expense",
        ).length;
        const incomeCount = templates.filter(
            (t) => (t.category || "expense") === "income",
        ).length;
        return {
            all: templates.length,
            expense: expenseCount,
            income: incomeCount,
        };
    }, [templates]);

    const openCreateModal = () => {
        setForm(emptyForm);
        setEditingTemplate(null);
        setShowCreateModal(true);
    };

    const openEditModal = (template: Template) => {
        setEditingTemplate(template);
        setForm({
            description: template.description,
            type: template.type,
            price: String(template.price),
            category: template.category || "expense",
            frequency: template.frequency || "monthly",
            dayOfMonth: template.dayOfMonth
                ? String(template.dayOfMonth)
                : String(new Date().getDate()),
            startDate: template.startDate
                ? new Date(template.startDate).toISOString().split("T")[0]
                : getToday(),
            endDate: template.endDate
                ? new Date(template.endDate).toISOString().split("T")[0]
                : "",
            provider: template.provider || DEFAULT_PROVIDER,
            status: template.status || "active",
        });
        setShowCreateModal(true);
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setEditingTemplate(null);
    };

    const submitForm = async () => {
        if (!form.description.trim() || !form.price) {
            setToast({
                message: "Name and amount are required",
                type: "error",
            });
            return;
        }

        const payload = {
            description: form.description.trim(),
            type: form.type.trim().toLowerCase() || "other",
            price: Number(form.price),
            category: form.category,
            frequency: form.frequency,
            dayOfMonth:
                form.frequency === "monthly"
                    ? Number(form.dayOfMonth)
                    : undefined,
            startDate: form.startDate,
            endDate: form.endDate || undefined,
            provider: form.provider || DEFAULT_PROVIDER,
            status: form.status,
            isRecurring: true,
        };

        try {
            if (editingTemplate?._id) {
                const res = await updateTemplate(editingTemplate._id, payload);
                setTemplates((prev) =>
                    prev.map((t) =>
                        t._id === editingTemplate._id ? res.data : t,
                    ),
                );
                setToast({
                    message: "Recurring transaction updated",
                    type: "success",
                });
            } else {
                const res = await createTemplate(payload);
                setTemplates((prev) => [res.data, ...prev]);
                setToast({
                    message: "Recurring transaction created",
                    type: "success",
                });
            }
            closeModal();
        } catch (error) {
            console.error("Failed to save recurring template", error);
            setToast({
                message: "Failed to save recurring transaction",
                type: "error",
            });
        }
    };

    const toggleStatus = async (template: Template) => {
        if (!template._id) return;
        const nextStatus =
            (template.status || "active") === "active" ? "paused" : "active";
        try {
            const res = await updateTemplate(template._id, {
                status: nextStatus,
            });
            setTemplates((prev) =>
                prev.map((t) => (t._id === template._id ? res.data : t)),
            );
            setToast({
                message:
                    nextStatus === "active"
                        ? "Recurring transaction resumed"
                        : "Recurring transaction paused",
                type: "success",
            });
        } catch (error) {
            console.error("Failed to update recurring status", error);
            setToast({ message: "Failed to update status", type: "error" });
        }
    };

    const remove = async (templateId: string) => {
        try {
            await removeTemplate(templateId);
            setTemplates((prev) => prev.filter((t) => t._id !== templateId));
            setToast({
                message: "Recurring transaction removed",
                type: "success",
            });
        } catch (error) {
            console.error("Failed to remove recurring template", error);
            setToast({
                message: "Failed to remove recurring transaction",
                type: "error",
            });
        }
    };

    return {
        loading,
        templates,
        providers,
        filteredTemplates,
        counts,
        categoryFilter,
        statusFilter,
        showCreateModal,
        editingTemplate,
        form,
        toast,
        setCategoryFilter,
        setStatusFilter,
        setForm,
        openCreateModal,
        openEditModal,
        closeModal,
        submitForm,
        toggleStatus,
        remove,
    };
}
