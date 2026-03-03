export interface ChecklistItem {
  id: string;
  text: string;
}

export interface ChecklistTemplate {
  id?: string;
  scope: string;
  items: ChecklistItem[];
  createdBy: string;
  createdAt: string;
}

export type ScopeStatus = "conforme" | "atencao" | "nao_conforme" | "pendente";

export interface ScopeItemResult {
  itemId: string;
  status: ScopeStatus;
  observation?: string;
}

export interface ScopeResult {
  scope: string;
  items: ScopeItemResult[];
  status: ScopeStatus;
}

export interface VistoriaDoc {
  id?: string;
  obraId: string;
  pavimentoId: string;
  apartamentoId: string;
  scopes: Record<string, ScopeResult>;
  observation: string;
  status: "pendente" | "aprovado" | "reprovado";
  responsavelId?: string;
  dataVistoria: string;
  createdBy: string;
  createdAt: string;
}
