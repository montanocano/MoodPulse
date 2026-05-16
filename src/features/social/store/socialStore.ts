import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { FriendSummary, FriendRequest, UserSearchResult } from "../types";
import * as repo from "../repositories/DefaultSocialRepository";

interface SocialState {
  friends: FriendSummary[];
  incomingRequests: FriendRequest[];
  outgoingRequests: FriendRequest[];
  searchResult: UserSearchResult | null;
  searchStatus: "idle" | "found" | "not_found" | "self";
  loading: boolean;
  error: string | null;
}

interface SocialActions {
  loadFriends: (uid: string) => Promise<void>;
  loadRequests: (uid: string) => Promise<void>;
  sendRequest: (
    fromUid: string,
    toEmail: string,
    currentUid: string,
  ) => Promise<void>;
  acceptRequest: (requestId: string, uid: string) => Promise<void>;
  rejectRequest: (requestId: string, uid: string) => Promise<void>;
  searchByEmail: (email: string, currentUid: string) => Promise<void>;
  cancelRequest: (requestId: string, uid: string) => Promise<void>;
  removeFriend: (uid: string, friendUid: string) => Promise<void>;
  clearSearch: () => void;
  clearError: () => void;
  reset: () => void;
}

export const useSocialStore = create<SocialState & SocialActions>()(
  immer((set, get) => ({
    friends: [],
    incomingRequests: [],
    outgoingRequests: [],
    searchResult: null,
    searchStatus: "idle",
    loading: false,
    error: null,

    loadFriends: async (uid) => {
      set((s) => {
        s.loading = true;
      });
      try {
        const friends = await repo.getFriends(uid);
        set((s) => {
          s.friends = friends;
          s.loading = false;
        });
      } catch {
        set((s) => {
          s.loading = false;
          s.error = "No se pudieron cargar los amigos.";
        });
      }
    },

    loadRequests: async (uid) => {
      const [incoming, outgoing] = await Promise.allSettled([
        repo.getIncomingRequests(uid),
        repo.getOutgoingRequests(uid),
      ]);
      set((s) => {
        if (incoming.status === "fulfilled")
          s.incomingRequests = incoming.value;
        if (outgoing.status === "fulfilled")
          s.outgoingRequests = outgoing.value;
      });
    },

    sendRequest: async (fromUid, toEmail, currentUid) => {
      const result = get().searchResult;
      if (!result) return;
      set((s) => {
        s.loading = true;
        s.error = null;
      });
      try {
        await repo.sendFriendRequest(fromUid, result.uid);
        // Refresh outgoing
        const outgoing = await repo.getOutgoingRequests(fromUid);
        set((s) => {
          s.outgoingRequests = outgoing;
          s.loading = false;
        });
      } catch (err: unknown) {
        const msg = (err as Error).message;
        set((s) => {
          s.loading = false;
          s.error =
            msg === "duplicate"
              ? "Ya tienes una solicitud pendiente con este usuario"
              : "No se pudo enviar la solicitud.";
        });
      }
    },

    acceptRequest: async (requestId, uid) => {
      set((s) => {
        s.loading = true;
      });
      try {
        await repo.acceptRequest(requestId);
      } catch {
        set((s) => {
          s.loading = false;
          s.error = "No se pudo aceptar la solicitud.";
        });
        return;
      }
      // Load results independently so one failure doesn't block the other.
      const [incoming, friends] = await Promise.allSettled([
        repo.getIncomingRequests(uid),
        repo.getFriends(uid),
      ]);
      set((s) => {
        if (incoming.status === "fulfilled")
          s.incomingRequests = incoming.value;
        if (friends.status === "fulfilled") s.friends = friends.value;
        s.loading = false;
      });
    },

    rejectRequest: async (requestId, uid) => {
      set((s) => {
        s.loading = true;
      });
      try {
        await repo.rejectRequest(requestId);
        const incoming = await repo.getIncomingRequests(uid);
        set((s) => {
          s.incomingRequests = incoming;
          s.loading = false;
        });
      } catch {
        set((s) => {
          s.loading = false;
          s.error = "No se pudo rechazar la solicitud.";
        });
      }
    },

    searchByEmail: async (email, currentUid) => {
      set((s) => {
        s.loading = true;
        s.searchResult = null;
        s.searchStatus = "idle";
      });
      try {
        const result = await repo.searchUserByEmail(email, currentUid);
        if (!result) {
          set((s) => {
            s.loading = false;
            s.searchStatus = "not_found";
          });
        } else if (result.self) {
          set((s) => {
            s.loading = false;
            s.searchStatus = "self";
          });
        } else {
          set((s) => {
            s.loading = false;
            s.searchResult = result;
            s.searchStatus = "found";
          });
        }
      } catch {
        set((s) => {
          s.loading = false;
          s.error = "Error al buscar usuario.";
        });
      }
    },

    cancelRequest: async (requestId, uid) => {
      set((s) => {
        s.loading = true;
      });
      try {
        await repo.cancelFriendRequest(requestId);
        const outgoing = await repo.getOutgoingRequests(uid);
        set((s) => {
          s.outgoingRequests = outgoing;
          s.loading = false;
        });
      } catch {
        set((s) => {
          s.loading = false;
          s.error = "No se pudo cancelar la solicitud.";
        });
      }
    },

    removeFriend: async (uid, friendUid) => {
      set((s) => { s.loading = true; });
      try {
        await repo.removeFriend(uid, friendUid);
        const friends = await repo.getFriends(uid);
        set((s) => {
          s.friends = friends;
          s.loading = false;
        });
      } catch {
        set((s) => {
          s.loading = false;
          s.error = "No se pudo eliminar el amigo.";
        });
      }
    },

    clearSearch: () => {
      set((s) => {
        s.searchResult = null;
        s.searchStatus = "idle";
        s.error = null;
      });
    },

    clearError: () => {
      set((s) => {
        s.error = null;
      });
    },

    reset: () => {
      set((s) => {
        s.friends = [];
        s.incomingRequests = [];
        s.outgoingRequests = [];
        s.searchResult = null;
        s.searchStatus = "idle";
        s.loading = false;
        s.error = null;
      });
    },
  })),
);
