import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy, Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { NC, NCFormData } from "@/types";

const COL = "nc";

export async function getNCs(): Promise<NC[]> {
  const q = query(collection(db, COL), orderBy("criadoEm", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as NC));
}

export async function createNC(data: NCFormData): Promise<string> {
  const now = Timestamp.now().toDate().toISOString();
  const today = new Date().toISOString().slice(0, 10);
  const overdue = data.deadline ? new Date(data.deadline) < new Date() : false;
  const count = (await getNCs()).length + 1;
  const ncId = `NC-${String(count).padStart(3, "0")}`;
  const ref = await addDoc(collection(db, COL), {
    ...data,
    ncId,
    status: "open",
    date: today,
    overdue,
    criadoEm: now,
  });
  return ref.id;
}

export async function updateNC(id: string, data: Partial<NC>): Promise<void> {
  await updateDoc(doc(db, COL, id), data);
}

export async function deleteNC(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}
