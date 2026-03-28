const Expense = require("../models/expenseModel");
const mongoose = require("mongoose");
const Type = require("../models/typeModel");
const Template = require("../models/templateModel");
const Budget = require("../models/budgetModel");
const ExpenseFilterPreset = require("../models/expenseFilterPresetModel");
const Workspace = require("../models/workspaceModel");
const { normalizeType } = require("../utils/normalizeType");

const normalizeTags = (tags) => {
    if (!tags) return [];
    const input = Array.isArray(tags)
        ? tags
        : String(tags)
              .split(",")
              .map((t) => t.trim());

    return Array.from(
        new Set(
            input
                .map((tag) =>
                    String(tag || "")
                        .trim()
                        .toLowerCase(),
                )
                .filter(Boolean),
        ),
    );
};

const sanitizePresetFilters = (filters = {}) => {
    const normalized = {};

    const assignString = (key) => {
        if (filters[key] == null) return;
        const value = String(filters[key]).trim();
        if (value) normalized[key] = value;
    };

    assignString("from");
    assignString("to");
    assignString("type");
    assignString("tags");
    assignString("minAmount");
    assignString("maxAmount");
    assignString("keyword");
    assignString("workspaceId");
    assignString("memberId");

    if (["all", "personal", "shared"].includes(String(filters.scope))) {
        normalized.scope = String(filters.scope);
    }

    if (typeof filters.included === "boolean") {
        normalized.included = filters.included;
    }

    if (typeof filters.isRecurring === "boolean") {
        normalized.isRecurring = filters.isRecurring;
    }

    if (Number.isFinite(Number(filters.limit))) {
        normalized.limit = Math.min(Math.max(Number(filters.limit), 1), 200);
    }

    return normalized;
};

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
    endYear,
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
            budget.endYear,
        );
        await budget.save();
    }
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const computeSpendStabilityScore = (monthlyTotals) => {
    if (!monthlyTotals.length) {
        return 50;
    }

    const mean =
        monthlyTotals.reduce((sum, value) => sum + value, 0) /
        monthlyTotals.length;
    if (mean <= 0) {
        return 65;
    }

    const variance =
        monthlyTotals.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
        monthlyTotals.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = stdDev / mean;

    return clamp(Math.round(100 - coefficientOfVariation * 70), 0, 100);
};

const computeBudgetAdherenceScore = (budgets) => {
    if (!budgets.length) {
        return 55;
    }

    const perBudgetScores = budgets.map((budget) => {
        const totalBudget = Number(budget.totalBudget) || 0;
        const spent = Number(budget.spent) || 0;

        if (totalBudget <= 0) {
            return 50;
        }

        const utilization = spent / totalBudget;
        if (utilization <= 1) {
            return 100;
        }

        return clamp(Math.round(100 - (utilization - 1) * 160), 0, 100);
    });

    return Math.round(
        perBudgetScores.reduce((sum, score) => sum + score, 0) /
            perBudgetScores.length,
    );
};

const computeSavingsTrendScore = (monthlyTotals) => {
    if (monthlyTotals.length < 2) {
        return 50;
    }

    const recentSlice = monthlyTotals.slice(-3);
    const previousSlice = monthlyTotals.slice(-6, -3);

    const recentAvg =
        recentSlice.reduce((sum, value) => sum + value, 0) / recentSlice.length;
    const previousAvg = previousSlice.length
        ? previousSlice.reduce((sum, value) => sum + value, 0) /
          previousSlice.length
        : recentAvg;

    if (previousAvg <= 0 && recentAvg <= 0) {
        return 80;
    }

    if (previousAvg <= 0 && recentAvg > 0) {
        return 40;
    }

    const savingsChangeRatio = (previousAvg - recentAvg) / previousAvg;
    return clamp(Math.round(50 + savingsChangeRatio * 50), 0, 100);
};

const getHealthBand = (score) => {
    if (score >= 80) return "excellent";
    if (score >= 65) return "good";
    if (score >= 45) return "fair";
    return "needs-attention";
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
            tags,
            workspaceId,
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
        let validatedWorkspaceId = null;

        if (workspaceId) {
            if (!mongoose.isValidObjectId(workspaceId)) {
                return res
                    .status(400)
                    .json({ message: "Invalid workspace ID" });
            }

            const workspace = await Workspace.findOne({
                _id: workspaceId,
                "members.userId": req.user._id,
            })
                .select("_id")
                .lean();

            if (!workspace) {
                return res.status(403).json({
                    message: "Not a member of the selected workspace",
                });
            }

            validatedWorkspaceId = workspace._id;
        }

        const expense = new Expense({
            date: expenseDate,
            description,
            amount,
            included: included !== undefined ? !!included : true,
            type,
            tags: normalizeTags(tags),
            userId: req.user._id,
            workspaceId: validatedWorkspaceId,
            createdBy: req.user._id,
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
                    { upsert: true },
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
        const {
            from,
            to,
            included,
            type,
            tags,
            minAmount,
            maxAmount,
            isRecurring,
            keyword,
            scope,
            workspaceId,
            memberId,
            page,
            limit,
        } = req.query;
        const filter = {};

        const memberships = await Workspace.find({
            "members.userId": req.user._id,
        })
            .select("_id")
            .lean();
        const accessibleWorkspaceIds = memberships.map((item) => item._id);

        const personalScopeFilter = {
            userId: req.user._id,
            $or: [{ workspaceId: { $exists: false } }, { workspaceId: null }],
        };

        let sharedScopeFilter = {
            workspaceId: { $in: accessibleWorkspaceIds },
        };

        if (workspaceId) {
            if (!mongoose.isValidObjectId(workspaceId)) {
                return res
                    .status(400)
                    .json({ message: "Invalid workspace ID" });
            }

            const isAccessible = accessibleWorkspaceIds.some(
                (id) => id.toString() === workspaceId,
            );

            if (!isAccessible) {
                return res.status(403).json({
                    message: "Not a member of the selected workspace",
                });
            }

            sharedScopeFilter = {
                workspaceId: new mongoose.Types.ObjectId(workspaceId),
            };
        }

        if (scope === "personal") {
            Object.assign(filter, personalScopeFilter);
        } else if (scope === "shared") {
            Object.assign(filter, sharedScopeFilter);
        } else {
            filter.$or = [personalScopeFilter, sharedScopeFilter];
        }

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

        if (memberId) {
            if (!mongoose.isValidObjectId(memberId)) {
                return res.status(400).json({ message: "Invalid member ID" });
            }
            filter.createdBy = new mongoose.Types.ObjectId(memberId);
        }

        if (minAmount !== undefined || maxAmount !== undefined) {
            filter.amount = {};
            if (minAmount !== undefined && minAmount !== "") {
                filter.amount.$gte = Number(minAmount);
            }
            if (maxAmount !== undefined && maxAmount !== "") {
                filter.amount.$lte = Number(maxAmount);
            }
        }

        if (isRecurring !== undefined && isRecurring !== "") {
            if (isRecurring === "true") filter.isRecurring = true;
            else if (isRecurring === "false") filter.isRecurring = false;
        }

        if (keyword) {
            const keywordRegex = {
                $regex: String(keyword).trim(),
                $options: "i",
            };
            const keywordCondition = {
                $or: [
                    { description: keywordRegex },
                    { type: keywordRegex },
                    { tags: keywordRegex },
                ],
            };

            if (filter.$or) {
                filter.$and = [{ $or: filter.$or }, keywordCondition];
                delete filter.$or;
            } else {
                Object.assign(filter, keywordCondition);
            }
        }

        if (tags) {
            const parsedTags = normalizeTags(tags);
            if (parsedTags.length) {
                filter.tags = { $in: parsedTags };
            }
        }

        const requestedPage = Number.parseInt(page, 10);
        const requestedLimit = Number.parseInt(limit, 10);
        const hasPagination =
            Number.isFinite(requestedPage) || Number.isFinite(requestedLimit);
        const currentPage =
            Number.isFinite(requestedPage) && requestedPage > 0
                ? requestedPage
                : 1;
        const pageSize =
            Number.isFinite(requestedLimit) && requestedLimit > 0
                ? Math.min(requestedLimit, 200)
                : 20;

        // By default sort newest first
        const baseQuery = Expense.find(filter)
            .sort({
                date: -1,
                createdAt: -1,
            })
            .populate("createdBy", "name email picture")
            .populate("workspaceId", "name inviteCode");

        if (!hasPagination) {
            const expenses = await baseQuery;
            return res.json(expenses);
        }

        const [expenses, total, totalsAgg] = await Promise.all([
            baseQuery
                .clone()
                .skip((currentPage - 1) * pageSize)
                .limit(pageSize),
            Expense.countDocuments(filter),
            Expense.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: null,
                        includedTotal: {
                            $sum: {
                                $cond: ["$included", "$amount", 0],
                            },
                        },
                        recurringCount: {
                            $sum: {
                                $cond: ["$isRecurring", 1, 0],
                            },
                        },
                    },
                },
            ]),
        ]);

        const totals = totalsAgg[0] || {
            includedTotal: 0,
            recurringCount: 0,
        };

        return res.json({
            items: expenses,
            total,
            page: currentPage,
            limit: pageSize,
            totalPages: Math.max(1, Math.ceil(total / pageSize)),
            includedTotal: totals.includedTotal,
            recurringCount: totals.recurringCount,
        });
    } catch (err) {
        console.error("getExpenses error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.getExpenseFilterPresets = async (req, res) => {
    try {
        const presets = await ExpenseFilterPreset.find({ userId: req.user._id })
            .sort({ updatedAt: -1 })
            .limit(20)
            .lean();

        res.json(presets);
    } catch (err) {
        console.error("getExpenseFilterPresets error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.createExpenseFilterPreset = async (req, res) => {
    try {
        const name = String(req.body?.name || "").trim();
        if (!name) {
            return res.status(400).json({ message: "Preset name is required" });
        }

        const filters = sanitizePresetFilters(req.body?.filters || {});
        const shouldSetDefault = Boolean(req.body?.isDefault);

        if (shouldSetDefault) {
            await ExpenseFilterPreset.updateMany(
                { userId: req.user._id, isDefault: true },
                { $set: { isDefault: false } },
            );
        }

        const preset = await ExpenseFilterPreset.findOneAndUpdate(
            { userId: req.user._id, name },
            {
                $set: {
                    userId: req.user._id,
                    name,
                    filters,
                    ...(shouldSetDefault ? { isDefault: true } : {}),
                },
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true,
            },
        );

        res.status(201).json(preset);
    } catch (err) {
        console.error("createExpenseFilterPreset error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.setDefaultExpenseFilterPreset = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid ID" });
        }

        const target = await ExpenseFilterPreset.findOne({
            _id: id,
            userId: req.user._id,
        });

        if (!target) {
            return res.status(404).json({ message: "Preset not found" });
        }

        await ExpenseFilterPreset.updateMany(
            { userId: req.user._id, isDefault: true },
            { $set: { isDefault: false } },
        );

        target.isDefault = true;
        await target.save();

        res.json(target);
    } catch (err) {
        console.error("setDefaultExpenseFilterPreset error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.deleteExpenseFilterPreset = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid ID" });
        }

        const deleted = await ExpenseFilterPreset.findOneAndDelete({
            _id: id,
            userId: req.user._id,
        });

        if (!deleted) {
            return res.status(404).json({ message: "Preset not found" });
        }

        res.json({ message: "Deleted", id: deleted._id });
    } catch (err) {
        console.error("deleteExpenseFilterPreset error:", err);
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
        if (Object.prototype.hasOwnProperty.call(updates, "tags")) {
            updates.tags = normalizeTags(updates.tags);
        }

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
            { $sort: { "_id.year": 1, "_id.month": 1 } },
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
            { $sort: { total: -1 } },
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

/**
 * Dashboard endpoint (summary-style content for UI)
 * Returns totals, recent expenses, type breakdown, monthly breakdown, templates
 */
exports.getDashboard = async (req, res) => {
    try {
        const userId = req.user._id;

        const totalsAgg = await Expense.aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: null,
                    totalIncluded: {
                        $sum: { $cond: ["$included", "$amount", 0] },
                    },
                    totalExcluded: {
                        $sum: {
                            $cond: [{ $not: ["$included"] }, "$amount", 0],
                        },
                    },
                    countIncluded: { $sum: { $cond: ["$included", 1, 0] } },
                    countExcluded: {
                        $sum: { $cond: [{ $not: ["$included"] }, 1, 0] },
                    },
                },
            },
        ]);

        const monthlyAgg = await Expense.aggregate([
            { $match: { userId, included: true } },
            {
                $project: {
                    year: { $year: "$date" },
                    month: { $month: "$date" },
                    amount: 1,
                },
            },
            {
                $group: {
                    _id: { year: "$year", month: "$month" },
                    total: { $sum: "$amount" },
                    count: { $sum: 1 },
                },
            },
            { $sort: { "_id.year": -1, "_id.month": -1 } },
            { $limit: 6 },
        ]);

        const typeAgg = await Expense.aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: "$type",
                    total: { $sum: "$amount" },
                    count: { $sum: 1 },
                },
            },
            { $sort: { total: -1 } },
            { $limit: 6 },
        ]);

        const recentExpenses = await Expense.find({ userId })
            .sort({ date: -1, createdAt: -1 })
            .limit(6)
            .select("date description amount type included")
            .lean();

        const templates = await Template.find({ userId })
            .sort({ createdAt: -1 })
            .limit(4)
            .select("description type price")
            .lean();

        const budgets = await Budget.find({ userId })
            .sort({ updatedAt: -1 })
            .limit(12)
            .select("totalBudget spent")
            .lean();

        const monthlyTotals = monthlyAgg
            .map((m) => Number(m.total) || 0)
            .reverse();

        const spendStabilityScore = computeSpendStabilityScore(monthlyTotals);
        const budgetAdherenceScore = computeBudgetAdherenceScore(budgets);
        const savingsTrendScore = computeSavingsTrendScore(monthlyTotals);
        const totalScore = Math.round(
            spendStabilityScore * 0.4 +
                budgetAdherenceScore * 0.35 +
                savingsTrendScore * 0.25,
        );

        res.json({
            totals: totalsAgg[0] || {
                totalIncluded: 0,
                totalExcluded: 0,
                countIncluded: 0,
                countExcluded: 0,
            },
            monthlyBreakdown: monthlyAgg
                .map((m) => ({
                    year: m._id.year,
                    month: m._id.month,
                    total: m.total,
                    count: m.count,
                }))
                .reverse(),
            typeBreakdown: typeAgg.map((t) => ({
                type: t._id,
                total: t.total,
                count: t.count,
            })),
            recentExpenses,
            templates,
            healthScore: {
                totalScore,
                band: getHealthBand(totalScore),
                spendStabilityScore,
                budgetAdherenceScore,
                savingsTrendScore,
            },
            updatedAt: new Date().toISOString(),
        });
    } catch (err) {
        console.error("getDashboard error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.getTrends = async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();
        const currentMonth = now.getMonth() + 1; // 1-12
        const currentYear = now.getFullYear();

        // Previous month calculation
        const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevMonth = prevDate.getMonth() + 1;
        const prevYear = prevDate.getFullYear();

        // Get current month data
        const currentMonthStart = new Date(currentYear, currentMonth - 1, 1);
        const currentMonthEnd = new Date(currentYear, currentMonth, 1);

        const currentMonthData = await Expense.aggregate([
            {
                $match: {
                    userId,
                    date: { $gte: currentMonthStart, $lt: currentMonthEnd },
                    included: true,
                },
            },
            {
                $group: {
                    _id: "$type",
                    total: { $sum: "$amount" },
                    count: { $sum: 1 },
                },
            },
            { $sort: { total: -1 } },
        ]);

        // Get previous month data
        const prevMonthStart = new Date(prevYear, prevMonth - 1, 1);
        const prevMonthEnd = new Date(prevYear, prevMonth, 1);

        const prevMonthData = await Expense.aggregate([
            {
                $match: {
                    userId,
                    date: { $gte: prevMonthStart, $lt: prevMonthEnd },
                    included: true,
                },
            },
            {
                $group: {
                    _id: "$type",
                    total: { $sum: "$amount" },
                    count: { $sum: 1 },
                },
            },
        ]);

        // Create maps for easy lookup
        const currentMap = new Map();
        const prevMap = new Map();

        currentMonthData.forEach((item) => {
            currentMap.set(item._id, { total: item.total, count: item.count });
        });

        prevMonthData.forEach((item) => {
            prevMap.set(item._id, { total: item.total, count: item.count });
        });

        // Combine data and calculate changes
        const allCategories = new Set([
            ...currentMap.keys(),
            ...prevMap.keys(),
        ]);
        const trends = [];

        for (const category of allCategories) {
            const current = currentMap.get(category) || { total: 0, count: 0 };
            const previous = prevMap.get(category) || { total: 0, count: 0 };

            let percentageChange = 0;
            if (previous.total > 0) {
                percentageChange =
                    ((current.total - previous.total) / previous.total) * 100;
            } else if (current.total > 0) {
                percentageChange = 100; // New category
            }

            trends.push({
                category,
                currentMonth: current.total,
                previousMonth: previous.total,
                percentageChange: Math.round(percentageChange * 100) / 100, // Round to 2 decimal places
                currentCount: current.count,
                previousCount: previous.count,
            });
        }

        // Sort by current month spending (highest first)
        trends.sort((a, b) => b.currentMonth - a.currentMonth);

        // Calculate overall totals
        const currentTotal = trends.reduce(
            (sum, item) => sum + item.currentMonth,
            0,
        );
        const previousTotal = trends.reduce(
            (sum, item) => sum + item.previousMonth,
            0,
        );
        let overallPercentageChange = 0;
        if (previousTotal > 0) {
            overallPercentageChange =
                ((currentTotal - previousTotal) / previousTotal) * 100;
        } else if (currentTotal > 0) {
            overallPercentageChange = 100;
        }

        res.json({
            currentMonth: { month: currentMonth, year: currentYear },
            previousMonth: { month: prevMonth, year: prevYear },
            trends,
            summary: {
                currentTotal,
                previousTotal,
                overallPercentageChange:
                    Math.round(overallPercentageChange * 100) / 100,
            },
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

exports.getTrends = async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();
        const currentMonth = now.getMonth() + 1; // 1-12
        const currentYear = now.getFullYear();

        // Previous month calculation
        const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevMonth = prevDate.getMonth() + 1;
        const prevYear = prevDate.getFullYear();

        // Get current month data
        const currentMonthStart = new Date(currentYear, currentMonth - 1, 1);
        const currentMonthEnd = new Date(currentYear, currentMonth, 1);

        const currentMonthData = await Expense.aggregate([
            {
                $match: {
                    userId,
                    date: { $gte: currentMonthStart, $lt: currentMonthEnd },
                    included: true,
                },
            },
            {
                $group: {
                    _id: "$type",
                    total: { $sum: "$amount" },
                    count: { $sum: 1 },
                },
            },
            { $sort: { total: -1 } },
        ]);

        // Get previous month data
        const prevMonthStart = new Date(prevYear, prevMonth - 1, 1);
        const prevMonthEnd = new Date(prevYear, prevMonth, 1);

        const prevMonthData = await Expense.aggregate([
            {
                $match: {
                    userId,
                    date: { $gte: prevMonthStart, $lt: prevMonthEnd },
                    included: true,
                },
            },
            {
                $group: {
                    _id: "$type",
                    total: { $sum: "$amount" },
                    count: { $sum: 1 },
                },
            },
        ]);

        // Create maps for easy lookup
        const currentMap = new Map();
        const prevMap = new Map();

        currentMonthData.forEach((item) => {
            currentMap.set(item._id, { total: item.total, count: item.count });
        });

        prevMonthData.forEach((item) => {
            prevMap.set(item._id, { total: item.total, count: item.count });
        });

        // Combine data and calculate changes
        const allCategories = new Set([
            ...currentMap.keys(),
            ...prevMap.keys(),
        ]);
        const trends = [];

        for (const category of allCategories) {
            const current = currentMap.get(category) || { total: 0, count: 0 };
            const previous = prevMap.get(category) || { total: 0, count: 0 };

            let percentageChange = 0;
            if (previous.total > 0) {
                percentageChange =
                    ((current.total - previous.total) / previous.total) * 100;
            } else if (current.total > 0) {
                percentageChange = 100; // New category
            }

            trends.push({
                category,
                currentMonth: current.total,
                previousMonth: previous.total,
                percentageChange: Math.round(percentageChange * 100) / 100, // Round to 2 decimal places
                currentCount: current.count,
                previousCount: previous.count,
            });
        }

        // Sort by current month spending (highest first)
        trends.sort((a, b) => b.currentMonth - a.currentMonth);

        // Calculate overall totals
        const currentTotal = trends.reduce(
            (sum, item) => sum + item.currentMonth,
            0,
        );
        const previousTotal = trends.reduce(
            (sum, item) => sum + item.previousMonth,
            0,
        );
        let overallPercentageChange = 0;
        if (previousTotal > 0) {
            overallPercentageChange =
                ((currentTotal - previousTotal) / previousTotal) * 100;
        } else if (currentTotal > 0) {
            overallPercentageChange = 100;
        }

        res.json({
            currentMonth: { month: currentMonth, year: currentYear },
            previousMonth: { month: prevMonth, year: prevYear },
            trends,
            summary: {
                currentTotal,
                previousTotal,
                overallPercentageChange:
                    Math.round(overallPercentageChange * 100) / 100,
            },
        });
    } catch (err) {
        console.error("getTrends error:", err);
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
                workspaceId: recurringExpense.workspaceId || null,
                createdBy:
                    recurringExpense.createdBy || recurringExpense.userId,
                isRecurring: false, // Generated instances are not recurring themselves
                parentExpenseId: recurringExpense._id, // Reference to the original
            });

            const saved = await newExpense.save();
            generatedExpenses.push(saved);

            // Update the recurring expense's next due date
            const nextDueDate = calculateNextDueDate(
                recurringExpense.nextDueDate,
                recurringExpense.frequency,
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
