const Template = require("../models/templateModel");
const mongoose = require("mongoose");

exports.getTemplates = async (req, res) => {
    try {
        const templates = await Template.find({ userId: req.user._id }).sort({
            createdAt: -1,
        });
        res.json(templates);
    } catch (err) {
        console.error("getTemplates error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.addTemplate = async (req, res) => {
    try {
        const { description, type, price } = req.body;
        if (!description || !type || price == null) {
            return res
                .status(400)
                .json({ message: "description, type and price required" });
        }

        const t = new Template({
            description,
            type,
            price: Number(price),
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
