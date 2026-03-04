import {
  doc, getDoc, setDoc, updateDoc, getDocs, collection, query, orderBy, Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { UserDoc, UserRole } from "@/types/user";

const COL = "users";
const ADMIN_EMAILS = [
  "maelcost10@gmail.com",
  process.env.NEXT_PUBLIC_ADMIN_EMAIL,
].filter(Boolean).map(e => e!.toLowerCase());

function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export async function getUser(uid: string): Promise<UserDoc | null> {
  const snap = await getDoc(doc(db, COL, uid));
  if (!snap.exists()) return null;
  return snap.data() as UserDoc;
}

export async function createUserIfNotExists(uid: string, email: string): Promise<UserDoc> {
  console.log("[AUTH DEBUG] createUserIfNotExists:", { email, ADMIN_EMAILS, isAdmin: isAdminEmail(email) });
  const existing = await getUser(uid);
  if (existing) {
    console.log("[AUTH DEBUG] existing user found:", { role: existing.role, email: existing.email });
    // Garantir que o email admin sempre tenha role admin
    if (isAdminEmail(email) && existing.role !== "admin") {
      console.log("[AUTH DEBUG] Promoting to admin!");
      await updateDoc(doc(db, COL, uid), { role: "admin" });
      return { ...existing, role: "admin" };
    }
    return existing;
  }

  const role: UserRole = isAdminEmail(email) ? "admin" : "user";
  const now = Timestamp.now().toDate().toISOString();

  const userData: UserDoc = {
    uid,
    email,
    displayName: email.split("@")[0],
    photoURL: null,
    role,
    online: true,
    lastSeen: now,
    createdAt: now,
  };

  await setDoc(doc(db, COL, uid), userData);
  return userData;
}

export async function updateUser(uid: string, data: Partial<UserDoc>): Promise<void> {
  await updateDoc(doc(db, COL, uid), data);
}

export async function setUserOnline(uid: string, online: boolean): Promise<void> {
  await updateDoc(doc(db, COL, uid), {
    online,
    lastSeen: Timestamp.now().toDate().toISOString(),
  });
}

export async function getAllUsers(): Promise<UserDoc[]> {
  const q = query(collection(db, COL), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as UserDoc);
}

export async function changeUserRole(uid: string, newRole: UserRole, requesterRole: UserRole): Promise<void> {
  if (requesterRole !== "admin") {
    throw new Error("Apenas administradores podem alterar roles");
  }
  await updateDoc(doc(db, COL, uid), { role: newRole });
}

export async function setUserObra(uid: string, obraId: string | null, requesterRole: UserRole): Promise<void> {
  if (requesterRole !== "admin" && requesterRole !== "dev") {
    throw new Error("Apenas administradores podem atribuir obras");
  }
  if (obraId) {
    await updateDoc(doc(db, COL, uid), { obraIdPermitida: obraId });
  } else {
    // Remove restriction - use deleteField
    const { deleteField } = await import("firebase/firestore");
    await updateDoc(doc(db, COL, uid), { obraIdPermitida: deleteField() });
  }
}
