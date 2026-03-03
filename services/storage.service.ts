import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/config";

export async function uploadProfilePhoto(uid: string, file: File): Promise<string> {
  const storageRef = ref(storage, `profile-photos/${uid}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
