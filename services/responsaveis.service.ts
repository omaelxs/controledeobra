import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy, Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Responsavel, ResponsavelFormData } from "@/types";
import { UserRole } from "@/types/user";
import { assertPermission } from "@/lib/permissions";

const COL = "responsaveis";

export async function getResponsaveis(): Promise<Responsavel[]> {
  const q = query(collection(db, COL), orderBy("criadoEm", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Responsavel));
}

export async function createResponsavel(data: ResponsavelFormData, role: UserRole): Promise<string> {
  assertPermission(role, "create");
  const now = Timestamp.now().toDate().toISOString();
  const ref = await addDoc(collection(db, COL), { ...data, criadoEm: now });
  return ref.id;
}

export async function updateResponsavel(id: string, data: Partial<Responsavel>, role: UserRole): Promise<void> {
  assertPermission(role, "edit");
  await updateDoc(doc(db, COL, id), data);
}

export async function deleteResponsavel(id: string, role: UserRole): Promise<void> {
  assertPermission(role, "delete");
  await deleteDoc(doc(db, COL, id));
}
