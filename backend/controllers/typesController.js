const Expense = require("../models/expenseModel");
const Template = require("../models/templateModel");
const Type = require("../models/typeModel");
const { normalizeType } = require("../utils/normalizeType");

exports.getTypes = async (req, res) => {
    try {
        const userId = req.user._id;
        // get distinct types from expenses
        const expenseTypes = await Expense.distinct("type", { userId });
        // get distinct types from templates
        const templateTypes = await Template.distinct("type", { userId });
        // get explicit saved types
        const savedTypes = await Type.find(
            { userId },
            { name: 1, _id: 0 },
        ).lean();

        const savedNames = (savedTypes || []).map((t) => t.name);

        const all = Array.from(
            new Set([
                ...(expenseTypes || []),
                ...(templateTypes || []),
                ...savedNames,
            ]),
        );
        res.json(all.sort());
    } catch (err) {
        console.error("getTypes error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.suggestTypes = async (req, res) => {
    try {
        const userId = req.user._id;
        const query = req.query.q || "";

        if (!query) {
            return res.json([]);
        }

        const filter = {
            userId,
            name: { $regex: query, $options: "i" },
        };

        const types = await Type.find(filter, { name: 1, _id: 0 })
            .limit(10)
            .lean();

        // Also check recent expenses for types matching the query
        const expenseTypes = await Expense.find(
            { userId, type: { $regex: query, $options: "i" } },
            { type: 1, _id: 0 },
        )
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        const all = Array.from(
            new Set([
                ...(types || []).map((t) => t.name),
                ...(expenseTypes || []).map((e) => e.type),
            ]),
        ).slice(0, 10);

        res.json(all.sort());
    } catch (err) {
        console.error("suggestTypes error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.addType = async (req, res) => {
    try {
        const userId = req.user._id;
        const raw = req.body.name;
        const name = normalizeType(raw);
        if (!name) return res.status(400).json({ message: "name required" });
        if (name.length > 64)
            return res.status(400).json({ message: "name too long" });

        // upsert by normalized name and userId
        const existing = await Type.findOne({ name, userId });
        if (existing) return res.status(200).json(existing);

        const t = new Type({ name, userId });
        const saved = await t.save();
        res.status(201).json(saved);
    } catch (err) {
        console.error("addType error:", err);
        // unique index error
        if (err.code === 11000) {
            const existing = await Type.findOne({
                name: normalizeType(req.body.name),
                userId: req.user._id,
            });
            return res.status(200).json(existing);
        }
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
