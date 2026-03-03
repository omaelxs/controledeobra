"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/context/AuthContext";
import { UserDoc, UserRole } from "@/types/user";
import { createUserIfNotExists } from "@/services/users.service";

interface UserContextValue {
  userDoc: UserDoc | null;
  role: UserRole;
  loading: boolean;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setUserDoc(null);
      setLoading(false);
      return;
    }

    // Garante que o doc existe
    createUserIfNotExists(user.uid, user.email ?? "").then(() => {
      // Escuta mudanças em tempo real no doc do user
      const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
        if (snap.exists()) {
          setUserDoc(snap.data() as UserDoc);
        }
        setLoading(false);
      });
      return unsub;
    });
  }, [user]);

  const role: UserRole = userDoc?.role ?? "user";

  return (
    <UserContext.Provider value={{ userDoc, role, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUserContext must be used inside UserProvider");
  return ctx;
}
