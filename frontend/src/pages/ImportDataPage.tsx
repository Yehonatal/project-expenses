import { useEffect, useMemo, useState } from "react";
import {
    FileJson,
    Loader2,
    RefreshCw,
    Search,
    Upload,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import PageContainer from "../components/ui/PageContainer";
import GlassCard from "../components/ui/GlassCard";
import PageSkeleton from "../components/ui/PageSkeleton";
import { uiControl } from "../utils/uiClasses";
import {
    createBankAccount,
    getBankAccounts,
    getImportBatchDetails,
    getImportBatches,
    importJsonData,
} from "../api/api";
import type {
    BankAccount,
    ImportBatch,
    ImportBatchDetailsResponse,
    ImportDataPayload,
    ImportedTransaction,
} from "../types/importData";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
});

const amountFormatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const formatDate = (value?: string | null) => {
    if (!value) return "-";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "-";
    return dateFormatter.format(parsed);
};

const readArray = (value: unknown) => (Array.isArray(value) ? value : []);

const recordLabel = (record: Record<string, unknown>) => {
    const label =
        record.name ||
        record.shortName ||
        record.accountNumber ||
        record.reference;
    return label ? String(label) : "Unnamed";
};

export default function ImportDataPage() {
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [status, setStatus] = useState("");

    const [fileName, setFileName] = useState("");
    const [parsedPayload, setParsedPayload] =
        useState<ImportDataPayload | null>(null);

    const [batches, setBatches] = useState<ImportBatch[]>([]);
    const [selectedBatchId, setSelectedBatchId] = useState("");

    const [detailsLoading, setDetailsLoading] = useState(false);
    const [details, setDetails] = useState<ImportBatchDetailsResponse | null>(
        null,
    );

    const [page, setPage] = useState(1);
    const [transactionType, setTransactionType] = useState<
        "ALL" | "DEBIT" | "CREDIT"
    >("ALL");
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [newAccountNumber, setNewAccountNumber] = useState("");
    const [newBankName, setNewBankName] = useState("");
    const [newHolderName, setNewHolderName] = useState("");
    const [newBalance, setNewBalance] = useState("");
    const [creatingAccount, setCreatingAccount] = useState(false);

    const payloadSummary = useMemo(() => {
        if (!parsedPayload) return null;

        return {
            accounts: readArray(parsedPayload.accounts).length,
            banks: readArray(parsedPayload.banks).length,
            categories: readArray(parsedPayload.categories).length,
            transactions: readArray(parsedPayload.transactions).length,
            exportDate: parsedPayload.exportDate,
            version: parsedPayload.version,
        };
    }, [parsedPayload]);

    const selectedBatch = useMemo(
        () => batches.find((batch) => batch._id === selectedBatchId),
        [batches, selectedBatchId],
    );

    const loadBatches = async (preferredBatchId?: string) => {
        const res = await getImportBatches({ limit: 30 });
        const list = res.data || [];
        setBatches(list);

        if (!list.length) {
            setSelectedBatchId("");
            return;
        }

        if (preferredBatchId) {
            const match = list.find((batch) => batch._id === preferredBatchId);
            if (match) {
                setSelectedBatchId(match._id);
                return;
            }
        }

        if (!selectedBatchId) {
            setSelectedBatchId(list[0]._id);
            return;
        }

        const stillExists = list.some((batch) => batch._id === selectedBatchId);
        if (!stillExists) {
            setSelectedBatchId(list[0]._id);
        }
    };

    const loadBankAccounts = async () => {
        const res = await getBankAccounts();
        setBankAccounts(res.data || []);
    };

    useEffect(() => {
        let mounted = true;

        const init = async () => {
            try {
                await Promise.all([loadBatches(), loadBankAccounts()]);
            } catch (error) {
                console.error("Failed to load import batches:", error);
                if (mounted) {
                    setStatus("Could not load import batches right now.");
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        void init();

        return () => {
            mounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!selectedBatchId) {
            setDetails(null);
            return;
        }

        let mounted = true;

        const loadDetails = async () => {
            try {
                setDetailsLoading(true);
                const res = await getImportBatchDetails(selectedBatchId, {
                    page,
                    limit: 50,
                    transactionType:
                        transactionType === "ALL" ? undefined : transactionType,
                    search: search || undefined,
                });

                if (!mounted) return;
                setDetails(res.data);
            } catch (error) {
                console.error("Failed to load import details:", error);
                if (mounted) {
                    setStatus("Could not load import details right now.");
                }
            } finally {
                if (mounted) {
                    setDetailsLoading(false);
                }
            }
        };

        void loadDetails();

        return () => {
            mounted = false;
        };
    }, [selectedBatchId, page, transactionType, search]);

    const handleFileSelected = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setStatus("");
        setFileName(file.name);

        try {
            const content = await file.text();
            const parsed = JSON.parse(content) as ImportDataPayload;

            if (
                !Array.isArray(parsed.transactions) ||
                parsed.transactions.length === 0
            ) {
                setParsedPayload(null);
                setStatus("The selected file has no transactions to import.");
                return;
            }

            setParsedPayload(parsed);
            setStatus("File parsed. Ready to import.");
        } catch (error) {
            console.error("Invalid JSON import file:", error);
            setParsedPayload(null);
            setStatus("Could not parse this JSON file.");
        }
    };

    const handleImport = async () => {
        if (!parsedPayload) {
            setStatus("Choose a valid JSON file first.");
            return;
        }

        try {
            setBusy(true);
            const res = await importJsonData({
                fileName,
                payload: parsedPayload,
            });

            const importedBatchId = res.data?.importBatch?._id as
                | string
                | undefined;

            setPage(1);
            await loadBatches(importedBatchId);
            await loadBankAccounts();
            setStatus("Import finished. Data stored successfully.");
        } catch (error) {
            console.error("Failed to import JSON:", error);
            setStatus("Import failed. Please try again.");
        } finally {
            setBusy(false);
        }
    };

    const applySearch = () => {
        setPage(1);
        setSearch(searchInput.trim());
    };

    const onTypeChange = (value: "ALL" | "DEBIT" | "CREDIT") => {
        setPage(1);
        setTransactionType(value);
    };

    const handleCreateAccount = async () => {
        const accountNumber = newAccountNumber.trim();
        if (!accountNumber) {
            setStatus("Account number is required to create an account.");
            return;
        }

        try {
            setCreatingAccount(true);
            await createBankAccount({
                accountNumber,
                bankName: newBankName.trim() || null,
                accountHolderName: newHolderName.trim() || null,
                balance:
                    newBalance.trim() === ""
                        ? null
                        : Number.parseFloat(newBalance),
            });

            setNewAccountNumber("");
            setNewBankName("");
            setNewHolderName("");
            setNewBalance("");
            await loadBankAccounts();
            setStatus("Bank account saved.");
        } catch (err) {
            console.error("Failed to create bank account", err);
            setStatus("Could not create bank account right now.");
        } finally {
            setCreatingAccount(false);
        }
    };

    const transactions: ImportedTransaction[] =
        details?.transactions.items || [];

    if (loading) {
        return <PageSkeleton title="Loading imports" />;
    }

    return (
        <PageContainer
            title="Import Data"
            subtitle="Upload your totals JSON, save it to the database, and browse imported records inside the app."
            className="space-y-6"
        >
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <GlassCard className="space-y-3 xl:col-span-2">
                    <div className="flex items-center justify-between gap-2">
                        <h3 className="flex items-center gap-2 text-sm font-semibold">
                            <FileJson className="h-4 w-4" />
                            JSON Upload
                        </h3>
                        <button
                            type="button"
                            className={uiControl.button}
                            onClick={() => void loadBatches(selectedBatchId)}
                            disabled={busy}
                        >
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </button>
                    </div>

                    <input
                        type="file"
                        accept="application/json,.json"
                        onChange={handleFileSelected}
                        className={uiControl.input}
                    />

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                            <div className="text-[11px] uppercase text-[var(--theme-text-secondary)]">
                                Accounts
                            </div>
                            <div className="text-base font-semibold">
                                {payloadSummary?.accounts ?? "-"}
                            </div>
                        </div>
                        <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                            <div className="text-[11px] uppercase text-[var(--theme-text-secondary)]">
                                Banks
                            </div>
                            <div className="text-base font-semibold">
                                {payloadSummary?.banks ?? "-"}
                            </div>
                        </div>
                        <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                            <div className="text-[11px] uppercase text-[var(--theme-text-secondary)]">
                                Categories
                            </div>
                            <div className="text-base font-semibold">
                                {payloadSummary?.categories ?? "-"}
                            </div>
                        </div>
                        <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                            <div className="text-[11px] uppercase text-[var(--theme-text-secondary)]">
                                Transactions
                            </div>
                            <div className="text-base font-semibold">
                                {payloadSummary?.transactions ?? "-"}
                            </div>
                        </div>
                    </div>

                    <div className="text-xs text-[var(--theme-text-secondary)]">
                        <div>File: {fileName || "-"}</div>
                        <div>
                            Export date:{" "}
                            {formatDate(payloadSummary?.exportDate)}
                        </div>
                        <div>Version: {payloadSummary?.version || "-"}</div>
                    </div>

                    <button
                        type="button"
                        className={uiControl.buttonPrimary}
                        onClick={handleImport}
                        disabled={!parsedPayload || busy}
                    >
                        {busy ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Upload className="h-4 w-4" />
                        )}
                        Import into DB
                    </button>
                </GlassCard>

                <GlassCard className="space-y-2">
                    <h3 className="text-sm font-semibold">Import Batches</h3>
                    <div className="max-h-[320px] space-y-2 overflow-auto pr-1">
                        {batches.length === 0 && (
                            <div className="text-xs text-[var(--theme-text-secondary)]">
                                No import batches yet.
                            </div>
                        )}
                        {batches.map((batch) => (
                            <button
                                key={batch._id}
                                type="button"
                                onClick={() => {
                                    setSelectedBatchId(batch._id);
                                    setPage(1);
                                }}
                                className={`w-full border px-3 py-2 text-left text-xs transition-colors ${
                                    selectedBatchId === batch._id
                                        ? "border-[var(--theme-accent)] bg-[var(--theme-hover)]"
                                        : "border-[var(--theme-border)] bg-[var(--theme-surface)] hover:bg-[var(--theme-hover)]"
                                }`}
                            >
                                <div className="font-semibold">
                                    {batch.sourceFileName || "Imported JSON"}
                                </div>
                                <div className="text-[11px] text-[var(--theme-text-secondary)]">
                                    {formatDate(batch.createdAt)}
                                </div>
                                <div className="mt-1 text-[11px] text-[var(--theme-text-secondary)]">
                                    {batch.counts.transactions} transactions
                                </div>
                            </button>
                        ))}
                    </div>
                </GlassCard>
            </div>

            <GlassCard className="space-y-3">
                <h3 className="text-sm font-semibold">
                    Bank Accounts (Manual + Imported)
                </h3>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
                    <input
                        value={newAccountNumber}
                        onChange={(event) =>
                            setNewAccountNumber(event.target.value)
                        }
                        placeholder="Account number"
                        className={uiControl.input}
                    />
                    <input
                        value={newBankName}
                        onChange={(event) => setNewBankName(event.target.value)}
                        placeholder="Bank name"
                        className={uiControl.input}
                    />
                    <input
                        value={newHolderName}
                        onChange={(event) =>
                            setNewHolderName(event.target.value)
                        }
                        placeholder="Account holder"
                        className={uiControl.input}
                    />
                    <div className="flex gap-2">
                        <input
                            value={newBalance}
                            onChange={(event) =>
                                setNewBalance(event.target.value)
                            }
                            placeholder="Balance"
                            className={uiControl.input}
                        />
                        <button
                            type="button"
                            className={uiControl.buttonPrimary}
                            onClick={handleCreateAccount}
                            disabled={creatingAccount}
                        >
                            {creatingAccount ? "Saving" : "Create"}
                        </button>
                    </div>
                </div>

                <div className="max-h-[220px] overflow-auto border border-[var(--theme-border)]">
                    <table className="min-w-full text-xs">
                        <thead className="bg-[var(--theme-surface)] text-[var(--theme-text-secondary)]">
                            <tr>
                                <th className="px-2 py-2 text-left">Account</th>
                                <th className="px-2 py-2 text-left">Bank</th>
                                <th className="px-2 py-2 text-left">Holder</th>
                                <th className="px-2 py-2 text-right">
                                    Balance
                                </th>
                                <th className="px-2 py-2 text-left">Source</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bankAccounts.map((account) => (
                                <tr
                                    key={account._id}
                                    className="border-t border-[var(--theme-border)]"
                                >
                                    <td className="px-2 py-2">
                                        {account.accountNumber}
                                    </td>
                                    <td className="px-2 py-2">
                                        {account.bankShortName ||
                                            account.bankName ||
                                            "-"}
                                    </td>
                                    <td className="px-2 py-2">
                                        {account.accountHolderName || "-"}
                                    </td>
                                    <td className="px-2 py-2 text-right">
                                        {account.balance == null
                                            ? "-"
                                            : `ETB ${amountFormatter.format(account.balance)}`}
                                    </td>
                                    <td className="px-2 py-2 uppercase">
                                        {account.source}
                                    </td>
                                </tr>
                            ))}
                            {bankAccounts.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-2 py-4 text-center text-[var(--theme-text-secondary)]"
                                    >
                                        No bank accounts yet. Import data or add
                                        one manually.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {status && (
                <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] px-3 py-2 text-sm">
                    {status}
                </div>
            )}

            {selectedBatch && (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
                    <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                        <div className="text-[11px] uppercase text-[var(--theme-text-secondary)]">
                            Debit total
                        </div>
                        <div className="text-base font-semibold">
                            ETB{" "}
                            {amountFormatter.format(
                                selectedBatch.stats.debitTotal || 0,
                            )}
                        </div>
                    </div>
                    <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                        <div className="text-[11px] uppercase text-[var(--theme-text-secondary)]">
                            Credit total
                        </div>
                        <div className="text-base font-semibold">
                            ETB{" "}
                            {amountFormatter.format(
                                selectedBatch.stats.creditTotal || 0,
                            )}
                        </div>
                    </div>
                    <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                        <div className="text-[11px] uppercase text-[var(--theme-text-secondary)]">
                            Debit count
                        </div>
                        <div className="text-base font-semibold">
                            {selectedBatch.stats.debitCount}
                        </div>
                    </div>
                    <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                        <div className="text-[11px] uppercase text-[var(--theme-text-secondary)]">
                            Credit count
                        </div>
                        <div className="text-base font-semibold">
                            {selectedBatch.stats.creditCount}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <GlassCard className="space-y-2">
                    <h3 className="text-sm font-semibold">Accounts</h3>
                    <div className="max-h-[220px] space-y-1 overflow-auto pr-1 text-xs">
                        {(details?.batch.accounts || []).map((account, idx) => (
                            <div
                                key={`${recordLabel(account)}-${idx}`}
                                className="border border-[var(--theme-border)] bg-[var(--theme-surface)] px-2 py-1.5"
                            >
                                {recordLabel(account)}
                            </div>
                        ))}
                        {!details?.batch.accounts?.length && (
                            <div className="text-[var(--theme-text-secondary)]">
                                No account records.
                            </div>
                        )}
                    </div>
                </GlassCard>

                <GlassCard className="space-y-2">
                    <h3 className="text-sm font-semibold">Banks</h3>
                    <div className="max-h-[220px] space-y-1 overflow-auto pr-1 text-xs">
                        {(details?.batch.banks || []).map((bank, idx) => (
                            <div
                                key={`${recordLabel(bank)}-${idx}`}
                                className="border border-[var(--theme-border)] bg-[var(--theme-surface)] px-2 py-1.5"
                            >
                                {recordLabel(bank)}
                            </div>
                        ))}
                        {!details?.batch.banks?.length && (
                            <div className="text-[var(--theme-text-secondary)]">
                                No bank records.
                            </div>
                        )}
                    </div>
                </GlassCard>

                <GlassCard className="space-y-2">
                    <h3 className="text-sm font-semibold">Categories</h3>
                    <div className="max-h-[220px] space-y-1 overflow-auto pr-1 text-xs">
                        {(details?.batch.categories || []).map(
                            (category, idx) => (
                                <div
                                    key={`${recordLabel(category)}-${idx}`}
                                    className="border border-[var(--theme-border)] bg-[var(--theme-surface)] px-2 py-1.5"
                                >
                                    {recordLabel(category)}
                                </div>
                            ),
                        )}
                        {!details?.batch.categories?.length && (
                            <div className="text-[var(--theme-text-secondary)]">
                                No category records.
                            </div>
                        )}
                    </div>
                </GlassCard>
            </div>

            <GlassCard className="space-y-4">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                    <h3 className="text-sm font-semibold">
                        Imported Transactions
                    </h3>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <div className="flex items-center gap-2 sm:col-span-2">
                            <input
                                className={uiControl.input}
                                placeholder="Search reference, receiver, bank..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") applySearch();
                                }}
                            />
                            <button
                                type="button"
                                className={uiControl.button}
                                onClick={applySearch}
                            >
                                <Search className="h-4 w-4" />
                            </button>
                        </div>

                        <select
                            className={uiControl.select}
                            value={transactionType}
                            onChange={(e) =>
                                onTypeChange(
                                    e.target.value as
                                        | "ALL"
                                        | "DEBIT"
                                        | "CREDIT",
                                )
                            }
                        >
                            <option value="ALL">All types</option>
                            <option value="DEBIT">Debit</option>
                            <option value="CREDIT">Credit</option>
                        </select>
                    </div>
                </div>

                {detailsLoading ? (
                    <div className="flex items-center gap-2 text-sm text-[var(--theme-text-secondary)]">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading transactions...
                    </div>
                ) : (
                    <>
                        <div className="overflow-auto border border-[var(--theme-border)]">
                            <table className="min-w-full text-xs">
                                <thead className="bg-[var(--theme-surface)] text-[var(--theme-text-secondary)]">
                                    <tr>
                                        <th className="px-2 py-2 text-left">
                                            Time
                                        </th>
                                        <th className="px-2 py-2 text-left">
                                            Type
                                        </th>
                                        <th className="px-2 py-2 text-left">
                                            Bank
                                        </th>
                                        <th className="px-2 py-2 text-right">
                                            Amount
                                        </th>
                                        <th className="px-2 py-2 text-left">
                                            Reference
                                        </th>
                                        <th className="px-2 py-2 text-left">
                                            Party
                                        </th>
                                        <th className="px-2 py-2 text-right">
                                            Balance
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((transaction) => (
                                        <tr
                                            key={transaction._id}
                                            className="border-t border-[var(--theme-border)]"
                                        >
                                            <td className="px-2 py-2">
                                                {formatDate(transaction.time)}
                                            </td>
                                            <td className="px-2 py-2">
                                                {transaction.transactionType}
                                            </td>
                                            <td className="px-2 py-2">
                                                {transaction.bankShortName ||
                                                    transaction.bankName ||
                                                    "-"}
                                            </td>
                                            <td className="px-2 py-2 text-right font-semibold">
                                                ETB{" "}
                                                {amountFormatter.format(
                                                    transaction.amount || 0,
                                                )}
                                            </td>
                                            <td className="px-2 py-2">
                                                {transaction.reference || "-"}
                                            </td>
                                            <td className="px-2 py-2">
                                                {transaction.receiver ||
                                                    transaction.creditor ||
                                                    "-"}
                                            </td>
                                            <td className="px-2 py-2 text-right">
                                                {transaction.currentBalance ==
                                                null
                                                    ? "-"
                                                    : `ETB ${amountFormatter.format(transaction.currentBalance)}`}
                                            </td>
                                        </tr>
                                    ))}
                                    {!transactions.length && (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-2 py-5 text-center text-[var(--theme-text-secondary)]"
                                            >
                                                No transactions matched these
                                                filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex items-center justify-between text-xs text-[var(--theme-text-secondary)]">
                            <span>
                                {details?.transactions.total || 0} total records
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    className={uiControl.button}
                                    disabled={
                                        (details?.transactions.page || 1) <= 1
                                    }
                                    onClick={() =>
                                        setPage((prev) => Math.max(1, prev - 1))
                                    }
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Prev
                                </button>
                                <span>
                                    Page {details?.transactions.page || 1} /{" "}
                                    {details?.transactions.totalPages || 1}
                                </span>
                                <button
                                    type="button"
                                    className={uiControl.button}
                                    disabled={
                                        (details?.transactions.page || 1) >=
                                        (details?.transactions.totalPages || 1)
                                    }
                                    onClick={() => setPage((prev) => prev + 1)}
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </GlassCard>
        </PageContainer>
    );
}
