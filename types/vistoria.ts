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

/**
 * Foto associada a um item do checklist
 */
export interface ChecklistItemPhoto {
  id: string;
  url: string; // URL do Firebase Storage
  uploadedAt: string; // ISO timestamp
  size: number; // Bytes
}

/**
 * Resultado de um item individual do checklist
 */
export interface ScopeItemResult {
  itemId: string;
  status: ScopeStatus;
  observation?: string; // Observações do item específico
  photos?: ChecklistItemPhoto[]; // Fotos do item
  createdAt?: string; // Quando foi marcado
}

/**
 * Resultado de um escopo inteiro
 */
export interface ScopeResult {
  scope: string;
  items: ScopeItemResult[];
  status: ScopeStatus;
}

/**
 * Documento principal de vistoria
 */
export interface VistoriaDoc {
  id?: string;
  obraId: string;
  pavimentoId: string;
  apartamentoId: string;
  scopes: Record<string, ScopeResult>;
  observation: string; // Observações gerais da vistoria
  status: "pendente" | "aprovado" | "reprovado";
  responsavelId?: string; // ID do responsável técnico
  dataVistoria: string; // YYYY-MM-DD
  createdBy: string; // UID do usuário
  createdAt: string; // ISO timestamp
  updatedAt?: string; // ISO timestamp
  approvedBy?: string; // UID de quem aprovou (se status = aprovado)
  approvedAt?: string; // ISO timestamp
}

