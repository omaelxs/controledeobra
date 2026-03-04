import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, orderBy, Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { FvsModelo } from "@/types";
import { UserRole } from "@/types/user";
import { assertPermission } from "@/lib/permissions";

const COL = "fvsModelos";

export async function getFvsModelos(): Promise<FvsModelo[]> {
  const q = query(collection(db, COL), orderBy("criadoEm", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as FvsModelo));
}

export async function getFvsModelo(id: string): Promise<FvsModelo | null> {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as FvsModelo;
}

export async function createFvsModelo(data: Omit<FvsModelo, "id" | "criadoEm">, role: UserRole): Promise<string> {
  assertPermission(role, "create");
  const ref = await addDoc(collection(db, COL), {
    ...data,
    criadoEm: Timestamp.now().toDate().toISOString(),
  });
  return ref.id;
}

export async function updateFvsModelo(id: string, data: Partial<FvsModelo>, role: UserRole): Promise<void> {
  assertPermission(role, "edit");
  const { id: _, ...rest } = data;
  await updateDoc(doc(db, COL, id), rest);
}

export async function deleteFvsModelo(id: string, role: UserRole): Promise<void> {
  assertPermission(role, "delete");
  await deleteDoc(doc(db, COL, id));
}
