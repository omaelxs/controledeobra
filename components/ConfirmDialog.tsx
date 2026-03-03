"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open, title, message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "danger",
  onConfirm, onCancel,
}: ConfirmDialogProps) {
  const isDanger = variant === "danger";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", zIndex: 9998,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15, ease: [0.175, 0.885, 0.32, 1.275] }}
            style={{
              background: "var(--surface)", border: `2px solid ${isDanger ? "rgba(164,22,26,.5)" : "var(--border-hard)"}`,
              borderRadius: 8, boxShadow: "8px 8px 0 #000", padding: "28px 26px",
              width: 380,
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 10 }}>{title}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.6)", lineHeight: 1.6, marginBottom: 22 }}>{message}</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={onCancel} className="btn-ghost">{cancelLabel}</button>
              <button onClick={onConfirm} style={{
                padding: "10px 20px", fontSize: 10, fontWeight: 800,
                letterSpacing: ".12em", textTransform: "uppercase",
                background: isDanger ? "var(--red-accent)" : "var(--charcoal)",
                color: "#fff", border: "2px solid #000", borderRadius: 6,
                boxShadow: "4px 4px 0 #000", cursor: "pointer", fontFamily: "inherit",
                transition: "transform .1s, box-shadow .1s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translate(4px,4px)"; e.currentTarget.style.boxShadow = "none"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "4px 4px 0 #000"; }}
              >{confirmLabel}</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
