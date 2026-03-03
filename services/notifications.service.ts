import {
  collection, addDoc, getDocs, updateDoc, doc, query, orderBy, limit,
  Timestamp, arrayUnion, type QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { NotificationDoc } from "@/types/notification";

const COL = "notifications";

export async function createNotification(
  data: Omit<NotificationDoc, "id" | "createdAt" | "readBy">
): Promise<void> {
  await addDoc(collection(db, COL), {
    ...data,
    createdAt: Timestamp.now().toDate().toISOString(),
    readBy: [],
  });
}

export async function getNotifications(limitCount: number = 30): Promise<NotificationDoc[]> {
  const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];
  if (limitCount) constraints.push(limit(limitCount));

  const q = query(collection(db, COL), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as NotificationDoc));
}

export async function markAsRead(notificationId: string, uid: string): Promise<void> {
  await updateDoc(doc(db, COL, notificationId), {
    readBy: arrayUnion(uid),
  });
}

export async function markAllAsRead(notifications: NotificationDoc[], uid: string): Promise<void> {
  const unread = notifications.filter(n => n.id && !n.readBy.includes(uid));
  await Promise.all(unread.map(n => markAsRead(n.id!, uid)));
}
