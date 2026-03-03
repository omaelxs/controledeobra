"use client";

import { useAuth } from "@/context/AuthContext";
import { NotificationDoc } from "@/types/notification";
import { markAsRead, markAllAsRead } from "@/services/notifications.service";

const TYPE_COLOR: Record<string, string> = {
  info: "#63b3ed",
  warning: "#eab308",
  success: "#22c55e",
  alert: "var(--red-accent)",
};

export default function NotificationPanel({
  notifications,
  onClose,
}: {
  notifications: NotificationDoc[];
  onClose: () => void;
}) {
  const { user } = useAuth();
  const uid = user?.uid ?? "";

  function handleMarkAll() {
    markAllAsRead(notifications, uid);
  }

  return (
    <div style={{
      background: "var(--surface)", border: "2px solid var(--border-hard)",
      boxShadow: "8px 8px 0 #000", overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "12px 16px",
        borderBottom: "2px solid #000",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "var(--charcoal)",
      }}>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(255,255,255,.6)" }}>
          Notificações
        </span>
        <button
          onClick={handleMarkAll}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 8, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase",
            color: "var(--red-accent)", fontFamily: "inherit",
          }}
        >
          Marcar todas como lidas
        </button>
      </div>

      {/* List */}
      <div style={{ maxHeight: 340, overflowY: "auto" }}>
        {notifications.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "rgba(255,255,255,.25)", fontSize: 11 }}>
            Nenhuma notificação
          </div>
        ) : (
          notifications.map(n => {
            const isRead = n.readBy.includes(uid);
            return (
              <div
                key={n.id}
                onClick={() => { if (!isRead && n.id) markAsRead(n.id, uid); }}
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--border)",
                  cursor: isRead ? "default" : "pointer",
                  background: isRead ? "transparent" : "rgba(229,56,59,.04)",
                  transition: "background .1s",
                }}
              >
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  {!isRead && (
                    <div style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: TYPE_COLOR[n.type] || TYPE_COLOR.info,
                      marginTop: 5, flexShrink: 0,
                    }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 11, fontWeight: isRead ? 500 : 700,
                      color: isRead ? "rgba(255,255,255,.5)" : "rgba(255,255,255,.85)",
                    }}>
                      {n.title}
                    </div>
                    <div style={{
                      fontSize: 10, color: "rgba(255,255,255,.3)", marginTop: 3,
                      lineHeight: 1.4,
                    }}>
                      {n.message}
                    </div>
                    <div style={{ fontSize: 8, color: "rgba(255,255,255,.15)", marginTop: 4, fontWeight: 600 }}>
                      {new Date(n.createdAt).toLocaleString("pt-BR")}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
