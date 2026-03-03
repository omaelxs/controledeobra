"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";

const CARDS = [
  {
    href: "/admin/users",
    title: "Usuários",
    desc: "Gerenciar roles e permissões",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z" strokeLinecap="square"/>
      </svg>
    ),
  },
  {
    href: "/admin/notifications",
    title: "Notificações",
    desc: "Enviar notificações globais",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" strokeLinecap="square"/>
      </svg>
    ),
  },
  {
    href: "/admin/logs",
    title: "Logs do Sistema",
    desc: "Rastrear ações dos usuários",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="square"/>
        <polyline points="14 2 14 8 20 8" strokeLinecap="square"/>
      </svg>
    ),
  },
];

export default function AdminPage() {
  return (
    <PageTransition>
      <div style={{ flex: 1, overflow: "auto", padding: 32 }} className="dot-grid">
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ marginBottom: 32 }}>
            <div className="section-label" style={{ marginBottom: 8 }}>ADMINISTRAÇÃO</div>
            <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-.01em" }}>Painel Admin</h1>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,.35)", marginTop: 6 }}>
              Gerencie usuários, permissões, notificações e logs do sistema.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {CARDS.map((card, i) => (
              <motion.div
                key={card.href}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
              >
                <Link href={card.href} style={{ textDecoration: "none", color: "inherit" }}>
                  <div className="card" style={{
                    padding: "24px 20px",
                    cursor: "pointer",
                    transition: "transform .1s, box-shadow .1s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translate(-2px,-2px)"; e.currentTarget.style.boxShadow = "8px 8px 0 #000"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "6px 6px 0px #000"; }}
                  >
                    <div style={{ color: "var(--red-accent)", marginBottom: 14 }}>{card.icon}</div>
                    <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>{card.title}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", lineHeight: 1.4 }}>{card.desc}</div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
