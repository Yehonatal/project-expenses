const Template = require("../models/templateModel");
const mongoose = require("mongoose");

exports.getTemplates = async (req, res) => {
    try {
        const { status, category } = req.query;
        const filter = { userId: req.user._id };
        if (status && ["active", "paused"].includes(status)) {
            filter.status = status;
        }
        if (category && ["expense", "income"].includes(category)) {
            filter.category = category;
        }

        const templates = await Template.find(filter).sort({ createdAt: -1 });
        res.json(templates);
    } catch (err) {
        console.error("getTemplates error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.addTemplate = async (req, res) => {
    try {
        const {
            description,
            type,
            price,
            category,
            frequency,
            dayOfMonth,
            startDate,
            endDate,
            provider,
            status,
            isRecurring,
        } = req.body;
        if (!description || !type || price == null) {
            return res
                .status(400)
                .json({ message: "description, type and price required" });
        }

        const t = new Template({
            description,
            type,
            price: Number(price),
            category: category || "expense",
            frequency: frequency || "monthly",
            dayOfMonth:
                dayOfMonth == null || dayOfMonth === ""
                    ? undefined
                    : Number(dayOfMonth),
            startDate: startDate ? new Date(startDate) : new Date(),
            endDate: endDate ? new Date(endDate) : undefined,
            provider: provider || "any",
            status: status || "active",
            isRecurring:
                isRecurring !== undefined ? Boolean(isRecurring) : true,
            userId: req.user._id,
        });
        const saved = await t.save();
        res.status(201).json(saved);
    } catch (err) {
        console.error("addTemplate error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.deleteTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id))
            return res.status(400).json({ message: "Invalid ID" });
        const deleted = await Template.findByIdAndDelete(id);
        if (!deleted || deleted.userId.toString() !== req.user._id.toString())
            return res.status(404).json({ message: "Template not found" });
        res.json({ message: "Deleted", id: deleted._id });
    } catch (err) {
        console.error("deleteTemplate error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.updateTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid ID" });
        }

        const existing = await Template.findById(id);
        if (
            !existing ||
            existing.userId.toString() !== req.user._id.toString()
        ) {
            return res.status(404).json({ message: "Template not found" });
        }

        const updates = { ...req.body };
        if (updates.price != null) updates.price = Number(updates.price);
        if (updates.dayOfMonth != null && updates.dayOfMonth !== "") {
            updates.dayOfMonth = Number(updates.dayOfMonth);
        }
        if (updates.startDate) updates.startDate = new Date(updates.startDate);
        if (updates.endDate) updates.endDate = new Date(updates.endDate);

        const updated = await Template.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        });

        res.json(updated);
    } catch (err) {
        console.error("updateTemplate error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
