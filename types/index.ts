// ── Obras ──────────────────────────────────────────────────────
export type ObraStatus = "Planejamento" | "Em Execução" | "Paralisada" | "Concluída";

export interface Apartamento {
  id: string;
  name: string;
  status: "pendente" | "aprovado" | "reprovado";
  classification: "normal" | "urgente";
  dataVistoria?: string;
  responsavelVistoria?: string;
}

export interface Pavimento {
  id: string;
  name: string;
  apts: Apartamento[];
}

export interface Obra {
  id?: string;
  name: string;
  address: string;
  rtId?: string;
  rtName?: string;
  status: ObraStatus;
  progress: number;
  pavimentos: Pavimento[];
  anexos: { id: string; name: string }[];
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface ObraFormData {
  name: string;
  address: string;
  rtId?: string;
  rtName?: string;
  status: ObraStatus;
  progress: number;
}

// ── FVS ────────────────────────────────────────────────────────
export type FvsStatus = "andamento" | "aprovado" | "reprovado";

export interface FvsItem {
  text: string;
  checked: boolean;
}

export interface Fvs {
  id?: string;
  code: string;
  title: string;
  obraId?: string;
  category: string;
  status: FvsStatus;
  items: FvsItem[];
  criterio?: string;
  criadoEm?: string;
}

export interface FvsFormData {
  code: string;
  title: string;
  obraId?: string;
  category: string;
  criterio?: string;
  items: FvsItem[];
}

// ── NC ─────────────────────────────────────────────────────────
export type NcSeverity = "crítica" | "alta" | "média" | "baixa";
export type NcStatus   = "open" | "closed";

export interface NC {
  id?: string;
  ncId: string;
  title: string;
  obraId?: string;
  location: string;
  desc: string;
  severity: NcSeverity;
  status: NcStatus;
  date: string;
  deadline: string;
  overdue: boolean;
  criadoEm?: string;
}

export interface NCFormData {
  title: string;
  obraId?: string;
  location: string;
  desc: string;
  severity: NcSeverity;
  deadline: string;
}

// ── Responsáveis ────────────────────────────────────────────────
export type RtTipo = "rt" | "eng" | "mestre" | "arquiteto" | "fiscal" | "outro";

export const CARGO_LABELS: Record<RtTipo, string> = {
  rt: "Responsável Técnico",
  eng: "Engenheiro",
  mestre: "Mestre de Obra",
  arquiteto: "Arquiteto",
  fiscal: "Fiscal",
  outro: "Outro",
};

export interface Responsavel {
  id?: string;
  nome: string;
  cargo: RtTipo;
  crea?: string;
  tel?: string;
  email?: string;
  isMe?: boolean;
  criadoEm?: string;
}

export interface ResponsavelFormData {
  nome: string;
  cargo: RtTipo;
  crea?: string;
  tel?: string;
  email?: string;
}

// ── Reprovação ──────────────────────────────────────────────────
export interface RepItem {
  id: string;
  problema: string;
  descricao: string;
  obs: string;
  status: "pendente" | "corrigido";
  fotos: string[];
}

export interface Reprovacao {
  aptId: string;
  cliente: string;
  dataPrevista: string;
  statusRevistoria: "confirmada" | "nao_confirmada";
  itens: RepItem[];
}
