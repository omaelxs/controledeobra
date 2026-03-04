export interface LogDoc {
  id?: string;
  userId: string;
  userEmail: string;
  action: "login" | "logout" | "create" | "update" | "delete" | "pdf_generated" | "promote_admin";
  target: "obra" | "fvs" | "nc" | "responsavel" | "user" | "notification" | "session" | "pavimento" | "apartamento" | "anexo" | "checklist" | "vistoria";
  targetId?: string;
  targetEmail?: string;
  details?: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  hash?: string; // Hash SHA256 para validar integridade
  previousHash?: string; // Hash do log anterior (chain)
  immutable?: boolean; // Flag para garantir que é imutável
}
