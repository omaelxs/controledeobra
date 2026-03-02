"use client";

import { useState, useEffect, useCallback } from "react";
import { Fvs, FvsFormData, FvsStatus } from "@/types";
import { getFvs, createFvs, updateFvs, deleteFvs } from "@/services/fvs.service";
import { getObras } from "@/services/obras.service";
import { Obra } from "@/types";

const STATUS_LABEL: Record<FvsStatus, string> = { andamento: "Em Andamento", aprovado: "Aprovado", reprovado: "Reprovado" };
const STATUS_PILL: Record<FvsStatus, string>  = { andamento: "pill-yellow", aprovado: "pill-green", reprovado: "pill-red" };
const CATEGORIES = ["Estrutura", "Alvenaria", "Revestimento", "Pintura", "Hidráulica", "Elétrica", "Esquadrias", "Cobertura", "Fundação", "Outro"];

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.9)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "var(--surface)", border: "2px solid var(--charcoal)", borderRadius: 12, boxShadow: "14px 14px 0 #000", padding: 34, width: 580, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 26 }}>
          <div style={{ fontSize: 20, fontWeight: 900 }}>{title}</div>
          <button onClick={onClose} style={{ width: 28, height: 28, background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 6, color: "white", cursor: "pointer", fontSize: 13 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const EMPTY_FORM: FvsFormData = { code: "", title: "", obraId: "", category: "Estrutura", criterio: "", items: [] };

export default function FvsPage() {
  const [fvsList, setFvsList] = useState<Fvs[]>([]);
  const [obras, setObras]     = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<"todos" | FvsStatus>("todos");
  const [selId, setSelId]     = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editFvs, setEditFvs]  = useState<Fvs | null>(null);
  const [form, setForm]        = useState<FvsFormData>(EMPTY_FORM);
  const [newItem, setNewItem]  = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const [f, o] = await Promise.all([getFvs(), getObras()]);
    setFvsList(f);
    setObras(o);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === "todos" ? fvsList : fvsList.filter(f => f.status === filter);
  const sel = fvsList.find(f => f.id === selId) ?? null;

  function openCreate() {
    setEditFvs(null);
    setForm({ ...EMPTY_FORM, code: `FVS-${String(fvsList.length + 1).padStart(3, "0")}` });
    setShowForm(true);
  }
  function openEdit(f: Fvs) {
    setEditFvs(f);
    setForm({ code: f.code, title: f.title, obraId: f.obraId ?? "", category: f.category, criterio: f.criterio ?? "", items: f.items });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.title.trim() || !form.code.trim()) return;
    if (editFvs?.id) {
      await updateFvs(editFvs.id, { code: form.code, title: form.title, obraId: form.obraId, category: form.category, criterio: form.criterio, items: form.items });
    } else {
      const id = await createFvs(form);
      setSelId(id);
    }
    setShowForm(false);
    await load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta FVS?")) return;
    await deleteFvs(id);
    if (selId === id) setSelId(null);
    await load();
  }

  async function toggleItem(fvsId: string, idx: number) {
    const fvs = fvsList.find(f => f.id === fvsId);
    if (!fvs) return;
    const items = fvs.items.map((it, i) => i === idx ? { ...it, checked: !it.checked } : it);
    const checked = items.filter(i => i.checked).length;
    const total   = items.length;
    const newStatus: FvsStatus = total === 0 ? "andamento" : checked === total ? "aprovado" : "andamento";
    await updateFvs(fvsId, { items, status: newStatus });
    await load();
  }

  async function setStatus(id: string, status: FvsStatus) {
    await updateFvs(id, { status });
    await load();
  }

  function addItem() {
    if (!newItem.trim()) return;
    setForm(p => ({ ...p, items: [...p.items, { text: newItem.trim(), checked: false }] }));
    setNewItem("");
  }
  function removeItem(idx: number) {
    setForm(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) }));
  }

  const obraName = (id?: string) => obras.find(o => o.id === id)?.name ?? "—";

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "36px 40px 48px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 30 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--red-accent)", marginBottom: 6 }}>Qualidade</div>
          <div style={{ fontSize: 52, fontWeight: 900, letterSpacing: "-.025em", lineHeight: 1 }}>FVS — Fichas</div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>Fichas de Verificação de Serviço</div>
        </div>
        <button className="btn-primary" onClick={openCreate}>+ Nova FVS</button>
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 8, marginBottom: 26 }}>
        {(["todos", "andamento", "aprovado", "reprovado"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "6px 16px", fontSize: 10, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase",
            background: filter === f ? "var(--red-accent)" : "var(--charcoal)",
            border: `1px solid ${filter === f ? "var(--red-accent)" : "rgba(255,255,255,.1)"}`,
            borderRadius: 6, color: filter === f ? "#fff" : "rgba(255,255,255,.5)", cursor: "pointer", fontFamily: "inherit",
          }}>
            {f === "todos" ? "Todos" : STATUS_LABEL[f]}
            <span style={{ marginLeft: 6, fontSize: 9, opacity: .7 }}>
              {f === "todos" ? fvsList.length : fvsList.filter(x => x.status === f).length}
            </span>
          </button>
        ))}
      </div>

      {/* Modal */}
      {showForm && (
        <Modal title={editFvs ? "Editar FVS" : "Nova FVS"} onClose={() => setShowForm(false)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label className="form-label">Código</label>
              <input className="form-input" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} placeholder="FVS-001" />
            </div>
            <div>
              <label className="form-label">Categoria</label>
              <select className="form-select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="form-label">Título</label>
            <input className="form-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Ex: Verificação de Fôrmas" />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="form-label">Obra Vinculada</label>
            <select className="form-select" value={form.obraId ?? ""} onChange={e => setForm(p => ({ ...p, obraId: e.target.value }))}>
              <option value="">— Sem vínculo —</option>
              {obras.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 18 }}>
            <label className="form-label">Critério de Aceitação</label>
            <textarea className="form-textarea" rows={2} value={form.criterio ?? ""} onChange={e => setForm(p => ({ ...p, criterio: e.target.value }))} placeholder="Descreva o critério de aprovação..." />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label className="form-label">Itens de Verificação</label>
            <div style={{ marginBottom: 8 }}>
              {form.items.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "rgba(255,255,255,.025)", borderRadius: 6, marginBottom: 4 }}>
                  <div style={{ width: 14, height: 14, borderRadius: 3, border: "1px solid var(--border)", background: "var(--charcoal)", flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 12 }}>{item.text}</span>
                  <button onClick={() => removeItem(i)} style={{ width: 18, height: 18, background: "rgba(164,22,26,.2)", border: "none", borderRadius: 3, color: "var(--red-accent)", cursor: "pointer", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                </div>
              ))}
              {form.items.length === 0 && <div style={{ fontSize: 11, color: "var(--muted)", padding: "6px 0" }}>Nenhum item. Adicione abaixo.</div>}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input className="form-input" style={{ flex: 1 }} value={newItem} onChange={e => setNewItem(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addItem()} placeholder="Novo item de verificação..." />
              <button className="btn-ghost" onClick={addItem}>+ Add</button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 18, borderTop: "1px solid var(--border)" }}>
            <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
            <button className="btn-primary" onClick={handleSave}>{editFvs ? "Salvar" : "Criar FVS"}</button>
          </div>
        </Modal>
      )}

      {/* Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20, minHeight: 480 }}>
        {/* Cards */}
        <div>
          {loading && <div style={{ color: "var(--muted)", fontSize: 13 }}>Carregando...</div>}
          {!loading && filtered.length === 0 && (
            <div style={{ background: "var(--surface)", border: "2px solid var(--charcoal)", borderRadius: 12, padding: "56px 0", textAlign: "center", color: "var(--muted)" }}>
              <div style={{ fontSize: 32, opacity: .18, marginBottom: 10 }}>📋</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.3)" }}>Nenhuma ficha encontrada</div>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {filtered.map(fvs => {
              const total   = fvs.items.length;
              const checked = fvs.items.filter(i => i.checked).length;
              const pct     = total > 0 ? Math.round((checked / total) * 100) : 0;
              const active  = selId === fvs.id;
              return (
                <div key={fvs.id} onClick={() => setSelId(active ? null : fvs.id!)} style={{
                  background: "var(--surface)", border: `2px solid ${active ? "var(--red-accent)" : "var(--charcoal)"}`,
                  borderRadius: 12, boxShadow: "6px 6px 0 #000", padding: "22px 20px", cursor: "pointer",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 4 }}>{fvs.code} · {fvs.category}</div>
                      <div style={{ fontSize: 15, fontWeight: 800 }}>{fvs.title}</div>
                    </div>
                    <span className={`pill ${STATUS_PILL[fvs.status]}`}>{STATUS_LABEL[fvs.status]}</span>
                  </div>
                  {fvs.obraId && <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 10 }}>📍 {obraName(fvs.obraId)}</div>}
                  {total > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 9, color: "var(--muted)" }}>Itens verificados</span>
                        <span style={{ fontSize: 9, fontWeight: 800 }}>{checked}/{total}</span>
                      </div>
                      <div className="stat-bar"><div className="stat-bar-fill" style={{ width: `${pct}%` }} /></div>
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => openEdit(fvs)} style={{ flex: 1, fontSize: 9, padding: "4px 0", background: "var(--charcoal)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 5, color: "rgba(255,255,255,.7)", cursor: "pointer", fontFamily: "inherit" }}>Editar</button>
                    <button onClick={() => handleDelete(fvs.id!)} style={{ flex: 1, fontSize: 9, padding: "4px 0", background: "rgba(164,22,26,.12)", border: "1px solid rgba(164,22,26,.25)", borderRadius: 5, color: "var(--red-accent)", cursor: "pointer", fontFamily: "inherit" }}>Excluir</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Painel lateral */}
        <div style={{ background: "var(--surface)", border: "2px solid var(--charcoal)", borderRadius: 12, boxShadow: "6px 6px 0 #000", overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 480 }}>
          {!sel ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, color: "var(--muted)", gap: 8 }}>
              <div style={{ fontSize: 28, opacity: .18 }}>📋</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.3)" }}>Clique em uma ficha para ver detalhes</div>
            </div>
          ) : (
            <>
              <div style={{ padding: "20px 22px 16px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ fontSize: 9, color: "var(--muted)", fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase", marginBottom: 4 }}>{sel.code}</div>
                <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 8 }}>{sel.title}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span className={`pill ${STATUS_PILL[sel.status]}`}>{STATUS_LABEL[sel.status]}</span>
                  <span style={{ fontSize: 9, background: "var(--charcoal)", borderRadius: 999, padding: "2px 9px", color: "rgba(255,255,255,.5)" }}>{sel.category}</span>
                </div>
              </div>
              {sel.criterio && (
                <div style={{ padding: "14px 22px", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>Critério</div>
                  <div style={{ fontSize: 11.5, color: "rgba(255,255,255,.6)", lineHeight: 1.6 }}>{sel.criterio}</div>
                </div>
              )}
              <div style={{ flex: 1, overflowY: "auto", padding: "14px 22px" }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>
                  Checklist ({sel.items.filter(i => i.checked).length}/{sel.items.length})
                </div>
                {sel.items.length === 0 && <div style={{ fontSize: 11, color: "var(--muted)" }}>Nenhum item cadastrado.</div>}
                {sel.items.map((item, i) => (
                  <div key={i} onClick={() => toggleItem(sel.id!, i)} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 7, marginBottom: 3, cursor: "pointer",
                    background: item.checked ? "rgba(34,197,94,.07)" : "transparent",
                  }}
                    onMouseEnter={e => { if (!item.checked) e.currentTarget.style.background = "rgba(255,255,255,.025)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = item.checked ? "rgba(34,197,94,.07)" : "transparent"; }}>
                    <div style={{
                      width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                      border: `2px solid ${item.checked ? "#22c55e" : "rgba(255,255,255,.2)"}`,
                      background: item.checked ? "#22c55e" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {item.checked && <span style={{ fontSize: 9, color: "#000", fontWeight: 900 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: 12, color: item.checked ? "rgba(255,255,255,.5)" : "rgba(255,255,255,.8)", textDecoration: item.checked ? "line-through" : "none" }}>{item.text}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: "12px 22px", borderTop: "1px solid var(--border)", display: "flex", gap: 6 }}>
                {(["andamento", "aprovado", "reprovado"] as FvsStatus[]).map(st => (
                  <button key={st} onClick={() => setStatus(sel.id!, st)} style={{
                    flex: 1, fontSize: 8, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", padding: "5px 0",
                    background: sel.status === st ? (st === "aprovado" ? "rgba(34,197,94,.2)" : st === "reprovado" ? "rgba(164,22,26,.2)" : "rgba(234,179,8,.2)") : "var(--charcoal)",
                    border: `1px solid ${sel.status === st ? (st === "aprovado" ? "rgba(34,197,94,.4)" : st === "reprovado" ? "rgba(164,22,26,.4)" : "rgba(234,179,8,.4)") : "rgba(255,255,255,.08)"}`,
                    borderRadius: 5, color: sel.status === st ? (st === "aprovado" ? "#22c55e" : st === "reprovado" ? "var(--red-accent)" : "#eab308") : "rgba(255,255,255,.45)",
                    cursor: "pointer", fontFamily: "inherit",
                  }}>
                    {STATUS_LABEL[st]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
