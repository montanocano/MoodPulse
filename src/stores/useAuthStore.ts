import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithCredential,
  updateProfile,
  type User,
} from "firebase/auth";
import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../config/firebase";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface AuthActions {
  register: (email: string, password: string, nombre: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: (idToken: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;
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

async function createUserDocument(
  uid: string,
  email: string,
  nombre: string,
  merge = false
) {
  await setDoc(
    doc(db, "users", uid),
    {
      email,
      nombre,
      fotoUrl: null,
      fechaRegistro: serverTimestamp(),
      rachaActual: 0,
      totalRegistros: 0,
    },
    { merge }
  );
}

export const useAuthStore = create<AuthState & AuthActions>()(
  immer((set) => ({
    user: null,
    loading: false,
    error: null,

    // ── Register ────────────────────────────────────────────────────
    register: async (email, password, nombre) => {
      set((state) => {
        state.loading = true;
        state.error = null;
      });
      try {
        const { user } = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        await updateProfile(user, { displayName: nombre });
        await sendEmailVerification(user);
        await createUserDocument(user.uid, email, nombre, false);
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
        const { user } = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
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

    // ── Google Sign In ──────────────────────────────────────────────
    signInWithGoogle: async (idToken: string) => {
      set((state) => {
        state.loading = true;
        state.error = null;
      });
      try {
        const credential = GoogleAuthProvider.credential(idToken);
        const { user } = await signInWithCredential(auth, credential);
        await createUserDocument(
          user.uid,
          user.email ?? "",
          user.displayName ?? "",
          true
        );
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
        await sendPasswordResetEmail(auth, email);
      } catch {
        // Intentionally swallowed — anti-enumeration: always show success
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
        await firebaseSignOut(auth);
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
  }))
);
