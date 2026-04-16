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
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../../shared/api/firebase";

// ── Contract ────────────────────────────────────────────────────────────────

export interface IAuthRepository {
  signIn(email: string, password: string): Promise<User>;
  register(email: string, password: string, nombre: string): Promise<User>;
  signOut(): Promise<void>;
  signInWithGoogle(idToken: string): Promise<User>;
  sendPasswordReset(email: string): Promise<void>;
}

// ── Firebase implementation ─────────────────────────────────────────────────

class DefaultAuthRepository implements IAuthRepository {
  async signIn(email: string, password: string): Promise<User> {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return user;
  }

  async register(email: string, password: string, nombre: string): Promise<User> {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName: nombre });
    await sendEmailVerification(user);
    await setDoc(doc(db, "users", user.uid), {
      email,
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

  async signInWithGoogle(idToken: string): Promise<User> {
    const credential = GoogleAuthProvider.credential(idToken);
    const { user } = await signInWithCredential(auth, credential);
    await setDoc(
      doc(db, "users", user.uid),
      {
        email: user.email ?? "",
        nombre: user.displayName ?? "",
        fotoUrl: null,
        fechaRegistro: serverTimestamp(),
        rachaActual: 0,
        totalRegistros: 0,
      },
      { merge: true }
    );
    return user;
  }

  async sendPasswordReset(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch {
      // Intentionally swallowed — anti-enumeration: always show success
    }
  }
}

// ── Singleton ───────────────────────────────────────────────────────────────

export const authRepository: IAuthRepository = new DefaultAuthRepository();
