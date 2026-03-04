/**
 * Validação de Upload de Arquivos (Backend)
 * Previne ataques: file bomb, MIME type spoofing, oversized uploads
 */

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// MIME types permitidos por tipo de arquivo
const ALLOWED_MIME_TYPES = {
  image: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  document: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
};

interface FileValidationOptions {
  maxSize?: number;
  allowedMimeTypes?: string[];
  filename?: string;
}

interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validar arquivo por size e MIME type
 */
export function validateFileUpload(
  buffer: Buffer,
  mimeType: string,
  options: FileValidationOptions = {}
): FileValidationResult {
  const { maxSize = MAX_FILE_SIZE, allowedMimeTypes = ALLOWED_MIME_TYPES.image, filename = "" } = options;

  // 1. Validar tamanho
  if (buffer.length > maxSize) {
    return {
      valid: false,
      error: `Arquivo muito grande. Máximo: ${maxSize / 1024 / 1024}MB`,
    };
  }

  // 2. Validar MIME type
  if (!mimeType || !allowedMimeTypes.includes(mimeType)) {
    return {
      valid: false,
      error: `Tipo de arquivo não permitido: ${mimeType}. Permitidos: ${allowedMimeTypes.join(", ")}`,
    };
  }

  // 3. Validar extensão do filename
  if (filename) {
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    const mimeToExt: Record<string, string[]> = {
      "image/jpeg": ["jpg", "jpeg"],
      "image/png": ["png"],
      "image/webp": ["webp"],
      "image/gif": ["gif"],
      "application/pdf": ["pdf"],
    };

    const validExts = mimeToExt[mimeType] || [];
    if (validExts.length > 0 && !validExts.includes(ext)) {
      return {
        valid: false,
        error: `Extensão do arquivo não corresponde ao tipo MIME`,
      };
    }
  }

  // 4. Validar assinatura mágica do arquivo (primeiros bytes)
  const magic = validateFileMagicBytes(buffer, mimeType);
  if (!magic) {
    return {
      valid: false,
      error: `Arquivo corrompido ou tipo MIME inválido`,
    };
  }

  return { valid: true };
}

/**
 * Validar assinatura mágica (primeiros bytes do arquivo)
 * Previne contrabando de tipo de arquivo
 */
function validateFileMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 4) return false;

  const signatures: Record<string, Buffer[]> = {
    "image/jpeg": [Buffer.from([0xff, 0xd8, 0xff])],
    "image/png": [Buffer.from([0x89, 0x50, 0x4e, 0x47])],
    "image/webp": [Buffer.from([0x52, 0x49, 0x46, 0x46])], // RIFF
    "image/gif": [Buffer.from([0x47, 0x49, 0x46, 0x38])], // GIF8
    "application/pdf": [Buffer.from([0x25, 0x50, 0x44, 0x46])], // %PDF
  };

  const validSignatures = signatures[mimeType];
  if (!validSignatures) return true; // Não validado, permitir

  return validSignatures.some((sig) =>
    buffer.subarray(0, sig.length).equals(sig)
  );
}

/**
 * Sanitizar filename para evitar path traversal
 */
export function sanitizeFilename(filename: string): string {
  // Remover path separators
  const sanitized = filename
    .replace(/\.\./g, "")
    .replace(/[\/\\]/g, "_")
    .replace(/[<>:"|?*]/g, "_")
    .slice(0, 255); // limitou a 255 chars

  return sanitized || "file";
}

/**
 * Gerar nome único para arquivo
 */
export function generateUniqueFilename(originalFilename: string): string {
  const sanitized = sanitizeFilename(originalFilename);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = sanitized.split(".").pop() || "bin";

  return `${timestamp}_${random}_${sanitized}`;
}
