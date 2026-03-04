"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Obra, Pavimento, Apartamento, FvsModelo, FvsAplicada, FvsAplicadaItem, FvsAplicadaStatus } from "@/types";
import { getObras } from "@/services/obras.service";
import { getFvsModelos, createFvsModelo, updateFvsModelo, deleteFvsModelo } from "@/services/fvsModelos.service";
import { getFvsAplicadasByApt, applyModeloToApartamento, updateFvsAplicada, deleteFvsAplicada } from "@/services/fvsAplicadas.service";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useUserRole } from "@/hooks/useUserRole";
import PageTransition from "@/components/PageTransition";
import { SkeletonCard } from "@/components/Skeleton";

const CATEGORIES = ["Estrutura", "Alvenaria", "Revestimento", "Pintura", "Hidráulica", "Elétrica", "Esquadrias", "Cobertura", "Fundação", "Outro"];

const STATUS_COLOR: Record<FvsAplicadaStatus, string> = {
  pendente: "rgba(255,255,255,.18)",
  preenchida: "#eab308",
  aprovada: "#22c55e",
  reprovada: "var(--red-accent)",
};
const STATUS_LABEL: Record<FvsAplicadaStatus, string> = {
  pendente: "Pendente",
  preenchida: "Preenchida",
  aprovada: "Aprovada",
  reprovada: "Reprovada",
};

const APT_STATUS_COLOR: Record<string, string> = {
  pendente: "rgba(255,255,255,.18)", aprovado: "#22c55e", reprovado: "var(--red-accent)",
};

export default function FvsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { role, isAdminOrDev } = useUserRole();

  const [obras, setObras] = useState<Obra[]>([]);
  const [modelos, setModelos] = useState<FvsModelo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selObraId, setSelObraId] = useState<string | null>(null);
  const [selPavId, setSelPavId] = useState<string | null>(null);

  // Modal states
  const [selApt, setSelApt] = useState<Apartamento | null>(null);
  const [aptFvs, setAptFvs] = useState<FvsAplicada[]>([]);
  const [aptFvsLoading, setAptFvsLoading] = useState(false);
  const [showAptModal, setShowAptModal] = useState(false);

  // Checklist fill modal
  const [fillFvs, setFillFvs] = useState<FvsAplicada | null>(null);

  // Apply modelo modal
  const [showApplyModal, setShowApplyModal] = useState(false);

  // Manage modelos modal
  const [showModelosModal, setShowModelosModal] = useState(false);
  const [modeloForm, setModeloForm] = useState({ titulo: "", codigo: "", categoria: "Estrutura", descricao: "", criterio: "", itensText: "" });
  const [editModeloId, setEditModeloId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [o, m] = await Promise.all([getObras(), getFvsModelos()]);
    setObras(o);
    setModelos(m);
    if (o.length > 0 && !selObraId) setSelObraId(o[0].id ?? null);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const selObra = obras.find(o => o.id === selObraId) ?? null;
  const pavimentos = selObra?.pavimentos ?? [];
  const selPav = pavimentos.find(p => p.id === selPavId) ?? pavimentos[0] ?? null;

  // Open apartment → load FVS aplicadas
  async function openApt(apt: Apartamento) {
    if (!selObra?.id || !selPav) return;
    setSelApt(apt);
    setAptFvsLoading(true);
    setShowAptModal(true);
    setFillFvs(null);
    const fvs = await getFvsAplicadasByApt(selObra.id, selPav.id, apt.id);
    setAptFvs(fvs);
    setAptFvsLoading(false);
  }

  // Apply a modelo
  async function handleApplyModelo(modelo: FvsModelo) {
    if (!selObra?.id || !selPav || !selApt) return;
    try {
      await applyModeloToApartamento(modelo, selObra.id, selPav.id, selApt.id);
      addToast(`FVS "${modelo.titulo}" aplicada!`, "success");
      setShowApplyModal(false);
      // Reload
      const fvs = await getFvsAplicadasByApt(selObra.id, selPav.id, selApt.id);
      setAptFvs(fvs);
    } catch {
      addToast("Erro ao aplicar modelo", "error");
    }
  }

  // Fill FVS checklist
  function openFill(fvs: FvsAplicada) {
    setFillFvs({ ...fvs, itens: fvs.itens.map(i => ({ ...i })) });
  }

  function setItemConforme(idx: number, val: boolean | null) {
    if (!fillFvs) return;
    const itens = fillFvs.itens.map((item, i) => i === idx ? { ...item, conforme: val } : item);
    setFillFvs({ ...fillFvs, itens });
  }

  function setItemObs(idx: number, obs: string) {
    if (!fillFvs) return;
    const itens = fillFvs.itens.map((item, i) => i === idx ? { ...item, observacao: obs } : item);
    setFillFvs({ ...fillFvs, itens });
  }

  async function saveFill() {
    if (!fillFvs?.id || !user) return;
    const allFilled = fillFvs.itens.every(i => i.conforme !== null);
    const status: FvsAplicadaStatus = allFilled ? "preenchida" : "pendente";
    try {
      await updateFvsAplicada(fillFvs.id, {
        itens: fillFvs.itens,
        status,
        preenchidoPor: user.uid,
        dataPreenchimento: new Date().toISOString(),
      });
      addToast("FVS salva!", "success");
      setFillFvs(null);
      if (selObra?.id && selPav && selApt) {
        const fvs = await getFvsAplicadasByApt(selObra.id, selPav.id, selApt.id);
        setAptFvs(fvs);
      }
    } catch {
      addToast("Erro ao salvar", "error");
    }
  }

  async function handleApproveFvs(fvsId: string, approve: boolean) {
    if (!user) return;
    try {
      await updateFvsAplicada(fvsId, {
        status: approve ? "aprovada" : "reprovada",
        aprovadoPor: user.uid,
      });
      addToast(approve ? "FVS aprovada!" : "FVS reprovada!", approve ? "success" : "warning");
      if (selObra?.id && selPav && selApt) {
        const fvs = await getFvsAplicadasByApt(selObra.id, selPav.id, selApt.id);
        setAptFvs(fvs);
      }
    } catch {
      addToast("Erro ao aprovar/reprovar", "error");
    }
  }

  async function handleDeleteFvsAplicada(id: string) {
    if (!confirm("Excluir esta FVS aplicada?")) return;
    try {
      await deleteFvsAplicada(id);
      setAptFvs(prev => prev.filter(f => f.id !== id));
      addToast("FVS excluída", "success");
    } catch {
      addToast("Erro ao excluir", "error");
    }
  }

  // ── Modelos CRUD ──
  function openCreateModelo() {
    setEditModeloId(null);
    setModeloForm({ titulo: "", codigo: `FVS-${String(modelos.length + 1).padStart(3, "0")}`, categoria: "Estrutura", descricao: "", criterio: "", itensText: "" });
  }
  function openEditModelo(m: FvsModelo) {
    setEditModeloId(m.id!);
    setModeloForm({ titulo: m.titulo, codigo: m.codigo, categoria: m.categoria, descricao: m.descricao ?? "", criterio: m.criterio ?? "", itensText: m.itensVerificacao.join("\n") });
  }
  async function saveModelo() {
    if (!modeloForm.titulo.trim() || !modeloForm.codigo.trim()) return;
    const itensVerificacao = modeloForm.itensText.split("\n").map(s => s.trim()).filter(Boolean);
    try {
      if (editModeloId) {
        await updateFvsModelo(editModeloId, { titulo: modeloForm.titulo, codigo: modeloForm.codigo, categoria: modeloForm.categoria, descricao: modeloForm.descricao || undefined, criterio: modeloForm.criterio || undefined, itensVerificacao }, role);
      } else {
        await createFvsModelo({ titulo: modeloForm.titulo, codigo: modeloForm.codigo, categoria: modeloForm.categoria, descricao: modeloForm.descricao || undefined, criterio: modeloForm.criterio || undefined, itensVerificacao, criadoPor: user!.uid }, role);
      }
      addToast(editModeloId ? "Modelo atualizado!" : "Modelo criado!", "success");
      const m = await getFvsModelos();
      setModelos(m);
      setEditModeloId(null);
      setModeloForm({ titulo: "", codigo: "", categoria: "Estrutura", descricao: "", criterio: "", itensText: "" });
    } catch {
      addToast("Erro ao salvar modelo", "error");
    }
  }
  async function handleDeleteModelo(id: string) {
    if (!confirm("Excluir modelo?")) return;
    try {
      await deleteFvsModelo(id, role);
      setModelos(prev => prev.filter(m => m.id !== id));
      addToast("Modelo excluído", "success");
    } catch {
      addToast("Erro ao excluir", "error");
    }
  }

  return (
    <PageTransition>
      <div style={{ flex: 1, overflowY: "auto", padding: "36px 40px 48px" }} className="dot-grid">
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <div className="section-label" style={{ marginBottom: 6 }}>QUALIDADE</div>
            <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-.02em" }}>FVS — Fichas de Verificação</h1>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.35)", marginTop: 4 }}>Selecione um apartamento para gerenciar as fichas</div>
          </div>
          {isAdminOrDev && (
            <button className="btn-primary" onClick={() => setShowModelosModal(true)}>Gerenciar Modelos</button>
          )}
        </div>

        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 20 }}>
            <SkeletonCard /><SkeletonCard />
          </div>
        )}

        {!loading && obras.length === 0 && (
          <div className="card" style={{ padding: 56, textAlign: "center" }}>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.3)" }}>Cadastre obras com pavimentos e apartamentos</div>
          </div>
        )}

        {!loading && obras.length > 0 && (
          <>
            {/* Obra tabs */}
            <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
              {obras.map(o => (
                <button key={o.id} onClick={() => { setSelObraId(o.id!); setSelPavId(null); }} style={{
                  padding: "5px 14px", fontSize: 9, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase",
                  background: selObraId === o.id ? "var(--red-accent)" : "var(--charcoal)",
                  border: `1.5px solid ${selObraId === o.id ? "var(--red-accent)" : "rgba(255,255,255,.08)"}`,
                  color: selObraId === o.id ? "#fff" : "rgba(255,255,255,.4)", cursor: "pointer", fontFamily: "inherit",
                  boxShadow: selObraId === o.id ? "3px 3px 0 #000" : "none",
                }}>{o.name}</button>
              ))}
            </div>

            {selObra && (
              <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 20 }}>
                {/* Sidebar pavimentos */}
                <div className="card" style={{ overflow: "hidden" }}>
                  <div style={{ padding: "14px 16px", borderBottom: "2px solid #000" }}>
                    <div className="section-label">Pavimentos</div>
                  </div>
                  <div style={{ padding: 6 }}>
                    {pavimentos.length === 0 && (
                      <div style={{ padding: 20, fontSize: 11, color: "rgba(255,255,255,.25)", textAlign: "center" }}>Nenhum</div>
                    )}
                    {pavimentos.map(pav => {
                      const active = selPav?.id === pav.id || (!selPavId && pav.id === pavimentos[0]?.id);
                      return (
                        <div key={pav.id} onClick={() => setSelPavId(pav.id)} style={{
                          padding: "10px 12px", cursor: "pointer", marginBottom: 2,
                          borderLeft: `3px solid ${active ? "var(--red-accent)" : "transparent"}`,
                          background: active ? "var(--charcoal)" : "transparent",
                        }}>
                          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{pav.name}</div>
                          <div style={{ fontSize: 9, color: "rgba(255,255,255,.3)" }}>{pav.apts.length} apts</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Apartment grid */}
                <div className="card" style={{ overflow: "hidden" }}>
                  {!selPav ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: "rgba(255,255,255,.25)", fontSize: 12 }}>
                      Selecione um pavimento
                    </div>
                  ) : (
                    <>
                      <div style={{ padding: "16px 20px", borderBottom: "2px solid #000", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div className="section-label" style={{ marginBottom: 2 }}>Pavimento</div>
                          <div style={{ fontSize: 16, fontWeight: 900 }}>{selPav.name}</div>
                        </div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)" }}>{selPav.apts.length} apartamentos</div>
                      </div>
                      <div style={{ padding: "18px 20px" }}>
                        {selPav.apts.length === 0 && (
                          <div style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,.25)", fontSize: 12 }}>Nenhum apartamento</div>
                        )}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
                          {selPav.apts.map((apt, i) => (
                            <motion.div
                              key={apt.id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.2, delay: i * 0.03 }}
                              whileHover={{ scale: 1.03, y: -2 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => openApt(apt)}
                              className="card"
                              style={{
                                padding: "14px 12px", cursor: "pointer", textAlign: "center",
                                borderColor: APT_STATUS_COLOR[apt.status],
                                boxShadow: `6px 6px 0 #000${apt.status !== "pendente" ? `, 0 0 8px ${APT_STATUS_COLOR[apt.status]}33` : ""}`,
                                transition: "box-shadow .15s ease",
                              }}
                              onMouseEnter={e => { e.currentTarget.style.boxShadow = `8px 8px 0 #000, 0 0 14px ${APT_STATUS_COLOR[apt.status]}55`; }}
                              onMouseLeave={e => { e.currentTarget.style.boxShadow = `6px 6px 0 #000${apt.status !== "pendente" ? `, 0 0 8px ${APT_STATUS_COLOR[apt.status]}33` : ""}`; }}
                            >
                              <div style={{ fontSize: 11, fontWeight: 800, marginBottom: 4 }}>{apt.name}</div>
                              <span className={`pill pill-${apt.status === "aprovado" ? "green" : apt.status === "reprovado" ? "red" : "gray"}`}>
                                <span className="pill-dot" />{apt.status}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* ══════ MODAL: FVS do Apartamento ══════ */}
        <AnimatePresence>
          {showAptModal && selApt && (
            <motion.div
              onClick={e => { if (e.target === e.currentTarget) { setShowAptModal(false); setFillFvs(null); } }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.88)", zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.175, 0.885, 0.32, 1.275] }}
                style={{ background: "var(--surface)", border: "2px solid var(--border-hard)", boxShadow: "10px 10px 0 #000", width: 650, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column" }}
              >
                {/* Header */}
                <div style={{ padding: "20px 24px", borderBottom: "2px solid #000", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div className="section-label" style={{ marginBottom: 4 }}>FVS — {selApt.name}</div>
                    <div style={{ fontSize: 16, fontWeight: 900 }}>Fichas de Verificação</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn-primary" onClick={() => setShowApplyModal(true)} style={{ fontSize: 10, padding: "6px 14px" }}>+ Aplicar Modelo</button>
                    <button onClick={() => { setShowAptModal(false); setFillFvs(null); }} style={{
                      width: 28, height: 28, background: "var(--charcoal)", border: "2px solid #000",
                      boxShadow: "2px 2px 0 #000", color: "white", cursor: "pointer", fontSize: 12, fontWeight: 900,
                    }}>✕</button>
                  </div>
                </div>

                <div style={{ flex: 1, overflowY: "auto" }}>
                  <AnimatePresence mode="wait">
                    {fillFvs ? (
                      /* ── Checklist Fill View ── */
                      <motion.div key="fill" initial={{ x: "100%", opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: "100%", opacity: 0 }} transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        style={{ padding: "20px 24px" }}>
                        <button onClick={() => setFillFvs(null)} style={{
                          display: "flex", alignItems: "center", gap: 6, marginBottom: 16,
                          background: "none", border: "none", cursor: "pointer",
                          fontSize: 10, fontWeight: 800, color: "var(--red-accent)",
                          letterSpacing: ".1em", textTransform: "uppercase", fontFamily: "inherit",
                        }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" strokeLinecap="square"/></svg>
                          Voltar
                        </button>

                        <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 2 }}>{fillFvs.modeloTitulo}</div>
                        <div className="section-label" style={{ marginBottom: 16 }}>{fillFvs.modeloCodigo}</div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {fillFvs.itens.map((item, i) => (
                            <div key={i} style={{
                              padding: "10px 14px",
                              background: item.conforme === true ? "rgba(34,197,94,.08)" : item.conforme === false ? "rgba(164,22,26,.08)" : "var(--charcoal)",
                              borderLeft: `3px solid ${item.conforme === true ? "#22c55e" : item.conforme === false ? "var(--red-accent)" : "rgba(255,255,255,.1)"}`,
                            }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                                <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.75)" }}>{item.texto}</span>
                                <div style={{ display: "flex", gap: 4 }}>
                                  {([true, null, false] as const).map(val => {
                                    const active = item.conforme === val;
                                    const label = val === true ? "C" : val === false ? "NC" : "—";
                                    const color = val === true ? "#22c55e" : val === false ? "var(--red-accent)" : "rgba(255,255,255,.3)";
                                    return (
                                      <button key={String(val)} onClick={() => setItemConforme(i, val)} style={{
                                        padding: "3px 10px", fontSize: 8, fontWeight: 800, letterSpacing: ".08em",
                                        background: active ? `${color}22` : "var(--charcoal)",
                                        border: `1.5px solid ${active ? color : "rgba(255,255,255,.06)"}`,
                                        color: active ? color : "rgba(255,255,255,.25)",
                                        cursor: "pointer", fontFamily: "inherit",
                                        boxShadow: active ? "2px 2px 0 #000" : "none",
                                      }}>{label}</button>
                                    );
                                  })}
                                </div>
                              </div>
                              {item.conforme === false && (
                                <input
                                  className="form-input"
                                  style={{ marginTop: 6, fontSize: 10, padding: "4px 8px" }}
                                  value={item.observacao ?? ""}
                                  onChange={e => setItemObs(i, e.target.value)}
                                  placeholder="Observação da não conformidade..."
                                />
                              )}
                            </div>
                          ))}
                        </div>

                        <div style={{ display: "flex", gap: 10, paddingTop: 18, marginTop: 16, borderTop: "2px solid #000" }}>
                          <button className="btn-ghost" onClick={() => setFillFvs(null)} style={{ flex: 1 }}>Cancelar</button>
                          <button className="btn-primary" onClick={saveFill} style={{ flex: 1 }}>Salvar</button>
                        </div>
                      </motion.div>
                    ) : (
                      /* ── FVS List View ── */
                      <motion.div key="list" initial={{ x: "-100%", opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: "-100%", opacity: 0 }} transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        style={{ padding: "20px 24px" }}>
                        {aptFvsLoading && <div style={{ fontSize: 12, color: "rgba(255,255,255,.3)", padding: 20, textAlign: "center" }}>Carregando...</div>}

                        {!aptFvsLoading && aptFvs.length === 0 && (
                          <div style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,.25)" }}>
                            <div style={{ fontSize: 12, marginBottom: 8 }}>Nenhuma FVS aplicada a este apartamento</div>
                            <div style={{ fontSize: 10 }}>Clique em "Aplicar Modelo" para adicionar</div>
                          </div>
                        )}

                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {aptFvs.map((fvs, i) => {
                            const filled = fvs.itens.filter(it => it.conforme !== null).length;
                            const total = fvs.itens.length;
                            const pct = total > 0 ? Math.round((filled / total) * 100) : 0;
                            return (
                              <motion.div
                                key={fvs.id}
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2, delay: i * 0.05 }}
                                style={{
                                  padding: "14px 18px",
                                  background: `${STATUS_COLOR[fvs.status]}11`,
                                  border: `2px solid ${STATUS_COLOR[fvs.status]}`,
                                  boxShadow: "4px 4px 0 #000",
                                }}
                              >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                                  <div>
                                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase", color: "rgba(255,255,255,.4)", marginBottom: 2 }}>{fvs.modeloCodigo}</div>
                                    <div style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,.85)" }}>{fvs.modeloTitulo}</div>
                                  </div>
                                  <span className={`pill pill-${fvs.status === "aprovada" ? "green" : fvs.status === "reprovada" ? "red" : fvs.status === "preenchida" ? "yellow" : "gray"}`}>
                                    {STATUS_LABEL[fvs.status]}
                                  </span>
                                </div>

                                {total > 0 && (
                                  <div style={{ marginBottom: 10 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                      <span style={{ fontSize: 9, color: "rgba(255,255,255,.3)" }}>Preenchimento</span>
                                      <span style={{ fontSize: 9, fontWeight: 800 }}>{filled}/{total} ({pct}%)</span>
                                    </div>
                                    <div className="stat-bar"><div className="stat-bar-fill" style={{ width: `${pct}%` }} /></div>
                                  </div>
                                )}

                                <div style={{ display: "flex", gap: 6 }}>
                                  <button onClick={() => openFill(fvs)} style={{
                                    flex: 1, fontSize: 9, padding: "5px 0", fontWeight: 700,
                                    background: "var(--charcoal)", border: "1px solid rgba(255,255,255,.1)",
                                    color: "rgba(255,255,255,.7)", cursor: "pointer", fontFamily: "inherit",
                                  }}>Preencher</button>
                                  {isAdminOrDev && fvs.status === "preenchida" && (
                                    <>
                                      <button onClick={() => handleApproveFvs(fvs.id!, true)} style={{
                                        flex: 1, fontSize: 9, padding: "5px 0", fontWeight: 700,
                                        background: "rgba(34,197,94,.15)", border: "1px solid rgba(34,197,94,.3)",
                                        color: "#22c55e", cursor: "pointer", fontFamily: "inherit",
                                      }}>Aprovar</button>
                                      <button onClick={() => handleApproveFvs(fvs.id!, false)} style={{
                                        flex: 1, fontSize: 9, padding: "5px 0", fontWeight: 700,
                                        background: "rgba(164,22,26,.15)", border: "1px solid rgba(164,22,26,.3)",
                                        color: "var(--red-accent)", cursor: "pointer", fontFamily: "inherit",
                                      }}>Reprovar</button>
                                    </>
                                  )}
                                  {isAdminOrDev && (
                                    <button onClick={() => handleDeleteFvsAplicada(fvs.id!)} style={{
                                      fontSize: 9, padding: "5px 10px", fontWeight: 700,
                                      background: "rgba(164,22,26,.1)", border: "1px solid rgba(164,22,26,.2)",
                                      color: "var(--red-accent)", cursor: "pointer", fontFamily: "inherit",
                                    }}>✕</button>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════ MODAL: Aplicar Modelo ══════ */}
        <AnimatePresence>
          {showApplyModal && (
            <motion.div
              onClick={e => { if (e.target === e.currentTarget) setShowApplyModal(false); }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.88)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                style={{ background: "var(--surface)", border: "2px solid var(--border-hard)", boxShadow: "10px 10px 0 #000", width: 480, maxHeight: "80vh", overflow: "hidden", display: "flex", flexDirection: "column" }}
              >
                <div style={{ padding: "20px 24px", borderBottom: "2px solid #000", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 900 }}>Aplicar Modelo FVS</div>
                  <button onClick={() => setShowApplyModal(false)} style={{ width: 28, height: 28, background: "var(--charcoal)", border: "2px solid #000", boxShadow: "2px 2px 0 #000", color: "white", cursor: "pointer", fontSize: 12, fontWeight: 900 }}>✕</button>
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
                  {modelos.length === 0 && (
                    <div style={{ textAlign: "center", padding: 30, color: "rgba(255,255,255,.25)", fontSize: 12 }}>
                      Nenhum modelo criado. Peça ao admin para criar modelos.
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {modelos.map(m => (
                      <div key={m.id} onClick={() => handleApplyModelo(m)} style={{
                        padding: "14px 16px", cursor: "pointer",
                        background: "var(--charcoal)", border: "2px solid rgba(255,255,255,.08)",
                        boxShadow: "4px 4px 0 #000",
                        transition: "transform .1s, box-shadow .1s",
                      }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "translate(-2px,-2px)"; e.currentTarget.style.boxShadow = "6px 6px 0 #000"; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "4px 4px 0 #000"; }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".15em", color: "rgba(255,255,255,.35)", marginBottom: 2 }}>{m.codigo} · {m.categoria}</div>
                            <div style={{ fontSize: 13, fontWeight: 800 }}>{m.titulo}</div>
                          </div>
                          <div style={{ fontSize: 9, color: "rgba(255,255,255,.3)" }}>{m.itensVerificacao.length} itens</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════ MODAL: Gerenciar Modelos (admin) ══════ */}
        <AnimatePresence>
          {showModelosModal && (
            <motion.div
              onClick={e => { if (e.target === e.currentTarget) setShowModelosModal(false); }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.88)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                style={{ background: "var(--surface)", border: "2px solid var(--border-hard)", boxShadow: "10px 10px 0 #000", width: 600, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column" }}
              >
                <div style={{ padding: "20px 24px", borderBottom: "2px solid #000", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 900 }}>Modelos FVS</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn-primary" onClick={openCreateModelo} style={{ fontSize: 10, padding: "6px 14px" }}>+ Novo Modelo</button>
                    <button onClick={() => setShowModelosModal(false)} style={{ width: 28, height: 28, background: "var(--charcoal)", border: "2px solid #000", boxShadow: "2px 2px 0 #000", color: "white", cursor: "pointer", fontSize: 12, fontWeight: 900 }}>✕</button>
                  </div>
                </div>

                <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
                  {/* Form */}
                  {(modeloForm.titulo || editModeloId !== null) && (
                    <div style={{ marginBottom: 20, padding: 16, background: "var(--charcoal)", border: "2px solid rgba(255,255,255,.08)" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                        <div>
                          <label className="form-label">Código</label>
                          <input className="form-input" value={modeloForm.codigo} onChange={e => setModeloForm(p => ({ ...p, codigo: e.target.value }))} placeholder="FVS-001" />
                        </div>
                        <div>
                          <label className="form-label">Categoria</label>
                          <select className="form-select" value={modeloForm.categoria} onChange={e => setModeloForm(p => ({ ...p, categoria: e.target.value }))}>
                            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>
                      <div style={{ marginBottom: 10 }}>
                        <label className="form-label">Título</label>
                        <input className="form-input" value={modeloForm.titulo} onChange={e => setModeloForm(p => ({ ...p, titulo: e.target.value }))} placeholder="Ex: Verificação de Fôrmas" />
                      </div>
                      <div style={{ marginBottom: 10 }}>
                        <label className="form-label">Critério de Aceitação</label>
                        <textarea className="form-textarea" rows={2} value={modeloForm.criterio} onChange={e => setModeloForm(p => ({ ...p, criterio: e.target.value }))} placeholder="Critério..." />
                      </div>
                      <div style={{ marginBottom: 10 }}>
                        <label className="form-label">Itens de Verificação (um por linha)</label>
                        <textarea className="form-textarea" rows={4} value={modeloForm.itensText} onChange={e => setModeloForm(p => ({ ...p, itensText: e.target.value }))} placeholder={"Fundações\nPilares\nVigas\nLajes"} />
                      </div>
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button className="btn-ghost" onClick={() => { setEditModeloId(null); setModeloForm({ titulo: "", codigo: "", categoria: "Estrutura", descricao: "", criterio: "", itensText: "" }); }}>Cancelar</button>
                        <button className="btn-primary" onClick={saveModelo}>{editModeloId ? "Salvar" : "Criar"}</button>
                      </div>
                    </div>
                  )}

                  {/* List */}
                  {modelos.length === 0 && !modeloForm.titulo && (
                    <div style={{ textAlign: "center", padding: 30, color: "rgba(255,255,255,.25)", fontSize: 12 }}>
                      Nenhum modelo. Clique em "+ Novo Modelo" para criar.
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {modelos.map(m => (
                      <div key={m.id} style={{
                        padding: "14px 16px", background: "var(--charcoal)", border: "2px solid rgba(255,255,255,.06)", boxShadow: "4px 4px 0 #000",
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".15em", color: "rgba(255,255,255,.35)", marginBottom: 2 }}>{m.codigo} · {m.categoria}</div>
                            <div style={{ fontSize: 13, fontWeight: 800 }}>{m.titulo}</div>
                            <div style={{ fontSize: 9, color: "rgba(255,255,255,.25)", marginTop: 2 }}>{m.itensVerificacao.length} itens</div>
                          </div>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => openEditModelo(m)} style={{
                              fontSize: 9, padding: "4px 10px", fontWeight: 700,
                              background: "var(--surface)", border: "1px solid rgba(255,255,255,.1)",
                              color: "rgba(255,255,255,.6)", cursor: "pointer", fontFamily: "inherit",
                            }}>Editar</button>
                            <button onClick={() => handleDeleteModelo(m.id!)} style={{
                              fontSize: 9, padding: "4px 10px", fontWeight: 700,
                              background: "rgba(164,22,26,.1)", border: "1px solid rgba(164,22,26,.2)",
                              color: "var(--red-accent)", cursor: "pointer", fontFamily: "inherit",
                            }}>Excluir</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
