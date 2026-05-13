/* eslint-disable import/first */
// jest.mock is hoisted before imports by Babel/Jest — imports must follow the mock calls
jest.mock("../repositories/DefaultSocialRepository", () => ({
  searchUserByEmail: jest.fn(),
  sendFriendRequest: jest.fn(),
  getFriends: jest.fn(),
  getIncomingRequests: jest.fn(),
  getOutgoingRequests: jest.fn(),
  acceptRequest: jest.fn(),
  rejectRequest: jest.fn(),
  cancelFriendRequest: jest.fn(),
  savePushToken: jest.fn(),
}));

import { useSocialStore } from "./socialStore";
import * as repo from "../repositories/DefaultSocialRepository";
import type { FriendRequest, FriendSummary, UserSearchResult } from "../types";

// Typed shortcuts
const mockSearch = repo.searchUserByEmail as jest.Mock;
const mockSendRequest = repo.sendFriendRequest as jest.Mock;
const mockGetFriends = repo.getFriends as jest.Mock;
const mockGetIncoming = repo.getIncomingRequests as jest.Mock;
const mockGetOutgoing = repo.getOutgoingRequests as jest.Mock;
const mockAccept = repo.acceptRequest as jest.Mock;
const mockReject = repo.rejectRequest as jest.Mock;
const mockCancel = repo.cancelFriendRequest as jest.Mock;

const INITIAL_STATE = {
  friends: [],
  incomingRequests: [],
  outgoingRequests: [],
  searchResult: null,
  searchStatus: "idle" as const,
  loading: false,
  error: null,
};

beforeEach(() => {
  jest.clearAllMocks();
  useSocialStore.setState(INITIAL_STATE);
});

// ── reset ─────────────────────────────────────────────────────────────────────

describe("reset", () => {
  it("clears all state back to initial values", () => {
    useSocialStore.setState({
      friends: [
        { uid: "1", nombre: "Ana", fotoUrl: null, streak: 3, achievements: [] },
      ],
      searchStatus: "found",
      error: "some error",
    });

    useSocialStore.getState().reset();

    expect(useSocialStore.getState()).toMatchObject(INITIAL_STATE);
  });
});

// ── clearSearch ───────────────────────────────────────────────────────────────

describe("clearSearch", () => {
  it("resets searchResult, searchStatus, and error", () => {
    useSocialStore.setState({
      searchResult: { uid: "u1", self: false, nombre: "Bob" },
      searchStatus: "found",
      error: "old error",
    });

    useSocialStore.getState().clearSearch();

    const { searchResult, searchStatus, error } = useSocialStore.getState();
    expect(searchResult).toBeNull();
    expect(searchStatus).toBe("idle");
    expect(error).toBeNull();
  });
});

// ── clearError ────────────────────────────────────────────────────────────────

describe("clearError", () => {
  it("sets error to null", () => {
    useSocialStore.setState({ error: "something went wrong" });
    useSocialStore.getState().clearError();
    expect(useSocialStore.getState().error).toBeNull();
  });
});

// ── searchByEmail ─────────────────────────────────────────────────────────────

describe("searchByEmail", () => {
  it("sets searchStatus=found and stores searchResult when user is found", async () => {
    const result: UserSearchResult = { uid: "u2", self: false, nombre: "Bob" };
    mockSearch.mockResolvedValueOnce(result);

    await useSocialStore.getState().searchByEmail("bob@example.com", "u1");

    const { searchStatus, searchResult, loading } = useSocialStore.getState();
    expect(searchStatus).toBe("found");
    expect(searchResult).toBe(result);
    expect(loading).toBe(false);
    expect(mockSearch).toHaveBeenCalledWith("bob@example.com", "u1");
  });

  it("sets searchStatus=not_found when repo returns null", async () => {
    mockSearch.mockResolvedValueOnce(null);

    await useSocialStore.getState().searchByEmail("unknown@example.com", "u1");

    const { searchStatus, searchResult } = useSocialStore.getState();
    expect(searchStatus).toBe("not_found");
    expect(searchResult).toBeNull();
  });

  it("sets searchStatus=self when the result has self=true", async () => {
    const self: UserSearchResult = { uid: "u1", self: true, nombre: "Me" };
    mockSearch.mockResolvedValueOnce(self);

    await useSocialStore.getState().searchByEmail("me@example.com", "u1");

    expect(useSocialStore.getState().searchStatus).toBe("self");
    expect(useSocialStore.getState().searchResult).toBeNull();
  });

  it("sets error on repo failure", async () => {
    mockSearch.mockRejectedValueOnce(new Error("network"));

    await useSocialStore.getState().searchByEmail("x@x.com", "u1");

    const { error, loading } = useSocialStore.getState();
    expect(error).toBe("Error al buscar usuario.");
    expect(loading).toBe(false);
  });
});

// ── loadFriends ───────────────────────────────────────────────────────────────

describe("loadFriends", () => {
  it("stores returned friends on success", async () => {
    const friends: FriendSummary[] = [
      { uid: "u2", nombre: "Ana", fotoUrl: null, streak: 5, achievements: [] },
    ];
    mockGetFriends.mockResolvedValueOnce(friends);

    await useSocialStore.getState().loadFriends("u1");

    const { friends: stored, loading } = useSocialStore.getState();
    expect(stored).toEqual(friends);
    expect(loading).toBe(false);
  });

  it("sets error on failure", async () => {
    mockGetFriends.mockRejectedValueOnce(new Error("Firestore error"));

    await useSocialStore.getState().loadFriends("u1");

    expect(useSocialStore.getState().error).toBe(
      "No se pudieron cargar los amigos.",
    );
  });
});

// ── loadRequests ──────────────────────────────────────────────────────────────

describe("loadRequests", () => {
  it("stores incoming and outgoing requests", async () => {
    const incoming: FriendRequest[] = [
      {
        id: "r1",
        fromUid: "u2",
        toUid: "u1",
        status: "pending",
        fromName: "Bob",
        fromPhoto: null,
      },
    ];
    const outgoing: FriendRequest[] = [
      {
        id: "r2",
        fromUid: "u1",
        toUid: "u3",
        status: "pending",
        fromName: null,
        fromPhoto: null,
      },
    ];
    mockGetIncoming.mockResolvedValueOnce(incoming);
    mockGetOutgoing.mockResolvedValueOnce(outgoing);

    await useSocialStore.getState().loadRequests("u1");

    const { incomingRequests, outgoingRequests } = useSocialStore.getState();
    expect(incomingRequests).toEqual(incoming);
    expect(outgoingRequests).toEqual(outgoing);
  });

  it("still stores fulfilled results when one of the promises rejects", async () => {
    const incoming: FriendRequest[] = [
      {
        id: "r1",
        fromUid: "u2",
        toUid: "u1",
        status: "pending",
        fromName: "Bob",
        fromPhoto: null,
      },
    ];
    mockGetIncoming.mockResolvedValueOnce(incoming);
    mockGetOutgoing.mockRejectedValueOnce(new Error("index missing"));

    await useSocialStore.getState().loadRequests("u1");

    expect(useSocialStore.getState().incomingRequests).toEqual(incoming);
    // outgoing should stay as the initial empty array (rejected promise skipped)
    expect(useSocialStore.getState().outgoingRequests).toEqual([]);
  });
});

// ── sendRequest ───────────────────────────────────────────────────────────────

describe("sendRequest", () => {
  const targetResult: UserSearchResult = {
    uid: "u2",
    self: false,
    nombre: "Bob",
  };

  beforeEach(() => {
    useSocialStore.setState({ searchResult: targetResult });
  });

  it("refreshes outgoing requests on success", async () => {
    const outgoing: FriendRequest[] = [
      {
        id: "r1",
        fromUid: "u1",
        toUid: "u2",
        status: "pending",
        fromName: null,
        fromPhoto: null,
      },
    ];
    mockSendRequest.mockResolvedValueOnce(undefined);
    mockGetOutgoing.mockResolvedValueOnce(outgoing);

    await useSocialStore.getState().sendRequest("u1", "bob@example.com", "u1");

    expect(mockSendRequest).toHaveBeenCalledWith("u1", "u2");
    expect(useSocialStore.getState().outgoingRequests).toEqual(outgoing);
    expect(useSocialStore.getState().loading).toBe(false);
  });

  it("sets a duplicate error message when repo throws 'duplicate'", async () => {
    mockSendRequest.mockRejectedValueOnce(new Error("duplicate"));

    await useSocialStore.getState().sendRequest("u1", "bob@example.com", "u1");

    expect(useSocialStore.getState().error).toBe(
      "Ya tienes una solicitud pendiente con este usuario",
    );
  });

  it("sets a generic error for other failures", async () => {
    mockSendRequest.mockRejectedValueOnce(new Error("network error"));

    await useSocialStore.getState().sendRequest("u1", "bob@example.com", "u1");

    expect(useSocialStore.getState().error).toBe(
      "No se pudo enviar la solicitud.",
    );
  });

  it("returns early (no repo call) when searchResult is null", async () => {
    useSocialStore.setState({ searchResult: null });

    await useSocialStore.getState().sendRequest("u1", "bob@example.com", "u1");

    expect(mockSendRequest).not.toHaveBeenCalled();
  });
});

// ── acceptRequest ─────────────────────────────────────────────────────────────

describe("acceptRequest", () => {
  it("updates incomingRequests and friends on success", async () => {
    const incoming: FriendRequest[] = [];
    const friends: FriendSummary[] = [
      { uid: "u2", nombre: "Bob", fotoUrl: null, streak: 2, achievements: [] },
    ];
    mockAccept.mockResolvedValueOnce(undefined);
    mockGetIncoming.mockResolvedValueOnce(incoming);
    mockGetFriends.mockResolvedValueOnce(friends);

    await useSocialStore.getState().acceptRequest("r1", "u1");

    expect(useSocialStore.getState().incomingRequests).toEqual(incoming);
    expect(useSocialStore.getState().friends).toEqual(friends);
    expect(useSocialStore.getState().loading).toBe(false);
  });

  it("sets error when accept repo call fails", async () => {
    mockAccept.mockRejectedValueOnce(new Error("permission denied"));

    await useSocialStore.getState().acceptRequest("r1", "u1");

    expect(useSocialStore.getState().error).toBe(
      "No se pudo aceptar la solicitud.",
    );
  });
});

// ── rejectRequest ─────────────────────────────────────────────────────────────

describe("rejectRequest", () => {
  it("updates incoming requests on success", async () => {
    const incoming: FriendRequest[] = [];
    mockReject.mockResolvedValueOnce(undefined);
    mockGetIncoming.mockResolvedValueOnce(incoming);

    await useSocialStore.getState().rejectRequest("r1", "u1");

    expect(useSocialStore.getState().incomingRequests).toEqual(incoming);
    expect(useSocialStore.getState().loading).toBe(false);
  });

  it("sets error on failure", async () => {
    mockReject.mockRejectedValueOnce(new Error("error"));

    await useSocialStore.getState().rejectRequest("r1", "u1");

    expect(useSocialStore.getState().error).toBe(
      "No se pudo rechazar la solicitud.",
    );
  });
});

// ── cancelRequest ─────────────────────────────────────────────────────────────

describe("cancelRequest", () => {
  it("updates outgoing requests on success", async () => {
    const outgoing: FriendRequest[] = [];
    mockCancel.mockResolvedValueOnce(undefined);
    mockGetOutgoing.mockResolvedValueOnce(outgoing);

    await useSocialStore.getState().cancelRequest("r1", "u1");

    expect(useSocialStore.getState().outgoingRequests).toEqual(outgoing);
    expect(useSocialStore.getState().loading).toBe(false);
    expect(mockCancel).toHaveBeenCalledWith("r1");
  });

  it("sets error on failure", async () => {
    mockCancel.mockRejectedValueOnce(new Error("error"));

    await useSocialStore.getState().cancelRequest("r1", "u1");

    expect(useSocialStore.getState().error).toBe(
      "No se pudo cancelar la solicitud.",
    );
  });
});
