"use client";

import { useState, useEffect, useCallback } from "react";
import { Responsavel, ResponsavelFormData, RtTipo } from "@/types";
import { getResponsaveis, createResponsavel, updateResponsavel, deleteResponsavel } from "@/services/responsaveis.service";
import { useAuth } from "@/context/AuthContext";

const TIPOS: { value: RtTipo; label: string }[] = [
  { value: "rt",         label: "Responsável Técnico" },
  { value: "eng",        label: "Engenheiro" },
  { value: "mestre",     label: "Mestre de Obras" },
  { value: "arquiteto",  label: "Arquiteto" },
  { value: "fiscal",     label: "Fiscal" },
  { value: "outro",      label: "Outro" },
];
const TIPO_LABEL: Record<RtTipo, string> = Object.fromEntries(TIPOS.map(t => [t.value, t.label])) as Record<RtTipo, string>;

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.9)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "var(--surface)", border: "2px solid var(--charcoal)", borderRadius: 12, boxShadow: "14px 14px 0 #000", padding: 34, width: 520, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 26 }}>
          <div style={{ fontSize: 20, fontWeight: 900 }}>{title}</div>
          <button onClick={onClose} style={{ width: 28, height: 28, background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 6, color: "white", cursor: "pointer", fontSize: 13 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const EMPTY: ResponsavelFormData = { nome: "", cargo: "", tipo: "eng", crea: "", tel: "", email: "" };

function initials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function ResponsaveisPage() {
  const { user } = useAuth();
  const [list, setList]         = useState<Responsavel[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editRt, setEditRt]     = useState<Responsavel | null>(null);
  const [form, setForm]         = useState<ResponsavelFormData>(EMPTY);

  const load = useCallback(async () => {
    setLoading(true);
    setList(await getResponsaveis());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() { setEditRt(null); setForm(EMPTY); setShowForm(true); }
  function openEdit(r: Responsavel) {
    setEditRt(r);
    setForm({ nome: r.nome, cargo: r.cargo, tipo: r.tipo, crea: r.crea ?? "", tel: r.tel ?? "", email: r.email ?? "" });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.nome.trim()) return;
    if (editRt?.id) await updateResponsavel(editRt.id, form);
    else await createResponsavel(form);
    setShowForm(false);
    await load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este responsável?")) return;
    await deleteResponsavel(id);
    await load();
  }

  const userInitials = user?.email?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "36px 40px 48px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 36 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--red-accent)", marginBottom: 6 }}>Equipe</div>
          <div style={{ fontSize: 52, fontWeight: 900, letterSpacing: "-.025em", lineHeight: 1 }}>Responsáveis</div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>Gerencie os profissionais vinculados às obras</div>
        </div>
        <button className="btn-primary" onClick={openCreate}>+ Novo Responsável</button>
      </div>

      {/* Modal */}
      {showForm && (
        <Modal title={editRt ? "Editar Responsável" : "Novo Responsável"} onClose={() => setShowForm(false)}>
          <div style={{ marginBottom: 14 }}>
            <label className="form-label">Nome Completo</label>
            <input className="form-input" value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} placeholder="Ex: João da Silva" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label className="form-label">Cargo</label>
              <input className="form-input" value={form.cargo} onChange={e => setForm(p => ({ ...p, cargo: e.target.value }))} placeholder="Ex: Engenheiro Civil" />
            </div>
            <div>
              <label className="form-label">Tipo</label>
              <select className="form-select" value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value as RtTipo }))}>
                {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label className="form-label">CREA / CAU</label>
              <input className="form-input" value={form.crea ?? ""} onChange={e => setForm(p => ({ ...p, crea: e.target.value }))} placeholder="Ex: CREA-SP 123456" />
            </div>
            <div>
              <label className="form-label">Telefone</label>
              <input className="form-input" value={form.tel ?? ""} onChange={e => setForm(p => ({ ...p, tel: e.target.value }))} placeholder="(11) 99999-9999" />
            </div>
          </div>
          <div style={{ marginBottom: 18 }}>
            <label className="form-label">E-mail</label>
            <input className="form-input" type="email" value={form.email ?? ""} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="profissional@email.com" />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 18, borderTop: "1px solid var(--border)" }}>
            <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
            <button className="btn-primary" onClick={handleSave}>{editRt ? "Salvar" : "Adicionar"}</button>
          </div>
        </Modal>
      )}

      {/* Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
        {/* Usuário logado */}
        <div style={{ background: "var(--surface)", border: "2px solid rgba(164,22,26,.45)", borderRadius: 12, boxShadow: "6px 6px 0 #000", padding: 24, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "var(--red-accent)" }} />
          <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--red-accent)", padding: "3px 8px", border: "1px solid rgba(164,22,26,.4)", display: "inline-block", marginBottom: 14 }}>Você</div>
          <div style={{ width: 48, height: 48, background: "var(--red)", border: "2px solid var(--red-accent)", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, marginBottom: 14 }}>
            {userInitials}
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 2 }}>{user?.email ?? "—"}</div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)" }}>Administrador</div>
        </div>

        {loading && <div style={{ display: "flex", alignItems: "center", padding: 24, color: "var(--muted)", fontSize: 12 }}>Carregando...</div>}

        {list.map(r => (
          <div key={r.id} style={{ background: "var(--surface)", border: "2px solid var(--charcoal)", borderRadius: 12, boxShadow: "6px 6px 0 #000", padding: 24, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "var(--charcoal)" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(255,255,255,.35)", padding: "3px 8px", border: "1px solid rgba(255,255,255,.08)", display: "inline-block" }}>
                {TIPO_LABEL[r.tipo] ?? r.tipo}
              </div>
            </div>
            <div style={{ width: 48, height: 48, background: "var(--charcoal)", border: "2px solid rgba(255,255,255,.12)", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, marginBottom: 14 }}>
              {initials(r.nome)}
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 2 }}>{r.nome}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 12 }}>{r.cargo}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 14 }}>
              {r.crea  && <div style={{ fontSize: 10, color: "rgba(255,255,255,.45)" }}>🪪 {r.crea}</div>}
              {r.tel   && <div style={{ fontSize: 10, color: "rgba(255,255,255,.45)" }}>📞 {r.tel}</div>}
              {r.email && <div style={{ fontSize: 10, color: "rgba(255,255,255,.45)" }}>✉ {r.email}</div>}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => openEdit(r)} style={{ flex: 1, fontSize: 9, padding: "4px 0", background: "var(--charcoal)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 5, color: "rgba(255,255,255,.7)", cursor: "pointer", fontFamily: "inherit" }}>Editar</button>
              <button onClick={() => handleDelete(r.id!)} style={{ flex: 1, fontSize: 9, padding: "4px 0", background: "rgba(164,22,26,.12)", border: "1px solid rgba(164,22,26,.25)", borderRadius: 5, color: "var(--red-accent)", cursor: "pointer", fontFamily: "inherit" }}>Excluir</button>
            </div>
          </div>
        ))}

        {!loading && list.length === 0 && (
          <div style={{ background: "var(--surface)", border: "2px dashed var(--charcoal)", borderRadius: 12, padding: "36px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={openCreate}>
            <div style={{ fontSize: 28, opacity: .2 }}>+</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.3)" }}>Adicionar profissional</div>
          </div>
        )}
      </div>
    </div>
  );
}
