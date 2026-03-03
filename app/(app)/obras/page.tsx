"use client";

import { useState } from "react";
import { useObras } from "@/hooks/useObras";
import { useUserRole } from "@/hooks/useUserRole";
import { Obra, Pavimento } from "@/types";
import {
  addPavimento, renamePavimento, deletePavimento,
  addApartamento, deleteApartamento,
  addAnexo, deleteAnexo,
} from "@/services/obras.service";

const S: Record<string, string> = {
  "Em Execução": "pill-yellow", "Concluída": "pill-green",
  "Paralisada": "pill-red", "Planejamento": "pill-gray",
};
const STATUS_OPT = ["Planejamento", "Em Execução", "Paralisada", "Concluída"];

type MiniModal = { type: "pav" | "apt" | "anexo"; pavId?: string } | null;

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.88)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "var(--surface)", border: "2px solid var(--charcoal)", borderRadius: 12, boxShadow: "14px 14px 0 #000", padding: 34, width: 520 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 26 }}>
          <div style={{ fontSize: 20, fontWeight: 900 }}>{title}</div>
          <button onClick={onClose} style={{ width: 28, height: 28, background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 6, color: "white", cursor: "pointer", fontSize: 13 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function MiniBox({ title, placeholder, onSave, onClose }: { title: string; placeholder: string; onSave: (v: string) => void; onClose: () => void }) {
  const [val, setVal] = useState("");
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "var(--surface)", border: "2px solid var(--charcoal)", borderRadius: 10, boxShadow: "10px 10px 0 #000", padding: 26, width: 400 }}>
        <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 18 }}>{title}</div>
        <label className="form-label">Nome</label>
        <input className="form-input" autoFocus placeholder={placeholder} value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === "Enter" && val.trim() && onSave(val.trim())} />
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
          <button className="btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={() => val.trim() && onSave(val.trim())}>Adicionar</button>
        </div>
      </div>
    </div>
  );
}

export default function ObrasPage() {
  const { obras, loading, create, update, remove, refresh } = useObras();
  const { role } = useUserRole();
  const [selId, setSelId]       = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editObra, setEditObra] = useState<Obra | null>(null);
  const [mini, setMini]         = useState<MiniModal>(null);
  const [treeOpen, setTreeOpen] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState({ name: "", address: "", status: "Planejamento" as Obra["status"] });

  const sel = obras.find(o => o.id === selId) ?? obras[0] ?? null;

  function toggle(key: string) { setTreeOpen(p => ({ ...p, [key]: !(p[key] ?? true) })); }
  function isOpen(key: string) { return treeOpen[key] ?? true; }

  function openCreate() { setEditObra(null); setForm({ name: "", address: "", status: "Planejamento" }); setShowForm(true); }
  function openEdit(o: Obra) { setEditObra(o); setForm({ name: o.name, address: o.address, status: o.status }); setShowForm(true); }

  async function handleSave() {
    if (!form.name.trim()) return;
    if (editObra?.id) await update(editObra.id, { name: form.name, address: form.address, status: form.status, progress: editObra.progress ?? 0 });
    else await create({ name: form.name, address: form.address, status: form.status, progress: 0, rtName: "" });
    setShowForm(false);
  }

  async function handleDelete(id: string) { if (confirm("Excluir esta obra?")) await remove(id); }

  async function handleAddPav(name: string) {
    if (!sel?.id) return;
    await addPavimento(sel.id, name, sel.pavimentos ?? [], role);
    await refresh(); setMini(null);
  }
  async function handleDeletePav(pavId: string) {
    if (!sel?.id || !confirm("Excluir pavimento e todas as unidades?")) return;
    await deletePavimento(sel.id, sel.pavimentos ?? [], pavId, role);
    await refresh();
  }
  async function handleAddApt(pavId: string, name: string) {
    if (!sel?.id) return;
    await addApartamento(sel.id, sel.pavimentos ?? [], pavId, name, role);
    await refresh(); setMini(null);
  }
  async function handleDeleteApt(aptId: string) {
    if (!sel?.id || !confirm("Excluir esta unidade?")) return;
    await deleteApartamento(sel.id, sel.pavimentos ?? [], aptId, role);
    await refresh();
  }
  async function handleAddAnexo(name: string) {
    if (!sel?.id) return;
    await addAnexo(sel.id, sel.anexos ?? [], name, role);
    await refresh(); setMini(null);
  }
  async function handleDeleteAnexo(anexoId: string) {
    if (!sel?.id || !confirm("Excluir este anexo?")) return;
    await deleteAnexo(sel.id, sel.anexos ?? [], anexoId, role);
    await refresh();
  }

  function renderTree(o: Obra) {
    const pavs = o.pavimentos ?? [];
    const anx  = o.anexos ?? [];
    const pavOpen = isOpen(`pav-${o.id}`);
    const anxOpen = isOpen(`anx-${o.id}`);

    return (
      <>
        {/* Pavimentos */}
        <div style={{ marginBottom: 1 }}>
          <div onClick={() => toggle(`pav-${o.id}`)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 10px", borderRadius: 6, cursor: "pointer", userSelect: "none" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,.04)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
            <span style={{ fontSize: 9, color: "var(--muted)", transition: "transform .18s", display: "inline-block", transform: pavOpen ? "rotate(90deg)" : "none" }}>▶</span>
            <span style={{ fontSize: 12 }}>🏢</span>
            <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600 }}>Pavimentos</span>
            <span style={{ fontSize: 9, color: "var(--muted)", marginRight: 4 }}>{pavs.length}</span>
          </div>
          {pavOpen && (
            <div style={{ marginLeft: 22, paddingLeft: 14, borderLeft: "1px solid var(--border)", marginTop: 1 }}>
              {pavs.length === 0 && <div style={{ padding: "6px 10px", fontSize: 11, color: "var(--muted)" }}>Nenhum pavimento. Use o botão abaixo.</div>}
              {pavs.map(pav => {
                const pavItemOpen = isOpen(`pav-item-${pav.id}`);
                return (
                  <div key={pav.id} style={{ marginBottom: 1 }}>
                    <div onClick={() => toggle(`pav-item-${pav.id}`)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 10px", borderRadius: 6, cursor: "pointer", userSelect: "none" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,.04)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <span style={{ fontSize: 9, color: "var(--muted)", transition: "transform .18s", display: "inline-block", transform: pavItemOpen ? "rotate(90deg)" : "none" }}>▶</span>
                      <span style={{ fontSize: 12 }}>🏗</span>
                      <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600 }}>{pav.name}</span>
                      <span style={{ fontSize: 9, color: "var(--muted)", marginRight: 4 }}>{pav.apts.length}</span>
                      <div style={{ display: "flex", gap: 3 }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => setMini({ type: "apt", pavId: pav.id })}
                          style={{ width: 22, height: 22, background: "var(--charcoal)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 4, color: "rgba(255,255,255,.5)", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                        <button onClick={() => handleDeletePav(pav.id)}
                          style={{ width: 22, height: 22, background: "rgba(164,22,26,.15)", border: "1px solid rgba(164,22,26,.2)", borderRadius: 4, color: "var(--red-accent)", cursor: "pointer", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                      </div>
                    </div>
                    {pavItemOpen && (
                      <div style={{ marginLeft: 22, paddingLeft: 14, borderLeft: "1px solid var(--border)", marginTop: 1 }}>
                        {pav.apts.length === 0 && <div style={{ padding: "6px 10px", fontSize: 11, color: "var(--muted)" }}>Nenhuma unidade. Clique em + para adicionar.</div>}
                        {pav.apts.map(apt => (
                          <div key={apt.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 6 }}
                            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,.025)")}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                            <div style={{ width: 5, height: 5, borderRadius: "50%", background: apt.status === "aprovado" ? "#22c55e" : apt.status === "reprovado" ? "var(--red-accent)" : "rgba(255,255,255,.18)", border: "1px solid rgba(255,255,255,.15)", flexShrink: 0, marginLeft: 5 }}/>
                            <span style={{ flex: 1, fontSize: 11.5, color: "rgba(255,255,255,.55)" }}>{apt.name}</span>
                            <button onClick={() => handleDeleteApt(apt.id)}
                              style={{ width: 20, height: 20, background: "rgba(164,22,26,.15)", border: "1px solid rgba(164,22,26,.2)", borderRadius: 4, color: "var(--red-accent)", cursor: "pointer", fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Anexos */}
        <div style={{ marginTop: 4 }}>
          <div onClick={() => toggle(`anx-${o.id}`)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 10px", borderRadius: 6, cursor: "pointer", userSelect: "none" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,.04)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
            <span style={{ fontSize: 9, color: "var(--muted)", display: "inline-block", transform: anxOpen ? "rotate(90deg)" : "none" }}>▶</span>
            <span style={{ fontSize: 12 }}>⚙</span>
            <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600 }}>Anexos e Infraestrutura</span>
            <span style={{ fontSize: 9, color: "var(--muted)", marginRight: 4 }}>{anx.length}</span>
          </div>
          {anxOpen && (
            <div style={{ marginLeft: 22, paddingLeft: 14, borderLeft: "1px solid var(--border)", marginTop: 1 }}>
              {anx.length === 0 && <div style={{ padding: "6px 10px", fontSize: 11, color: "var(--muted)" }}>Nenhum anexo.</div>}
              {anx.map(a => (
                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 6 }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,.025)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,.18)", border: "1px solid rgba(255,255,255,.15)", flexShrink: 0, marginLeft: 5 }}/>
                  <span style={{ flex: 1, fontSize: 11.5, color: "rgba(255,255,255,.55)" }}>{a.name}</span>
                  <button onClick={() => handleDeleteAnexo(a.id)}
                    style={{ width: 20, height: 20, background: "rgba(164,22,26,.15)", border: "1px solid rgba(164,22,26,.2)", borderRadius: 4, color: "var(--red-accent)", cursor: "pointer", fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "36px 40px 48px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 36 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--red-accent)", marginBottom: 6 }}>Gerenciamento</div>
          <div style={{ fontSize: 52, fontWeight: 900, letterSpacing: "-.025em", lineHeight: 1 }}>Obras</div>
        </div>
        <button className="btn-primary" onClick={openCreate}>+ Nova Obra</button>
      </div>

      {/* Modal obra */}
      {showForm && (
        <Modal title={editObra ? "Editar Obra" : "Nova Obra"} onClose={() => setShowForm(false)}>
          <div style={{ marginBottom: 18 }}>
            <label className="form-label">Nome da Obra</label>
            <input className="form-input" placeholder="Ex: Ed. Residencial Jardins" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label className="form-label">Endereço</label>
            <input className="form-input" placeholder="Rua, número, bairro, cidade" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label className="form-label">Status</label>
            <select className="form-select" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as Obra["status"] }))}>
              {STATUS_OPT.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 24, paddingTop: 18, borderTop: "1px solid var(--border)" }}>
            <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
            <button className="btn-primary" onClick={handleSave}>{editObra ? "Salvar" : "Criar Obra"}</button>
          </div>
        </Modal>
      )}

      {/* Mini modals */}
      {mini?.type === "pav" && <MiniBox title="Adicionar Pavimento" placeholder="Ex: 3º Pavimento, Térreo, Subsolo" onSave={handleAddPav} onClose={() => setMini(null)} />}
      {mini?.type === "apt" && mini.pavId && <MiniBox title="Adicionar Unidade" placeholder="Ex: Apt 301, Sala 10, Loja 2" onSave={n => handleAddApt(mini.pavId!, n)} onClose={() => setMini(null)} />}
      {mini?.type === "anexo" && <MiniBox title="Adicionar Anexo" placeholder="Ex: Casa de Máquinas, Guarita" onSave={handleAddAnexo} onClose={() => setMini(null)} />}

      {/* Layout 2 colunas */}
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20, height: "calc(100vh - 220px)" }}>

        {/* Lista */}
        <div style={{ background: "var(--surface)", border: "2px solid var(--charcoal)", borderRadius: 12, boxShadow: "6px 6px 0 #000", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "18px 18px 14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--muted)" }}>
              {obras.length === 0 ? "Nenhuma obra" : `${obras.length} obra${obras.length > 1 ? "s" : ""}`}
            </span>
            <span className="pill pill-green"><span className="pill-dot" />Online</span>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 6 }}>
            {loading && <div style={{ padding: 20, textAlign: "center", color: "var(--muted)", fontSize: 12 }}>Carregando...</div>}
            {!loading && obras.length === 0 && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 24px", color: "var(--muted)", textAlign: "center", gap: 8 }}>
                <div style={{ fontSize: 32, opacity: .2 }}>🏗</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.3)" }}>Sem obras</div>
                <div style={{ fontSize: 11 }}>Clique em "+ Nova Obra" para começar</div>
              </div>
            )}
            {obras.map(o => (
              <div key={o.id} onClick={() => setSelId(o.id!)} style={{
                padding: "13px 14px", borderRadius: 8, cursor: "pointer", marginBottom: 2,
                borderLeft: `3px solid ${sel?.id === o.id ? "var(--red-accent)" : "transparent"}`,
                background: sel?.id === o.id ? "var(--charcoal)" : "transparent",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700 }}>{o.name}</span>
                  <span className={`pill ${S[o.status] ?? "pill-gray"}`}>{o.status}</span>
                </div>
                <div style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 8 }}>{o.address || "—"}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div className="stat-bar" style={{ flex: 1 }}><div className="stat-bar-fill" style={{ width: `${o.progress ?? 0}%` }} /></div>
                  <span style={{ fontSize: 10, fontWeight: 800 }}>{o.progress ?? 0}%</span>
                </div>
                <div style={{ display: "flex", gap: 4, marginTop: 8 }} onClick={e => e.stopPropagation()}>
                  <button onClick={() => openEdit(o)} style={{ flex: 1, fontSize: 9, padding: "4px 0", background: "var(--charcoal)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 5, color: "rgba(255,255,255,.7)", cursor: "pointer", fontFamily: "inherit" }}>Editar</button>
                  <button onClick={() => handleDelete(o.id!)} style={{ flex: 1, fontSize: 9, padding: "4px 0", background: "rgba(164,22,26,.15)", border: "1px solid rgba(164,22,26,.3)", borderRadius: 5, color: "var(--red-accent)", cursor: "pointer", fontFamily: "inherit" }}>Excluir</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detalhe */}
        <div style={{ background: "var(--surface)", border: "2px solid var(--charcoal)", borderRadius: 12, boxShadow: "6px 6px 0 #000", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {!sel ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--muted)", gap: 8 }}>
              <div style={{ fontSize: 32, opacity: .2 }}>🏢</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.3)" }}>Selecione ou crie uma obra</div>
            </div>
          ) : (
            <>
              <div style={{ padding: "24px 26px 18px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ fontSize: 26, fontWeight: 900 }}>{sel.name}</div>
                  <span className={`pill ${S[sel.status] ?? "pill-gray"}`}>{sel.status}</span>
                </div>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>📍 {sel.address || "—"}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="stat-bar" style={{ width: 72 }}><div className="stat-bar-fill" style={{ width: `${sel.progress ?? 0}%` }} /></div>
                    <span style={{ fontSize: 11, fontWeight: 800 }}>{sel.progress ?? 0}%</span>
                  </div>
                </div>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px" }}>
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 14 }}>Estrutura Hierárquica</div>
                {renderTree(sel)}
              </div>
              <div style={{ padding: "14px 22px", borderTop: "1px solid var(--border)", display: "flex", gap: 8, flexShrink: 0 }}>
                <button onClick={() => setMini({ type: "pav" })} style={{ padding: "5px 12px", fontSize: 9, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", background: "var(--charcoal)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 5, color: "rgba(255,255,255,.7)", cursor: "pointer", fontFamily: "inherit" }}>+ Pavimento</button>
                <button onClick={() => setMini({ type: "anexo" })} style={{ padding: "5px 12px", fontSize: 9, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", background: "var(--charcoal)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 5, color: "rgba(255,255,255,.7)", cursor: "pointer", fontFamily: "inherit" }}>+ Anexo</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
