import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_RENDER_URL || "http://localhost:5000/api",
});

// Separate instance for auth routes (not under /api)
const authAPI = axios.create({
    baseURL:
        import.meta.env.VITE_RENDER_URL?.replace("/api", "") ||
        "http://localhost:5000",
});

export default API;
export { authAPI };

// Budget APIs
export const getBudgets = () => API.get("/budgets");
export const setBudget = (data: {
    type: "weekly" | "monthly" | "multi-month" | "yearly";
    startDate?: string;
    endDate?: string;
    startMonth?: number;
    startYear?: number;
    endMonth?: number;
    endYear?: number;
    year?: number;
    totalBudget: number;
}) => API.post("/budgets", data);
export const deleteBudget = (id: string) => API.delete(`/budgets/${id}`);

// Expense APIs
export const getExpenses = (params?: {
    startDate?: string;
    endDate?: string;
    type?: string;
    limit?: number;
    page?: number;
}) => API.get("/expenses", { params });
export const getExpenseStats = () => API.get("/expenses/stats");

// Export APIs
export const exportExpenses = (format: "csv" | "pdf") =>
    API.get(`/expenses/export/${format}`, { responseType: "blob" });
