const express = require("express");
const {
    getBudgets,
    setBudget,
    deleteBudget,
} = require("../controllers/budgetController");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, getBudgets); // GET /api/budgets
router.post("/", auth, setBudget); // POST /api/budgets { startMonth, startYear, endMonth, endYear, totalBudget }
router.delete("/:id", auth, deleteBudget); // DELETE /api/budgets/:id

module.exports = router;
