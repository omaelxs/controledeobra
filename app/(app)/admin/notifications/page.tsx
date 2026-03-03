"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { createNotification } from "@/services/notifications.service";
import { createLog } from "@/services/logs.service";
import { useNotifications } from "@/hooks/useNotifications";
import PageTransition from "@/components/PageTransition";

const TYPES = [
  { value: "info", label: "Info", color: "#63b3ed" },
  { value: "warning", label: "Aviso", color: "#eab308" },
  { value: "success", label: "Sucesso", color: "#22c55e" },
  { value: "alert", label: "Alerta", color: "var(--red-accent)" },
] as const;

export default function AdminNotificationsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { notifications } = useNotifications(50);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"info" | "warning" | "success" | "alert">("info");
  const [sending, setSending] = useState(false);

  async function handleSend() {
    if (!title.trim() || !message.trim() || !user) return;
    setSending(true);
    try {
      await createNotification({
        title: title.trim(),
        message: message.trim(),
        type,
        createdBy: user.uid,
        createdByEmail: user.email ?? "",
      });
      await createLog({
        userId: user.uid,
        userEmail: user.email ?? "",
        action: "create",
        target: "notification",
        details: `Notificação: ${title.trim()}`,
      });
      addToast("Notificação enviada!", "success");
      setTitle("");
      setMessage("");
      setType("info");
    } catch {
      addToast("Erro ao enviar notificação.", "error");
    } finally {
      setSending(false);
    }
  }

  return (
    <PageTransition>
      <div style={{ flex: 1, overflow: "auto", padding: 32 }} className="dot-grid">
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ marginBottom: 32 }}>
            <div className="section-label" style={{ marginBottom: 8 }}>ADMINISTRAÇÃO</div>
            <h1 style={{ fontSize: 22, fontWeight: 900 }}>Notificações Globais</h1>
          </div>

          {/* Create form */}
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ padding: "24px 22px", marginBottom: 24 }}
          >
            <div className="section-label" style={{ marginBottom: 16 }}>NOVA NOTIFICAÇÃO</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="form-label">Título</label>
                <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Título da notificação" />
              </div>
              <div>
                <label className="form-label">Mensagem</label>
                <textarea className="form-textarea" value={message} onChange={e => setMessage(e.target.value)} placeholder="Conteúdo da mensagem..." />
              </div>
              <div>
                <label className="form-label">Tipo</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {TYPES.map(t => (
                    <button
                      key={t.value}
                      onClick={() => setType(t.value)}
                      style={{
                        padding: "6px 14px", fontSize: 9, fontWeight: 800,
                        letterSpacing: ".1em", textTransform: "uppercase",
                        background: type === t.value ? `${t.color}20` : "var(--charcoal)",
                        border: `1.5px solid ${type === t.value ? t.color : "rgba(255,255,255,.08)"}`,
                        color: type === t.value ? t.color : "rgba(255,255,255,.35)",
                        cursor: "pointer", fontFamily: "inherit",
                        boxShadow: type === t.value ? `3px 3px 0 #000` : "none",
                        transition: "all .1s",
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <button className="btn-primary" onClick={handleSend} disabled={sending} style={{ alignSelf: "flex-end" }}>
                {sending ? "Enviando..." : "Enviar Notificação"}
              </button>
            </div>
          </motion.div>

          {/* History */}
          <div className="section-label" style={{ marginBottom: 12 }}>HISTÓRICO</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {notifications.map((n, i) => (
              <motion.div
                key={n.id}
                className="card"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
                style={{ padding: "12px 16px" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span className={`pill pill-${n.type === "alert" ? "red" : n.type === "warning" ? "yellow" : n.type === "success" ? "green" : "blue"}`}>
                    {n.type.toUpperCase()}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{n.title}</span>
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", lineHeight: 1.4 }}>{n.message}</div>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,.15)", marginTop: 6, fontWeight: 600 }}>
                  {new Date(n.createdAt).toLocaleString("pt-BR")} · {n.createdByEmail} · {n.readBy.length} leram
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
