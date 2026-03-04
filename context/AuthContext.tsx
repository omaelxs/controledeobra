"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { createUserIfNotExists, setUserOnline } from "@/services/users.service";
import { createLog } from "@/services/logs.service";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        setUser(firebaseUser);
        if (firebaseUser) {
          try {
            await createUserIfNotExists(firebaseUser.uid, firebaseUser.email ?? "");
            await setUserOnline(firebaseUser.uid, true);
          } catch (e) {
            console.error("Erro ao inicializar user doc:", e);
          }
        }
        setLoading(false);
      });
      return unsubscribe;
    } catch (e) {
      console.error("Erro ao conectar Firebase Auth:", e);
      setLoading(false);
    }
  }, []);

  // Marcar offline ao fechar aba
  useEffect(() => {
    function handleUnload() {
      if (user) {
        // sendBeacon para garantir que executa antes de fechar
        const payload = JSON.stringify({ uid: user.uid });
        navigator.sendBeacon?.("/api/offline", payload);
        // Fallback: tenta setar offline direto (pode não completar)
        setUserOnline(user.uid, false).catch(() => {});
      }
    }
    function handleVisibility() {
      if (!user) return;
      if (document.visibilityState === "hidden") {
        setUserOnline(user.uid, false).catch(() => {});
      } else {
        setUserOnline(user.uid, true).catch(() => {});
      }
    }

    window.addEventListener("beforeunload", handleUnload);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [user]);

  async function login(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    // Log de login (não bloqueia o login se falhar)
    try {
      await createLog({
        userId: cred.user.uid,
        userEmail: cred.user.email ?? "",
        action: "login",
        target: "session",
        details: "Login realizado",
      });
    } catch (e) {
      console.error("Erro ao registrar log de login:", e);
    }
  }

  async function logout() {
    try {
      if (user) {
        // Tenta marcar como offline, mas não esperamos
        setUserOnline(user.uid, false).catch(() => {});

        // Tenta registrar logout, mas não esperamos
        createLog({
          userId: user.uid,
          userEmail: user.email ?? "",
          action: "logout",
          target: "session",
          details: "Logout realizado",
        }).catch(() => {});
      }

      // Faz logout do Firebase imediatamente
      await signOut(auth);
    } catch (e) {
      console.error("Erro ao fazer logout:", e);
      // Mesmo com erro, força o logout do Firebase
      await signOut(auth).catch(() => {});
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
