import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../../../shared/api/firebase";
import { EmotionRecord } from "../../../types/emotion";

// ── Contract ────────────────────────────────────────────────────────────────

export interface IHistoryRepository {
  /** Load all emotion records for a given calendar month. */
  getRecordsByMonth(
    uid: string,
    year: number,
    month: number,
  ): Promise<EmotionRecord[]>;
}

// ── Firestore implementation ────────────────────────────────────────────────

class DefaultHistoryRepository implements IHistoryRepository {
  async getRecordsByMonth(
    uid: string,
    year: number,
    month: number,
  ): Promise<EmotionRecord[]> {
    const from = `${year}-${String(month).padStart(2, "0")}-01`;
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const to = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

    const colRef = collection(db, "users", uid, "emotionRecords");
    const q = query(
      colRef,
      where("date", ">=", from),
      where("date", "<", to),
      orderBy("date", "asc"),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      ...(d.data() as Omit<EmotionRecord, "date">),
      date: d.id,
    }));
  }
}

// ── Singleton ───────────────────────────────────────────────────────────────

export const historyRepository: IHistoryRepository =
  new DefaultHistoryRepository();
