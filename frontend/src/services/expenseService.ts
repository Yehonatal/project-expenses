import API from "../api/api";
import type { Expense } from "../types/expense";

export interface ExpenseData {
    date: string;
    description: string;
    amount: number;
    included: boolean;
    type: string;
    isRecurring?: boolean;
    frequency?: "weekly" | "monthly";
}

export class ExpenseService {
    static async addExpense(expenseData: ExpenseData): Promise<Expense> {
        try {
            const response = await API.post<Expense>("/expenses", {
                date: expenseData.date,
                description: expenseData.description,
                amount: expenseData.amount,
                included: expenseData.included,
                type: expenseData.type,
                isRecurring: expenseData.isRecurring || false,
                frequency: expenseData.frequency || "monthly",
            });

            return response.data;
        } catch (error) {
            console.error("Failed to add expense:", error);
            throw new Error("Failed to add expense");
        }
    }

    static async addExpenses(
        expenseDataArray: ExpenseData[]
    ): Promise<Expense[]> {
        const results: Expense[] = [];

        for (const expenseData of expenseDataArray) {
            try {
                const expense = await this.addExpense(expenseData);
                results.push(expense);
            } catch (error) {
                console.error(
                    `Failed to add expense "${expenseData.description}":`,
                    error
                );
                // Continue with other expenses even if one fails
            }
        }

        return results;
    }
}
