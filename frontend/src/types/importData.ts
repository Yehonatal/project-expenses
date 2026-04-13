export interface ImportDataPayload {
    schemaVersion?: string | number;
    version?: string;
    exportDate?: string;
    accounts?: Array<Record<string, unknown>>;
    banks?: Array<Record<string, unknown>>;
    categories?: Array<Record<string, unknown>>;
    transactions?: Array<Record<string, unknown>>;
    failedParses?: unknown[];
    receiverCategoryMappings?: unknown[];
    smsPatterns?: unknown[];
}

export interface ImportBatch {
    _id: string;
    sourceFileName: string | null;
    schemaVersion: string | null;
    version: string | null;
    exportDate: string | null;
    counts: {
        accounts: number;
        banks: number;
        categories: number;
        transactions: number;
    };
    stats: {
        debitTotal: number;
        creditTotal: number;
        debitCount: number;
        creditCount: number;
    };
    meta: {
        failedParsesCount: number;
        receiverCategoryMappingsCount: number;
        smsPatternsCount: number;
    };
    accounts: Array<Record<string, unknown>>;
    banks: Array<Record<string, unknown>>;
    categories: Array<Record<string, unknown>>;
    createdAt: string;
    updatedAt: string;
}

export interface ImportedTransaction {
    _id: string;
    amount: number;
    reference: string | null;
    creditor: string | null;
    receiver: string | null;
    note: string | null;
    time: string | null;
    status: string | null;
    currentBalance: number | null;
    bankId: number | null;
    bankName: string | null;
    bankShortName: string | null;
    transactionType: "DEBIT" | "CREDIT" | "OTHER";
    accountNumber: string | null;
    categoryId: number | null;
    profileId: number | null;
    serviceCharge: number;
    vat: number;
    createdAt: string;
    updatedAt: string;
}

export interface ImportBatchDetailsResponse {
    batch: ImportBatch;
    transactions: {
        items: ImportedTransaction[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface ImportJsonResponse {
    message: string;
    importBatch: ImportBatch;
}

export interface BankAccount {
    _id: string;
    accountNumber: string;
    bankId: number | null;
    bankName: string | null;
    bankShortName: string | null;
    accountHolderName: string | null;
    balance: number | null;
    settledBalance: number | null;
    pendingCredit: number | null;
    profileId: number | null;
    source: "manual" | "import";
    updatedAt: string;
}
