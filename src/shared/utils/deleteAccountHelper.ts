import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
} from "firebase/auth";
import {
  collection,
  getDocs,
  writeBatch,
  doc,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../api/firebase";

async function deleteSubcollection(
  uid: string,
  subcollection: string,
): Promise<void> {
  const snap = await getDocs(collection(db, "users", uid, subcollection));
  if (snap.empty) return;
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

export async function deleteAccount(
  email: string,
  password: string,
): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("No authenticated user");

  const credential = EmailAuthProvider.credential(email, password);
  await reauthenticateWithCredential(currentUser, credential);

  const uid = currentUser.uid;

  await deleteSubcollection(uid, "emotionRecords");
  await deleteSubcollection(uid, "achievements");

  const fromSnap = await getDocs(
    query(collection(db, "friendRequests"), where("fromUid", "==", uid)),
  );
  if (!fromSnap.empty) {
    const batch = writeBatch(db);
    fromSnap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }

  const toSnap = await getDocs(
    query(collection(db, "friendRequests"), where("toUid", "==", uid)),
  );
  if (!toSnap.empty) {
    const batch = writeBatch(db);
    toSnap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }

  const batch = writeBatch(db);
  batch.delete(doc(db, "users", uid));
  await batch.commit();

  await deleteUser(currentUser);
}
