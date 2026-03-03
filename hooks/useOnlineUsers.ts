"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { UserDoc } from "@/types/user";

export function useOnlineUsers() {
  const [onlineUsers, setOnlineUsers] = useState<UserDoc[]>([]);

  useEffect(() => {
    const q = query(collection(db, "users"), where("online", "==", true));
    const unsub = onSnapshot(q, (snap) => {
      setOnlineUsers(snap.docs.map(d => d.data() as UserDoc));
    });
    return unsub;
  }, []);

  return { onlineUsers, onlineCount: onlineUsers.length };
}
