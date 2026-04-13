import { useEffect, useState } from "react";
import PageContainer from "../components/ui/PageContainer";

import PageSkeleton from "../components/ui/PageSkeleton";
import { getBankAccounts, getBanks } from "../api/api";
import type { BankAccount, Bank } from "../types/importData";
import { Copy, Plus, Activity } from "lucide-react";
import { uiControl } from "../utils/uiClasses";

const amountFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function AccountsPage() {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [accountsRes, banksRes] = await Promise.all([
          getBankAccounts(),
          getBanks(),
        ]);
        if (!mounted) return;
        setAccounts(accountsRes.data || []);
        setBanks(banksRes.data?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <PageSkeleton />;

  const totalBalance = accounts.reduce((acc, a) => acc + (a.balance || 0), 0);

  const bankMap = new Map(banks.map((b) => [b.externalId, b]));

  return (
    <PageContainer title="Banks & Accounts">
      <div className="grid grid-cols-1 gap-6">
        <div className="border-[2px] border-[var(--theme-text)] bg-[var(--theme-surface)] p-6">
          <h2 className="text-sm uppercase text-[var(--theme-text-secondary)] font-bold tracking-wider">
            Total Available Balance
          </h2>
          <p className="mt-2 text-4xl font-black">
            {amountFormatter.format(totalBalance)}{" "}
            <span className="text-xl text-[var(--theme-text-secondary)] font-bold">
              ETB
            </span>
          </p>
        </div>

        <h3 className="text-xl font-bold mt-4 uppercase tracking-wide">
          Your Banks
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {banks.map((bank) => {
            const bgPrimary = bank.colors?.[0] || "var(--theme-surface)";
            const bgSecondary = bank.colors?.[1] || "var(--theme-border)";
            return (
              <div
                key={bank._id}
                className="relative overflow-hidden border-2 border-[var(--theme-border)] bg-[var(--theme-surface)] transition-all hover:-translate-y-1 hover:border-[var(--theme-text)] group"
              >
                <div
                  className="absolute inset-0 opacity-[0.08]"
                  style={{
                    background: `linear-gradient(135deg, ${bgPrimary}, ${bgSecondary})`,
                  }}
                />
                <div className="relative p-6 flex flex-col items-start gap-1">
                  <div
                    className="w-12 h-12 flex items-center justify-center font-black text-xl text-white mb-3 tracking-tighter"
                    style={{ backgroundColor: bgPrimary }}
                  >
                    {bank.shortName?.substring(0, 2) ||
                      bank.name.substring(0, 2)}
                  </div>
                  <h4
                    className="font-bold text-base truncate w-full uppercase tracking-tight text-[var(--theme-text)]"
                    title={bank.name}
                  >
                    {bank.name}
                  </h4>
                  <p className="text-xs font-bold uppercase text-[var(--theme-text-secondary)]">
                    {bank.shortName || "BANK"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {banks.length === 0 && (
          <div className="border-2 border-dashed border-[var(--theme-border)] p-8 text-center font-bold text-[var(--theme-text-secondary)] uppercase tracking-wide">
            No banks synced yet. Head over to Import Data page and sync from an
            export batch!
          </div>
        )}

        <h3 className="text-xl font-bold mt-4 uppercase tracking-wide">
          Your Accounts
        </h3>
        <div className="flex flex-col gap-4">
          {accounts.map((acc) => {
            const bank = acc.bankId ? bankMap.get(acc.bankId) : null;
            const accent = bank?.colors?.[0] || "var(--theme-accent)";

            return (
              <div
                key={acc._id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-2 border-[var(--theme-border)] bg-[var(--theme-surface)] p-5 transition-all hover:-translate-y-1 hover:border-[var(--theme-text)]"
                style={{
                  borderLeftWidth: "8px",
                  borderLeftColor: accent,
                }}
              >
                <div className="space-y-1">
                  <h4 className="text-lg font-black uppercase tracking-tight text-[var(--theme-text)]">
                    {acc.bankShortName || acc.bankName || "Unknown Bank"}
                  </h4>
                  <p className="font-mono text-sm font-bold text-[var(--theme-text-secondary)]">
                    {acc.accountNumber}
                  </p>
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--theme-text-secondary)]">
                    {acc.accountHolderName || "Unknown Holder"}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-3xl font-black tabular-nums">
                    {amountFormatter.format(acc.balance || 0)}
                  </div>
                  <div className="mt-2 flex items-center justify-start sm:justify-end gap-1.5 text-xs font-bold uppercase text-[var(--theme-text-secondary)]">
                    <Activity className="h-3.5 w-3.5" />
                    Settled: {amountFormatter.format(acc.settledBalance || 0)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {accounts.length === 0 && (
          <div className="border-2 border-dashed border-[var(--theme-border)] p-8 text-center font-bold text-[var(--theme-text-secondary)] uppercase tracking-wide">
            No accounts found. They will appear here once you import data!
          </div>
        )}
      </div>
    </PageContainer>
  );
}
