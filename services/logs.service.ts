import {
  collection, addDoc, getDocs, query, orderBy, where, limit, Timestamp,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { LogDoc } from "@/types/log";
import { generateLogHash, validateLogChain } from "@/lib/log-integrity";

const COL = "logs";

// Cache do último log para chain de hashes
let lastLogCache: { hash?: string; timestamp?: string } | null = null;

/**
 * Criar log com hash de integridade
 * Formato append-only: todo novo log tem hash e aponta para anterior
 */
export async function createLog(data: Omit<LogDoc, "id" | "timestamp" | "hash" | "previousHash" | "immutable">): Promise<void> {
  const now = new Date();
  const timestamp = Timestamp.now().toDate().toISOString();

  // Se cache está stale (>10 minutos), limpar
  if (lastLogCache?.timestamp) {
    const age = now.getTime() - new Date(lastLogCache.timestamp).getTime();
    if (age > 10 * 60 * 1000) {
      lastLogCache = null;
    }
  }

  const logData: LogDoc = {
    ...data,
    timestamp,
    previousHash: lastLogCache?.hash || "ROOT", // Aponta para anterior ou ROOT
    immutable: true, // Sempre imutável
  };

  // Gerar hash baseado no conteúdo
  logData.hash = generateLogHash(logData);

  // Adicionar ao Firestore
  await addDoc(collection(db, COL), logData);

  // Atualizar cache
  lastLogCache = {
    hash: logData.hash,
    timestamp: timestamp,
  };
}

/**
 * Obter logs com filtros
 */
export async function getLogs(filters?: {
  action?: LogDoc["action"];
  target?: LogDoc["target"];
  userId?: string;
  limitCount?: number;
}): Promise<LogDoc[]> {
  const constraints: QueryConstraint[] = [orderBy("timestamp", "desc")];

  if (filters?.action) constraints.push(where("action", "==", filters.action));
  if (filters?.target) constraints.push(where("target", "==", filters.target));
  if (filters?.userId) constraints.push(where("userId", "==", filters.userId));
  if (filters?.limitCount) constraints.push(limit(filters.limitCount));

  const q = query(collection(db, COL), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as LogDoc));
}

/**
 * Obter N logs mais recentes
 */
export async function getRecentLogs(count: number = 10): Promise<LogDoc[]> {
  const q = query(collection(db, COL), orderBy("timestamp", "desc"), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as LogDoc));
}

/**
 * Validar integridade da cadeia de logs
 * Admin pode usar para auditar se alguém tentou editar/deletar logs
 */
export async function validateLogIntegrityChain(count: number = 100): Promise<{
  valid: boolean;
  issues: string[];
  logsChecked: number;
}> {
  // Obter últimos N logs em ordem crescente
  const q = query(collection(db, COL), orderBy("timestamp", "asc"), limit(count));
  const snap = await getDocs(q);
  const logs = snap.docs.map(d => ({ id: d.id, ...d.data() } as LogDoc));

  const issues: string[] = [];

  // Validar cada log individualmente
  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];

    // Verificar se hash existe
    if (!log.hash) {
      issues.push(`Log ${i}: hash ausente`);
    }

    // Verificar se é imutável
    if (log.immutable !== true) {
      issues.push(`Log ${i}: flag immutable não está true`);
    }

    // Verificar previousHash
    if (i === 0 && log.previousHash !== "ROOT") {
      issues.push(`Log ${i}: primeiro log deve ter previousHash = ROOT`);
    } else if (i > 0 && log.previousHash !== logs[i - 1].hash) {
      issues.push(`Log ${i}: chain quebrada, previousHash não aponta para log anterior`);
    }
  }

  // Validar cadeia geral
  const chainValid = validateLogChain(logs);
  if (!chainValid && issues.length === 0) {
    issues.push("Cadeia de logs inválida");
  }

  return {
    valid: issues.length === 0,
    issues,
    logsChecked: logs.length,
  };
}
