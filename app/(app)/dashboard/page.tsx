"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useObras } from "@/hooks/useObras";
import { getFvs } from "@/services/fvs.service";
import { getNCs } from "@/services/nc.service";
import { getResponsaveis } from "@/services/responsaveis.service";
import { getRecentLogs } from "@/services/logs.service";
import { useOnlineUsers } from "@/hooks/useOnlineUsers";
import { LogDoc } from "@/types/log";
import PageTransition from "@/components/PageTransition";

const ACTION_COLOR: Record<string, string> = {
  login: "#63b3ed", logout: "rgba(255,255,255,.3)", create: "#22c55e",
  update: "#eab308", delete: "var(--red-accent)", pdf_generated: "#a78bfa",
};

export default function DashboardPage() {
  const { obras } = useObras();
  const { onlineCount } = useOnlineUsers();
  const [fvsCount, setFvsCount]       = useState(0);
  const [ncCount, setNcCount]         = useState(0);
  const [rtCount, setRtCount]         = useState(0);
  const [fvsAndamento, setFvsAndamento] = useState(0);
  const [logs, setLogs]               = useState<LogDoc[]>([]);

  useEffect(() => {
    getFvs().then(f => { setFvsCount(f.length); setFvsAndamento(f.filter(x => x.status === "andamento").length); });
    getNCs().then(n => setNcCount(n.filter(x => x.status === "open").length));
    getResponsaveis().then(r => setRtCount(r.length));
    getRecentLogs(10).then(setLogs);
  }, []);

  const stats = [
    { label: "Obras Ativas",  value: obras.length, note: "Cadastradas no sistema",       crit: false },
    { label: "Fichas FVS",    value: fvsCount,      note: `${fvsAndamento} em andamento`, crit: false },
    { label: "NCs Abertas",   value: ncCount,       note: "Pendentes de resolução",      crit: ncCount > 0 },
    { label: "Online Agora",  value: onlineCount,   note: "Usuários conectados",          crit: false },
  ];

  return (
    <PageTransition>
      <div style={{ flex: 1, overflowY: "auto", padding: "36px 40px 48px" }} className="dot-grid">
        <div style={{ marginBottom: 32 }}>
          <div className="section-label" style={{ marginBottom: 6 }}>VISÃO GERAL</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-.02em" }}>Painel Geral</h1>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.35)", marginTop: 4 }}>Monitoramento centralizado de obras, qualidade e equipe</div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              className="card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              style={{
                padding: "22px 20px",
                borderColor: s.crit ? "rgba(164,22,26,.45)" : undefined,
              }}
            >
              <div className="section-label" style={{ marginBottom: 10 }}>{s.label}</div>
              <div style={{ fontSize: 42, fontWeight: 900, letterSpacing: "-.03em", lineHeight: 1, color: s.crit ? "var(--red-accent)" : "var(--white)" }}>{s.value}</div>
              <div className="stat-bar" style={{ marginTop: 12 }}>
                <div className="stat-bar-fill" style={{ width: `${Math.min(s.value * 10, 100)}%` }} />
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.25)", marginTop: 8 }}>{s.note}</div>
            </motion.div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Obras */}
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
            style={{ padding: "22px 20px" }}
          >
            <div className="section-label" style={{ marginBottom: 16 }}>OBRAS EM ANDAMENTO</div>
            {obras.length === 0 ? (
              <div style={{ textAlign: "center", padding: 24, color: "rgba(255,255,255,.2)", fontSize: 11 }}>Nenhuma obra cadastrada</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {obras.slice(0, 5).map(o => (
                  <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{o.name}</div>
                      <div className="stat-bar"><div className="stat-bar-fill" style={{ width: `${o.progress ?? 0}%` }} /></div>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,.4)", minWidth: 32, textAlign: "right" }}>{o.progress ?? 0}%</div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Activity */}
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            style={{ padding: "22px 20px" }}
          >
            <div className="section-label" style={{ marginBottom: 16 }}>ATIVIDADE RECENTE</div>
            {logs.length === 0 ? (
              <div style={{ textAlign: "center", padding: 24, color: "rgba(255,255,255,.2)", fontSize: 11 }}>Nenhuma atividade registrada</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {logs.map((log, i) => (
                  <motion.div
                    key={log.id ?? i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15, delay: i * 0.03 }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "6px 10px",
                      borderLeft: `3px solid ${ACTION_COLOR[log.action] || "rgba(255,255,255,.1)"}`,
                      background: i % 2 === 0 ? "rgba(255,255,255,.02)" : "transparent",
                    }}
                  >
                    <span style={{
                      fontSize: 7, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase",
                      color: ACTION_COLOR[log.action] || "rgba(255,255,255,.3)",
                      width: 45, flexShrink: 0,
                    }}>
                      {log.action}
                    </span>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,.5)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {log.details || log.target}
                    </span>
                    <span style={{ fontSize: 7, color: "rgba(255,255,255,.15)", flexShrink: 0 }}>
                      {log.userEmail?.split("@")[0]}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
