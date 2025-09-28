import { useState } from "react";
import {
    Sparkles,
    Loader2,
    Receipt,
    FileText,
    Calendar,
    RotateCcw,
} from "lucide-react";
import Modal from "./Modal";
import SegmentedControl from "./ui/SegmentedControl";
import API from "../api/api";
import { ExpenseService } from "../services/expenseService";
import type { Expense } from "../types/expense";
import type { AxiosError } from "axios";

type AIParsingType = "expense" | "template" | "budget" | "recurring";

interface GeminiModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddExpenses: (expenses: Expense[]) => void;
    onToast?: (message: string, type: "success" | "error" | "info") => void;
}

export default function GeminiModal({
    isOpen,
    onClose,
    onAddExpenses,
    onToast,
}: GeminiModalProps) {
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<AIParsingType>("expense");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!description.trim()) {
            onToast?.("Please enter a description", "error");
            return;
        }

        setIsLoading(true);

        try {
            let endpoint = "";
            let successMessage = "";

            switch (activeTab) {
                case "expense":
                    endpoint = "/ai/parse-expense";
                    successMessage = "expense";
                    break;
                case "template":
                    endpoint = "/ai/parse-template";
                    successMessage = "template";
                    break;
                case "budget":
                    endpoint = "/ai/parse-budget";
                    successMessage = "budget";
                    break;
                case "recurring":
                    endpoint = "/ai/parse-recurring";
                    successMessage = "recurring expense";
                    break;
            }

            const response = await API.post(endpoint, {
                description: description.trim(),
            });

            if (activeTab === "expense" || activeTab === "recurring") {
                const parsedExpenses = response.data.expenses;

                if (parsedExpenses.length === 0) {
                    onToast?.(
                        `No ${successMessage}s found in the description`,
                        "error"
                    );
                    return;
                }

                const addedExpenses = await ExpenseService.addExpenses(
                    parsedExpenses
                );

                if (addedExpenses.length > 0) {
                    onAddExpenses(addedExpenses);
                    onToast?.(
                        `Successfully added ${
                            addedExpenses.length
                        } ${successMessage}${
                            addedExpenses.length > 1 ? "s" : ""
                        }! ✨`,
                        "success"
                    );
                    setDescription("");
                    setTimeout(() => onClose(), 2000);
                } else {
                    onToast?.(`Failed to add ${successMessage}s`, "error");
                }
            } else if (activeTab === "template") {
                const parsedTemplates = response.data.templates;

                if (parsedTemplates.length === 0) {
                    onToast?.("No templates found in the description", "error");
                    return;
                }

                // Create templates directly via API
                const createdTemplates = [];
                for (const template of parsedTemplates) {
                    try {
                        const res = await API.post("/templates", {
                            description: template.description,
                            type: template.type,
                            price: template.price,
                        });
                        createdTemplates.push(res.data);
                    } catch (error) {
                        console.error(
                            "Failed to create template:",
                            template,
                            error
                        );
                    }
                }

                if (createdTemplates.length > 0) {
                    onToast?.(
                        `Successfully created ${
                            createdTemplates.length
                        } template${
                            createdTemplates.length > 1 ? "s" : ""
                        }! ✨`,
                        "success"
                    );
                    setDescription("");
                    setTimeout(() => onClose(), 2000);
                } else {
                    onToast?.("Failed to create templates", "error");
                }
            } else if (activeTab === "budget") {
                const parsedBudget = response.data.budget;

                if (!parsedBudget || !parsedBudget.totalBudget) {
                    onToast?.("No budget found in the description", "error");
                    return;
                }

                // Create budget directly via API
                try {
                    const { setBudget } = await import("../api/api");
                    await setBudget(parsedBudget);
                    onToast?.("Successfully created budget! ✨", "success");
                    setDescription("");
                    setTimeout(() => onClose(), 2000);
                } catch (error) {
                    console.error("Failed to create budget:", error);
                    onToast?.("Failed to create budget", "error");
                }
            }
        } catch (error: unknown) {
            console.error("Error processing with AI:", error);
            const axiosError = error as AxiosError<{ error: string }>;
            onToast?.(
                axiosError.response?.data?.error || "Failed to process with AI",
                "error"
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            setDescription("");
            setActiveTab("expense");
            onClose();
        }
    };

    const getTabConfig = () => {
        switch (activeTab) {
            case "expense":
                return {
                    title: "Add Expense",
                    buttonText: "Add Expense",
                    icon: Receipt,
                    placeholder:
                        "Example: had lunch at a restaurant for 500 birr, took taxi for 60 to get home, just signed up for a monthly newsletter for 25",
                    examples: [
                        "just took a ride to get home for 600 birr",
                        "had lunch at a restaurant for 500 birr",
                        "just signed up for a monthly newsletter for 25",
                        "got my mom a bag for 450 don't include it to the total",
                        "I had a coffee for 30, lunch for 500, and took the taxi for 60 to get to work",
                    ],
                };
            case "template":
                return {
                    title: "Create Template",
                    buttonText: "Create Template",
                    icon: FileText,
                    placeholder:
                        "Example: coffee at starbucks costs 50 birr, monthly internet bill is 800 birr, weekly lunch budget of 300 birr",
                    examples: [
                        "coffee at starbucks costs 50 birr",
                        "monthly internet bill is 800 birr",
                        "weekly lunch budget of 300 birr",
                        "taxi fare to work is about 60 birr daily",
                        "gym membership costs 1500 birr monthly",
                    ],
                };
            case "budget":
                return {
                    title: "Set Budget",
                    buttonText: "Set Budget",
                    icon: Calendar,
                    placeholder:
                        "Example: set monthly budget of 5000 birr for food and transport, weekly budget from jan 1 to jan 7 of 2000 birr",
                    examples: [
                        "set monthly budget of 5000 birr for food and transport",
                        "weekly budget from jan 1 to jan 7 of 2000 birr",
                        "yearly budget of 60000 birr for 2025",
                        "multi-month budget from march to june of 15000 birr",
                    ],
                };
            case "recurring":
                return {
                    title: "Add Recurring Expense",
                    buttonText: "Add Recurring Expense",
                    icon: RotateCcw,
                    placeholder:
                        "Example: monthly gym membership 1500 birr, weekly coffee 200 birr, bi-weekly cleaning service 300 birr",
                    examples: [
                        "monthly gym membership 1500 birr",
                        "weekly coffee 200 birr",
                        "bi-weekly cleaning service 300 birr",
                        "monthly internet bill 800 birr",
                        "weekly lunch allowance 400 birr",
                    ],
                };
        }
    };

    const tabConfig = getTabConfig();
    const TabIcon = tabConfig.icon;

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={handleClose}
                title={tabConfig.title}
                actions={
                    <div className="flex gap-3">
                        <button
                            onClick={handleClose}
                            disabled={isLoading}
                            className="glass-button text-sm rounded-lg transition-all hover:bg-theme-surface/30 px-4 py-2"
                            style={{ color: "var(--theme-text)" }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading || !description.trim()}
                            className="glass-button text-sm rounded-lg transition-all hover:bg-theme-surface/30 px-4 py-2 flex items-center gap-2 disabled:opacity-50"
                            style={{
                                backgroundColor: "var(--theme-accent)",
                                color: "var(--theme-background)",
                            }}
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <TabIcon className="w-4 h-4" />
                            )}
                            {isLoading ? "Processing..." : tabConfig.buttonText}
                        </button>
                    </div>
                }
            >
                <div className="space-y-4 relative">
                    <div className="mb-6">
                        <SegmentedControl
                            options={[
                                "expense",
                                "template",
                                "budget",
                                "recurring",
                            ]}
                            value={activeTab}
                            onChange={setActiveTab}
                        />
                    </div>

                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 ">
                            <div className="glass-card p-6 bg-theme-background/80 backdrop-blur-md rounded-xl shadow-xl border border-theme-surface/30">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Loader2
                                            className="w-6 h-6 animate-spin"
                                            style={{
                                                color: "var(--theme-accent)",
                                            }}
                                        />
                                        <Sparkles
                                            className="w-4 h-4 absolute -top-1 -right-1 animate-pulse"
                                            style={{
                                                color: "var(--theme-accent)",
                                            }}
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <span
                                            className="text-sm font-semibold"
                                            style={{
                                                color: "var(--theme-text)",
                                            }}
                                        >
                                            Processing with AI
                                        </span>
                                        <span
                                            className="text-xs opacity-75"
                                            style={{
                                                color: "var(--theme-text-secondary)",
                                            }}
                                        >
                                            Parsing your {activeTab}{" "}
                                            description...
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center gap-2 mb-4">
                        <TabIcon
                            className="w-5 h-5"
                            style={{ color: "var(--theme-accent)" }}
                        />
                        <span
                            className="text-sm font-medium"
                            style={{ color: "var(--theme-text)" }}
                        >
                            Describe your {activeTab} in natural language
                        </span>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder={tabConfig.placeholder}
                                className="w-full glass-button rounded-xl resize-none"
                                style={{
                                    color: "var(--theme-text)",
                                    minHeight: "120px",
                                }}
                                disabled={isLoading}
                                rows={4}
                            />
                        </div>

                        <div className="text-xs text-theme-text-secondary space-y-1">
                            <p>
                                <strong>Examples:</strong>
                            </p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                {tabConfig.examples.map((example, index) => (
                                    <li key={index}>{example}</li>
                                ))}
                            </ul>
                        </div>
                    </form>
                </div>
            </Modal>
        </>
    );
}
