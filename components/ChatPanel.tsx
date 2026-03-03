"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useUserContext } from "@/context/UserContext";
import { ChatMessage } from "@/types/chat";
import { onMessages, sendMessage } from "@/services/chat.service";
import { chatLimiter } from "@/lib/rateLimit";

export default function ChatPanel({ collectionName }: { collectionName: string }) {
  const { user } = useAuth();
  const { userDoc } = useUserContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !userDoc) return;
    try {
      const unsub = onMessages(collectionName, (msgs) => {
        setMessages(msgs);
        setError(null);
      });
      return unsub;
    } catch (e) {
      console.error("Erro ao carregar mensagens:", e);
      setError("Erro ao carregar mensagens");
    }
  }, [collectionName, user, userDoc]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSend() {
    if (!text.trim() || !user || !userDoc || sending) return;
    if (!chatLimiter.canProceed()) return;
    setSending(true);
    try {
      await sendMessage(collectionName, {
        userId: user.uid,
        userEmail: user.email ?? "",
        displayName: userDoc.displayName,
        photoURL: userDoc.photoURL,
        text: text.trim(),
      });
      setText("");
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {error && (
        <div style={{
          padding: "12px 16px",
          background: "rgba(164,22,26,.12)",
          border: "2px solid var(--red-accent)",
          color: "var(--red-accent)",
          fontSize: 11,
          fontWeight: 600,
        }}>
          {error}
        </div>
      )}

      {/* Messages */}
      <div ref={containerRef} style={{ flex: 1, overflow: "auto", padding: "16px 20px" }}>
        {!user || !userDoc ? (
          <div style={{ textAlign: "center", color: "rgba(255,255,255,.2)", fontSize: 11, marginTop: 60 }}>
            Carregando contexto...
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: "center", color: "rgba(255,255,255,.2)", fontSize: 11, marginTop: 60 }}>
            Nenhuma mensagem ainda. Comece a conversa!
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.userId === user?.uid;
            return (
              <motion.div
                key={msg.id ?? i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                style={{
                  display: "flex", gap: 10, marginBottom: 12,
                  flexDirection: isMe ? "row-reverse" : "row",
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 28, height: 28, flexShrink: 0,
                  background: msg.photoURL ? "transparent" : "var(--raised)",
                  border: "1.5px solid #000", boxShadow: "2px 2px 0 #000",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, fontWeight: 900, color: "rgba(255,255,255,.5)",
                  overflow: "hidden",
                }}>
                  {msg.photoURL ? (
                    <img src={msg.photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : msg.displayName.slice(0, 2).toUpperCase()}
                </div>

                {/* Bubble */}
                <div style={{ maxWidth: "70%" }}>
                  <div style={{
                    fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,.25)",
                    marginBottom: 3, textAlign: isMe ? "right" : "left",
                    letterSpacing: ".08em", textTransform: "uppercase",
                  }}>
                    {msg.displayName}
                  </div>
                  <div style={{
                    padding: "8px 14px",
                    background: isMe ? "var(--red)" : "var(--charcoal)",
                    border: `1.5px solid ${isMe ? "rgba(229,56,59,.3)" : "rgba(255,255,255,.06)"}`,
                    boxShadow: "3px 3px 0 #000",
                    fontSize: 12, color: "rgba(255,255,255,.85)", lineHeight: 1.5,
                    wordBreak: "break-word",
                  }}>
                    {msg.text}
                  </div>
                  <div style={{
                    fontSize: 7, color: "rgba(255,255,255,.12)", marginTop: 3,
                    textAlign: isMe ? "right" : "left", fontWeight: 600,
                  }}>
                    {new Date(msg.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: "12px 16px",
        borderTop: "2px solid #000",
        background: "var(--surface)",
        display: "flex", gap: 10,
      }}>
        <input
          className="form-input"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua mensagem..."
          style={{ flex: 1 }}
        />
        <button
          className="btn-primary"
          onClick={handleSend}
          disabled={sending || !text.trim()}
          style={{ padding: "10px 18px" }}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
