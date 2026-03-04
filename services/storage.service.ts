import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/config";
import { validateFile } from "@/lib/validation";

export async function uploadProfilePhoto(uid: string, file: File): Promise<string> {
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const storageRef = ref(storage, `users/${uid}/profile.jpg`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
