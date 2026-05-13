// NOTE: The query `where('toUid','==',uid).where('status','==','pending')` requires
// a Firestore composite index on the `friendRequests` collection.
// Fields: toUid ASC, status ASC.
// If the index is missing, the first query will fail and Firestore will log the
// index creation URL in the Metro console. Create it from there or via:
// Firebase Console → Firestore → Indexes → Add composite index.

import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../../../shared/api/firebase";
import type { FriendRequest, FriendSummary, UserSearchResult } from "../types";

export async function searchUserByEmail(
  email: string,
  currentUid: string,
): Promise<UserSearchResult | null> {
  const normalizedEmail = email.toLowerCase().trim();
  console.log("[searchUser] querying email:", JSON.stringify(normalizedEmail));
  const snap = await getDocs(
    query(collection(db, "users"), where("email", "==", normalizedEmail)),
  );
  console.log("[searchUser] docs found:", snap.size);
  snap.docs.forEach((d) =>
    console.log(
      "[searchUser] doc id:",
      d.id,
      "data:",
      JSON.stringify(d.data()),
    ),
  );
  if (snap.empty) return null;
  const d = snap.docs[0];
  if (d.id === currentUid)
    return { uid: d.id, self: true, ...d.data() } as UserSearchResult;
  return { uid: d.id, self: false, ...d.data() } as UserSearchResult;
}

export async function sendFriendRequest(
  fromUid: string,
  toUid: string,
): Promise<void> {
  // Check for existing pending request
  const existing = await getDocs(
    query(
      collection(db, "friendRequests"),
      where("fromUid", "==", fromUid),
      where("toUid", "==", toUid),
      where("status", "==", "pending"),
    ),
  );
  if (!existing.empty) {
    throw new Error("duplicate");
  }
  await addDoc(collection(db, "friendRequests"), {
    fromUid,
    toUid,
    status: "pending",
    createdAt: serverTimestamp(),
  });

  // Notify recipient (best-effort, non-blocking)
  notifyFriendRequest(fromUid, toUid).catch(() => {});
}

async function notifyFriendRequest(
  fromUid: string,
  toUid: string,
): Promise<void> {
  const [fromDoc, toDoc] = await Promise.all([
    getDoc(doc(db, "users", fromUid)),
    getDoc(doc(db, "users", toUid)),
  ]);
  const pushToken: string | null = toDoc.exists()
    ? (toDoc.data().expoPushToken ?? null)
    : null;
  if (!pushToken) return;

  const fromName: string = fromDoc.exists()
    ? (fromDoc.data().nombre ?? fromDoc.data().email ?? "Alguien")
    : "Alguien";

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: pushToken,
      title: "Nueva solicitud de amistad",
      body: `${fromName} te ha enviado una solicitud de amistad`,
      sound: "default",
    }),
  });
}

export async function cancelFriendRequest(requestId: string): Promise<void> {
  await deleteDoc(doc(db, "friendRequests", requestId));
}

export async function savePushToken(uid: string, token: string): Promise<void> {
  await setDoc(
    doc(db, "users", uid),
    { expoPushToken: token },
    { merge: true },
  );
}

export async function getIncomingRequests(
  uid: string,
): Promise<FriendRequest[]> {
  // Single-field query + JS filter to avoid composite index requirement.
  const snap = await getDocs(
    query(collection(db, "friendRequests"), where("toUid", "==", uid)),
  );
  const requests: FriendRequest[] = [];
  for (const d of snap.docs) {
    const data = d.data();
    if (data.status !== "pending") continue;
    const fromDoc = await getDoc(doc(db, "users", data.fromUid));
    requests.push({
      id: d.id,
      fromUid: data.fromUid,
      toUid: data.toUid,
      status: data.status,
      fromName: fromDoc.exists()
        ? (fromDoc.data().nombre ?? fromDoc.data().email)
        : data.fromUid,
      fromPhoto: fromDoc.exists() ? (fromDoc.data().fotoUrl ?? null) : null,
    });
  }
  return requests;
}

export async function acceptRequest(requestId: string): Promise<void> {
  await updateDoc(doc(db, "friendRequests", requestId), { status: "accepted" });
}

export async function rejectRequest(requestId: string): Promise<void> {
  await updateDoc(doc(db, "friendRequests", requestId), { status: "rejected" });
}

export async function getFriends(uid: string): Promise<FriendSummary[]> {
  // Use single-field queries + JS filter to avoid needing composite indexes.
  const [fromSnap, toSnap] = await Promise.all([
    getDocs(
      query(collection(db, "friendRequests"), where("fromUid", "==", uid)),
    ),
    getDocs(query(collection(db, "friendRequests"), where("toUid", "==", uid))),
  ]);

  const friendUids = new Set<string>();
  fromSnap.docs
    .filter((d) => d.data().status === "accepted")
    .forEach((d) => friendUids.add(d.data().toUid));
  toSnap.docs
    .filter((d) => d.data().status === "accepted")
    .forEach((d) => friendUids.add(d.data().fromUid));

  const friends: FriendSummary[] = [];
  for (const friendUid of friendUids) {
    const userDoc = await getDoc(doc(db, "users", friendUid));
    if (!userDoc.exists()) continue;
    const userData = userDoc.data();

    // Get achievements (best-effort)
    let achievements: { type: string; emoji: string; titulo: string }[] = [];
    try {
      const achievementsSnap = await getDocs(
        collection(db, "users", friendUid, "achievements"),
      );
      achievements = achievementsSnap.docs.map((d) => ({
        type: d.id,
        emoji: d.data().emoji ?? "🏆",
        titulo: d.data().titulo ?? "",
      }));
    } catch {
      // Not critical
    }

    // Compute streak from emotionRecords (best-effort)
    let streak = 0;
    try {
      const recordsSnap = await getDocs(
        collection(db, "users", friendUid, "emotionRecords"),
      );
      const dates = recordsSnap.docs
        .map((d) => d.id)
        .sort()
        .reverse();
      const today = new Date().toISOString().slice(0, 10);
      let expected = today;
      for (const date of dates) {
        if (date === expected) {
          streak++;
          const d = new Date(expected);
          d.setDate(d.getDate() - 1);
          expected = d.toISOString().slice(0, 10);
        } else if (date < expected) {
          break;
        }
      }
    } catch {
      // Not critical
    }

    friends.push({
      uid: friendUid,
      nombre: userData.nombre ?? userData.email ?? friendUid,
      fotoUrl: userData.fotoUrl ?? null,
      streak,
      achievements,
    });
  }
  return friends;
}

export async function getOutgoingRequests(
  uid: string,
): Promise<FriendRequest[]> {
  // Single-field query + JS filter to avoid composite index requirement.
  const snap = await getDocs(
    query(collection(db, "friendRequests"), where("fromUid", "==", uid)),
  );
  const requests: FriendRequest[] = [];
  for (const d of snap.docs) {
    const data = d.data();
    if (data.status !== "pending") continue;
    const toDoc = await getDoc(doc(db, "users", data.toUid));
    requests.push({
      id: d.id,
      fromUid: data.fromUid,
      toUid: data.toUid,
      status: data.status,
      fromName: null,
      fromPhoto: null,
      toName: toDoc.exists()
        ? (toDoc.data().nombre ?? toDoc.data().email ?? null)
        : null,
    });
  }
  return requests;
}
