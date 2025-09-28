const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

class GeminiService {
    constructor() {
        this.apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API;
        if (!this.apiKey) {
            throw new Error("Google API key not found");
        }
        this.client = new GoogleGenerativeAI(this.apiKey);
    }

    async parseExpense(description) {
        const prompt = `Parse the following natural language description into structured expense data. Return a JSON array of expense objects.

Description: "${description}"

Rules:
- Extract all expenses mentioned in the description
- Each expense should have: date (use today's date if not specified), description, amount (as number), included (boolean, default true unless explicitly excluded), type (food, transport, drink, internet, shopping, entertainment, other, etc.)
- If "don't include it" or similar phrases are used, set included to false
- For recurring expenses, set isRecurring to true and frequency to "monthly" or "weekly" if mentioned
- Return only valid JSON array, no additional text

Example input: "had lunch at a restaurant for 500 birr, took taxi for 60 to get home"
Example output: [{"date":"2025-01-15","description":"Lunch at restaurant","amount":500,"included":true,"type":"food"},{"date":"2025-01-15","description":"Taxi home","amount":60,"included":true,"type":"transport"}]

Current date: ${new Date().toISOString().split("T")[0]}`;

        try {
            const model = this.client.getGenerativeModel({
                model: "gemini-2.0-flash-exp",
            });
            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.1,
                    topK: 1,
                    topP: 1,
                    maxOutputTokens: 2048,
                },
            });

            const response = result.response;
            const text = response.text();

            // Extract JSON from the response
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                throw new Error("No JSON found in response");
            }

            const expenses = JSON.parse(jsonMatch[0]);

            // Validate and clean the data
            return expenses.map((expense) => ({
                date: expense.date || new Date().toISOString().split("T")[0],
                description: expense.description || "Unknown expense",
                amount:
                    typeof expense.amount === "number"
                        ? expense.amount
                        : parseFloat(expense.amount) || 0,
                included:
                    typeof expense.included === "boolean"
                        ? expense.included
                        : true,
                type: expense.type || "other",
                isRecurring: expense.isRecurring || false,
                frequency: expense.frequency || "monthly",
            }));
        } catch (error) {
            console.error("Gemini API error:", error);
            throw new Error("Failed to parse expense with AI");
        }
    }

    async parseTemplate(description) {
        const prompt = `Parse the following natural language description into structured template data. Return a JSON array of template objects.

Description: "${description}"

Rules:
- Extract all expense templates mentioned in the description
- Each template should have: description, type (food, transport, drink, internet, shopping, entertainment, other, etc.), price (as number)
- Templates are reusable expense patterns that can be used to quickly create expenses
- Return only valid JSON array, no additional text

Example input: "coffee at starbucks costs 50 birr, monthly internet bill is 800 birr, weekly lunch budget of 300 birr"
Example output: [{"description":"Coffee at Starbucks","type":"drink","price":50},{"description":"Monthly internet bill","type":"internet","price":800},{"description":"Weekly lunch budget","type":"food","price":300}]`;

        try {
            const model = this.client.getGenerativeModel({
                model: "gemini-2.0-flash-exp",
            });
            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.1,
                    topK: 1,
                    topP: 1,
                    maxOutputTokens: 2048,
                },
            });

            const response = result.response;
            const text = response.text();

            // Extract JSON from the response
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                throw new Error("No JSON found in response");
            }

            const templates = JSON.parse(jsonMatch[0]);

            // Validate and clean the data
            return templates.map((template) => ({
                description: template.description || "Unknown template",
                type: template.type || "other",
                price:
                    typeof template.price === "number"
                        ? template.price
                        : parseFloat(template.price) || 0,
            }));
        } catch (error) {
            console.error("Gemini API error:", error);
            throw new Error("Failed to parse template with AI");
        }
    }

    async parseBudget(description) {
        const prompt = `Parse the following natural language description into structured budget data. Return a JSON object representing a budget.

Description: "${description}"

Rules:
- Extract budget information from the description
- Budget should have: type ("weekly", "monthly", "multi-month", "yearly"), totalBudget (as number)
- For weekly budgets: include startDate and endDate (ISO date strings)
- For monthly budgets: include startMonth (1-12), startYear
- For multi-month budgets: include startMonth, startYear, endMonth, endYear
- For yearly budgets: include year
- If no specific dates/periods mentioned, default to monthly budget for current month
- Return only valid JSON object, no additional text

Example input: "set monthly budget of 5000 birr for food and transport"
Example output: {"type":"monthly","startMonth":1,"startYear":2025,"totalBudget":5000}

Example input: "weekly budget from jan 1 to jan 7 of 2000 birr"
Example output: {"type":"weekly","startDate":"2025-01-01","endDate":"2025-01-07","totalBudget":2000}

Current date: ${new Date().toISOString().split("T")[0]}`;

        try {
            const model = this.client.getGenerativeModel({
                model: "gemini-2.0-flash-exp",
            });
            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.1,
                    topK: 1,
                    topP: 1,
                    maxOutputTokens: 2048,
                },
            });

            const response = result.response;
            const text = response.text();

            // Extract JSON from the response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error("No JSON found in response");
            }

            const budget = JSON.parse(jsonMatch[0]);

            // Validate and clean the data
            const cleanedBudget = {
                type: budget.type || "monthly",
                totalBudget:
                    typeof budget.totalBudget === "number"
                        ? budget.totalBudget
                        : parseFloat(budget.totalBudget) || 0,
            };

            // Add type-specific fields
            if (budget.type === "weekly") {
                cleanedBudget.startDate = budget.startDate;
                cleanedBudget.endDate = budget.endDate;
            } else if (budget.type === "monthly") {
                cleanedBudget.startMonth = budget.startMonth;
                cleanedBudget.startYear = budget.startYear;
            } else if (budget.type === "multi-month") {
                cleanedBudget.startMonth = budget.startMonth;
                cleanedBudget.startYear = budget.startYear;
                cleanedBudget.endMonth = budget.endMonth;
                cleanedBudget.endYear = budget.endYear;
            } else if (budget.type === "yearly") {
                cleanedBudget.year = budget.year;
            }

            return cleanedBudget;
        } catch (error) {
            console.error("Gemini API error:", error);
            throw new Error("Failed to parse budget with AI");
        }
    }

    async parseRecurring(description) {
        const prompt = `Parse the following natural language description into structured recurring expense data. Return a JSON array of expense objects that are set up for recurring.

Description: "${description}"

Rules:
- Extract all recurring expenses mentioned in the description
- Each expense should have: date (use today's date if not specified), description, amount (as number), included (boolean, default true), type, isRecurring (set to true), frequency ("weekly" or "monthly"), nextDueDate (calculate based on frequency)
- Set isRecurring to true for all parsed items
- Frequency should be "weekly" or "monthly" based on context
- Calculate nextDueDate as the next occurrence based on frequency
- Return only valid JSON array, no additional text

Example input: "monthly gym membership 1500 birr, weekly coffee 200 birr"
Example output: [{"date":"2025-01-15","description":"Gym membership","amount":1500,"included":true,"type":"entertainment","isRecurring":true,"frequency":"monthly","nextDueDate":"2025-02-15"},{"date":"2025-01-15","description":"Weekly coffee","amount":200,"included":true,"type":"drink","isRecurring":true,"frequency":"weekly","nextDueDate":"2025-01-22"}]

Current date: ${new Date().toISOString().split("T")[0]}`;

        try {
            const model = this.client.getGenerativeModel({
                model: "gemini-2.0-flash-exp",
            });
            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.1,
                    topK: 1,
                    topP: 1,
                    maxOutputTokens: 2048,
                },
            });

            const response = result.response;
            const text = response.text();

            // Extract JSON from the response
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                throw new Error("No JSON found in response");
            }

            const expenses = JSON.parse(jsonMatch[0]);

            // Validate and clean the data
            return expenses.map((expense) => ({
                date: expense.date || new Date().toISOString().split("T")[0],
                description: expense.description || "Unknown recurring expense",
                amount:
                    typeof expense.amount === "number"
                        ? expense.amount
                        : parseFloat(expense.amount) || 0,
                included:
                    typeof expense.included === "boolean"
                        ? expense.included
                        : true,
                type: expense.type || "other",
                isRecurring: true,
                frequency: expense.frequency || "monthly",
                nextDueDate: expense.nextDueDate,
            }));
        } catch (error) {
            console.error("Gemini API error:", error);
            throw new Error("Failed to parse recurring expense with AI");
        }
    }
}

const geminiService = new GeminiService();

const parseExpense = async (req, res) => {
    try {
        const { description } = req.body;

        if (!description || !description.trim()) {
            return res.status(400).json({ error: "Description is required" });
        }

        const parsedExpenses = await geminiService.parseExpense(
            description.trim()
        );

        res.json({ expenses: parsedExpenses });
    } catch (error) {
        console.error("Error parsing expense:", error);
        res.status(500).json({ error: "Failed to parse expense" });
    }
};

const parseTemplate = async (req, res) => {
    try {
        const { description } = req.body;

        if (!description || !description.trim()) {
            return res.status(400).json({ error: "Description is required" });
        }

        const parsedTemplates = await geminiService.parseTemplate(
            description.trim()
        );

        res.json({ templates: parsedTemplates });
    } catch (error) {
        console.error("Error parsing template:", error);
        res.status(500).json({ error: "Failed to parse template" });
    }
};

const parseBudget = async (req, res) => {
    try {
        const { description } = req.body;

        if (!description || !description.trim()) {
            return res.status(400).json({ error: "Description is required" });
        }

        const parsedBudget = await geminiService.parseBudget(
            description.trim()
        );

        res.json({ budget: parsedBudget });
    } catch (error) {
        console.error("Error parsing budget:", error);
        res.status(500).json({ error: "Failed to parse budget" });
    }
};

const parseRecurring = async (req, res) => {
    try {
        const { description } = req.body;

        if (!description || !description.trim()) {
            return res.status(400).json({ error: "Description is required" });
        }

        const parsedExpenses = await geminiService.parseRecurring(
            description.trim()
        );

        res.json({ expenses: parsedExpenses });
    } catch (error) {
        console.error("Error parsing recurring expense:", error);
        res.status(500).json({ error: "Failed to parse recurring expense" });
    }
};

module.exports = {
    parseExpense,
    parseTemplate,
    parseBudget,
    parseRecurring,
};
