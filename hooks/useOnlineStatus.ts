"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { setUserOnline } from "@/services/users.service";

export function useOnlineStatus() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    setUserOnline(user.uid, true);

    function handleVisChange() {
      if (!user) return;
      setUserOnline(user.uid, !document.hidden);
    }

    function handleBeforeUnload() {
      if (!user) return;
      navigator.sendBeacon?.("/api/noop");
      setUserOnline(user.uid, false);
    }

    document.addEventListener("visibilitychange", handleVisChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [user]);
}
