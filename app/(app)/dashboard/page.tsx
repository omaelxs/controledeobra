"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useObras } from "@/hooks/useObras";
import { useOnlineUsers } from "@/hooks/useOnlineUsers";
import { getFvsAplicadas } from "@/services/fvsAplicadas.service";
import { getVistorias } from "@/services/vistorias.service";
import { getNCs } from "@/services/nc.service";
import PageTransition from "@/components/PageTransition";

export default function DashboardPage() {
  const { obras } = useObras();
  const { onlineCount } = useOnlineUsers();
  const [fvsTotal, setFvsTotal] = useState(0);
  const [fvsConcluidas, setFvsConcluidas] = useState(0);
  const [vistTotal, setVistTotal] = useState(0);
  const [vistConcluidas, setVistConcluidas] = useState(0);
  const [ncAbertas, setNcAbertas] = useState(0);

  useEffect(() => {
    async function loadStats() {
      // Load FVS and vistorias stats for all obras the user can see
      let fT = 0, fC = 0, vT = 0, vC = 0;
      for (const obra of obras) {
        if (!obra.id) continue;
        try {
          const fvs = await getFvsAplicadas(obra.id);
          fT += fvs.length;
          fC += fvs.filter(f => f.status === "aprovada").length;
        } catch { /* empty */ }
      }
      setFvsTotal(fT);
      setFvsConcluidas(fC);

      try {
        const vist = await getVistorias();
        const filteredVist = obras.length > 0
          ? vist.filter(v => obras.some(o => o.id === v.obraId))
          : vist;
        vT = filteredVist.length;
        vC = filteredVist.filter(v => v.status === "aprovado").length;
      } catch { /* empty */ }
      setVistTotal(vT);
      setVistConcluidas(vC);

      try {
        const ncs = await getNCs();
        setNcAbertas(ncs.filter(n => n.status === "open").length);
      } catch { /* empty */ }
    }

    if (obras.length > 0) loadStats();
  }, [obras]);

  const fvsPct = fvsTotal > 0 ? Math.round((fvsConcluidas / fvsTotal) * 100) : 0;
  const vistPct = vistTotal > 0 ? Math.round((vistConcluidas / vistTotal) * 100) : 0;

  const stats = [
    { label: "FVS Concluídas", value: `${fvsPct}%`, sub: `${fvsConcluidas}/${fvsTotal} aprovadas`, pct: fvsPct, color: "#22c55e", crit: false },
    { label: "Vistorias Concluídas", value: `${vistPct}%`, sub: `${vistConcluidas}/${vistTotal} aprovadas`, pct: vistPct, color: "#3b82f6", crit: false },
    { label: "Online Agora", value: String(onlineCount), sub: "Usuários conectados", pct: Math.min(onlineCount * 20, 100), color: "#a78bfa", crit: false },
    { label: "Obra Atual", value: String(obras.length), sub: obras.length > 0 ? obras[0].name : "Nenhuma", pct: 100, color: "rgba(255,255,255,.3)", crit: false },
    { label: "Alertas Críticos", value: String(ncAbertas), sub: "NCs abertas pendentes", pct: Math.min(ncAbertas * 25, 100), color: "var(--red-accent)", crit: ncAbertas > 0 },
  ];

  return (
    <PageTransition>
      <div style={{ flex: 1, overflowY: "auto", padding: "36px 40px 48px" }} className="dot-grid">
        <div style={{ marginBottom: 32 }}>
          <div className="section-label" style={{ marginBottom: 6 }}>VISÃO GERAL</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-.02em" }}>Painel Geral</h1>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.35)", marginTop: 4 }}>Métricas consolidadas das suas obras</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              className="card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              whileHover={{ scale: 1.02, y: -2 }}
              style={{
                padding: "22px 20px",
                borderColor: s.crit ? "rgba(164,22,26,.45)" : undefined,
                boxShadow: s.crit ? "6px 6px 0 #000, 0 0 12px rgba(164,22,26,.2)" : undefined,
              }}
            >
              <div className="section-label" style={{ marginBottom: 10 }}>{s.label}</div>
              <div style={{
                fontSize: 42, fontWeight: 900, letterSpacing: "-.03em", lineHeight: 1,
                color: s.crit ? "var(--red-accent)" : "var(--white)",
              }}>
                {s.value}
              </div>
              <div style={{
                marginTop: 12, height: 4, background: "rgba(255,255,255,.06)", overflow: "hidden",
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${s.pct}%` }}
                  transition={{ duration: 0.8, delay: 0.3 + i * 0.1, ease: [0.4, 0, 0.2, 1] }}
                  style={{ height: "100%", background: s.color }}
                />
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.25)", marginTop: 8 }}>{s.sub}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
