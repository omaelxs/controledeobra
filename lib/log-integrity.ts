/**
 * Utilitário para Hash de Integridade de Logs
 * Implementa cadeia de hashes (blockchain-like) para garantir append-only
 */

import crypto from "crypto";
import { LogDoc } from "@/types/log";

/**
 * Gerar hash SHA256 de um log
 */
export function generateLogHash(log: Partial<LogDoc>): string {
  // Criar objeto canônico (ordenado) para garantir hash consistente
  const canonical = JSON.stringify({
    userId: log.userId,
    userEmail: log.userEmail,
    action: log.action,
    target: log.target,
    targetId: log.targetId || "",
    targetEmail: log.targetEmail || "",
    details: log.details || "",
    timestamp: log.timestamp,
    ipAddress: log.ipAddress || "",
    userAgent: log.userAgent || "",
    previousHash: log.previousHash || "ROOT",
  });

  return crypto
    .createHash("sha256")
    .update(canonical)
    .digest("hex");
}

/**
 * Validar integridade de um log
 * Verifica se o hash do log corresponde ao esperado
 */
export function validateLogIntegrity(log: LogDoc): boolean {
  if (!log.hash) return false;

  const expectedHash = generateLogHash(log);
  return log.hash === expectedHash;
}

/**
 * Validar cadeia de logs
 * Verifica se cada log aponta para o anterior (chain)
 */
export function validateLogChain(logs: LogDoc[]): boolean {
  // Logs devem estar em ordem crescente de timestamp
  for (let i = 0; i < logs.length - 1; i++) {
    const current = logs[i];
    const next = logs[i + 1];

    // Cada log deve ter hash válido
    if (!validateLogIntegrity(current)) return false;

    // Se há log anterior, current deve apontar para ele
    if (i > 0 && current.previousHash !== logs[i - 1].hash) {
      return false;
    }
  }

  // Validar último
  if (logs.length > 0 && !validateLogIntegrity(logs[logs.length - 1])) {
    return false;
  }

  return true;
}

/**
 * Extrair IP da requisição (helper para backend)
 */
export function extractIpAddress(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");

  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  if (realIp) return realIp;

  return "unknown";
}

/**
 * Extrair User-Agent da requisição
 */
export function extractUserAgent(req: Request): string {
  return req.headers.get("user-agent") || "unknown";
}
