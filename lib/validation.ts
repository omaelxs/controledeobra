import { z } from "zod";

// ── Sanitização ──
export function sanitize(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim();
}

// ── Schemas ──
export const obraSchema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(200).transform(sanitize),
  address: z.string().max(500).transform(sanitize).optional(),
  status: z.enum(["Planejamento", "Em andamento", "Concluída", "Paralisada"]),
  progress: z.number().min(0).max(100).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const fvsSchema = z.object({
  title: z.string().min(1, "Título obrigatório").max(300).transform(sanitize),
  obraId: z.string().min(1),
  responsible: z.string().max(200).transform(sanitize).optional(),
  description: z.string().max(2000).transform(sanitize).optional(),
});

export const ncSchema = z.object({
  title: z.string().min(1, "Título obrigatório").max(300).transform(sanitize),
  description: z.string().max(2000).transform(sanitize).optional(),
  severity: z.enum(["low", "medium", "high", "critical"]).optional(),
  obraId: z.string().optional(),
  responsible: z.string().max(200).transform(sanitize).optional(),
  deadline: z.string().optional(),
});

export const responsavelSchema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(200).transform(sanitize),
  role: z.string().max(100).transform(sanitize).optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().max(30).transform(sanitize).optional(),
});

export const chatMessageSchema = z.object({
  text: z.string().min(1, "Mensagem vazia").max(2000).transform(sanitize),
});

export const notificationSchema = z.object({
  title: z.string().min(1).max(200).transform(sanitize),
  message: z.string().min(1).max(1000).transform(sanitize),
  type: z.enum(["info", "warning", "success", "alert"]),
});

export const displayNameSchema = z.string().min(1).max(100).transform(sanitize);

// ── Upload validation ──
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `Arquivo muito grande. Máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB` };
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: "Tipo de arquivo não permitido. Use: JPEG, PNG, WebP ou GIF" };
  }
  // Check file extension matches MIME
  const ext = file.name.split(".").pop()?.toLowerCase();
  const validExts = ["jpg", "jpeg", "png", "webp", "gif"];
  if (!ext || !validExts.includes(ext)) {
    return { valid: false, error: "Extensão de arquivo inválida" };
  }
  return { valid: true };
}
