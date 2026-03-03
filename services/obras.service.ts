import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, orderBy, Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Obra, ObraFormData, Pavimento, Apartamento } from "@/types";
import { UserRole } from "@/types/user";
import { assertPermission } from "@/lib/permissions";

const COL = "obras";

export async function getObras(): Promise<Obra[]> {
  const q = query(collection(db, COL), orderBy("criadoEm", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Obra));
}

export async function getObra(id: string): Promise<Obra | null> {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Obra;
}

export async function createObra(data: ObraFormData, role: UserRole): Promise<string> {
  assertPermission(role, "create");
  const now = Timestamp.now().toDate().toISOString();
  const ref = await addDoc(collection(db, COL), { ...data, pavimentos: [], anexos: [], criadoEm: now, atualizadoEm: now });
  return ref.id;
}

export async function updateObra(id: string, data: Partial<Obra>, role: UserRole): Promise<void> {
  assertPermission(role, "edit");
  await updateDoc(doc(db, COL, id), { ...data, atualizadoEm: Timestamp.now().toDate().toISOString() });
}

export async function deleteObra(id: string, role: UserRole): Promise<void> {
  assertPermission(role, "delete");
  await deleteDoc(doc(db, COL, id));
}

// ── Pavimentos ─────────────────────────────────────────────────
export async function addPavimento(obraId: string, name: string, pavimentos: Pavimento[], role: UserRole): Promise<void> {
  assertPermission(role, "create");
  const novo: Pavimento = { id: crypto.randomUUID(), name, apts: [] };
  await updateDoc(doc(db, COL, obraId), {
    pavimentos: [...pavimentos, novo],
    atualizadoEm: Timestamp.now().toDate().toISOString(),
  });
}

export async function renamePavimento(obraId: string, pavimentos: Pavimento[], pavId: string, name: string, role: UserRole): Promise<void> {
  assertPermission(role, "edit");
  const updated = pavimentos.map(p => p.id === pavId ? { ...p, name } : p);
  await updateDoc(doc(db, COL, obraId), { pavimentos: updated, atualizadoEm: Timestamp.now().toDate().toISOString() });
}

export async function deletePavimento(obraId: string, pavimentos: Pavimento[], pavId: string, role: UserRole): Promise<void> {
  assertPermission(role, "delete");
  await updateDoc(doc(db, COL, obraId), {
    pavimentos: pavimentos.filter(p => p.id !== pavId),
    atualizadoEm: Timestamp.now().toDate().toISOString(),
  });
}

// ── Apartamentos ───────────────────────────────────────────────
export async function addApartamento(obraId: string, pavimentos: Pavimento[], pavId: string, name: string, role: UserRole): Promise<void> {
  assertPermission(role, "create");
  const novo: Apartamento = { id: crypto.randomUUID(), name, status: "pendente", classification: "normal" };
  const updated = pavimentos.map(p => p.id === pavId ? { ...p, apts: [...p.apts, novo] } : p);
  await updateDoc(doc(db, COL, obraId), { pavimentos: updated, atualizadoEm: Timestamp.now().toDate().toISOString() });
}

export async function updateApartamento(obraId: string, pavimentos: Pavimento[], aptId: string, changes: Partial<Apartamento>): Promise<void> {
  // Vistorias podem ser feitas por qualquer user autenticado (sem assertPermission)
  const updated = pavimentos.map(p => ({ ...p, apts: p.apts.map(a => a.id === aptId ? { ...a, ...changes } : a) }));
  await updateDoc(doc(db, COL, obraId), { pavimentos: updated, atualizadoEm: Timestamp.now().toDate().toISOString() });
}

export async function deleteApartamento(obraId: string, pavimentos: Pavimento[], aptId: string, role: UserRole): Promise<void> {
  assertPermission(role, "delete");
  const updated = pavimentos.map(p => ({ ...p, apts: p.apts.filter(a => a.id !== aptId) }));
  await updateDoc(doc(db, COL, obraId), { pavimentos: updated, atualizadoEm: Timestamp.now().toDate().toISOString() });
}

// ── Anexos ─────────────────────────────────────────────────────
export async function addAnexo(obraId: string, anexos: { id: string; name: string }[], name: string, role: UserRole): Promise<void> {
  assertPermission(role, "create");
  await updateDoc(doc(db, COL, obraId), {
    anexos: [...anexos, { id: crypto.randomUUID(), name }],
    atualizadoEm: Timestamp.now().toDate().toISOString(),
  });
}

export async function deleteAnexo(obraId: string, anexos: { id: string; name: string }[], anexoId: string, role: UserRole): Promise<void> {
  assertPermission(role, "delete");
  await updateDoc(doc(db, COL, obraId), {
    anexos: anexos.filter(a => a.id !== anexoId),
    atualizadoEm: Timestamp.now().toDate().toISOString(),
  });
}
