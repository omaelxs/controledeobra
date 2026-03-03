"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/context/AuthContext";
import { NotificationDoc } from "@/types/notification";

export function useNotifications(limitCount: number = 30) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "notifications"),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    const unsub = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() } as NotificationDoc)));
      setLoading(false);
    });

    return unsub;
  }, [limitCount]);

  const unreadCount = user
    ? notifications.filter(n => !n.readBy.includes(user.uid)).length
    : 0;

  return { notifications, unreadCount, loading };
}
