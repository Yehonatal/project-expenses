import axios from "axios";
import type { Template } from "../types/template";
import type {
    Expense,
    ExpenseFilterParams,
    ExpenseFilterPreset,
    ExpenseFilterPresetPayload,
    PaginatedExpensesResponse,
} from "../types/expense";
import type {
    ForecastData,
    ImportSynergyOverview,
    InsightsData,
} from "../types/dashboard";
import type { Workspace } from "../types/workspace";
import type {
    BankAccount,
    ImportBatch,
    ImportBatchDetailsResponse,
    ImportDataPayload,
    ImportJsonResponse,
} from "../types/importData";

export const API = axios.create({
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
export const getExpenseInsights = () =>
    API.get<InsightsData>("/expenses/insights");
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

// Import APIs
export const importJsonData = (data: {
    fileName?: string | null;
    payload: ImportDataPayload;
}) => API.post<ImportJsonResponse>("/imports/json", data);

export const getImportBatches = (params?: { limit?: number }) =>
    API.get<ImportBatch[]>("/imports/batches", { params });

export const getImportBatchDetails = (
    id: string,
    params?: {
        page?: number;
        limit?: number;
        search?: string;
        transactionType?: "DEBIT" | "CREDIT";
    },
) => API.get<ImportBatchDetailsResponse>(`/imports/batches/${id}`, { params });

export const getBankAccounts = () =>
    API.get<BankAccount[]>("/imports/accounts");

export const getBanks = () =>
    API.get<{ message: string; data: import("../types/importData").Bank[] }>(
        "/imports/banks",
    );

export const syncImportBatch = (id: string) =>
    API.post<{ message: string; syncStatus: any }>(
        `/imports/batches/${id}/sync`,
    );

export const createBankAccount = (data: {
    accountNumber: string;
    bankId?: number | null;
    bankName?: string | null;
    bankShortName?: string | null;
    accountHolderName?: string | null;
    balance?: number | null;
}) => API.post<BankAccount>("/imports/accounts", data);

export const getImportSynergyOverview = (params?: {
    batchId?: string;
    accountKey?: string;
}) => API.get<ImportSynergyOverview>("/imports/synergy", { params });
