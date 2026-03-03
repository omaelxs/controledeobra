"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationPanel from "./NotificationPanel";

export default function NotificationBell() {
  const { notifications, unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          background: "none", border: "none", cursor: "pointer", padding: 4,
          color: "rgba(255,255,255,.4)", position: "relative",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" strokeLinecap="square"/>
        </svg>
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              position: "absolute", top: -2, right: -4,
              width: 16, height: 16, borderRadius: "50%",
              background: "var(--red-accent)", border: "2px solid #000",
              fontSize: 8, fontWeight: 900, color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: [0.175, 0.885, 0.32, 1.275] }}
            style={{
              position: "absolute", top: "calc(100% + 10px)", right: 0,
              width: 340, maxHeight: 420, zIndex: 999,
            }}
          >
            <NotificationPanel notifications={notifications} onClose={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
