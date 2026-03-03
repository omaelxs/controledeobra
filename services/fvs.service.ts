import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy, Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Fvs, FvsFormData, FvsStatus } from "@/types";
import { UserRole } from "@/types/user";
import { assertPermission } from "@/lib/permissions";

const COL = "fvs";

export async function getFvs(): Promise<Fvs[]> {
  const q = query(collection(db, COL), orderBy("criadoEm", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Fvs));
}

export async function createFvs(data: FvsFormData, role?: UserRole): Promise<string> {
  if (role) assertPermission(role, "create");
  const now = Timestamp.now().toDate().toISOString();
  const ref = await addDoc(collection(db, COL), {
    ...data,
    status: "andamento" as FvsStatus,
    criadoEm: now,
  });
  return ref.id;
}

export async function updateFvs(id: string, data: Partial<Fvs>): Promise<void> {
  await updateDoc(doc(db, COL, id), data);
}

export async function deleteFvs(id: string, role?: UserRole): Promise<void> {
  if (role) assertPermission(role, "delete");
  await deleteDoc(doc(db, COL, id));
}
