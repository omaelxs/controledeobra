"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getLogs } from "@/services/logs.service";
import { LogDoc } from "@/types/log";
import PageTransition from "@/components/PageTransition";
import { SkeletonCard } from "@/components/Skeleton";

const ACTION_COLOR: Record<string, string> = {
  login: "#63b3ed",
  logout: "rgba(255,255,255,.3)",
  create: "#22c55e",
  update: "#eab308",
  delete: "var(--red-accent)",
  pdf_generated: "#a78bfa",
};

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState<string>("");

  useEffect(() => {
    const filters: Parameters<typeof getLogs>[0] = { limitCount: 100 };
    if (filterAction) filters.action = filterAction as LogDoc["action"];
    getLogs(filters).then(l => { setLogs(l); setLoading(false); });
  }, [filterAction]);

  const actions = ["", "login", "logout", "create", "update", "delete", "pdf_generated"];

  return (
    <PageTransition>
      <div style={{ flex: 1, overflow: "auto", padding: 32 }} className="dot-grid">
        <div style={{ maxWidth: 750, margin: "0 auto" }}>
          <div style={{ marginBottom: 24 }}>
            <div className="section-label" style={{ marginBottom: 8 }}>ADMINISTRAÇÃO</div>
            <h1 style={{ fontSize: 22, fontWeight: 900 }}>Logs do Sistema</h1>
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
            {actions.map(a => (
              <button
                key={a}
                onClick={() => { setLoading(true); setFilterAction(a); }}
                style={{
                  padding: "5px 12px", fontSize: 8, fontWeight: 800,
                  letterSpacing: ".12em", textTransform: "uppercase",
                  background: filterAction === a ? "var(--red-accent)" : "var(--charcoal)",
                  border: `1.5px solid ${filterAction === a ? "var(--red-accent)" : "rgba(255,255,255,.08)"}`,
                  color: filterAction === a ? "#fff" : "rgba(255,255,255,.35)",
                  cursor: "pointer", fontFamily: "inherit",
                  boxShadow: filterAction === a ? "3px 3px 0 #000" : "none",
                }}
              >
                {a || "Todos"}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
            </div>
          ) : logs.length === 0 ? (
            <div className="card" style={{ padding: 32, textAlign: "center", color: "rgba(255,255,255,.25)", fontSize: 12 }}>
              Nenhum log encontrado
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {logs.map((log, i) => (
                <motion.div
                  key={log.id ?? i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15, delay: i * 0.015 }}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 16px",
                    background: i % 2 === 0 ? "var(--surface)" : "transparent",
                    borderLeft: `3px solid ${ACTION_COLOR[log.action] || "rgba(255,255,255,.1)"}`,
                  }}
                >
                  <span style={{
                    fontSize: 8, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase",
                    color: ACTION_COLOR[log.action] || "#fff",
                    width: 60, flexShrink: 0,
                  }}>
                    {log.action}
                  </span>
                  <span style={{
                    fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,.25)",
                    width: 70, flexShrink: 0, textTransform: "uppercase", letterSpacing: ".08em",
                  }}>
                    {log.target}
                  </span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,.6)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {log.details || "—"}
                  </span>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,.2)", flexShrink: 0 }}>
                    {log.userEmail?.split("@")[0]}
                  </span>
                  <span style={{ fontSize: 8, color: "rgba(255,255,255,.12)", flexShrink: 0, fontWeight: 600 }}>
                    {new Date(log.timestamp).toLocaleString("pt-BR")}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
