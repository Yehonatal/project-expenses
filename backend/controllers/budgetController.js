const Budget = require("../models/budgetModel");
const Expense = require("../models/expenseModel");

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

// Get budgets (can filter by range if needed)
const getBudgets = async (req, res) => {
    try {
        const budgets = await Budget.find({ userId: req.user._id });
        for (const budget of budgets) {
            budget.spent = await calculateSpent(
                req.user._id,
                budget.startMonth,
                budget.startYear,
                budget.endMonth,
                budget.endYear
            );
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
        const { startMonth, startYear, endMonth, endYear, totalBudget } =
            req.body;
        const budget = await Budget.findOneAndUpdate(
            { userId: req.user._id, startMonth, startYear, endMonth, endYear },
            { totalBudget },
            { upsert: true, new: true }
        );
        budget.spent = await calculateSpent(
            req.user._id,
            startMonth,
            startYear,
            endMonth,
            endYear
        );
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
