import { useMemo, useState } from "react";
import SegmentedControl from "./ui/SegmentedControl";
import type { BudgetType } from "../hooks/useBudgetPageData";
import { modalCopy } from "../content/modalCopy";

type WeeklyForm = {
    startDate: string;
    endDate: string;
    totalBudget: number;
};

type MonthlyForm = {
    month: string;
    year: number;
    totalBudget: number;
};

type MultiMonthForm = {
    startDate: string;
    endDate: string;
    totalBudget: number;
};

type YearlyForm = {
    year: number;
    totalBudget: number;
};

type Props = {
    activeTab: BudgetType;
    tabs: BudgetType[];
    weeklyForm: WeeklyForm;
    monthlyForm: MonthlyForm;
    multiMonthForm: MultiMonthForm;
    yearlyForm: YearlyForm;
    setActiveTab: (next: BudgetType) => void;
    setWeeklyForm: (next: WeeklyForm) => void;
    setMonthlyForm: (next: MonthlyForm) => void;
    setMultiMonthForm: (next: MultiMonthForm) => void;
    setYearlyForm: (next: YearlyForm) => void;
    onSave: () => void;
    onCancel: () => void;
};

const steps = ["Type & Amount", "Timings", "Calculations", "Details"];

export default function BudgetCreateModal({
    activeTab,
    tabs,
    weeklyForm,
    monthlyForm,
    multiMonthForm,
    yearlyForm,
    setActiveTab,
    setWeeklyForm,
    setMonthlyForm,
    setMultiMonthForm,
    setYearlyForm,
    onSave,
    onCancel,
}: Props) {
    const [step, setStep] = useState(1);

    const selectedAmount = useMemo(() => {
        if (activeTab === "weekly") return weeklyForm.totalBudget;
        if (activeTab === "monthly") return monthlyForm.totalBudget;
        if (activeTab === "multi-month") return multiMonthForm.totalBudget;
        return yearlyForm.totalBudget;
    }, [activeTab, weeklyForm, monthlyForm, multiMonthForm, yearlyForm]);

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h4 className="text-lg font-semibold">
                    {modalCopy.goals.createTitle}
                </h4>
                <p
                    className="text-xs"
                    style={{ color: "var(--theme-text-secondary)" }}
                >
                    Set up a new financial goal to track your progress.
                </p>
            </div>

            <div className="grid grid-cols-4 gap-2">
                {steps.map((label, index) => {
                    const position = index + 1;
                    const isActive = position === step;
                    const isDone = position < step;
                    return (
                        <div
                            key={label}
                            className="flex flex-col items-center gap-1"
                        >
                            <div
                                className="w-8 h-8 border flex items-center justify-center text-xs"
                                style={{
                                    borderColor: "var(--theme-border)",
                                    backgroundColor:
                                        isActive || isDone
                                            ? "var(--theme-active)"
                                            : "transparent",
                                    color:
                                        isActive || isDone
                                            ? "var(--theme-text)"
                                            : "var(--theme-text-secondary)",
                                }}
                            >
                                {position}
                            </div>
                            <span
                                className="text-[10px] text-center"
                                style={{ color: "var(--theme-text-secondary)" }}
                            >
                                {label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {step === 1 && (
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-medium">
                            Goal Type *
                        </label>
                        <div className="mt-1">
                            <SegmentedControl
                                options={tabs}
                                value={activeTab}
                                onChange={(value) =>
                                    setActiveTab(value as BudgetType)
                                }
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-medium">
                            Target Amount (ETB) *
                        </label>
                        {activeTab === "weekly" && (
                            <input
                                type="number"
                                className="w-full border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] backdrop-blur-[20px] rounded-none transition-colors hover:bg-white/5 active:bg-white/[0.02] mt-1"
                                value={weeklyForm.totalBudget || ""}
                                onChange={(e) =>
                                    setWeeklyForm({
                                        ...weeklyForm,
                                        totalBudget: Number(e.target.value),
                                    })
                                }
                            />
                        )}
                        {activeTab === "monthly" && (
                            <input
                                type="number"
                                className="w-full border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] backdrop-blur-[20px] rounded-none transition-colors hover:bg-white/5 active:bg-white/[0.02] mt-1"
                                value={monthlyForm.totalBudget || ""}
                                onChange={(e) =>
                                    setMonthlyForm({
                                        ...monthlyForm,
                                        totalBudget: Number(e.target.value),
                                    })
                                }
                            />
                        )}
                        {activeTab === "multi-month" && (
                            <input
                                type="number"
                                className="w-full border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] backdrop-blur-[20px] rounded-none transition-colors hover:bg-white/5 active:bg-white/[0.02] mt-1"
                                value={multiMonthForm.totalBudget || ""}
                                onChange={(e) =>
                                    setMultiMonthForm({
                                        ...multiMonthForm,
                                        totalBudget: Number(e.target.value),
                                    })
                                }
                            />
                        )}
                        {activeTab === "yearly" && (
                            <input
                                type="number"
                                className="w-full border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] backdrop-blur-[20px] rounded-none transition-colors hover:bg-white/5 active:bg-white/[0.02] mt-1"
                                value={yearlyForm.totalBudget || ""}
                                onChange={(e) =>
                                    setYearlyForm({
                                        ...yearlyForm,
                                        totalBudget: Number(e.target.value),
                                    })
                                }
                            />
                        )}
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-4">
                    {(activeTab === "weekly" ||
                        activeTab === "multi-month") && (
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-medium">
                                    Start Date
                                </label>
                                <input
                                    type={
                                        activeTab === "weekly"
                                            ? "date"
                                            : "month"
                                    }
                                    value={
                                        activeTab === "weekly"
                                            ? weeklyForm.startDate
                                            : multiMonthForm.startDate
                                    }
                                    onChange={(e) =>
                                        activeTab === "weekly"
                                            ? setWeeklyForm({
                                                  ...weeklyForm,
                                                  startDate: e.target.value,
                                              })
                                            : setMultiMonthForm({
                                                  ...multiMonthForm,
                                                  startDate: e.target.value,
                                              })
                                    }
                                    className="w-full border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] backdrop-blur-[20px] rounded-none transition-colors hover:bg-white/5 active:bg-white/[0.02] mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium">
                                    End Date
                                </label>
                                <input
                                    type={
                                        activeTab === "weekly"
                                            ? "date"
                                            : "month"
                                    }
                                    value={
                                        activeTab === "weekly"
                                            ? weeklyForm.endDate
                                            : multiMonthForm.endDate
                                    }
                                    onChange={(e) =>
                                        activeTab === "weekly"
                                            ? setWeeklyForm({
                                                  ...weeklyForm,
                                                  endDate: e.target.value,
                                              })
                                            : setMultiMonthForm({
                                                  ...multiMonthForm,
                                                  endDate: e.target.value,
                                              })
                                    }
                                    className="w-full border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] backdrop-blur-[20px] rounded-none transition-colors hover:bg-white/5 active:bg-white/[0.02] mt-1"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === "monthly" && (
                        <div>
                            <label className="text-xs font-medium">Month</label>
                            <input
                                type="month"
                                value={monthlyForm.month}
                                onChange={(e) =>
                                    setMonthlyForm({
                                        ...monthlyForm,
                                        month: e.target.value,
                                    })
                                }
                                className="w-full border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] backdrop-blur-[20px] rounded-none transition-colors hover:bg-white/5 active:bg-white/[0.02] mt-1"
                            />
                        </div>
                    )}

                    {activeTab === "yearly" && (
                        <div>
                            <label className="text-xs font-medium">Year</label>
                            <input
                                type="number"
                                value={yearlyForm.year}
                                onChange={(e) =>
                                    setYearlyForm({
                                        ...yearlyForm,
                                        year: Number(e.target.value),
                                    })
                                }
                                className="w-full border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] backdrop-blur-[20px] rounded-none transition-colors hover:bg-white/5 active:bg-white/[0.02] mt-1"
                            />
                        </div>
                    )}
                </div>
            )}

            {step === 3 && (
                <div className="space-y-3">
                    <div
                        className="border p-3"
                        style={{ borderColor: "var(--theme-border)" }}
                    >
                        <div
                            className="text-xs"
                            style={{ color: "var(--theme-text-secondary)" }}
                        >
                            Estimated monthly target
                        </div>
                        <div className="text-lg font-semibold">
                            {selectedAmount.toLocaleString()} ETB
                        </div>
                    </div>
                    <p
                        className="text-xs"
                        style={{ color: "var(--theme-text-secondary)" }}
                    >
                        This estimate helps compare target balance and spending
                        pace.
                    </p>
                </div>
            )}

            {step === 4 && (
                <div className="space-y-2">
                    <p
                        className="text-sm"
                        style={{ color: "var(--theme-text-secondary)" }}
                    >
                        Review and create your new goal.
                    </p>
                    <div
                        className="border p-3 text-sm"
                        style={{ borderColor: "var(--theme-border)" }}
                    >
                        <p>
                            Type: <strong>{activeTab.replace("-", " ")}</strong>
                        </p>
                        <p>
                            Target:{" "}
                            <strong>
                                {selectedAmount.toLocaleString()} ETB
                            </strong>
                        </p>
                    </div>
                </div>
            )}

            <div
                className="flex items-center justify-between pt-2 border-t"
                style={{ borderColor: "var(--theme-border)" }}
            >
                <button
                    type="button"
                    onClick={onCancel}
                    className="border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] backdrop-blur-[20px] rounded-none transition-colors hover:bg-white/5 active:bg-white/[0.02] text-sm"
                >
                    {modalCopy.common.cancel}
                </button>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setStep((prev) => Math.max(1, prev - 1))}
                        className="border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] backdrop-blur-[20px] rounded-none transition-colors hover:bg-white/5 active:bg-white/[0.02] text-sm"
                        disabled={step === 1}
                    >
                        Back
                    </button>
                    {step < 4 ? (
                        <button
                            type="button"
                            onClick={() =>
                                setStep((prev) => Math.min(4, prev + 1))
                            }
                            className="border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] backdrop-blur-[20px] rounded-none transition-colors hover:bg-white/5 active:bg-white/[0.02] text-sm"
                            style={{
                                backgroundColor: "var(--theme-active)",
                                color: "var(--theme-text)",
                            }}
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={onSave}
                            className="border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] backdrop-blur-[20px] rounded-none transition-colors hover:bg-white/5 active:bg-white/[0.02] text-sm"
                            style={{
                                backgroundColor: "var(--theme-active)",
                                color: "var(--theme-text)",
                            }}
                        >
                            {modalCopy.goals.createConfirm}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
