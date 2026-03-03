"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useToast, ToastType } from "@/context/ToastContext";

const COLORS: Record<ToastType, { bg: string; border: string; color: string }> = {
  success: { bg: "rgba(34,197,94,.12)", border: "rgba(34,197,94,.35)", color: "#22c55e" },
  error:   { bg: "rgba(164,22,26,.15)", border: "rgba(164,22,26,.4)", color: "var(--red-accent)" },
  warning: { bg: "rgba(234,179,8,.12)", border: "rgba(234,179,8,.35)", color: "#eab308" },
  info:    { bg: "rgba(99,179,237,.1)", border: "rgba(99,179,237,.3)", color: "#63b3ed" },
};

const ICONS: Record<ToastType, string> = {
  success: "✓",
  error: "✕",
  warning: "!",
  info: "i",
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      display: "flex", flexDirection: "column", gap: 8,
      pointerEvents: "none",
    }}>
      <AnimatePresence>
        {toasts.map(t => {
          const c = COLORS[t.type];
          return (
            <motion.div
              key={t.id}
              initial={{ x: 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 60, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.175, 0.885, 0.32, 1.275] }}
              onClick={() => removeToast(t.id)}
              style={{
                pointerEvents: "auto",
                background: "var(--surface)", border: `2px solid ${c.border}`,
                borderLeft: `4px solid ${c.color}`,
                borderRadius: 6, boxShadow: "4px 4px 0 #000",
                padding: "10px 16px", display: "flex", alignItems: "center", gap: 10,
                cursor: "pointer", minWidth: 260,
              }}
            >
              <div style={{
                width: 20, height: 20, borderRadius: 3,
                background: c.bg, border: `1px solid ${c.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 900, color: c.color, flexShrink: 0,
              }}>{ICONS[t.type]}</div>
              <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.85)" }}>{t.message}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
