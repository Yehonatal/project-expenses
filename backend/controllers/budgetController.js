const Budget = require("../models/budgetModel");
const Expense = require("../models/expenseModel");

// Helper to calculate spent across a date range
const calculateSpent = async (userId, budget) => {
    let startDate, endDate;

    switch (budget.type) {
        case "weekly":
        case "monthly":
        case "multi-month":
            startDate =
                budget.startDate ||
                new Date(budget.startYear, budget.startMonth - 1, 1);
            endDate =
                budget.endDate || new Date(budget.endYear, budget.endMonth, 1); // First day of the next month
            break;
        case "yearly":
            startDate = new Date(budget.year, 0, 1); // January 1st
            endDate = new Date(budget.year + 1, 0, 1); // January 1st of next year
            break;
        default:
            throw new Error("Invalid budget type");
    }

    const expenses = await Expense.find({
        userId,
        date: { $gte: startDate, $lt: endDate },
    });
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
};

// Get budgets (can filter by range if needed)
const getBudgets = async (req, res) => {
    try {
        const budgets = await Budget.find({ userId: req.user._id });
        for (const budget of budgets) {
            budget.spent = await calculateSpent(req.user._id, budget);
            await budget.save();
        }
        res.json(budgets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create or update budget
const setBudget = async (req, res) => {
    try {
        const {
            type,
            startDate,
            endDate,
            startMonth,
            startYear,
            endMonth,
            endYear,
            year,
            totalBudget,
        } = req.body;

        let budgetData = { userId: req.user._id, type, totalBudget };

        switch (type) {
            case "weekly":
                budgetData.startDate = new Date(startDate);
                budgetData.endDate = new Date(endDate);
                break;
            case "monthly":
                budgetData.startDate = new Date(startYear, startMonth - 1, 1);
                budgetData.endDate = new Date(startYear, startMonth, 1);
                budgetData.startMonth = startMonth;
                budgetData.startYear = startYear;
                budgetData.endMonth = startMonth;
                budgetData.endYear = startYear;
                break;
            case "multi-month":
                budgetData.startDate = new Date(startYear, startMonth - 1, 1);
                budgetData.endDate = new Date(endYear, endMonth, 1);
                budgetData.startMonth = startMonth;
                budgetData.startYear = startYear;
                budgetData.endMonth = endMonth;
                budgetData.endYear = endYear;
                break;
            case "yearly":
                budgetData.startDate = new Date(year, 0, 1);
                budgetData.endDate = new Date(year + 1, 0, 1);
                budgetData.year = year;
                break;
            default:
                return res.status(400).json({ message: "Invalid budget type" });
        }

        const budget = await Budget.findOneAndUpdate(budgetData, budgetData, {
            upsert: true,
            new: true,
        });

        budget.spent = await calculateSpent(req.user._id, budget);
        await budget.save();
        res.json(budget);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete budget
const deleteBudget = async (req, res) => {
    try {
        await Budget.findOneAndDelete({
            userId: req.user._id,
            _id: req.params.id,
        });
        res.json({ message: "Budget deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getBudgets, setBudget, deleteBudget };
