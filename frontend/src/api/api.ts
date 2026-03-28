import axios from "axios";
import type { Template } from "../types/template";
import type {
    Expense,
    ExpenseFilterParams,
    ExpenseFilterPreset,
    ExpenseFilterPresetPayload,
    PaginatedExpensesResponse,
} from "../types/expense";
import type { ForecastData, InsightsData } from "../types/dashboard";
import type { Workspace } from "../types/workspace";

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
export const getExpenses = (params?: ExpenseFilterParams) =>
    API.get<Expense[]>("/expenses", { params });

export const getExpensesPaged = (params: ExpenseFilterParams) =>
    API.get<PaginatedExpensesResponse>("/expenses", { params });
export const getExpenseStats = () => API.get("/expenses/stats");
export const getExpenseInsights = () => API.get<InsightsData>("/expenses/insights");
export const getExpenseForecast = (params?: {
    scenario?: "conservative" | "baseline" | "aggressive";
    window?: 1 | 3 | 6 | 12;
}) => API.get<ForecastData>("/expenses/forecast", { params });
export const getExpenseFilterPresets = () =>
    API.get<ExpenseFilterPreset[]>("/expenses/filter-presets");

export const createExpenseFilterPreset = (
    payload: ExpenseFilterPresetPayload,
) => API.post<ExpenseFilterPreset>("/expenses/filter-presets", payload);

export const deleteExpenseFilterPreset = (id: string) =>
    API.delete(`/expenses/filter-presets/${id}`);

export const setDefaultExpenseFilterPreset = (id: string) =>
    API.patch<ExpenseFilterPreset>(`/expenses/filter-presets/${id}/default`);

export const getWorkspaces = () => API.get<Workspace[]>("/workspaces");

export const createWorkspace = (payload: { name: string }) =>
    API.post<Workspace>("/workspaces", payload);

export const joinWorkspace = (payload: { inviteCode: string }) =>
    API.post<Workspace>("/workspaces/join", payload);

export const getWorkspaceMembers = (workspaceId: string) =>
    API.get<Pick<Workspace, "_id" | "name" | "inviteCode" | "members">>(
        `/workspaces/${workspaceId}/members`,
    );

// Template/recurring APIs
export const getTemplates = (params?: {
    status?: "active" | "paused";
    category?: "expense" | "income";
}) => API.get<Template[]>("/templates", { params });

export const createTemplate = (data: Partial<Template>) =>
    API.post<Template>("/templates", data);

export const updateTemplate = (id: string, data: Partial<Template>) =>
    API.put<Template>(`/templates/${id}`, data);

export const removeTemplate = (id: string) => API.delete(`/templates/${id}`);

// Export APIs
export const exportExpenses = (format: "csv" | "pdf") =>
    API.get(`/expenses/export/${format}`, { responseType: "blob" });
