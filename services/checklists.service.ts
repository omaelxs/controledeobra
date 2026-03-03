import {
  collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy, Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { ChecklistTemplate } from "@/types/vistoria";

const COL = "checklists";

export async function getChecklists(): Promise<ChecklistTemplate[]> {
  const q = query(collection(db, COL), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as ChecklistTemplate));
}

export async function getChecklistByScope(scope: string): Promise<ChecklistTemplate | null> {
  const all = await getChecklists();
  return all.find(c => c.scope === scope) ?? null;
}

export async function createChecklist(data: Omit<ChecklistTemplate, "id" | "createdAt">): Promise<void> {
  await addDoc(collection(db, COL), {
    ...data,
    createdAt: Timestamp.now().toDate().toISOString(),
  });
}

export async function updateChecklist(id: string, data: Partial<ChecklistTemplate>): Promise<void> {
  await updateDoc(doc(db, COL, id), data);
}

export async function deleteChecklist(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}
