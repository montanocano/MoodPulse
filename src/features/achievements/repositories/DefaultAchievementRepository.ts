import {
  collection,
  writeBatch,
  getDocs,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../shared/api/firebase";
import {
  type AchievementType,
  type AchievementMeta,
  ACHIEVEMENT_CONFIG,
} from "../../../shared/utils/checkAchievements";

export async function getAchievements(uid: string): Promise<AchievementMeta[]> {
  const snap = await getDocs(collection(db, "users", uid, "achievements"));
  return snap.docs.map((d) => d.data() as AchievementMeta);
}

export async function grantAchievements(
  uid: string,
  newTypes: AchievementType[],
): Promise<void> {
  if (newTypes.length === 0) return;
  const batch = writeBatch(db);
  for (const type of newTypes) {
    const meta = ACHIEVEMENT_CONFIG[type];
    const ref = doc(collection(db, "users", uid, "achievements"), type);
    batch.set(ref, {
      type: meta.type,
      titulo: meta.titulo,
      descripcion: meta.descripcion,
      emoji: meta.emoji,
      fechaObtenido: serverTimestamp(),
    });
  }
  await batch.commit();
}
