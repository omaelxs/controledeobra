import {
  collection, addDoc, query, orderBy, limit, onSnapshot, Timestamp, where, getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { ChatMessage } from "@/types/chat";
import { createLog } from "./logs.service";

/**
 * Listener em tempo real para mensagens de chat
 */
export function onMessages(
  collectionName: string,
  callback: (msgs: ChatMessage[]) => void,
  limitCount: number = 100
) {
  const q = query(
    collection(db, collectionName),
    orderBy("timestamp", "asc"),
    limit(limitCount)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage)));
  });
}

/**
 * Enviar mensagem de chat com logging
 */
export async function sendMessage(
  collectionName: string,
  data: Omit<ChatMessage, "id" | "timestamp">
): Promise<void> {
  await addDoc(collection(db, collectionName), {
    ...data,
    timestamp: Timestamp.now().toDate().toISOString(),
  });

  // Log
  await createLog({
    userId: data.userId,
    userEmail: data.userEmail,
    action: "create",
    target: "session",
    details: `Mensagem enviada em ${collectionName}`,
  });
}

/**
 * Obter mensagens recentes
 */
export async function getRecentMessages(
  collectionName: string,
  limitCount: number = 50
): Promise<ChatMessage[]> {
  const q = query(
    collection(db, collectionName),
    orderBy("timestamp", "desc"),
    limit(limitCount)
  );

  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as ChatMessage))
    .reverse();
}

/**
 * Obter usuários online
 */
export async function getOnlineUsers(): Promise<
  { uid: string; displayName: string; photoURL?: string | null; lastSeen: string }[]
> {
  const q = query(
    collection(db, "users"),
    where("online", "==", true),
    orderBy("displayName", "asc")
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      uid: d.id,
      displayName: data.displayName || "Usuário",
      photoURL: data.photoURL,
      lastSeen: data.lastSeen || new Date().toISOString(),
    };
  });
}

/**
 * Listener em tempo real para usuários online
 */
export function onOnlineUsersUpdate(
  callback: (users: { uid: string; displayName: string; photoURL?: string | null; lastSeen: string }[]) => void
) {
  const q = query(
    collection(db, "users"),
    where("online", "==", true),
    orderBy("displayName", "asc")
  );

  return onSnapshot(q, (snap) => {
    const users = snap.docs.map((d) => {
      const data = d.data();
      return {
        uid: d.id,
        displayName: data.displayName || "Usuário",
        photoURL: data.photoURL,
        lastSeen: data.lastSeen || new Date().toISOString(),
      };
    });
    callback(users);
  });
}
