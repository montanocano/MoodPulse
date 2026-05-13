import { useCallback } from "react";
import { useSocialStore } from "../store/socialStore";

export function useSocial(currentUid: string) {
  const store = useSocialStore();

  const searchByEmail = useCallback(
    (email: string) => store.searchByEmail(email, currentUid),
    [store, currentUid],
  );

  const acceptRequest = useCallback(
    (requestId: string) => store.acceptRequest(requestId, currentUid),
    [store, currentUid],
  );

  const rejectRequest = useCallback(
    (requestId: string) => store.rejectRequest(requestId, currentUid),
    [store, currentUid],
  );

  const loadAll = useCallback(() => {
    store.loadFriends(currentUid);
    store.loadRequests(currentUid);
  }, [store, currentUid]);

  const cancelRequest = useCallback(
    (requestId: string) => store.cancelRequest(requestId, currentUid),
    [store, currentUid],
  );

  return {
    friends: store.friends,
    incomingRequests: store.incomingRequests,
    outgoingRequests: store.outgoingRequests,
    searchResult: store.searchResult,
    searchStatus: store.searchStatus,
    loading: store.loading,
    error: store.error,
    searchByEmail,
    sendRequest: (toUid: string) =>
      store.sendRequest(currentUid, toUid, currentUid),
    acceptRequest,
    rejectRequest,
    cancelRequest,
    loadAll,
    clearSearch: store.clearSearch,
    clearError: store.clearError,
  };
}
