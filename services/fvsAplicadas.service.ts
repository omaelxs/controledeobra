import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { FvsAplicada, FvsAplicadaItem, FvsAplicadaStatus, FvsModelo } from "@/types";

const COL = "fvsAplicadas";

export async function getFvsAplicadas(obraId: string): Promise<FvsAplicada[]> {
  const q = query(collection(db, COL), where("obraId", "==", obraId), orderBy("criadoEm", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as FvsAplicada));
}

export async function getFvsAplicadasByApt(obraId: string, pavimentoId: string, apartamentoId: string): Promise<FvsAplicada[]> {
  const q = query(
    collection(db, COL),
    where("obraId", "==", obraId),
    where("pavimentoId", "==", pavimentoId),
    where("apartamentoId", "==", apartamentoId),
    orderBy("criadoEm", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as FvsAplicada));
}

export async function applyModeloToApartamento(
  modelo: FvsModelo,
  obraId: string,
  pavimentoId: string,
  apartamentoId: string,
): Promise<string> {
  const itens: FvsAplicadaItem[] = modelo.itensVerificacao.map(texto => ({
    texto,
    conforme: null,
  }));

  const data: Omit<FvsAplicada, "id"> = {
    fvsModeloId: modelo.id!,
    modeloTitulo: modelo.titulo,
    modeloCodigo: modelo.codigo,
    obraId,
    pavimentoId,
    apartamentoId,
    status: "pendente",
    itens,
    criadoEm: Timestamp.now().toDate().toISOString(),
  };

  const ref = await addDoc(collection(db, COL), data);
  return ref.id;
}

export async function updateFvsAplicada(
  id: string,
  data: {
    itens?: FvsAplicadaItem[];
    status?: FvsAplicadaStatus;
    preenchidoPor?: string;
    aprovadoPor?: string;
    dataPreenchimento?: string;
  },
): Promise<void> {
  await updateDoc(doc(db, COL, id), data);
}

export async function deleteFvsAplicada(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}

export async function getFvsStats(obraId: string) {
  const todas = await getFvsAplicadas(obraId);
  const total = todas.length;
  const preenchidas = todas.filter(f => f.status !== "pendente").length;
  const aprovadas = todas.filter(f => f.status === "aprovada").length;
  const reprovadas = todas.filter(f => f.status === "reprovada").length;
  const pendentes = todas.filter(f => f.status === "pendente").length;

  return { total, preenchidas, aprovadas, reprovadas, pendentes };
}
