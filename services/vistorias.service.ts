import {
  collection, addDoc, getDocs, query, where, orderBy, Timestamp,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { VistoriaDoc } from "@/types/vistoria";

const COL = "vistorias";

export async function createVistoria(data: Omit<VistoriaDoc, "id" | "createdAt">): Promise<void> {
  await addDoc(collection(db, COL), {
    ...data,
    createdAt: Timestamp.now().toDate().toISOString(),
  });
}

export async function getVistorias(filters?: {
  obraId?: string;
  apartamentoId?: string;
}): Promise<VistoriaDoc[]> {
  const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];
  if (filters?.obraId) constraints.push(where("obraId", "==", filters.obraId));
  if (filters?.apartamentoId) constraints.push(where("apartamentoId", "==", filters.apartamentoId));

  const q = query(collection(db, COL), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as VistoriaDoc));
}
