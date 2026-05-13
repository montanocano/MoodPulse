export interface UserSearchResult {
  uid: string;
  nombre?: string;
  email?: string;
  fotoUrl?: string | null;
  self: boolean;
}

export interface FriendRequest {
  id: string;
  fromUid: string;
  toUid: string;
  status: "pending" | "accepted" | "rejected";
  fromName: string | null;
  fromPhoto: string | null;
  toName?: string | null;
}

export interface FriendSummary {
  uid: string;
  nombre: string;
  fotoUrl: string | null;
  streak: number;
  achievements: { type: string; emoji: string; titulo: string }[];
}
