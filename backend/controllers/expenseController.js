const Expense = require("../models/expenseModel");
const mongoose = require("mongoose");
const Type = require("../models/typeModel");
const Template = require("../models/templateModel");
const Budget = require("../models/budgetModel");
const ExpenseFilterPreset = require("../models/expenseFilterPresetModel");
const Workspace = require("../models/workspaceModel");
const { normalizeType } = require("../utils/normalizeType");

const ALLOWED_RECURRING_FREQUENCIES = new Set([
    "daily",
    "weekly",
    "monthly",
    "yearly",
    "custom",
]);

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
    assignString("includeMode");
    assignString("recurringMode");

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

const normalizeRecurrenceRules = (rules = {}) => {
    const interval = Math.max(1, Number.parseInt(rules.interval, 10) || 1);

    const normalized = {
        interval,
    };

    if (Array.isArray(rules.daysOfWeek)) {
        const days = Array.from(
            new Set(
                rules.daysOfWeek
                    .map((day) => Number.parseInt(day, 10))
                    .filter(
                        (day) => Number.isFinite(day) && day >= 0 && day <= 6,
                    ),
            ),
        ).sort((a, b) => a - b);

        if (days.length) {
            normalized.daysOfWeek = days;
        }
    }

    if (rules.endDate) {
        const parsedEnd = new Date(rules.endDate);
        if (!Number.isNaN(parsedEnd.getTime())) {
            normalized.endDate = parsedEnd;
        }
    }

    const occurrenceCount = Number.parseInt(rules.occurrenceCount, 10);
    if (Number.isFinite(occurrenceCount) && occurrenceCount > 0) {
        normalized.occurrenceCount = occurrenceCount;
    }

    return normalized;
};

const addMonthsClamped = (date, months) => {
    const source = new Date(date);
    const day = source.getDate();
    source.setDate(1);
    source.setMonth(source.getMonth() + months);
    const lastDayOfMonth = new Date(
        source.getFullYear(),
        source.getMonth() + 1,
        0,
    ).getDate();
    source.setDate(Math.min(day, lastDayOfMonth));
    return source;
};

const addYearsClamped = (date, years) => {
    const source = new Date(date);
    const month = source.getMonth();
    const day = source.getDate();
    source.setDate(1);
    source.setFullYear(source.getFullYear() + years, month, 1);
    const lastDayOfMonth = new Date(
        source.getFullYear(),
        source.getMonth() + 1,
        0,
    ).getDate();
    source.setDate(Math.min(day, lastDayOfMonth));
    return source;
};

// Helper to calculate next due date for recurring expenses
const calculateNextDueDate = (currentDate, frequency, recurrenceRules = {}) => {
    const nextDate = new Date(currentDate);
    if (Number.isNaN(nextDate.getTime())) {
        return new Date();
    }

    const interval = Math.max(
        1,
        Number.parseInt(recurrenceRules.interval, 10) || 1,
    );
    const daysOfWeek = Array.isArray(recurrenceRules.daysOfWeek)
        ? Array.from(
              new Set(
                  recurrenceRules.daysOfWeek
                      .map((day) => Number.parseInt(day, 10))
                      .filter(
                          (day) => Number.isFinite(day) && day >= 0 && day <= 6,
                      ),
              ),
          ).sort((a, b) => a - b)
        : [];

    if (frequency === "daily" || frequency === "custom") {
        nextDate.setDate(nextDate.getDate() + interval);
        return nextDate;
    }

    if (frequency === "weekly") {
        if (daysOfWeek.length === 0) {
            nextDate.setDate(nextDate.getDate() + 7 * interval);
            return nextDate;
        }

        const currentDay = nextDate.getDay();
        const nextDay = daysOfWeek.find((day) => day > currentDay);

        if (nextDay !== undefined) {
            nextDate.setDate(nextDate.getDate() + (nextDay - currentDay));
            return nextDate;
        }

        const daysUntilFirstInNextCycle =
            7 * interval - currentDay + daysOfWeek[0];
        nextDate.setDate(nextDate.getDate() + daysUntilFirstInNextCycle);
        return nextDate;
    }

    if (frequency === "monthly") {
        return addMonthsClamped(nextDate, interval);
    }

    if (frequency === "yearly") {
        return addYearsClamped(nextDate, interval);
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

const monthKey = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const percentDelta = (current, previous) => {
    if (!previous && !current) return 0;
    if (!previous && current) return 100;
    return ((current - previous) / previous) * 100;
};

const toneFromDelta = (value) => {
    if (value >= 25) return "high";
    if (value >= 10) return "medium";
    return "low";
};

const calculateWeightedAverage = (values) => {
    if (!values.length) return 0;
    let weightedSum = 0;
    let totalWeight = 0;

    values.forEach((value, index) => {
        const weight = index + 1;
        weightedSum += value * weight;
        totalWeight += weight;
    });

    return totalWeight ? weightedSum / totalWeight : 0;
};

const countOccurrencesInMonth = (item, monthStart, monthEnd) => {
    const { frequency } = item;
    if (!frequency || !ALLOWED_RECURRING_FREQUENCIES.has(frequency)) {
        return 0;
    }

    const recurrenceRules = normalizeRecurrenceRules(
        item.recurrenceRules || {},
    );
    const startOfProjectedMonth = new Date(monthStart);
    const endOfProjectedMonth = new Date(monthEnd);

    const baseDate = item.nextDueDate || item.date || item.startDate;
    if (!baseDate) return 0;

    let currentDate = new Date(baseDate);
    if (Number.isNaN(currentDate.getTime())) return 0;

    const stopDateRaw = recurrenceRules.endDate || item.endDate;
    const stopDate = stopDateRaw ? new Date(stopDateRaw) : null;
    if (stopDate && stopDate < startOfProjectedMonth) return 0;

    const occurrenceLimit =
        Number.parseInt(recurrenceRules.occurrenceCount, 10) > 0
            ? Number.parseInt(recurrenceRules.occurrenceCount, 10)
            : null;

    let count = 0;
    let seenOccurrences = 0;
    let guard = 0;
    while (currentDate < endOfProjectedMonth && guard < 5000) {
        guard++;

        if (stopDate && currentDate > stopDate) break;

        seenOccurrences += 1;
        if (occurrenceLimit && seenOccurrences > occurrenceLimit) break;

        if (
            currentDate >= startOfProjectedMonth &&
            currentDate < endOfProjectedMonth
        ) {
            count++;
        }

        const next = calculateNextDueDate(
            currentDate,
            frequency,
            recurrenceRules,
        );
        if (next.getTime() <= currentDate.getTime()) break;
        currentDate = next;
    }

    return count;
};

const projectRecurringAmountForMonth = (items, monthStart, monthEnd) => {
    return items.reduce((sum, item) => {
        const amount = Number(item.amount || item.price || 0);
        if (amount <= 0) return sum;

        const occurrences = countOccurrencesInMonth(item, monthStart, monthEnd);
        return sum + amount * occurrences;
    }, 0);
};

const projectRecurringByCategoryForMonth = (
    items,
    monthStart,
    monthEnd,
    amountKey = "amount",
    typeKey = "type",
) => {
    const byCategory = new Map();

    for (const item of items) {
        const amount = Number(item[amountKey] || 0);
        const category = String(item[typeKey] || "other").toLowerCase();
        if (amount <= 0) continue;

        const occurrences = countOccurrencesInMonth(item, monthStart, monthEnd);
        const projected = amount * occurrences;

        if (projected > 0) {
            byCategory.set(
                category,
                (byCategory.get(category) || 0) + projected,
            );
        }
    }

    return byCategory;
};

const standardDeviation = (values) => {
    if (!values.length) return 0;
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const variance =
        values.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
        values.length;
    return Math.sqrt(variance);
};

const buildProbabilisticBand = (mean, sigma) => {
    const safeMean = Number(mean || 0);
    const safeSigma = Math.max(0, Number(sigma || 0));
    const z90 = 1.2816;

    const p50 = safeMean;
    const p10 = Math.max(0, safeMean - z90 * safeSigma);
    const p90 = Math.max(p50, safeMean + z90 * safeSigma);

    return {
        p10: Number(p10.toFixed(2)),
        p50: Number(p50.toFixed(2)),
        p90: Number(p90.toFixed(2)),
    };
};

const mergeCategoryMaps = (first, second) => {
    const merged = new Map(first);
    for (const [key, value] of second.entries()) {
        merged.set(key, (merged.get(key) || 0) + value);
    }
    return merged;
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

        if (isRecurring && !ALLOWED_RECURRING_FREQUENCIES.has(frequency)) {
            return res.status(400).json({
                message:
                    "frequency must be one of: daily, weekly, monthly, yearly, custom",
            });
        }

        const normalizedRecurrenceRules = isRecurring
            ? normalizeRecurrenceRules(req.body.recurrenceRules || {})
            : undefined;

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
            recurrenceRules: normalizedRecurrenceRules,
            nextDueDate: isRecurring
                ? calculateNextDueDate(
                      expenseDate,
                      frequency,
                      normalizedRecurrenceRules,
                  )
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
            if (to) {
                const endDate = new Date(to);
                endDate.setHours(23, 59, 59, 999);
                filter.date.$lte = endDate;
            }
        }

        if (included !== undefined) {
            if (included === "true") filter.included = true;
            else if (included === "false") filter.included = false;
        }

        if (type) {
            const types = Array.isArray(type)
                ? type
                : String(type)
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean);

            if (types.length > 0) {
                // If there's only one and it's 'all', we don't filter by type
                if (!(types.length === 1 && types[0].toLowerCase() === "all")) {
                    filter.type = {
                        $in: types.map((t) => new RegExp(`^${t}$`, "i")),
                    };
                }
            }
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
                // Use case-insensitive regex for each tag to ensure match regardless of storage case
                filter.tags = {
                    $in: parsedTags.map((tag) => new RegExp(`^${tag}$`, "i")),
                };
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

        const existing = await Expense.findById(id);
        if (!existing || existing.userId.toString() !== req.user._id.toString())
            return res.status(404).json({ message: "Expense not found" });

        const nextIsRecurring =
            updates.isRecurring !== undefined
                ? Boolean(updates.isRecurring)
                : Boolean(existing.isRecurring);

        const nextFrequency = updates.frequency || existing.frequency;

        if (nextIsRecurring && !nextFrequency) {
            return res
                .status(400)
                .json({ message: "frequency required for recurring expenses" });
        }

        if (
            nextIsRecurring &&
            !ALLOWED_RECURRING_FREQUENCIES.has(String(nextFrequency))
        ) {
            return res.status(400).json({
                message:
                    "frequency must be one of: daily, weekly, monthly, yearly, custom",
            });
        }

        if (nextIsRecurring) {
            const mergedRules = normalizeRecurrenceRules({
                ...(existing.recurrenceRules?.toObject?.() ||
                    existing.recurrenceRules ||
                    {}),
                ...(updates.recurrenceRules || {}),
            });

            updates.recurrenceRules = mergedRules;
            updates.frequency = nextFrequency;
            updates.nextDueDate = calculateNextDueDate(
                updates.date ||
                    existing.nextDueDate ||
                    existing.date ||
                    new Date(),
                String(nextFrequency),
                mergedRules,
            );
            updates.isRecurring = true;
        } else if (updates.isRecurring === false) {
            updates.frequency = undefined;
            updates.recurrenceRules = undefined;
            updates.nextDueDate = undefined;
        }

        const updated = await Expense.findByIdAndUpdate(id, updates, {
            new: true,
        });
        if (!updated)
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
            if (to) {
                const endDate = new Date(to);
                endDate.setHours(23, 59, 59, 999);
                match.date.$lte = endDate;
            }
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

exports.getInsights = async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        const currentMonthStart = new Date(
            now.getFullYear(),
            now.getMonth(),
            1,
        );
        const previousMonthStart = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            1,
        );
        const nextMonthStart = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            1,
        );

        const [recentExpenses, recurringExpenses] = await Promise.all([
            Expense.find({
                userId,
                included: true,
                date: { $gte: sixMonthsAgo, $lt: nextMonthStart },
            })
                .sort({ date: 1 })
                .select("date amount type description")
                .lean(),
            Expense.find({
                userId,
                isRecurring: true,
                nextDueDate: {
                    $gte: now,
                    $lt: new Date(
                        now.getFullYear(),
                        now.getMonth() + 1,
                        now.getDate(),
                    ),
                },
            })
                .select("description amount frequency nextDueDate")
                .lean(),
        ]);

        if (!recentExpenses.length) {
            return res.json({
                generatedAt: new Date().toISOString(),
                summary: {
                    insightCount: 1,
                    monthlyDeltaPercent: 0,
                },
                insights: [
                    {
                        id: "starter-hint",
                        kind: "opportunity",
                        severity: "low",
                        title: "Start building your insight feed",
                        message:
                            "Add a few more expenses and this feed will surface spending anomalies and trend tips automatically.",
                        recommendation:
                            "Capture at least a week of expenses to unlock stronger trend analysis.",
                        metricLabel: "Tracked expenses",
                        metricValue: 0,
                    },
                ],
            });
        }

        const insights = [];
        const monthlyTotals = new Map();

        for (const expense of recentExpenses) {
            const key = monthKey(new Date(expense.date));
            monthlyTotals.set(
                key,
                (monthlyTotals.get(key) || 0) + Number(expense.amount || 0),
            );
        }

        const currentMonthTotal = recentExpenses
            .filter((expense) => new Date(expense.date) >= currentMonthStart)
            .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
        const previousMonthTotal = recentExpenses
            .filter(
                (expense) =>
                    new Date(expense.date) >= previousMonthStart &&
                    new Date(expense.date) < currentMonthStart,
            )
            .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

        const monthlyDeltaPercent = percentDelta(
            currentMonthTotal,
            previousMonthTotal,
        );
        const monthlyTone = toneFromDelta(Math.abs(monthlyDeltaPercent));

        insights.push({
            id: "month-shift",
            kind: "trend",
            severity: monthlyTone,
            title:
                monthlyDeltaPercent >= 0
                    ? "Spending trend is rising this month"
                    : "Spending trend is cooling this month",
            message:
                monthlyDeltaPercent >= 0
                    ? `Included spend is up ${Math.abs(monthlyDeltaPercent).toFixed(1)}% versus last month.`
                    : `Included spend is down ${Math.abs(monthlyDeltaPercent).toFixed(1)}% versus last month.`,
            recommendation:
                monthlyDeltaPercent >= 15
                    ? "Review top categories to prevent a month-end budget overrun."
                    : "Maintain current pacing and keep high-variance categories monitored weekly.",
            metricLabel: "Month delta",
            metricValue: Number(monthlyDeltaPercent.toFixed(2)),
        });

        const currentByType = new Map();
        const previousByType = new Map();
        for (const expense of recentExpenses) {
            const expenseDate = new Date(expense.date);
            const amount = Number(expense.amount || 0);

            if (expenseDate >= currentMonthStart) {
                currentByType.set(
                    expense.type,
                    (currentByType.get(expense.type) || 0) + amount,
                );
            } else if (
                expenseDate >= previousMonthStart &&
                expenseDate < currentMonthStart
            ) {
                previousByType.set(
                    expense.type,
                    (previousByType.get(expense.type) || 0) + amount,
                );
            }
        }

        let topSpike = null;
        for (const [type, current] of currentByType.entries()) {
            const previous = previousByType.get(type) || 0;
            const delta = percentDelta(current, previous);
            if (delta <= 20 || current < 150) continue;

            if (!topSpike || delta > topSpike.delta) {
                topSpike = { type, current, previous, delta };
            }
        }

        if (topSpike) {
            insights.push({
                id: `type-spike-${topSpike.type}`,
                kind: "anomaly",
                severity: toneFromDelta(topSpike.delta),
                title: `${topSpike.type} spending spiked`,
                message: `${topSpike.type} is up ${topSpike.delta.toFixed(1)}% month-over-month (${topSpike.current.toFixed(0)} ETB).`,
                recommendation:
                    "Check recent transactions in this category and set a tighter filter preset for weekly review.",
                metricLabel: "Category delta",
                metricValue: Number(topSpike.delta.toFixed(2)),
            });
        }

        const last90Days = recentExpenses
            .filter(
                (expense) =>
                    new Date(expense.date) >=
                    new Date(
                        now.getFullYear(),
                        now.getMonth(),
                        now.getDate() - 90,
                    ),
            )
            .map((expense) => Number(expense.amount || 0));

        if (last90Days.length >= 8) {
            const avg =
                last90Days.reduce((sum, value) => sum + value, 0) /
                last90Days.length;
            const variance =
                last90Days.reduce((sum, value) => sum + (value - avg) ** 2, 0) /
                last90Days.length;
            const stdDev = Math.sqrt(variance);
            const anomalyThreshold = Math.max(
                avg * 1.6,
                avg + stdDev * 1.75,
                250,
            );

            const anomalous = recentExpenses
                .filter(
                    (expense) =>
                        new Date(expense.date) >=
                            new Date(
                                now.getFullYear(),
                                now.getMonth(),
                                now.getDate() - 30,
                            ) &&
                        Number(expense.amount || 0) >= anomalyThreshold,
                )
                .sort((a, b) => b.amount - a.amount)[0];

            if (anomalous) {
                insights.push({
                    id: `single-anomaly-${anomalous._id}`,
                    kind: "anomaly",
                    severity: "medium",
                    title: "Unusual high-value expense detected",
                    message: `${anomalous.description} (${anomalous.type}) at ${Number(anomalous.amount).toFixed(0)} ETB is well above your recent baseline.`,
                    recommendation:
                        "Tag this item and decide if it is one-time or should influence your regular monthly planning.",
                    metricLabel: "Anomaly threshold",
                    metricValue: Number(anomalyThreshold.toFixed(2)),
                });
            }
        }

        if (recurringExpenses.length > 0) {
            const recurringTotal = recurringExpenses.reduce(
                (sum, expense) => sum + Number(expense.amount || 0),
                0,
            );

            insights.push({
                id: "recurring-pressure",
                kind: "recurring",
                severity:
                    recurringTotal > currentMonthTotal * 0.45 ? "high" : "low",
                title: "Upcoming recurring pressure",
                message: `${recurringExpenses.length} recurring expense${recurringExpenses.length === 1 ? " is" : "s are"} due soon, totaling ${recurringTotal.toFixed(0)} ETB.`,
                recommendation:
                    "Reserve this amount early to avoid end-of-month cash flow surprises.",
                metricLabel: "Upcoming recurring",
                metricValue: Number(recurringTotal.toFixed(2)),
            });
        }

        const ordered = insights
            .sort((a, b) => {
                const score = { high: 3, medium: 2, low: 1 };
                return score[b.severity] - score[a.severity];
            })
            .slice(0, 6);

        res.json({
            generatedAt: new Date().toISOString(),
            summary: {
                insightCount: ordered.length,
                monthlyDeltaPercent: Number(monthlyDeltaPercent.toFixed(2)),
            },
            insights: ordered,
        });
    } catch (err) {
        console.error("getInsights error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.getForecast = async (req, res) => {
    try {
        const userId = req.user._id;
        const scenario = ["conservative", "baseline", "aggressive"].includes(
            String(req.query.scenario || ""),
        )
            ? String(req.query.scenario)
            : "baseline";

        const requestedWindow = Number.parseInt(
            String(req.query.window || 6),
            10,
        );
        const windowMonths = [1, 3, 6, 12].includes(requestedWindow)
            ? requestedWindow
            : 6;

        const scenarioProfiles = {
            conservative: {
                variableMultiplier: 0.55,
            },
            baseline: {
                variableMultiplier: 1,
            },
            aggressive: {
                variableMultiplier: 1.6,
            },
        };

        const now = new Date();
        const windowStart = new Date(
            now.getFullYear(),
            now.getMonth() - windowMonths,
            1,
        );
        const currentMonthStart = new Date(
            now.getFullYear(),
            now.getMonth(),
            1,
        );
        const nextMonthStart = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            1,
        );
        const monthAfterNextStart = new Date(
            now.getFullYear(),
            now.getMonth() + 2,
            1,
        );

        const [
            monthlyHistory,
            monthlyTypeHistory,
            currentMonthAgg,
            recurringExpenses,
            recurringTemplates,
            recurringIncomeTemplates,
        ] = await Promise.all([
            Expense.aggregate([
                {
                    $match: {
                        userId,
                        included: true,
                        date: { $gte: windowStart, $lt: currentMonthStart },
                    },
                },
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
                    },
                },
                { $sort: { "_id.year": 1, "_id.month": 1 } },
            ]),
            Expense.aggregate([
                {
                    $match: {
                        userId,
                        included: true,
                        date: { $gte: windowStart, $lt: currentMonthStart },
                    },
                },
                {
                    $project: {
                        year: { $year: "$date" },
                        month: { $month: "$date" },
                        type: "$type",
                        amount: 1,
                    },
                },
                {
                    $group: {
                        _id: {
                            year: "$year",
                            month: "$month",
                            type: "$type",
                        },
                        total: { $sum: "$amount" },
                    },
                },
                { $sort: { "_id.year": 1, "_id.month": 1 } },
            ]),
            Expense.aggregate([
                {
                    $match: {
                        userId,
                        included: true,
                        date: { $gte: currentMonthStart, $lt: nextMonthStart },
                    },
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$amount" },
                    },
                },
            ]),
            Expense.find({
                userId,
                isRecurring: true,
            })
                .select(
                    "amount frequency nextDueDate recurrenceRules endDate date type",
                )
                .lean(),
            Template.find({
                userId,
                isRecurring: true,
                status: "active",
                category: "expense",
            })
                .select(
                    "price frequency startDate recurrenceRules endDate dayOfMonth type",
                )
                .lean(),
            Template.find({
                userId,
                isRecurring: true,
                status: "active",
                category: "income",
            })
                .select(
                    "price frequency startDate recurrenceRules endDate dayOfMonth type",
                )
                .lean(),
        ]);

        const monthSlots = Array.from({ length: windowMonths }).map(
            (_, index) => {
                const cursor = new Date(
                    windowStart.getFullYear(),
                    windowStart.getMonth() + index,
                    1,
                );
                return {
                    year: cursor.getFullYear(),
                    month: cursor.getMonth() + 1,
                    key: `${cursor.getFullYear()}-${cursor.getMonth() + 1}`,
                };
            },
        );

        const monthlyMap = new Map(
            monthlyHistory.map((row) => [
                `${row._id.year}-${row._id.month}`,
                Number(row.total || 0),
            ]),
        );

        const monthlySeries = monthSlots.map((slot) => ({
            year: slot.year,
            month: slot.month,
            total: Number((monthlyMap.get(slot.key) || 0).toFixed(2)),
        }));

        const historicalTotals = monthlySeries.map((item) => item.total);
        const nonZeroHistoryTotals = historicalTotals.filter(
            (value) => value > 0,
        );
        const scenarioProfile =
            scenarioProfiles[scenario] || scenarioProfiles.baseline;
        const scenarioMultiplier = scenarioProfile.variableMultiplier;
        const historicalStdDev = standardDeviation(
            nonZeroHistoryTotals.length
                ? nonZeroHistoryTotals
                : historicalTotals,
        );

        const currentMonthSpend = Number(currentMonthAgg[0]?.total || 0);
        const daysInCurrentMonth = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0,
        ).getDate();
        const daysElapsedInMonth = Math.max(1, now.getDate());
        const remainingDaysInMonth = Math.max(
            0,
            daysInCurrentMonth - daysElapsedInMonth,
        );
        const dailyRunRate =
            currentMonthSpend > 0 ? currentMonthSpend / daysElapsedInMonth : 0;
        const projectedCurrentMonthEndSpend = Number(
            (currentMonthSpend + dailyRunRate * remainingDaysInMonth).toFixed(
                2,
            ),
        );

        const baselineWindowValues =
            nonZeroHistoryTotals.length > 0
                ? nonZeroHistoryTotals
                : historicalTotals.length > 0
                  ? historicalTotals
                  : [projectedCurrentMonthEndSpend || currentMonthSpend || 0];
        const historicalBaseline =
            calculateWeightedAverage(baselineWindowValues);

        const currentMonthMomentum =
            projectedCurrentMonthEndSpend ||
            currentMonthSpend ||
            historicalBaseline;
        const currentMonthBlendWeight = clamp(
            0.2 + (daysElapsedInMonth / daysInCurrentMonth) * 0.6,
            0.25,
            0.8,
        );
        const anchoredBaselineBeforeScenario = historicalBaseline
            ? historicalBaseline * (1 - currentMonthBlendWeight) +
              currentMonthMomentum * currentMonthBlendWeight
            : currentMonthMomentum;
        const baselineSpend =
            anchoredBaselineBeforeScenario * scenarioMultiplier;

        const trendSeries = baselineWindowValues
            .filter((value) => value > 0)
            .concat(currentMonthMomentum > 0 ? [currentMonthMomentum] : []);

        const trendRateRaw =
            trendSeries.length >= 2 && trendSeries[0] > 0
                ? (trendSeries[trendSeries.length - 1] - trendSeries[0]) /
                  trendSeries[0] /
                  Math.max(1, trendSeries.length - 1)
                : 0;
        const monthlyTrendDrift = clamp(trendRateRaw, -0.03, 0.03);

        const recurringByTypeFromExpenses = projectRecurringByCategoryForMonth(
            recurringExpenses,
            nextMonthStart,
            monthAfterNextStart,
            "amount",
            "type",
        );

        const recurringByTypeFromTemplates = projectRecurringByCategoryForMonth(
            recurringTemplates,
            nextMonthStart,
            monthAfterNextStart,
            "price",
            "type",
        );

        const recurringByCategory = mergeCategoryMaps(
            recurringByTypeFromExpenses,
            recurringByTypeFromTemplates,
        );

        const recurringFromExpenses = projectRecurringAmountForMonth(
            recurringExpenses,
            nextMonthStart,
            monthAfterNextStart,
        );
        const recurringFromTemplates = projectRecurringAmountForMonth(
            recurringTemplates,
            nextMonthStart,
            monthAfterNextStart,
        );
        const recurringIncomeFromTemplates = projectRecurringAmountForMonth(
            recurringIncomeTemplates,
            nextMonthStart,
            monthAfterNextStart,
        );

        const projectedRecurringSpend =
            recurringFromExpenses + recurringFromTemplates;
        const projectedRecurringIncome = recurringIncomeFromTemplates;
        const projectedSpend = baselineSpend + projectedRecurringSpend;
        const projectedNetCashFlow = projectedRecurringIncome - projectedSpend;

        const confidenceBandWidth = Math.max(
            projectedSpend * 0.08,
            historicalStdDev * 0.7,
            120,
        );
        const projectedMin = Math.max(0, projectedSpend - confidenceBandWidth);
        const projectedMax = projectedSpend + confidenceBandWidth;
        const summaryBand = buildProbabilisticBand(
            projectedSpend,
            Math.max(historicalStdDev * 0.75, projectedSpend * 0.06),
        );

        const monthOverMonthDelta = percentDelta(
            projectedSpend,
            projectedCurrentMonthEndSpend,
        );
        const confidence = clamp(
            Math.round(42 + Math.min(baselineWindowValues.length, 12) * 4.2),
            45,
            93,
        );

        const categoryMonthlyMap = new Map();
        for (const row of monthlyTypeHistory) {
            const type = String(row._id.type || "other").toLowerCase();
            if (!categoryMonthlyMap.has(type)) {
                categoryMonthlyMap.set(type, Array(windowMonths).fill(0));
            }

            const monthIndex = monthSlots.findIndex(
                (slot) =>
                    slot.year === row._id.year && slot.month === row._id.month,
            );
            if (monthIndex >= 0) {
                categoryMonthlyMap.get(type)[monthIndex] = Number(
                    row.total || 0,
                );
            }
        }

        const categories = Array.from(categoryMonthlyMap.entries())
            .map(([type, totals]) => {
                const base =
                    calculateWeightedAverage(totals) * scenarioMultiplier;
                const recurring = recurringByCategory.get(type) || 0;
                const expected = base + recurring;
                const volatility = standardDeviation(totals);
                const width = Math.max(expected * 0.12, volatility * 0.65, 40);
                const band = buildProbabilisticBand(
                    expected,
                    Math.max(volatility * 0.65, expected * 0.08, 18),
                );

                return {
                    type,
                    expected: Number(expected.toFixed(2)),
                    min: Number(Math.max(0, expected - width).toFixed(2)),
                    max: Number((expected + width).toFixed(2)),
                    recurring: Number(recurring.toFixed(2)),
                    ...band,
                };
            })
            .sort((a, b) => b.expected - a.expected)
            .slice(0, 8);

        const next12Months = Array.from({ length: 12 }).map((_, idx) => {
            const monthStart = new Date(
                now.getFullYear(),
                now.getMonth() + 1 + idx,
                1,
            );
            const monthEnd = new Date(
                now.getFullYear(),
                now.getMonth() + 2 + idx,
                1,
            );

            const recurringProjection =
                projectRecurringAmountForMonth(
                    recurringExpenses,
                    monthStart,
                    monthEnd,
                ) +
                projectRecurringAmountForMonth(
                    recurringTemplates,
                    monthStart,
                    monthEnd,
                );
            const recurringIncomeProjection = projectRecurringAmountForMonth(
                recurringIncomeTemplates,
                monthStart,
                monthEnd,
            );

            const trendGrowthFactor = Math.pow(1 + monthlyTrendDrift, idx + 1);
            const total =
                baselineSpend * trendGrowthFactor + recurringProjection;
            const netCashFlow = recurringIncomeProjection - total;
            const bandWidth = Math.max(
                total * 0.08,
                historicalStdDev * 0.75,
                120,
            );
            const probabilistic = buildProbabilisticBand(
                total,
                Math.max(historicalStdDev * 0.8, total * 0.065),
            );

            return {
                year: monthStart.getFullYear(),
                month: monthStart.getMonth() + 1,
                projectedSpend: Number(total.toFixed(2)),
                projectedRecurringSpend: Number(recurringProjection.toFixed(2)),
                projectedRecurringIncome: Number(
                    recurringIncomeProjection.toFixed(2),
                ),
                projectedNetCashFlow: Number(netCashFlow.toFixed(2)),
                min: Number(Math.max(0, total - bandWidth).toFixed(2)),
                max: Number((total + bandWidth).toFixed(2)),
                ...probabilistic,
            };
        });

        const next6MonthsSpend = Number(
            next12Months
                .slice(0, 6)
                .reduce((sum, month) => sum + month.projectedSpend, 0)
                .toFixed(2),
        );

        const next12MonthsSpend = Number(
            next12Months
                .reduce((sum, month) => sum + month.projectedSpend, 0)
                .toFixed(2),
        );
        const next6MonthsIncome = Number(
            next12Months
                .slice(0, 6)
                .reduce((sum, month) => sum + month.projectedRecurringIncome, 0)
                .toFixed(2),
        );
        const next12MonthsIncome = Number(
            next12Months
                .reduce((sum, month) => sum + month.projectedRecurringIncome, 0)
                .toFixed(2),
        );
        const next6MonthsNet = Number(
            (next6MonthsIncome - next6MonthsSpend).toFixed(2),
        );
        const next12MonthsNet = Number(
            (next12MonthsIncome - next12MonthsSpend).toFixed(2),
        );

        res.json({
            generatedAt: new Date().toISOString(),
            request: {
                scenario,
                windowMonths,
            },
            summary: {
                baselineSpend: Number(baselineSpend.toFixed(2)),
                historicalBaselineSpend: Number(historicalBaseline.toFixed(2)),
                anchoredBaselineSpend: Number(
                    anchoredBaselineBeforeScenario.toFixed(2),
                ),
                projectedRecurringSpend: Number(
                    projectedRecurringSpend.toFixed(2),
                ),
                projectedRecurringIncome: Number(
                    projectedRecurringIncome.toFixed(2),
                ),
                projectedSpend: Number(projectedSpend.toFixed(2)),
                projectedCashFlow: Number(projectedNetCashFlow.toFixed(2)),
                monthOverMonthDelta: Number(monthOverMonthDelta.toFixed(2)),
                confidence,
                currentMonthSpend: Number(currentMonthSpend.toFixed(2)),
                dailyRunRate: Number(dailyRunRate.toFixed(2)),
                daysElapsedInMonth,
                daysInMonth: daysInCurrentMonth,
                projectedMin: Number(projectedMin.toFixed(2)),
                projectedMax: Number(projectedMax.toFixed(2)),
                projectedCurrentMonthEndSpend,
                next6MonthsSpend,
                next12MonthsSpend,
                next6MonthsIncome,
                next12MonthsIncome,
                next6MonthsNet,
                next12MonthsNet,
                ...summaryBand,
            },
            historical: monthlySeries,
            forecast: next12Months,
            categories,
            assumptions: {
                model: "Weighted moving average + recurring commitments",
                distribution: "Normal approximation over monthly variance",
                percentileMethod:
                    "P10/P50/P90 computed as mean +/- 1.2816*sigma",
                scenarioMultiplier,
                windowMonths,
                monthlyTrendDrift,
                currentMonthProjection:
                    "Current month uses run-rate projection, then blended with history baseline using elapsed-day confidence weighting",
                recurringTreatment:
                    "Recurring expenses and incomes are treated as fixed commitments by frequency and are not scaled by scenario",
            },
        });
    } catch (err) {
        console.error("getForecast error:", err);
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
                recurringExpense.recurrenceRules,
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
