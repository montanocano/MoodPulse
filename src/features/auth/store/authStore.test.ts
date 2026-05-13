/* eslint-disable import/first */
// jest.mock is hoisted before imports by Babel/Jest — imports must follow the mock calls
jest.mock("../repositories/DefaultAuthRepository", () => ({
  authRepository: {
    signIn: jest.fn(),
    register: jest.fn(),
    signOut: jest.fn(),
    sendPasswordReset: jest.fn(),
    checkEmailVerified: jest.fn(),
    resendVerificationEmail: jest.fn(),
    updateDisplayName: jest.fn(),
  },
}));

jest.mock("../../achievements", () => ({
  getAchievements: jest.fn().mockResolvedValue([]),
}));

import { useAuthStore } from "./authStore";
import { authRepository } from "../repositories/DefaultAuthRepository";

// Typed shortcuts to the mocked functions
const mockSignIn = authRepository.signIn as jest.Mock;
const mockRegister = authRepository.register as jest.Mock;
const mockSignOut = authRepository.signOut as jest.Mock;
const mockPasswordReset = authRepository.sendPasswordReset as jest.Mock;

// Minimal fake Firebase user
const fakeUser = { uid: "uid-1", email: "user@example.com" } as any;

beforeEach(() => {
  jest.clearAllMocks();
  // Reset store to initial state between tests
  useAuthStore.setState({
    user: null,
    loading: false,
    error: null,
    achievements: [],
  });
});

// ── Initial state ─────────────────────────────────────────────────────────────

describe("initial state", () => {
  it("has user=null, loading=false, error=null", () => {
    const { user, loading, error } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(loading).toBe(false);
    expect(error).toBeNull();
  });
});

// ── setUser ───────────────────────────────────────────────────────────────────

describe("setUser", () => {
  it("stores the user and clears loading", () => {
    useAuthStore.getState().setUser(fakeUser);
    const { user, loading } = useAuthStore.getState();
    expect(user).toBe(fakeUser);
    expect(loading).toBe(false);
  });

  it("accepts null to clear the user", () => {
    useAuthStore.setState({ user: fakeUser });
    useAuthStore.getState().setUser(null);
    expect(useAuthStore.getState().user).toBeNull();
  });
});

// ── clearError ────────────────────────────────────────────────────────────────

describe("clearError", () => {
  it("sets error to null", () => {
    useAuthStore.setState({ error: "some error" });
    useAuthStore.getState().clearError();
    expect(useAuthStore.getState().error).toBeNull();
  });
});

// ── signIn ────────────────────────────────────────────────────────────────────

describe("signIn", () => {
  it("sets user on success", async () => {
    mockSignIn.mockResolvedValueOnce(fakeUser);

    await useAuthStore.getState().signIn("user@example.com", "pass123");

    const { user, loading, error } = useAuthStore.getState();
    expect(user).toBe(fakeUser);
    expect(loading).toBe(false);
    expect(error).toBeNull();
    expect(mockSignIn).toHaveBeenCalledWith("user@example.com", "pass123");
  });

  it("sets error message on auth/invalid-credential failure", async () => {
    const err = Object.assign(new Error("Firebase error"), {
      code: "auth/invalid-credential",
    });
    mockSignIn.mockRejectedValueOnce(err);

    await useAuthStore.getState().signIn("user@example.com", "wrong");

    const { user, loading, error } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(loading).toBe(false);
    expect(error).toBe("Credenciales incorrectas");
  });

  it("maps auth/user-not-found to 'Credenciales incorrectas'", async () => {
    mockSignIn.mockRejectedValueOnce(
      Object.assign(new Error(), { code: "auth/user-not-found" }),
    );
    await useAuthStore.getState().signIn("x@x.com", "y");
    expect(useAuthStore.getState().error).toBe("Credenciales incorrectas");
  });

  it("maps auth/too-many-requests to the correct message", async () => {
    mockSignIn.mockRejectedValueOnce(
      Object.assign(new Error(), { code: "auth/too-many-requests" }),
    );
    await useAuthStore.getState().signIn("x@x.com", "y");
    expect(useAuthStore.getState().error).toBe(
      "Demasiados intentos. Inténtalo más tarde",
    );
  });

  it("uses a generic fallback for unknown error codes", async () => {
    mockSignIn.mockRejectedValueOnce(
      Object.assign(new Error(), { code: "auth/unknown-code" }),
    );
    await useAuthStore.getState().signIn("x@x.com", "y");
    expect(useAuthStore.getState().error).toBe(
      "Ha ocurrido un error. Inténtalo de nuevo",
    );
  });
});

// ── register ──────────────────────────────────────────────────────────────────

describe("register", () => {
  it("sets user on successful registration", async () => {
    mockRegister.mockResolvedValueOnce(fakeUser);

    await useAuthStore
      .getState()
      .register("user@example.com", "pass123", "Ana");

    const { user, loading, error } = useAuthStore.getState();
    expect(user).toBe(fakeUser);
    expect(loading).toBe(false);
    expect(error).toBeNull();
    expect(mockRegister).toHaveBeenCalledWith(
      "user@example.com",
      "pass123",
      "Ana",
    );
  });

  it("sets error on auth/email-already-in-use", async () => {
    mockRegister.mockRejectedValueOnce(
      Object.assign(new Error(), { code: "auth/email-already-in-use" }),
    );
    await useAuthStore.getState().register("taken@example.com", "pass", "Ana");
    expect(useAuthStore.getState().error).toBe(
      "Este correo ya está registrado",
    );
  });

  it("sets error on auth/weak-password", async () => {
    mockRegister.mockRejectedValueOnce(
      Object.assign(new Error(), { code: "auth/weak-password" }),
    );
    await useAuthStore.getState().register("x@x.com", "12", "Ana");
    expect(useAuthStore.getState().error).toBe(
      "La contraseña debe tener al menos 6 caracteres",
    );
  });

  it("sets error on auth/invalid-email", async () => {
    mockRegister.mockRejectedValueOnce(
      Object.assign(new Error(), { code: "auth/invalid-email" }),
    );
    await useAuthStore.getState().register("notanemail", "pass", "Ana");
    expect(useAuthStore.getState().error).toBe(
      "El formato del correo no es válido",
    );
  });
});

// ── signOut ───────────────────────────────────────────────────────────────────

describe("signOut", () => {
  it("clears user on success", async () => {
    useAuthStore.setState({ user: fakeUser });
    mockSignOut.mockResolvedValueOnce(undefined);

    await useAuthStore.getState().signOut();

    const { user, loading, error } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(loading).toBe(false);
    expect(error).toBeNull();
  });

  it("sets error on signOut failure", async () => {
    useAuthStore.setState({ user: fakeUser });
    mockSignOut.mockRejectedValueOnce(
      Object.assign(new Error(), { code: "auth/network-request-failed" }),
    );

    await useAuthStore.getState().signOut();

    expect(useAuthStore.getState().error).toBe(
      "Error de conexión. Comprueba tu internet",
    );
  });
});

// ── sendPasswordReset ─────────────────────────────────────────────────────────

describe("sendPasswordReset", () => {
  it("completes without setting error on success", async () => {
    mockPasswordReset.mockResolvedValueOnce(undefined);

    await useAuthStore.getState().sendPasswordReset("user@example.com");

    const { loading, error } = useAuthStore.getState();
    expect(loading).toBe(false);
    expect(error).toBeNull();
    expect(mockPasswordReset).toHaveBeenCalledWith("user@example.com");
  });

  it("sets loading to false even if the repo throws", async () => {
    mockPasswordReset.mockRejectedValueOnce(new Error("network error"));

    // The store uses try/finally so loading is always reset, but the error
    // propagates (the real repo swallows it; here we catch it manually)
    try {
      await useAuthStore.getState().sendPasswordReset("user@example.com");
    } catch {
      // expected in test environment — real repo always swallows
    }

    expect(useAuthStore.getState().loading).toBe(false);
  });
});
