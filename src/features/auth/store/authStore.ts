import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { type User } from "firebase/auth";
import { authRepository } from "../repositories/DefaultAuthRepository";
import { getAchievements } from "../../achievements";
import type { AchievementMeta } from "../../../shared/utils/checkAchievements";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  achievements: AchievementMeta[];
}

interface AuthActions {
  register: (email: string, password: string, nombre: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;
  checkEmailVerified: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  updateDisplayName: (nombre: string) => Promise<void>;
  loadAchievements: (uid: string) => Promise<void>;
}

function parseFirebaseError(code: string): string {
  const messages: Record<string, string> = {
    "auth/user-not-found": "Credenciales incorrectas",
    "auth/wrong-password": "Credenciales incorrectas",
    "auth/invalid-credential": "Credenciales incorrectas",
    "auth/email-already-in-use": "Este correo ya está registrado",
    "auth/weak-password": "La contraseña debe tener al menos 6 caracteres",
    "auth/invalid-email": "El formato del correo no es válido",
    "auth/too-many-requests": "Demasiados intentos. Inténtalo más tarde",
    "auth/network-request-failed": "Error de conexión. Comprueba tu internet",
  };
  return messages[code] ?? "Ha ocurrido un error. Inténtalo de nuevo";
}

export const useAuthStore = create<AuthState & AuthActions>()(
  immer((set) => ({
    user: null,
    loading: false,
    error: null,
    achievements: [],

    // ── Register ────────────────────────────────────────────────────
    register: async (email, password, nombre) => {
      set((state) => {
        state.loading = true;
        state.error = null;
      });
      try {
        const user = await authRepository.register(email, password, nombre);
        set((state) => {
          state.user = user;
          state.loading = false;
        });
      } catch (err: unknown) {
        const code = (err as { code?: string }).code ?? "";
        set((state) => {
          state.error = parseFirebaseError(code);
          state.loading = false;
        });
      }
    },

    // ── Sign In ─────────────────────────────────────────────────────
    signIn: async (email, password) => {
      set((state) => {
        state.loading = true;
        state.error = null;
      });
      try {
        const user = await authRepository.signIn(email, password);
        set((state) => {
          state.user = user;
          state.loading = false;
        });
      } catch (err: unknown) {
        const code = (err as { code?: string }).code ?? "";
        set((state) => {
          state.error = parseFirebaseError(code);
          state.loading = false;
        });
      }
    },

    // ── Password Reset ──────────────────────────────────────────────
    sendPasswordReset: async (email) => {
      set((state) => {
        state.loading = true;
        state.error = null;
      });
      try {
        await authRepository.sendPasswordReset(email);
      } finally {
        set((state) => {
          state.loading = false;
        });
      }
    },

    // ── Sign Out ────────────────────────────────────────────────────
    signOut: async () => {
      set((state) => {
        state.loading = true;
        state.error = null;
      });
      try {
        await authRepository.signOut();
        set((state) => {
          state.user = null;
          state.loading = false;
        });
      } catch (err: unknown) {
        const code = (err as { code?: string }).code ?? "";
        set((state) => {
          state.error = parseFirebaseError(code);
          state.loading = false;
        });
      }
    },

    // ── Setter used by onAuthStateChanged listener ──────────────────
    setUser: (user) => {
      set((state) => {
        state.user = user;
        state.loading = false;
      });
    },

    clearError: () => {
      set((state) => {
        state.error = null;
      });
    },

    // ── Email verification ──────────────────────────────────────────
    checkEmailVerified: async () => {
      await authRepository.checkEmailVerified();
    },

    resendVerificationEmail: async () => {
      await authRepository.resendVerificationEmail();
    },

    // ── Profile ─────────────────────────────────────────────────────
    updateDisplayName: async (nombre) => {
      set((state) => {
        state.loading = true;
        state.error = null;
      });
      try {
        await authRepository.updateDisplayName(nombre);
      } finally {
        set((state) => {
          state.loading = false;
        });
      }
    },

    loadAchievements: async (uid) => {
      try {
        const items = await getAchievements(uid);
        set((state) => {
          state.achievements = items;
        });
      } catch {
        // Non-critical — leave achievements as-is
      }
    },
  })),
);
