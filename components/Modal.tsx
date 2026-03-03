"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
}

export default function Modal({ open, title, onClose, children, width = 520 }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,.88)", zIndex: 999,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
          }}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: [0.175, 0.885, 0.32, 1.275] }}
            style={{
              background: "var(--surface)", border: "2px solid var(--border-hard)",
              borderRadius: 8, boxShadow: "8px 8px 0 #000", padding: "30px 28px",
              width, maxHeight: "90vh", overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-.01em" }}>{title}</div>
              <button onClick={onClose} style={{
                width: 28, height: 28, background: "var(--charcoal)",
                border: "1.5px solid rgba(255,255,255,.1)", borderRadius: 4,
                color: "rgba(255,255,255,.5)", cursor: "pointer", fontSize: 12,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "2px 2px 0 #000",
              }}>✕</button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
