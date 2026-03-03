"use client";

import { useState, useEffect, useCallback } from "react";
import { NC, NCFormData, NcSeverity, NcStatus } from "@/types";
import { getNCs, createNC, updateNC, deleteNC } from "@/services/nc.service";
import { getObras } from "@/services/obras.service";
import { Obra } from "@/types";
import { useUserRole } from "@/hooks/useUserRole";

const SEV_PILL: Record<NcSeverity, string>  = { crítica: "pill-red", alta: "pill-red", média: "pill-yellow", baixa: "pill-gray" };
const SEV_COLOR: Record<NcSeverity, string> = { crítica: "var(--red-accent)", alta: "#f97316", média: "#eab308", baixa: "rgba(255,255,255,.4)" };
const SEVERITIES: NcSeverity[] = ["crítica", "alta", "média", "baixa"];

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.9)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "var(--surface)", border: "2px solid var(--charcoal)", borderRadius: 12, boxShadow: "14px 14px 0 #000", padding: 34, width: 560, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 26 }}>
          <div style={{ fontSize: 20, fontWeight: 900 }}>{title}</div>
          <button onClick={onClose} style={{ width: 28, height: 28, background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 6, color: "white", cursor: "pointer", fontSize: 13 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const EMPTY: NCFormData = { title: "", obraId: "", location: "", desc: "", severity: "média", deadline: "" };

export default function NcPage() {
  const { role } = useUserRole();
  const [ncs, setNcs]       = useState<NC[]>([]);
  const [obras, setObras]   = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<"todos" | NcStatus>("todos");
  const [selId, setSelId]     = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editNc, setEditNc]    = useState<NC | null>(null);
  const [form, setForm]        = useState<NCFormData>(EMPTY);

  const load = useCallback(async () => {
    setLoading(true);
    const [n, o] = await Promise.all([getNCs(), getObras()]);
    setNcs(n);
    setObras(o);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === "todos" ? ncs : ncs.filter(n => n.status === filter);
  const sel      = ncs.find(n => n.id === selId) ?? null;

  function openCreate() {
    setEditNc(null); setForm(EMPTY); setShowForm(true);
  }
  function openEdit(nc: NC) {
    setEditNc(nc);
    setForm({ title: nc.title, obraId: nc.obraId ?? "", location: nc.location, desc: nc.desc, severity: nc.severity, deadline: nc.deadline });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.title.trim()) return;
    if (editNc?.id) {
      await updateNC(editNc.id, { title: form.title, obraId: form.obraId, location: form.location, desc: form.desc, severity: form.severity, deadline: form.deadline, overdue: form.deadline ? new Date(form.deadline) < new Date() : false }, role);
    } else {
      const id = await createNC(form, role);
      setSelId(id);
    }
    setShowForm(false);
    await load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta NC?")) return;
    await deleteNC(id, role);
    if (selId === id) setSelId(null);
    await load();
  }

  async function toggleStatus(nc: NC) {
    const next: NcStatus = nc.status === "open" ? "closed" : "open";
    await updateNC(nc.id!, { status: next }, role);
    await load();
  }

  const obraName = (id?: string) => obras.find(o => o.id === id)?.name ?? "—";

  const openCount   = ncs.filter(n => n.status === "open").length;
  const closedCount = ncs.filter(n => n.status === "closed").length;
  const critCount   = ncs.filter(n => n.severity === "crítica" && n.status === "open").length;

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "36px 40px 48px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 26 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--red-accent)", marginBottom: 6 }}>Qualidade</div>
          <div style={{ fontSize: 52, fontWeight: 900, letterSpacing: "-.025em", lineHeight: 1 }}>Não Conformidades</div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>Registro e acompanhamento de NCs</div>
        </div>
        <button className="btn-primary" onClick={openCreate}>+ Registrar NC</button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 26 }}>
        {[
          { label: "Abertas", value: openCount, color: "var(--red-accent)" },
          { label: "Fechadas", value: closedCount, color: "#22c55e" },
          { label: "Críticas", value: critCount, color: "#f97316" },
        ].map(s => (
          <div key={s.label} style={{ background: "var(--surface)", border: "2px solid var(--charcoal)", borderRadius: 10, boxShadow: "4px 4px 0 #000", padding: "18px 20px" }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 40, fontWeight: 900, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
        {([["todos", "Todos"], ["open", "Abertas"], ["closed", "Fechadas"]] as const).map(([f, lbl]) => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "6px 16px", fontSize: 10, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase",
            background: filter === f ? "var(--red-accent)" : "var(--charcoal)",
            border: `1px solid ${filter === f ? "var(--red-accent)" : "rgba(255,255,255,.1)"}`,
            borderRadius: 6, color: filter === f ? "#fff" : "rgba(255,255,255,.5)", cursor: "pointer", fontFamily: "inherit",
          }}>
            {lbl}
            <span style={{ marginLeft: 6, fontSize: 9, opacity: .7 }}>
              {f === "todos" ? ncs.length : ncs.filter(n => n.status === f).length}
            </span>
          </button>
        ))}
      </div>

      {/* Modal */}
      {showForm && (
        <Modal title={editNc ? "Editar NC" : "Registrar NC"} onClose={() => setShowForm(false)}>
          <div style={{ marginBottom: 14 }}>
            <label className="form-label">Título</label>
            <input className="form-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Ex: Fissura em parede estrutural" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label className="form-label">Obra</label>
              <select className="form-select" value={form.obraId ?? ""} onChange={e => setForm(p => ({ ...p, obraId: e.target.value }))}>
                <option value="">— Sem vínculo —</option>
                {obras.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Gravidade</label>
              <select className="form-select" value={form.severity} onChange={e => setForm(p => ({ ...p, severity: e.target.value as NcSeverity }))}>
                {SEVERITIES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="form-label">Localização</label>
            <input className="form-input" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="Ex: 3º Pavimento, Apt 301" />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="form-label">Descrição</label>
            <textarea className="form-textarea" rows={3} value={form.desc} onChange={e => setForm(p => ({ ...p, desc: e.target.value }))} placeholder="Descreva a não conformidade em detalhes..." />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label className="form-label">Prazo de Resolução</label>
            <input className="form-input" type="date" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 18, borderTop: "1px solid var(--border)" }}>
            <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
            <button className="btn-primary" onClick={handleSave}>{editNc ? "Salvar" : "Registrar"}</button>
          </div>
        </Modal>
      )}

      {/* Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20, minHeight: 400 }}>
        {/* Lista */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {loading && <div style={{ color: "var(--muted)", fontSize: 13 }}>Carregando...</div>}
          {!loading && filtered.length === 0 && (
            <div style={{ background: "var(--surface)", border: "2px solid var(--charcoal)", borderRadius: 12, padding: "48px 0", textAlign: "center" }}>
              <div style={{ fontSize: 28, opacity: .18 }}>⚠</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.3)", marginTop: 8 }}>Nenhuma NC encontrada</div>
            </div>
          )}
          {filtered.map(nc => {
            const active = selId === nc.id;
            const overdue = nc.deadline && nc.status === "open" && new Date(nc.deadline) < new Date();
            return (
              <div key={nc.id} onClick={() => setSelId(active ? null : nc.id!)} style={{
                background: "var(--surface)", border: `2px solid ${active ? "var(--red-accent)" : "var(--charcoal)"}`,
                borderRadius: 10, boxShadow: "4px 4px 0 #000", padding: "18px 20px", cursor: "pointer",
                borderLeft: `4px solid ${SEV_COLOR[nc.severity]}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 3 }}>
                      {nc.ncId} {overdue && <span style={{ color: "var(--red-accent)", marginLeft: 4 }}>· VENCIDA</span>}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 800 }}>{nc.title}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <span className={`pill ${SEV_PILL[nc.severity]}`}>{nc.severity}</span>
                    <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 999, background: nc.status === "open" ? "rgba(239,68,68,.12)" : "rgba(34,197,94,.12)", color: nc.status === "open" ? "#ef4444" : "#22c55e", border: `1px solid ${nc.status === "open" ? "rgba(239,68,68,.2)" : "rgba(34,197,94,.2)"}` }}>
                      {nc.status === "open" ? "Aberta" : "Fechada"}
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{nc.desc}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>
                    📍 {nc.location}
                    {nc.deadline && <span style={{ marginLeft: 10 }}>⏱ {nc.deadline}</span>}
                  </div>
                  <div style={{ display: "flex", gap: 5 }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => openEdit(nc)} style={{ fontSize: 9, padding: "3px 8px", background: "var(--charcoal)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 4, color: "rgba(255,255,255,.6)", cursor: "pointer", fontFamily: "inherit" }}>Editar</button>
                    <button onClick={() => toggleStatus(nc)} style={{ fontSize: 9, padding: "3px 8px", background: nc.status === "open" ? "rgba(34,197,94,.12)" : "rgba(239,68,68,.12)", border: `1px solid ${nc.status === "open" ? "rgba(34,197,94,.2)" : "rgba(239,68,68,.2)"}`, borderRadius: 4, color: nc.status === "open" ? "#22c55e" : "#ef4444", cursor: "pointer", fontFamily: "inherit" }}>
                      {nc.status === "open" ? "Fechar" : "Reabrir"}
                    </button>
                    <button onClick={() => handleDelete(nc.id!)} style={{ fontSize: 9, padding: "3px 8px", background: "rgba(164,22,26,.12)", border: "1px solid rgba(164,22,26,.2)", borderRadius: 4, color: "var(--red-accent)", cursor: "pointer", fontFamily: "inherit" }}>✕</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Painel detalhe */}
        <div style={{ background: "var(--surface)", border: "2px solid var(--charcoal)", borderRadius: 12, boxShadow: "6px 6px 0 #000", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {!sel ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, color: "var(--muted)", gap: 8, padding: 40 }}>
              <div style={{ fontSize: 28, opacity: .18 }}>⚠</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.3)" }}>Selecione uma NC para ver detalhes</div>
            </div>
          ) : (
            <>
              <div style={{ padding: "20px 22px 16px", borderBottom: "1px solid var(--border)", borderLeft: `4px solid ${SEV_COLOR[sel.severity]}` }}>
                <div style={{ fontSize: 9, color: "var(--muted)", fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase", marginBottom: 4 }}>{sel.ncId}</div>
                <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 8 }}>{sel.title}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span className={`pill ${SEV_PILL[sel.severity]}`}>{sel.severity}</span>
                  <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 999, background: sel.status === "open" ? "rgba(239,68,68,.12)" : "rgba(34,197,94,.12)", color: sel.status === "open" ? "#ef4444" : "#22c55e", border: `1px solid ${sel.status === "open" ? "rgba(239,68,68,.2)" : "rgba(34,197,94,.2)"}` }}>
                    {sel.status === "open" ? "Aberta" : "Fechada"}
                  </span>
                </div>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px" }}>
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>Descrição</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,.7)", lineHeight: 1.7 }}>{sel.desc || "—"}</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 4 }}>Localização</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,.65)" }}>{sel.location || "—"}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 4 }}>Prazo</div>
                    <div style={{ fontSize: 12, color: sel.overdue && sel.status === "open" ? "var(--red-accent)" : "rgba(255,255,255,.65)" }}>{sel.deadline || "—"}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 4 }}>Data</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,.65)" }}>{sel.date || "—"}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 4 }}>Obra</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,.65)" }}>{obraName(sel.obraId)}</div>
                  </div>
                </div>
              </div>
              <div style={{ padding: "12px 22px", borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
                <button onClick={() => openEdit(sel)} style={{ flex: 1, fontSize: 9, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", padding: "7px 0", background: "var(--charcoal)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 6, color: "rgba(255,255,255,.7)", cursor: "pointer", fontFamily: "inherit" }}>Editar</button>
                <button onClick={() => toggleStatus(sel)} style={{ flex: 1, fontSize: 9, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", padding: "7px 0", background: sel.status === "open" ? "rgba(34,197,94,.12)" : "rgba(239,68,68,.12)", border: `1px solid ${sel.status === "open" ? "rgba(34,197,94,.25)" : "rgba(239,68,68,.25)"}`, borderRadius: 6, color: sel.status === "open" ? "#22c55e" : "#ef4444", cursor: "pointer", fontFamily: "inherit" }}>
                  {sel.status === "open" ? "Fechar NC" : "Reabrir NC"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
