"use client";

import PageTransition from "@/components/PageTransition";
import ChatPanel from "@/components/ChatPanel";

export default function AdminChatPage() {
  return (
    <PageTransition>
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{
          padding: "16px 24px",
          borderBottom: "2px solid #000",
          background: "var(--surface)",
        }}>
          <div className="section-label" style={{ marginBottom: 4, color: "rgba(229,56,59,.35)" }}>ADMINISTRAÇÃO</div>
          <h1 style={{ fontSize: 18, fontWeight: 900 }}>Chat Moderadores</h1>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,.3)", marginTop: 2 }}>
            Apenas administradores e desenvolvedores.
          </p>
        </div>
        <ChatPanel collectionName="chat_moderators" />
      </div>
    </PageTransition>
  );
}
