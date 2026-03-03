"use client";

import PageTransition from "@/components/PageTransition";
import ChatPanel from "@/components/ChatPanel";

export default function ChatPage() {
  return (
    <PageTransition>
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{
          padding: "16px 24px",
          borderBottom: "2px solid #000",
          background: "var(--surface)",
        }}>
          <div className="section-label" style={{ marginBottom: 4 }}>COMUNICAÇÃO</div>
          <h1 style={{ fontSize: 18, fontWeight: 900 }}>Chat Geral</h1>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,.3)", marginTop: 2 }}>
            Todos os membros da equipe podem participar.
          </p>
        </div>
        <ChatPanel collectionName="chat_general" />
      </div>
    </PageTransition>
  );
}
