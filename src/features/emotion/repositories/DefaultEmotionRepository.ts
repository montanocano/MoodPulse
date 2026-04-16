import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../shared/api/firebase";
import { EmotionRecord, NewEmotionRecord } from "../../../types/emotion";

// ── Contract ────────────────────────────────────────────────────────────────

export interface IEmotionRepository {
  /** Load emotion records for a user from `from` (YYYY-MM-DD) onwards, newest first. */
  loadRecords(uid: string, from: string): Promise<EmotionRecord[]>;
  /** Persist a new emotion record for the given date. */
  saveRecord(uid: string, date: string, data: NewEmotionRecord): Promise<void>;
  /** Merge partial updates into an existing record. */
  updateRecord(uid: string, date: string, data: Partial<NewEmotionRecord>): Promise<void>;
}

// ── Firestore implementation ────────────────────────────────────────────────

class DefaultEmotionRepository implements IEmotionRepository {
  async loadRecords(uid: string, from: string): Promise<EmotionRecord[]> {
    const colRef = collection(db, "users", uid, "emotionRecords");
    const q = query(
      colRef,
      where("date", ">=", from),
      orderBy("date", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      ...(d.data() as Omit<EmotionRecord, "date">),
      date: d.id,
    }));
  }

  async saveRecord(uid: string, date: string, data: NewEmotionRecord): Promise<void> {
    const docRef = doc(db, "users", uid, "emotionRecords", date);
    await setDoc(docRef, {
      emotion: data.emotion,
      intensity: data.intensity,
      reflection: data.reflection,
      date,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async updateRecord(
    uid: string,
    date: string,
    data: Partial<NewEmotionRecord>
  ): Promise<void> {
    const docRef = doc(db, "users", uid, "emotionRecords", date);
    await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
  }
}

// ── Singleton ───────────────────────────────────────────────────────────────

export const emotionRepository: IEmotionRepository = new DefaultEmotionRepository();
