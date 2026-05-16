import {
  collection,
  getDocs,
  writeBatch,
  doc,
  updateDoc,
  query,
  orderBy,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../../shared/api/firebase";
import type { Recommendation } from "../../../types/recommendation";

function recCol(uid: string) {
  return collection(db, "users", uid, "recommendations");
}

export async function loadRecommendations(uid: string): Promise<Recommendation[]> {
  const snap = await getDocs(
    query(recCol(uid), orderBy("fechaGenerada", "desc")),
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Recommendation));
}

export async function saveRecommendations(
  uid: string,
  recs: Recommendation[],
): Promise<void> {
  // Delete existing docs first to avoid stale data
  const existing = await getDocs(recCol(uid));
  const deleteBatch = writeBatch(db);
  existing.docs.forEach((d) => deleteBatch.delete(d.ref));
  await deleteBatch.commit();

  // Write new batch
  const batch = writeBatch(db);
  for (const rec of recs) {
    const ref = doc(recCol(uid), rec.id);
    const { isStatic, ...firestoreData } = rec;
    void isStatic; // intentionally excluded from Firestore
    batch.set(ref, firestoreData);
  }
  await batch.commit();
}

export async function toggleCompleted(
  uid: string,
  recId: string,
  completada: boolean,
): Promise<void> {
  await updateDoc(doc(recCol(uid), recId), { completada });
}
