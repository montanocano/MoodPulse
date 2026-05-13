import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  reload,
  type User,
} from "firebase/auth";
import { doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../../shared/api/firebase";

// ── Contract ────────────────────────────────────────────────────────────────

export interface IAuthRepository {
  signIn(email: string, password: string): Promise<User>;
  register(email: string, password: string, nombre: string): Promise<User>;
  signOut(): Promise<void>;
  sendPasswordReset(email: string): Promise<void>;
  checkEmailVerified(): Promise<void>;
  resendVerificationEmail(): Promise<void>;
  updateDisplayName(nombre: string): Promise<void>;
}

// ── Firebase implementation ─────────────────────────────────────────────────

class DefaultAuthRepository implements IAuthRepository {
  async signIn(email: string, password: string): Promise<User> {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return user;
  }

  async register(
    email: string,
    password: string,
    nombre: string,
  ): Promise<User> {
    const { user } = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    await updateProfile(user, { displayName: nombre });
    await sendEmailVerification(user);
    await setDoc(doc(db, "users", user.uid), {
      email: user.email ?? email.toLowerCase(),
      nombre,
      fotoUrl: null,
      fechaRegistro: serverTimestamp(),
      rachaActual: 0,
      totalRegistros: 0,
    });
    return user;
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(auth);
  }

  async sendPasswordReset(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch {
      // Intentionally swallowed — anti-enumeration: always show success
    }
  }

  async checkEmailVerified(): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;
    await reload(user);
    if (user.emailVerified) {
      await user.getIdToken(true); // force token refresh → triggers onIdTokenChanged in layout
    }
  }

  async resendVerificationEmail(): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;
    await sendEmailVerification(user);
  }

  async updateDisplayName(nombre: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;
    await updateProfile(user, { displayName: nombre });
    await updateDoc(doc(db, "users", user.uid), { nombre });
  }
}

// ── Singleton ───────────────────────────────────────────────────────────────

export const authRepository: IAuthRepository = new DefaultAuthRepository();
