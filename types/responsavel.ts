export interface Responsavel {
  id?: string;
  nome: string;
  cargo: "rt" | "engenheiro" | "mestre" | "arquiteto" | "fiscal" | "outro";
  crea?: string;
  telefone?: string;
  email?: string;
  userId?: string; // Link a usuário do sistema (opcional)
  createdAt?: string;
  createdBy?: string;
}

export const CARGO_LABELS = {
  rt: "Responsável Técnico",
  engenheiro: "Engenheiro",
  mestre: "Mestre de Obra",
  arquiteto: "Arquiteto",
  fiscal: "Fiscal",
  outro: "Outro",
};
