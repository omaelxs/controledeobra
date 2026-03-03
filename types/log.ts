export interface LogDoc {
  id?: string;
  userId: string;
  userEmail: string;
  action: "login" | "logout" | "create" | "update" | "delete" | "pdf_generated";
  target: "obra" | "fvs" | "nc" | "responsavel" | "user" | "notification" | "session" | "pavimento" | "apartamento" | "anexo" | "checklist" | "vistoria";
  targetId?: string;
  details?: string;
  timestamp: string;
}
