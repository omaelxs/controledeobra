import {
  collection, addDoc, getDocs, query, orderBy, where, limit, Timestamp,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { LogDoc } from "@/types/log";

const COL = "logs";

export async function createLog(data: Omit<LogDoc, "id" | "timestamp">): Promise<void> {
  await addDoc(collection(db, COL), {
    ...data,
    timestamp: Timestamp.now().toDate().toISOString(),
  });
}

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

export async function getRecentLogs(count: number = 10): Promise<LogDoc[]> {
  const q = query(collection(db, COL), orderBy("timestamp", "desc"), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as LogDoc));
}
