export interface WorkspaceMemberUser {
    _id: string;
    name: string;
    email: string;
    picture?: string | null;
}

export interface WorkspaceMember {
    userId: WorkspaceMemberUser;
    role: "owner" | "member";
    joinedAt: string;
}

export interface Workspace {
    _id: string;
    name: string;
    inviteCode: string;
    ownerId: WorkspaceMemberUser;
    members: WorkspaceMember[];
    createdAt: string;
    updatedAt: string;
}
