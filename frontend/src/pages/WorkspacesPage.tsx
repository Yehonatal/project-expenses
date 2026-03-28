import { useEffect, useMemo, useState } from "react";
import { Copy, Plus, RefreshCw, Users, UserRound, Wallet } from "lucide-react";
import PageContainer from "../components/ui/PageContainer";
import GlassCard from "../components/ui/GlassCard";
import PageSkeleton from "../components/ui/PageSkeleton";
import { uiControl } from "../utils/uiClasses";
import {
    createWorkspace,
    getExpensesPaged,
    getWorkspaceMembers,
    getWorkspaces,
    joinWorkspace,
} from "../api/api";
import type { Expense } from "../types/expense";
import type { Workspace, WorkspaceMember } from "../types/workspace";

export default function WorkspacesPage() {
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [status, setStatus] = useState("");

    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
    const [members, setMembers] = useState<WorkspaceMember[]>([]);
    const [selectedMemberId, setSelectedMemberId] = useState("");

    const [workspaceName, setWorkspaceName] = useState("");
    const [inviteCode, setInviteCode] = useState("");

    const [sharedExpenses, setSharedExpenses] = useState<Expense[]>([]);
    const [sharedTotal, setSharedTotal] = useState(0);
    const [sharedCount, setSharedCount] = useState(0);
    const [personalTotal, setPersonalTotal] = useState(0);

    const selectedWorkspace = useMemo(
        () =>
            workspaces.find(
                (workspace) => workspace._id === selectedWorkspaceId,
            ),
        [workspaces, selectedWorkspaceId],
    );

    const loadWorkspaces = async () => {
        const res = await getWorkspaces();
        const list = res.data || [];
        setWorkspaces(list);

        if (!selectedWorkspaceId && list.length > 0) {
            setSelectedWorkspaceId(list[0]._id);
        }

        if (selectedWorkspaceId) {
            const stillExists = list.some(
                (workspace) => workspace._id === selectedWorkspaceId,
            );
            if (!stillExists) {
                setSelectedWorkspaceId(list[0]?._id || "");
                setSelectedMemberId("");
            }
        }
    };

    const loadMembers = async (workspaceId: string) => {
        if (!workspaceId) {
            setMembers([]);
            setSelectedMemberId("");
            return;
        }

        const res = await getWorkspaceMembers(workspaceId);
        const nextMembers = res.data?.members || [];
        setMembers(nextMembers);

        if (selectedMemberId) {
            const exists = nextMembers.some(
                (member) => member.userId._id === selectedMemberId,
            );
            if (!exists) setSelectedMemberId("");
        }
    };

    const loadSpending = async () => {
        const [sharedRes, personalRes] = await Promise.all([
            getExpensesPaged({
                scope: "shared",
                workspaceId: selectedWorkspaceId || undefined,
                memberId: selectedMemberId || undefined,
                page: 1,
                limit: 20,
            }),
            getExpensesPaged({
                scope: "personal",
                page: 1,
                limit: 1,
            }),
        ]);

        setSharedExpenses(sharedRes.data?.items || []);
        setSharedTotal(sharedRes.data?.includedTotal || 0);
        setSharedCount(sharedRes.data?.total || 0);
        setPersonalTotal(personalRes.data?.includedTotal || 0);
    };

    const refreshAll = async () => {
        try {
            setBusy(true);
            await loadWorkspaces();
        } catch (error) {
            console.error("Failed to load workspaces:", error);
            setStatus("Could not load workspaces right now.");
        } finally {
            setBusy(false);
        }
    };

    useEffect(() => {
        let mounted = true;

        const init = async () => {
            try {
                await loadWorkspaces();
            } catch (error) {
                console.error("Workspace init failed:", error);
                if (mounted) setStatus("Could not load workspaces right now.");
            } finally {
                if (mounted) setLoading(false);
            }
        };

        void init();

        return () => {
            mounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        void loadMembers(selectedWorkspaceId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedWorkspaceId]);

    useEffect(() => {
        if (loading) return;
        void loadSpending();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, selectedWorkspaceId, selectedMemberId]);

    const handleCreateWorkspace = async () => {
        const name = workspaceName.trim();
        if (!name) {
            setStatus("Enter a workspace name.");
            return;
        }

        try {
            setBusy(true);
            await createWorkspace({ name });
            setWorkspaceName("");
            setStatus("Workspace created.");
            await refreshAll();
        } catch (error) {
            console.error("Failed to create workspace:", error);
            setStatus("Could not create workspace right now.");
        } finally {
            setBusy(false);
        }
    };

    const handleJoinWorkspace = async () => {
        const code = inviteCode.trim().toUpperCase();
        if (!code) {
            setStatus("Enter an invite code.");
            return;
        }

        try {
            setBusy(true);
            await joinWorkspace({ inviteCode: code });
            setInviteCode("");
            setStatus("Joined workspace.");
            await refreshAll();
        } catch (error) {
            console.error("Failed to join workspace:", error);
            setStatus("Invite code invalid or unavailable.");
        } finally {
            setBusy(false);
        }
    };

    const handleCopyInviteCode = async (code: string) => {
        try {
            await navigator.clipboard.writeText(code);
            setStatus(`Copied invite code ${code}.`);
        } catch {
            setStatus("Could not copy invite code.");
        }
    };

    if (loading) {
        return <PageSkeleton title="Loading workspaces" />;
    }

    return (
        <PageContainer
            title="Shared Households"
            subtitle="Invite members, manage workspace access, and track personal versus shared spending from one place."
            className="space-y-6 sm:space-y-8"
        >
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                    <div className="text-xs font-semibold uppercase text-[var(--theme-text-secondary)]">
                        Shared included total
                    </div>
                    <div className="text-lg font-semibold sm:text-xl">
                        Birr {sharedTotal.toFixed(2)}
                    </div>
                </div>
                <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                    <div className="text-xs font-semibold uppercase text-[var(--theme-text-secondary)]">
                        Personal included total
                    </div>
                    <div className="text-lg font-semibold sm:text-xl">
                        Birr {personalTotal.toFixed(2)}
                    </div>
                </div>
                <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                    <div className="text-xs font-semibold uppercase text-[var(--theme-text-secondary)]">
                        Shared entries
                    </div>
                    <div className="text-lg font-semibold sm:text-xl">
                        {sharedCount}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <GlassCard className="space-y-3 xl:col-span-2">
                    <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold">
                            Workspace access
                        </h3>
                        <button
                            type="button"
                            className={uiControl.button}
                            onClick={() => void refreshAll()}
                            disabled={busy}
                        >
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <div className="flex gap-2">
                            <input
                                className={uiControl.input}
                                value={workspaceName}
                                onChange={(e) =>
                                    setWorkspaceName(e.target.value)
                                }
                                placeholder="Create workspace name"
                            />
                            <button
                                type="button"
                                className={uiControl.buttonPrimary}
                                onClick={() => void handleCreateWorkspace()}
                                disabled={busy}
                            >
                                <Plus className="h-4 w-4" />
                                Create
                            </button>
                        </div>

                        <div className="flex gap-2">
                            <input
                                className={uiControl.input}
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value)}
                                placeholder="Invite code"
                            />
                            <button
                                type="button"
                                className={uiControl.button}
                                onClick={() => void handleJoinWorkspace()}
                                disabled={busy}
                            >
                                Join
                            </button>
                        </div>
                    </div>

                    {status && (
                        <p className="text-xs text-[var(--theme-text-secondary)]">
                            {status}
                        </p>
                    )}

                    {workspaces.length === 0 ? (
                        <p className="text-sm text-[var(--theme-text-secondary)]">
                            No workspaces yet. Create one or join with an invite
                            code.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                            {workspaces.map((workspace) => (
                                <div
                                    key={workspace._id}
                                    role="button"
                                    tabIndex={0}
                                    className={`border p-3 text-left transition-colors ${selectedWorkspaceId === workspace._id ? "bg-[var(--theme-active)]" : "bg-[var(--theme-surface)] hover:bg-[var(--theme-hover)]"}`}
                                    style={{
                                        borderColor: "var(--theme-border)",
                                    }}
                                    onClick={() => {
                                        setSelectedWorkspaceId(workspace._id);
                                        setSelectedMemberId("");
                                    }}
                                    onKeyDown={(event) => {
                                        if (
                                            event.key === "Enter" ||
                                            event.key === " "
                                        ) {
                                            event.preventDefault();
                                            setSelectedWorkspaceId(
                                                workspace._id,
                                            );
                                            setSelectedMemberId("");
                                        }
                                    }}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="text-sm font-semibold">
                                                {workspace.name}
                                            </p>
                                            <p className="text-xs text-[var(--theme-text-secondary)]">
                                                {workspace.members.length}{" "}
                                                members
                                            </p>
                                        </div>
                                        <span className="border border-[var(--theme-border)] bg-[var(--theme-background)] px-2 py-1 text-[10px] uppercase tracking-wide">
                                            {workspace.inviteCode}
                                        </span>
                                    </div>
                                    <div className="mt-3 flex justify-end">
                                        <button
                                            type="button"
                                            className={uiControl.button}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                void handleCopyInviteCode(
                                                    workspace.inviteCode,
                                                );
                                            }}
                                        >
                                            <Copy className="h-3.5 w-3.5" />
                                            Copy invite
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </GlassCard>

                <GlassCard className="space-y-3">
                    <h3 className="text-sm font-semibold">Members</h3>
                    <div>
                        <label className={uiControl.label}>Track member</label>
                        <select
                            className={uiControl.select}
                            value={selectedMemberId}
                            onChange={(e) =>
                                setSelectedMemberId(e.target.value)
                            }
                            disabled={!selectedWorkspaceId}
                        >
                            <option value="">All members</option>
                            {members.map((member) => (
                                <option
                                    key={member.userId._id}
                                    value={member.userId._id}
                                >
                                    {member.userId.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedWorkspace ? (
                        <div className="space-y-2">
                            {members.map((member) => (
                                <div
                                    key={member.userId._id}
                                    className="flex items-center justify-between border border-[var(--theme-border)] bg-[var(--theme-surface)] p-2"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium">
                                            {member.userId.name}
                                        </p>
                                        <p className="truncate text-[11px] text-[var(--theme-text-secondary)]">
                                            {member.userId.email}
                                        </p>
                                    </div>
                                    <span className="text-[10px] uppercase tracking-wide text-[var(--theme-text-secondary)]">
                                        {member.role}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-[var(--theme-text-secondary)]">
                            Select a workspace to view members.
                        </p>
                    )}
                </GlassCard>
            </div>

            <GlassCard className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold">
                        Shared spending feed
                    </h3>
                    <div className="text-xs text-[var(--theme-text-secondary)]">
                        {selectedWorkspace
                            ? selectedWorkspace.name
                            : "All shared workspaces"}
                    </div>
                </div>

                {sharedExpenses.length === 0 ? (
                    <p className="text-sm text-[var(--theme-text-secondary)]">
                        No shared expenses match the current workspace/member
                        selection.
                    </p>
                ) : (
                    <div className="space-y-2">
                        {sharedExpenses.map((expense) => (
                            <div
                                key={expense._id}
                                className="flex items-center justify-between gap-3 border border-[var(--theme-border)] bg-[var(--theme-surface)] p-2"
                            >
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold">
                                        {expense.description}
                                    </p>
                                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-[var(--theme-text-secondary)]">
                                        <span className="inline-flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            {typeof expense.workspaceId ===
                                            "string"
                                                ? selectedWorkspace?.name ||
                                                  "Shared"
                                                : expense.workspaceId?.name ||
                                                  "Shared"}
                                        </span>
                                        <span className="inline-flex items-center gap-1">
                                            <UserRound className="h-3 w-3" />
                                            {expense.createdBy?.name ||
                                                "Member"}
                                        </span>
                                        <span>
                                            {new Date(
                                                expense.date,
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold">
                                        Birr {expense.amount.toFixed(2)}
                                    </p>
                                    <p className="text-[11px] text-[var(--theme-text-secondary)]">
                                        {expense.type}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="rounded-none border border-[var(--theme-border)] bg-[var(--theme-background)] p-2 text-xs text-[var(--theme-text-secondary)]">
                    <Wallet className="mr-1 inline h-3.5 w-3.5" />
                    Personal and shared totals are computed from included
                    expenses only.
                </div>
            </GlassCard>
        </PageContainer>
    );
}
