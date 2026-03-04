"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import { AdminCard } from "@/components/AdminCard";
import { getAllUsers } from "@/services/users.service";
import { getResponsaveis } from "@/services/responsaveis.service";
import { getRecentLogs } from "@/services/logs.service";
import { UserDoc } from "@/types/user";
import { Responsavel } from "@/types";
import { LogDoc } from "@/types/log";

const MENU_CARDS = [
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
    href: "/admin/responsaveis",
    title: "Responsáveis",
    desc: "Gerenciar técnicos e engenheiros",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
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
    href: "/admin/audit",
    title: "Auditoria",
    desc: "Validar integridade de logs",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
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
  {
    href: "/admin/settings",
    title: "Configurações",
    desc: "Configurar o sistema",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" strokeLinecap="square"/>
        <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24" strokeLinecap="square"/>
      </svg>
    ),
  },
];

export default function AdminPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    usersOnline: 0,
    totalResponsaveis: 0,
    recentLogs: [] as LogDoc[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      setLoading(true);
      const [users, responsaveis, logs] = await Promise.all([
        getAllUsers(),
        getResponsaveis(),
        getRecentLogs(5),
      ]);

      const usersOnline = users.filter((u) => u.online).length;

      setStats({
        totalUsers: users.length,
        usersOnline,
        totalResponsaveis: responsaveis.length,
        recentLogs: logs,
      });
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageTransition>
      <div style={{ flex: 1, overflow: "auto", padding: 32 }} className="dot-grid">
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Cabeçalho */}
          <div style={{ marginBottom: 32 }}>
            <div className="section-label" style={{ marginBottom: 8 }}>ADMINISTRAÇÃO</div>
            <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-.01em" }}>
              Painel de Controle
            </h1>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,.35)", marginTop: 6 }}>
              Bem-vindo ao painel de administração. Gerencie usuários, permissões, notificações e logs.
            </p>
          </div>

          {/* Estatísticas */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
            <AdminCard
              icon="👥"
              label="Total de Usuários"
              value={stats.totalUsers}
              subtext={`${stats.usersOnline} online agora`}
              status="neutral"
              loading={loading}
            />
            <AdminCard
              icon="🏗️"
              label="Responsáveis"
              value={stats.totalResponsaveis}
              subtext="Técnicos e engenheiros"
              status="success"
              loading={loading}
            />
            <AdminCard
              icon="📝"
              label="Últimas Ações"
              value={stats.recentLogs.length}
              subtext="Logs registrados"
              status="neutral"
              loading={loading}
            />
            <AdminCard
              icon="✅"
              label="Sistema"
              value="Online"
              subtext="Operacional"
              status="success"
              loading={loading}
            />
          </div>

          {/* Menu Principal */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,.7)" }}>
                NAVEGAÇÃO RÁPIDA
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
              {MENU_CARDS.map((card, i) => (
                <motion.div
                  key={card.href}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.08 }}
                >
                  <Link href={card.href} style={{ textDecoration: "none", color: "inherit" }}>
                    <div
                      className="card"
                      style={{
                        padding: "24px 20px",
                        cursor: "pointer",
                        transition: "transform .1s, box-shadow .1s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translate(-2px,-2px)";
                        e.currentTarget.style.boxShadow = "8px 8px 0 #000";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "none";
                        e.currentTarget.style.boxShadow = "6px 6px 0px #000";
                      }}
                    >
                      <div style={{ color: "var(--red-accent)", marginBottom: 14 }}>{card.icon}</div>
                      <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>{card.title}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", lineHeight: 1.4 }}>
                        {card.desc}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Últimas Ações */}
          {stats.recentLogs.length > 0 && (
            <div className="card" style={{ padding: 24 }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>
                📋 Últimas Ações do Sistema
              </h2>
              <div style={{ fontSize: 12 }}>
                {stats.recentLogs.map((log, i) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{
                      padding: 12,
                      borderBottom: i < stats.recentLogs.length - 1 ? "1px solid rgba(255,255,255,.1)" : "none",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ color: "rgba(255,255,255,.8)", marginBottom: 4 }}>
                        <span style={{ fontWeight: 600 }}>{log.userEmail.split("@")[0]}</span>
                        {" "}
                        <span style={{ color: "rgba(255,255,255,.5)" }}>
                          {log.action === "create" && "criou"}
                          {log.action === "update" && "atualizou"}
                          {log.action === "delete" && "deletou"}
                          {log.action === "login" && "fez login"}
                          {log.action === "logout" && "fez logout"}
                        </span>
                        {" "}
                        <span style={{ fontWeight: 600 }}>{log.target}</span>
                      </div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)" }}>
                        {new Date(log.timestamp).toLocaleDateString("pt-BR", {
                          weekday: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontSize: 10,
                        fontWeight: 600,
                        background: log.action === "delete" ? "rgba(239, 68, 68, 0.2)" : "rgba(59, 130, 246, 0.2)",
                        color: log.action === "delete" ? "#ef4444" : "#3b82f6",
                      }}
                    >
                      {log.action}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
