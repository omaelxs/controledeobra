import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy, Timestamp, where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Responsavel, ResponsavelFormData } from "@/types";
import { UserRole } from "@/types/user";
import { assertPermission } from "@/lib/permissions";
import { createLog } from "./logs.service";

const COL = "responsaveis";

/**
 * Obter todos responsáveis
 */
export async function getResponsaveis(): Promise<Responsavel[]> {
  const q = query(collection(db, COL), orderBy("criadoEm", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Responsavel));
}

/**
 * Obter responsáveis por cargo
 */
export async function getResponsaveisByCargo(cargo: string): Promise<Responsavel[]> {
  const q = query(
    collection(db, COL),
    where("cargo", "==", cargo),
    orderBy("criadoEm", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Responsavel));
}

/**
 * Obter responsável por ID
 */
export async function getResponsavel(id: string): Promise<Responsavel | null> {
  const q = query(collection(db, COL), where("__name__", "==", id));
  const snap = await getDocs(q);
  return snap.docs[0] ? ({ id: snap.docs[0].id, ...snap.docs[0].data() } as Responsavel) : null;
}

/**
 * Criar responsável técnico com logging
 */
export async function createResponsavel(
  data: ResponsavelFormData,
  role: UserRole,
  userId: string,
  userEmail: string
): Promise<string> {
  assertPermission(role, "create");
  const now = Timestamp.now().toDate().toISOString();
  const ref = await addDoc(collection(db, COL), { ...data, criadoEm: now });

  // Log
  await createLog({
    userId,
    userEmail,
    action: "create",
    target: "responsavel",
    targetId: ref.id,
    details: `Responsável técnico criado: ${data.nome || "sem nome"} (${data.cargo || "sem cargo"})`,
  });

  return ref.id;
}

/**
 * Atualizar responsável com logging
 */
export async function updateResponsavel(
  id: string,
  data: Partial<Responsavel>,
  role: UserRole,
  userId: string,
  userEmail: string
): Promise<void> {
  assertPermission(role, "edit");
  await updateDoc(doc(db, COL, id), data);

  // Log
  await createLog({
    userId,
    userEmail,
    action: "update",
    target: "responsavel",
    targetId: id,
    details: `Responsável técnico atualizado: ${data.nome || "sem nome"}`,
  });
}

/**
 * Deletar responsável com logging
 */
export async function deleteResponsavel(
  id: string,
  role: UserRole,
  userId: string,
  userEmail: string
): Promise<void> {
  assertPermission(role, "delete");

  // Buscar dados antes de deletar para log
  const responsavel = await getResponsavel(id);

  await deleteDoc(doc(db, COL, id));

  // Log
  await createLog({
    userId,
    userEmail,
    action: "delete",
    target: "responsavel",
    targetId: id,
    details: `Responsável técnico deletado: ${responsavel?.nome || "sem nome"}`,
  });
}
