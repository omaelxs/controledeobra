import {
  collection, addDoc, query, orderBy, limit, onSnapshot, Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { ChatMessage } from "@/types/chat";

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

export async function sendMessage(
  collectionName: string,
  data: Omit<ChatMessage, "id" | "timestamp">
): Promise<void> {
  await addDoc(collection(db, collectionName), {
    ...data,
    timestamp: Timestamp.now().toDate().toISOString(),
  });
}
