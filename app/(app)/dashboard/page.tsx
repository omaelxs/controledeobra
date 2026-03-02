"use client";

import { useState, useEffect } from "react";
import { useObras } from "@/hooks/useObras";
import { getFvs } from "@/services/fvs.service";
import { getNCs } from "@/services/nc.service";
import { getResponsaveis } from "@/services/responsaveis.service";

export default function DashboardPage() {
  const { obras } = useObras();
  const [fvsCount,  setFvsCount]  = useState(0);
  const [ncCount,   setNcCount]   = useState(0);
  const [rtCount,   setRtCount]   = useState(0);
  const [fvsAndamento, setFvsAndamento] = useState(0);

  useEffect(() => {
    getFvs().then(f => { setFvsCount(f.length); setFvsAndamento(f.filter(x => x.status === "andamento").length); });
    getNCs().then(n => setNcCount(n.filter(x => x.status === "open").length));
    getResponsaveis().then(r => setRtCount(r.length));
  }, []);

  const stats = [
    { label: "Obras Ativas",   value: obras.length,  note: "Cadastradas no sistema",      crit: false },
    { label: "Fichas FVS",     value: fvsCount,       note: `${fvsAndamento} em andamento`, crit: false },
    { label: "NCs Abertas",    value: ncCount,        note: "Pendentes de resolução",      crit: ncCount > 0 },
    { label: "Responsáveis",   value: rtCount + 1,    note: "Profissionais vinculados",    crit: false },
  ];

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "36px 40px 48px" }}>
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--red-accent)", marginBottom: 6 }}>Visão Geral</div>
        <div style={{ fontSize: 52, fontWeight: 900, letterSpacing: "-.025em", lineHeight: 1 }}>Painel Geral</div>
        <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>Monitoramento centralizado de obras, qualidade e equipe</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18, marginBottom: 28 }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: "var(--surface)", border: `2px solid ${s.crit ? "rgba(164,22,26,.45)" : "var(--charcoal)"}`,
            borderRadius: 12, boxShadow: "6px 6px 0px #000", padding: "26px 24px",
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>{s.label}</div>
            <div style={{ fontSize: 54, fontWeight: 900, letterSpacing: "-.03em", lineHeight: 1, color: s.crit ? "var(--red-accent)" : "var(--white)" }}>{s.value}</div>
            <div className="stat-bar" style={{ marginTop: 14 }}>
              <div className="stat-bar-fill" style={{ width: `${Math.min(s.value * 10, 100)}%` }}/>
            </div>
            <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 8 }}>{s.note}</div>
          </div>
        ))}
      </div>

      {/* Obras resumo */}
      {obras.length > 0 && (
        <div style={{ background: "var(--surface)", border: "2px solid var(--charcoal)", borderRadius: 12, boxShadow: "6px 6px 0px #000", padding: "26px 24px", marginBottom: 20 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 18 }}>Obras em Andamento</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {obras.slice(0, 5).map(o => (
              <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{o.name}</div>
                  <div className="stat-bar"><div className="stat-bar-fill" style={{ width: `${o.progress ?? 0}%` }} /></div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,.5)", minWidth: 32, textAlign: "right" }}>{o.progress ?? 0}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ background: "var(--surface)", border: "2px solid var(--charcoal)", borderRadius: 12, boxShadow: "6px 6px 0px #000", padding: "26px 24px" }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 22 }}>Atividade Recente</div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 0", color: "var(--muted)", gap: 8 }}>
          <div style={{ fontSize: 32, opacity: .2 }}>⚡</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.3)" }}>Nenhuma atividade registrada ainda</div>
        </div>
      </div>
    </div>
  );
}
