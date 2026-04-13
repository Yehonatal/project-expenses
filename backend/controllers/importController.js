const mongoose = require("mongoose");
const ImportBatch = require("../models/importBatchModel");
const ImportedTransaction = require("../models/importedTransactionModel");
const BankAccount = require("../models/bankAccountModel");
const Expense = require("../models/expenseModel");
const Type = require("../models/typeModel");
const Bank = require("../models/bankModel");

const normalizeArray = (value) => (Array.isArray(value) ? value : []);

const toNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const toNullableNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const toNullableDate = (value) => {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const toTrimmedOrNull = (value) => {
    if (value == null) return null;
    const normalized = String(value).trim();
    return normalized ? normalized : null;
};

const toAccountKey = (value) => {
    const normalized = toTrimmedOrNull(value);
    return normalized || "UNASSIGNED";
};

const weightedAverage = (values) => {
    if (!Array.isArray(values) || values.length === 0) return 0;
    let weightedSum = 0;
    let totalWeight = 0;

    values.forEach((value, index) => {
        const weight = index + 1;
        weightedSum += Number(value || 0) * weight;
        totalWeight += weight;
    });

    return totalWeight ? weightedSum / totalWeight : 0;
};

exports.importJsonData = async (req, res) => {
    try {
        const payload = req.body?.payload;
        const sourceFileName = toTrimmedOrNull(req.body?.fileName);

        if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
            return res.status(400).json({
                message: "payload must be a JSON object",
            });
        }

        const transactions = normalizeArray(payload.transactions);
        if (!transactions.length) {
            return res.status(400).json({
                message: "payload.transactions must be a non-empty array",
            });
        }

        const accounts = normalizeArray(payload.accounts);
        const banks = normalizeArray(payload.banks);
        const categories = normalizeArray(payload.categories);
        const budgets = normalizeArray(payload.budgets);

        const importBatch = await ImportBatch.create({
            userId: req.user._id,
            sourceFileName,
            schemaVersion: toTrimmedOrNull(payload.schemaVersion),
            version: toTrimmedOrNull(payload.version),
            exportDate: toNullableDate(payload.exportDate),
            counts: {
                accounts: accounts.length,
                banks: banks.length,
                categories: categories.length,
                transactions: transactions.length,
            },
            meta: {
                failedParsesCount: normalizeArray(payload.failedParses).length,
                receiverCategoryMappingsCount: normalizeArray(
                    payload.receiverCategoryMappings,
                ).length,
                smsPatternsCount: normalizeArray(payload.smsPatterns).length,
            },
            accounts,
            banks,
            categories,
            budgets,
        });

        // Run data through the pipeline
        const ImportDataPipeline = require("../services/importPipelineService");
        const pipeline = new ImportDataPipeline(req.user._id, importBatch._id);
        const pipelineStats = await pipeline.run(payload);

        const bankLookup = new Map(
            banks
                .map((bank) => ({
                    id: Number(bank?.id),
                    name: toTrimmedOrNull(bank?.name),
                    shortName: toTrimmedOrNull(bank?.shortName),
                }))
                .filter((bank) => Number.isFinite(bank.id))
                .map((bank) => [bank.id, bank]),
        );

        let debitTotal = 0;
        let creditTotal = 0;
        let debitCount = 0;
        let creditCount = 0;

        const transactionDocs = transactions.map((transaction) => {
            const normalizedType =
                String(transaction?.type || "")
                    .trim()
                    .toUpperCase() || "OTHER";

            const transactionType =
                normalizedType === "DEBIT" || normalizedType === "CREDIT"
                    ? normalizedType
                    : "OTHER";

            const amount = Math.max(0, toNumber(transaction?.amount, 0));
            if (transactionType === "DEBIT") {
                debitTotal += amount;
                debitCount += 1;
            } else if (transactionType === "CREDIT") {
                creditTotal += amount;
                creditCount += 1;
            }

            const bankId = toNullableNumber(transaction?.bankId);
            const bankInfo = bankId != null ? bankLookup.get(bankId) : null;

            return {
                userId: req.user._id,
                importBatchId: importBatch._id,
                amount,
                reference: toTrimmedOrNull(transaction?.reference),
                creditor: toTrimmedOrNull(transaction?.creditor),
                receiver: toTrimmedOrNull(transaction?.receiver),
                note: toTrimmedOrNull(transaction?.note),
                time: toNullableDate(transaction?.time),
                status: toTrimmedOrNull(transaction?.status),
                currentBalance: toNullableNumber(transaction?.currentBalance),
                bankId,
                bankName: bankInfo?.name || null,
                bankShortName: bankInfo?.shortName || null,
                transactionType,
                accountNumber: toTrimmedOrNull(transaction?.accountNumber),
                categoryId: toNullableNumber(transaction?.categoryId),
                profileId: toNullableNumber(transaction?.profileId),
                serviceCharge: Math.max(
                    0,
                    toNumber(transaction?.serviceCharge, 0),
                ),
                vat: Math.max(0, toNumber(transaction?.vat, 0)),
                raw: transaction,
            };
        });

        await ImportedTransaction.insertMany(transactionDocs, {
            ordered: false,
        });

        importBatch.stats = {
            debitTotal,
            creditTotal,
            debitCount,
            creditCount,
        };
        await importBatch.save();

        return res.status(201).json({
            message: "JSON data imported successfully",
            importBatch,
        });
    } catch (err) {
        console.error("importJsonData error:", err);
        return res.status(500).json({
            message: "Failed to import JSON data",
            error: err.message,
        });
    }
};

exports.getImportBatches = async (req, res) => {
    try {
        const limit = Math.min(
            50,
            Math.max(1, Number.parseInt(req.query?.limit, 10) || 20),
        );

        const batches = await ImportBatch.find({
            userId: req.user._id,
        })
            .sort({ createdAt: -1 })
            .limit(limit)
            .select(
                "sourceFileName schemaVersion version exportDate counts stats meta createdAt updatedAt",
            )
            .lean();

        return res.json(batches);
    } catch (err) {
        console.error("getImportBatches error:", err);
        return res.status(500).json({
            message: "Failed to load imports",
            error: err.message,
        });
    }
};

exports.getImportBatchDetails = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid import batch ID" });
        }

        const batch = await ImportBatch.findOne({
            _id: id,
            userId: req.user._id,
        }).lean();

        if (!batch) {
            return res.status(404).json({ message: "Import batch not found" });
        }

        const page = Math.max(1, Number.parseInt(req.query?.page, 10) || 1);
        const limit = Math.min(
            200,
            Math.max(1, Number.parseInt(req.query?.limit, 10) || 50),
        );

        const filter = {
            userId: req.user._id,
            importBatchId: id,
        };

        const transactionType = String(req.query?.transactionType || "")
            .trim()
            .toUpperCase();
        if (transactionType === "DEBIT" || transactionType === "CREDIT") {
            filter.transactionType = transactionType;
        }

        const search = String(req.query?.search || "").trim();
        if (search) {
            const regex = { $regex: search, $options: "i" };
            filter.$or = [
                { reference: regex },
                { creditor: regex },
                { receiver: regex },
                { note: regex },
                { accountNumber: regex },
                { bankName: regex },
                { bankShortName: regex },
            ];
        }

        const [items, total] = await Promise.all([
            ImportedTransaction.find(filter)
                .sort({ time: -1, createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            ImportedTransaction.countDocuments(filter),
        ]);

        return res.json({
            batch,
            transactions: {
                items,
                total,
                page,
                limit,
                totalPages: Math.max(1, Math.ceil(total / limit)),
            },
        });
    } catch (err) {
        console.error("getImportBatchDetails error:", err);
        return res.status(500).json({
            message: "Failed to load import details",
            error: err.message,
        });
    }
};

exports.getImportSynergyOverview = async (req, res) => {
    try {
        const requestedBatchId = toTrimmedOrNull(req.query?.batchId);
        const requestedAccountKey =
            toTrimmedOrNull(req.query?.accountKey) || "ALL";

        const baseBatchQuery = {
            userId: req.user._id,
        };

        let batch = null;

        if (requestedBatchId) {
            if (!mongoose.isValidObjectId(requestedBatchId)) {
                return res.status(400).json({ message: "Invalid batch ID" });
            }

            batch = await ImportBatch.findOne({
                ...baseBatchQuery,
                _id: requestedBatchId,
            }).lean();
        } else {
            batch = await ImportBatch.findOne(baseBatchQuery)
                .sort({ createdAt: -1 })
                .lean();
        }

        const bankAccounts = await BankAccount.find({
            userId: req.user._id,
        })
            .sort({ updatedAt: -1 })
            .lean();

        const importedTransactions = batch
            ? await ImportedTransaction.find({
                  userId: req.user._id,
                  importBatchId: batch._id,
              })
                  .sort({ time: -1, createdAt: -1 })
                  .lean()
            : [];

        const accountMap = new Map(
            bankAccounts.map((account) => {
                const key = toAccountKey(account.accountNumber);
                return [
                    key,
                    {
                        key,
                        accountNumber: toTrimmedOrNull(account.accountNumber),
                        accountHolderName: toTrimmedOrNull(
                            account.accountHolderName,
                        ),
                        bankId: Number.isFinite(Number(account.bankId))
                            ? Number(account.bankId)
                            : null,
                        bankName: toTrimmedOrNull(account.bankName),
                        bankShortName: toTrimmedOrNull(account.bankShortName),
                        balance: toNullableNumber(account.balance),
                        settledBalance: toNullableNumber(
                            account.settledBalance,
                        ),
                    },
                ];
            }),
        );

        if (batch) {
            normalizeArray(batch.accounts).forEach((account) => {
                const key = toAccountKey(account?.accountNumber);
                if (accountMap.has(key)) return;
                accountMap.set(key, {
                    key,
                    accountNumber: toTrimmedOrNull(account?.accountNumber),
                    accountHolderName: toTrimmedOrNull(
                        account?.accountHolderName,
                    ),
                    bankId: Number.isFinite(Number(account?.bank))
                        ? Number(account.bank)
                        : null,
                    bankName: null,
                    bankShortName: null,
                    balance: toNullableNumber(account?.balance),
                    settledBalance: toNullableNumber(account?.settledBalance),
                });
            });
        }

        const accountTransactionStats = new Map();
        const monthlyAllMap = new Map();
        const monthlyByAccountMap = new Map();

        for (const transaction of importedTransactions) {
            const accountKey = toAccountKey(transaction.accountNumber);
            const transactionType = String(
                transaction.transactionType || "OTHER",
            ).toUpperCase();
            const amount = Number(transaction.amount || 0);

            if (!accountTransactionStats.has(accountKey)) {
                accountTransactionStats.set(accountKey, {
                    debitTotal: 0,
                    creditTotal: 0,
                    txCount: 0,
                    latestBalance: null,
                    latestTime: null,
                });
            }

            const stats = accountTransactionStats.get(accountKey);
            stats.txCount += 1;

            if (transactionType === "DEBIT") {
                stats.debitTotal += amount;
            } else if (transactionType === "CREDIT") {
                stats.creditTotal += amount;
            }

            const txTime = transaction.time ? new Date(transaction.time) : null;
            if (
                txTime &&
                !Number.isNaN(txTime.getTime()) &&
                (stats.latestTime == null || txTime > stats.latestTime)
            ) {
                stats.latestTime = txTime;
                stats.latestBalance =
                    toNullableNumber(transaction.currentBalance) ??
                    stats.latestBalance;
            }

            const monthCursor = txTime || new Date(transaction.createdAt);
            const monthKey = `${monthCursor.getFullYear()}-${String(monthCursor.getMonth() + 1).padStart(2, "0")}`;

            if (!monthlyAllMap.has(monthKey)) {
                monthlyAllMap.set(monthKey, {
                    year: monthCursor.getFullYear(),
                    month: monthCursor.getMonth() + 1,
                    debit: 0,
                    credit: 0,
                });
            }

            const monthAll = monthlyAllMap.get(monthKey);
            if (transactionType === "DEBIT") {
                monthAll.debit += amount;
            } else if (transactionType === "CREDIT") {
                monthAll.credit += amount;
            }

            if (!monthlyByAccountMap.has(accountKey)) {
                monthlyByAccountMap.set(accountKey, new Map());
            }
            const accountMonthMap = monthlyByAccountMap.get(accountKey);

            if (!accountMonthMap.has(monthKey)) {
                accountMonthMap.set(monthKey, {
                    year: monthCursor.getFullYear(),
                    month: monthCursor.getMonth() + 1,
                    debit: 0,
                    credit: 0,
                });
            }

            const monthAccount = accountMonthMap.get(monthKey);
            if (transactionType === "DEBIT") {
                monthAccount.debit += amount;
            } else if (transactionType === "CREDIT") {
                monthAccount.credit += amount;
            }
        }

        const accounts = Array.from(accountMap.values()).map((account) => {
            const txStats = accountTransactionStats.get(account.key) || {
                debitTotal: 0,
                creditTotal: 0,
                txCount: 0,
                latestBalance: null,
            };

            const resolvedBalance =
                account.balance ??
                account.settledBalance ??
                txStats.latestBalance;

            return {
                ...account,
                balance: resolvedBalance,
                debitTotal: Number(txStats.debitTotal.toFixed(2)),
                creditTotal: Number(txStats.creditTotal.toFixed(2)),
                netFlow: Number(
                    (txStats.creditTotal - txStats.debitTotal).toFixed(2),
                ),
                txCount: txStats.txCount,
            };
        });

        const accountSelectionOptions = [
            {
                key: "ALL",
                label: "All accounts",
            },
            ...accounts.map((account) => ({
                key: account.key,
                label: account.accountNumber || account.key,
            })),
        ];

        const selectedAccountKey =
            requestedAccountKey === "ALL" ||
            accountSelectionOptions.some(
                (option) => option.key === requestedAccountKey,
            )
                ? requestedAccountKey
                : "ALL";

        const selectedTransactions =
            selectedAccountKey === "ALL"
                ? importedTransactions
                : importedTransactions.filter(
                      (transaction) =>
                          toAccountKey(transaction.accountNumber) ===
                          selectedAccountKey,
                  );

        let debitTotal = 0;
        let creditTotal = 0;

        selectedTransactions.forEach((transaction) => {
            const type = String(
                transaction.transactionType || "",
            ).toUpperCase();
            const amount = Number(transaction.amount || 0);
            if (type === "DEBIT") debitTotal += amount;
            if (type === "CREDIT") creditTotal += amount;
        });

        const monthlyMapForSelection =
            selectedAccountKey === "ALL"
                ? monthlyAllMap
                : monthlyByAccountMap.get(selectedAccountKey) || new Map();

        const monthlyNet = Array.from(monthlyMapForSelection.values())
            .map((item) => ({
                year: item.year,
                month: item.month,
                debit: Number(item.debit.toFixed(2)),
                credit: Number(item.credit.toFixed(2)),
                net: Number((item.credit - item.debit).toFixed(2)),
            }))
            .sort((a, b) =>
                a.year === b.year ? a.month - b.month : a.year - b.year,
            );

        const recentMonthlyNetValues = monthlyNet.map((item) => item.net);
        const netBaseline = weightedAverage(recentMonthlyNetValues);
        const nextMonthProjectedNet = Number(netBaseline.toFixed(2));
        const next6MonthsProjectedNet = Number((netBaseline * 6).toFixed(2));

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        const [currentMonthExpenseAgg, recentExpense] = await Promise.all([
            Expense.aggregate([
                {
                    $match: {
                        userId: req.user._id,
                        date: { $gte: startOfMonth, $lt: nextMonth },
                        included: true,
                    },
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$amount" },
                        count: { $sum: 1 },
                    },
                },
            ]),
            Expense.findOne({ userId: req.user._id })
                .sort({ date: -1, createdAt: -1 })
                .lean(),
        ]);

        const expenseOverlay = {
            currentMonthExpenseTotal: Number(
                (currentMonthExpenseAgg[0]?.total || 0).toFixed(2),
            ),
            currentMonthExpenseCount: Number(
                currentMonthExpenseAgg[0]?.count || 0,
            ),
            recentExpense: recentExpense
                ? {
                      description: recentExpense.description,
                      type: recentExpense.type,
                      amount: Number(recentExpense.amount || 0),
                      date: recentExpense.date,
                  }
                : null,
        };

        const totalBalance = accounts.reduce(
            (sum, account) => sum + Number(account.balance || 0),
            0,
        );

        return res.json({
            batch: {
                _id: batch?._id || null,
                sourceFileName: batch?.sourceFileName || null,
                exportDate: batch?.exportDate || null,
                createdAt: batch?.createdAt || null,
            },
            accountOptions: accountSelectionOptions,
            selectedAccountKey,
            accounts,
            aggregate: {
                totalBalance: Number(totalBalance.toFixed(2)),
                debitTotal: Number(debitTotal.toFixed(2)),
                creditTotal: Number(creditTotal.toFixed(2)),
                netFlow: Number((creditTotal - debitTotal).toFixed(2)),
                txCount: selectedTransactions.length,
            },
            monthlyNet,
            forecast: {
                baselineMonthlyNet: Number(netBaseline.toFixed(2)),
                nextMonthProjectedNet,
                next6MonthsProjectedNet,
            },
            expenseOverlay,
        });
    } catch (err) {
        console.error("getImportSynergyOverview error:", err);
        return res.status(500).json({
            message: "Failed to build import synergy overview",
            error: err.message,
        });
    }
};

exports.getBankAccounts = async (req, res) => {
    try {
        const accounts = await BankAccount.find({ userId: req.user._id })
            .sort({ updatedAt: -1 })
            .lean();

        return res.json(accounts);
    } catch (err) {
        console.error("getBankAccounts error:", err);
        return res.status(500).json({
            message: "Failed to load bank accounts",
            error: err.message,
        });
    }
};

exports.createBankAccount = async (req, res) => {
    try {
        const accountNumber = toTrimmedOrNull(req.body?.accountNumber);
        if (!accountNumber) {
            return res.status(400).json({
                message: "accountNumber is required",
            });
        }

        const account = await BankAccount.findOneAndUpdate(
            {
                userId: req.user._id,
                accountNumber,
            },
            {
                $set: {
                    bankId: toNullableNumber(req.body?.bankId),
                    bankName: toTrimmedOrNull(req.body?.bankName),
                    bankShortName: toTrimmedOrNull(req.body?.bankShortName),
                    accountHolderName: toTrimmedOrNull(
                        req.body?.accountHolderName,
                    ),
                    balance: toNullableNumber(req.body?.balance),
                    settledBalance: toNullableNumber(req.body?.settledBalance),
                    pendingCredit: toNullableNumber(req.body?.pendingCredit),
                    profileId: toNullableNumber(req.body?.profileId),
                    source: "manual",
                },
                $setOnInsert: {
                    userId: req.user._id,
                    accountNumber,
                },
            },
            {
                upsert: true,
                new: true,
                runValidators: true,
                setDefaultsOnInsert: true,
            },
        );

        return res.status(201).json(account);
    } catch (err) {
        console.error("createBankAccount error:", err);
        return res.status(500).json({
            message: "Failed to create bank account",
            error: err.message,
        });
    }
};

exports.manualSyncBatch = async (req, res) => {
    try {
        const batch = await ImportBatch.findOne({
            _id: req.params.id,
            userId: req.user._id,
        });
        if (!batch) return res.status(404).json({ message: "Batch not found" });

        const ImportDataPipeline = require("../services/importPipelineService");
        const pipeline = new ImportDataPipeline(req.user._id, batch._id);
        const stats = await pipeline.run({
            accounts: batch.accounts || [],
            banks: batch.banks || [],
            categories: batch.categories || [],
            budgets: batch.budgets || [],
            transactions: [], // We typically don't re-sync exported transactions here unless modified
        });

        batch.syncStatus = {
            accounts: stats.accounts > 0 || batch.syncStatus?.accounts,
            banks: stats.banks > 0 || batch.syncStatus?.banks,
            categories: stats.types > 0 || batch.syncStatus?.categories,
            budgets: stats.budgets > 0 || batch.syncStatus?.budgets,
        };
        await batch.save();

        res.json({ message: "Sync successful", syncStatus: batch.syncStatus });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Sync failed" });
    }
};

exports.getBanks = async (req, res) => {
    try {
        const banks = await Bank.find({ userId: req.user._id }).sort({
            name: 1,
        });
        res.json({ message: "Banks retrieved successfully", data: banks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};
