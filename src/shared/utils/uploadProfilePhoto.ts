import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { storage, auth, db } from "../api/firebase";

export async function uploadProfilePhoto(
  localUri: string,
  uid: string,
): Promise<string> {
  const response = await fetch(localUri);
  const blob = await response.blob();

  const storageRef = ref(storage, `profilePhotos/${uid}.jpg`);
  const uploadTask = uploadBytesResumable(storageRef, blob);

  await new Promise<void>((resolve, reject) => {
    uploadTask.on("state_changed", undefined, reject, resolve);
  });

  const downloadURL = await getDownloadURL(storageRef);

  if (auth.currentUser) {
    await updateProfile(auth.currentUser, { photoURL: downloadURL });
  }

  await updateDoc(doc(db, "users", uid), { fotoUrl: downloadURL });

  return downloadURL;
}
