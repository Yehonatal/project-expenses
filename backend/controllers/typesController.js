const Expense = require("../models/expenseModel");
const Template = require("../models/templateModel");
const Type = require("../models/typeModel");
const { normalizeType } = require("../utils/normalizeType");

exports.getTypes = async (req, res) => {
    try {
        // get distinct types from expenses
        const expenseTypes = await Expense.distinct("type");
        // get distinct types from templates
        const templateTypes = await Template.distinct("type");
        // get explicit saved types
        const savedTypes = await Type.find({}, { name: 1, _id: 0 }).lean();

        const savedNames = (savedTypes || []).map((t) => t.name);

        const all = Array.from(
            new Set([
                ...(expenseTypes || []),
                ...(templateTypes || []),
                ...savedNames,
            ])
        );
        res.json(all.sort());
    } catch (err) {
        console.error("getTypes error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.addType = async (req, res) => {
    try {
        const raw = req.body.name;
        const name = normalizeType(raw);
        if (!name) return res.status(400).json({ message: "name required" });
        if (name.length > 64)
            return res.status(400).json({ message: "name too long" });

        // upsert by normalized name
        const existing = await Type.findOne({ name });
        if (existing) return res.status(200).json(existing);

        const t = new Type({ name });
        const saved = await t.save();
        res.status(201).json(saved);
    } catch (err) {
        console.error("addType error:", err);
        // unique index error
        if (err.code === 11000) {
            const existing = await Type.findOne({
                name: normalizeType(req.body.name),
            });
            return res.status(200).json(existing);
        }
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
