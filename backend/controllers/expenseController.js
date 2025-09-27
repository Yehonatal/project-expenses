const Expense = require("../models/expenseModel");
const mongoose = require("mongoose");
const Type = require("../models/typeModel");
const Budget = require("../models/budgetModel");
const { normalizeType } = require("../utils/normalizeType");

// Helper to calculate next due date for recurring expenses
const calculateNextDueDate = (currentDate, frequency) => {
    const nextDate = new Date(currentDate);
    if (frequency === "weekly") {
        nextDate.setDate(nextDate.getDate() + 7);
    } else if (frequency === "monthly") {
        nextDate.setMonth(nextDate.getMonth() + 1);
    }
    return nextDate;
};

// Helper to calculate spent across a date range
const calculateSpent = async (
    userId,
    startMonth,
    startYear,
    endMonth,
    endYear
) => {
    const startDate = new Date(startYear, startMonth - 1, 1);
    const endDate = new Date(endYear, endMonth, 1); // First day of the next month
    const expenses = await Expense.find({
        userId,
        date: { $gte: startDate, $lt: endDate },
    });
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
};

// Helper to update budgets that overlap with the expense date
const updateOverlappingBudgets = async (userId, expenseDate) => {
    const budgets = await Budget.find({
        userId,
        $or: [
            {
                startYear: { $lt: expenseDate.getFullYear() },
                endYear: { $gt: expenseDate.getFullYear() },
            },
            {
                startYear: expenseDate.getFullYear(),
                startMonth: { $lte: expenseDate.getMonth() + 1 },
            },
            {
                endYear: expenseDate.getFullYear(),
                endMonth: { $gte: expenseDate.getMonth() + 1 },
            },
        ],
    });
    for (const budget of budgets) {
        budget.spent = await calculateSpent(
            userId,
            budget.startMonth,
            budget.startYear,
            budget.endMonth,
            budget.endYear
        );
        await budget.save();
    }
};

/**
 * Add new expense
 * body: { date, description, amount, included, type, isRecurring, frequency }
 */
exports.addExpense = async (req, res) => {
    try {
        const {
            date,
            description,
            amount,
            included,
            type,
            isRecurring,
            frequency,
        } = req.body;

        if (description == null || amount == null || type == null) {
            return res
                .status(400)
                .json({ message: "description, amount, and type required" });
        }

        // Validate recurring fields
        if (isRecurring && !frequency) {
            return res
                .status(400)
                .json({ message: "frequency required for recurring expenses" });
        }

        if (isRecurring && !["weekly", "monthly"].includes(frequency)) {
            return res
                .status(400)
                .json({ message: "frequency must be 'weekly' or 'monthly'" });
        }

        const expenseDate = date ? new Date(date) : new Date();
        const expense = new Expense({
            date: expenseDate,
            description,
            amount,
            included: included !== undefined ? !!included : true,
            type,
            userId: req.user._id,
            isRecurring: !!isRecurring,
            frequency: isRecurring ? frequency : undefined,
            nextDueDate: isRecurring
                ? calculateNextDueDate(expenseDate, frequency)
                : undefined,
        });

        const saved = await expense.save();

        // Ensure the type exists in the types collection (upsert)
        try {
            if (type) {
                await Type.updateOne(
                    { name: type, userId: req.user._id },
                    { $setOnInsert: { name: type, userId: req.user._id } },
                    { upsert: true }
                );
            }
        } catch (tErr) {
            console.error("Failed to upsert type:", tErr);
        }

        // Update overlapping budgets
        await updateOverlappingBudgets(req.user._id, expense.date);

        res.status(201).json(saved);
    } catch (err) {
        console.error("addExpense error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

/**
 * Get all expenses (optionally with query filters)
 * Query params:
 *  - from: ISO date
 *  - to: ISO date
 *  - included: true/false
 */
exports.getExpenses = async (req, res) => {
    try {
        const { from, to, included, type } = req.query;
        const filter = { userId: req.user._id };

        if (from || to) {
            filter.date = {};
            if (from) filter.date.$gte = new Date(from);
            if (to) filter.date.$lte = new Date(to);
        }

        if (included !== undefined) {
            if (included === "true") filter.included = true;
            else if (included === "false") filter.included = false;
        }

        if (type) {
            filter.type = type;
        }

        // By default sort newest first
        const expenses = await Expense.find(filter).sort({
            date: -1,
            createdAt: -1,
        });
        res.json(expenses);
    } catch (err) {
        console.error("getExpenses error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

/**
 * Update expense by ID
 * body can include any of: { date, description, amount, included }
 */
exports.updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid ID" });
        }

        const updates = req.body;
        if (updates.date) updates.date = new Date(updates.date);

        const updated = await Expense.findByIdAndUpdate(id, updates, {
            new: true,
        });
        if (!updated || updated.userId.toString() !== req.user._id.toString())
            return res.status(404).json({ message: "Expense not found" });

        res.json(updated);
    } catch (err) {
        console.error("updateExpense error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

/**
 * Delete expense by ID
 */
exports.deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid ID" });
        }

        const deleted = await Expense.findByIdAndDelete(id);
        if (!deleted || deleted.userId.toString() !== req.user._id.toString())
            return res.status(404).json({ message: "Expense not found" });

        // Update overlapping budgets
        await updateOverlappingBudgets(req.user._id, deleted.date);

        res.json({ message: "Deleted", id: deleted._id });
    } catch (err) {
        console.error("deleteExpense error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

/**
 * Summary endpoint using aggregation pipelines
 * Returns:
 *  - totalIncluded
 *  - totalExcluded
 *  - countIncluded
 *  - countExcluded
 *  - monthlyBreakdown (array)
 *
 * Accepts optional query params: year (e.g., 2025), from, to
 */
exports.getSummary = async (req, res) => {
    try {
        const { year, from, to } = req.query;
        const match = { userId: req.user._id };

        if (year) {
            // match by year
            const y = parseInt(year, 10);
            if (!isNaN(y)) {
                const start = new Date(Date.UTC(y, 0, 1));
                const end = new Date(Date.UTC(y + 1, 0, 1));
                match.date = { $gte: start, $lt: end };
            }
        } else if (from || to) {
            match.date = {};
            if (from) match.date.$gte = new Date(from);
            if (to) match.date.$lte = new Date(to);
        }

        const pipeline = [];

        if (Object.keys(match).length) pipeline.push({ $match: match });

        // totals
        pipeline.push({
            $group: {
                _id: null,
                totalIncluded: { $sum: { $cond: ["$included", "$amount", 0] } },
                totalExcluded: {
                    $sum: { $cond: [{ $not: ["$included"] }, "$amount", 0] },
                },
                countIncluded: { $sum: { $cond: ["$included", 1, 0] } },
                countExcluded: {
                    $sum: { $cond: [{ $not: ["$included"] }, 1, 0] },
                },
            },
        });

        const totals = await Expense.aggregate(pipeline);

        const monthlyPipeline = [];
        if (Object.keys(match).length) monthlyPipeline.push({ $match: match });

        monthlyPipeline.push(
            {
                $project: {
                    year: { $year: "$date" },
                    month: { $month: "$date" },
                    amount: 1,
                    included: 1,
                },
            },
            {
                $match: { included: true }, // breakdown counts only included toward total by default
            },
            {
                $group: {
                    _id: { year: "$year", month: "$month" },
                    total: { $sum: "$amount" },
                    count: { $sum: 1 },
                },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        );

        const monthly = await Expense.aggregate(monthlyPipeline);

        const typePipeline = [];
        if (Object.keys(match).length) typePipeline.push({ $match: match });

        typePipeline.push(
            {
                $group: {
                    _id: "$type",
                    total: { $sum: "$amount" },
                    count: { $sum: 1 },
                },
            },
            { $sort: { total: -1 } }
        );

        const typeBreakdown = await Expense.aggregate(typePipeline);

        res.json({
            totals: totals[0] || {
                totalIncluded: 0,
                totalExcluded: 0,
                countIncluded: 0,
                countExcluded: 0,
            },
            monthlyBreakdown: monthly.map((m) => ({
                year: m._id.year,
                month: m._id.month,
                total: m.total,
                count: m.count,
            })),
            typeBreakdown: typeBreakdown.map((t) => ({
                type: t._id,
                total: t.total,
                count: t.count,
            })),
        });
    } catch (err) {
        console.error("getSummary error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.getStats = async (req, res) => {
    try {
        const userId = req.user._id;

        const totalExpenses = await Expense.countDocuments({ userId });

        // Count distinct types from expenses instead of types collection
        const typeResult = await Expense.distinct("type", { userId });
        const totalTypes = typeResult.length;

        const mostExpensive = await Expense.findOne({ userId })
            .sort({ amount: -1 })
            .select("amount description");
        const cheapest = await Expense.findOne({ userId })
            .sort({ amount: 1 })
            .select("amount description");

        const monthlyAssessment = await Expense.aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
                    total: { $sum: "$amount" },
                    count: { $sum: 1 },
                    maxExpense: { $max: "$amount" },
                    minExpense: { $min: "$amount" },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        res.json({
            totalExpenses,
            totalTypes,
            mostExpensive,
            cheapest,
            monthlyAssessment,
        });
    } catch (err) {
        console.error("getStats error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

/**
 * Generate recurring expenses that are due
 * This should be called periodically (e.g., daily via cron job)
 */
exports.generateRecurringExpenses = async (req, res) => {
    try {
        const now = new Date();

        // Find all recurring expenses that are due (nextDueDate <= now)
        const dueRecurringExpenses = await Expense.find({
            userId: req.user._id,
            isRecurring: true,
            nextDueDate: { $lte: now },
        });

        const generatedExpenses = [];

        for (const recurringExpense of dueRecurringExpenses) {
            // Create a new expense instance
            const newExpense = new Expense({
                date: recurringExpense.nextDueDate,
                description: recurringExpense.description,
                amount: recurringExpense.amount,
                included: recurringExpense.included,
                type: recurringExpense.type,
                userId: recurringExpense.userId,
                isRecurring: false, // Generated instances are not recurring themselves
                parentExpenseId: recurringExpense._id, // Reference to the original
            });

            const saved = await newExpense.save();
            generatedExpenses.push(saved);

            // Update the recurring expense's next due date
            const nextDueDate = calculateNextDueDate(
                recurringExpense.nextDueDate,
                recurringExpense.frequency
            );

            await Expense.findByIdAndUpdate(recurringExpense._id, {
                nextDueDate: nextDueDate,
            });

            // Update overlapping budgets for the new expense
            await updateOverlappingBudgets(req.user._id, newExpense.date);
        }

        res.json({
            message: `Generated ${generatedExpenses.length} recurring expenses`,
            generatedExpenses,
        });
    } catch (err) {
        console.error("generateRecurringExpenses error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
