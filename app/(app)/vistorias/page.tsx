"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Obra, Pavimento, Apartamento } from "@/types";
import { getObras, updateApartamento } from "@/services/obras.service";
import { createVistoria } from "@/services/vistorias.service";
import { getChecklistByScope } from "@/services/checklists.service";
import { createLog } from "@/services/logs.service";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { ChecklistItem, ScopeResult, ScopeItemResult, ScopeStatus } from "@/types/vistoria";
import PageTransition from "@/components/PageTransition";
import { SkeletonCard } from "@/components/Skeleton";

const SCOPES = ["Estrutura", "Vedação", "Hidráulica", "Elétrica", "Acabamento"] as const;
type Scope = typeof SCOPES[number];

const STATUS_STYLES: Record<ScopeStatus, { bg: string; border: string; color: string; label: string }> = {
  conforme:      { bg: "rgba(34,197,94,.12)",  border: "#22c55e", color: "#22c55e", label: "Conforme" },
  atencao:       { bg: "rgba(234,179,8,.10)",   border: "#eab308", color: "#eab308", label: "Atenção" },
  nao_conforme:  { bg: "rgba(164,22,26,.12)",   border: "var(--red-accent)", color: "var(--red-accent)", label: "Não Conforme" },
  pendente:      { bg: "var(--charcoal)",        border: "rgba(255,255,255,.1)", color: "rgba(255,255,255,.3)", label: "Pendente" },
};

const APT_STATUS_COLOR: Record<string, string> = {
  pendente: "rgba(255,255,255,.18)", aprovado: "#22c55e", reprovado: "var(--red-accent)",
};

const DEFAULT_ITEMS: Record<Scope, string[]> = {
  Estrutura:   ["Fundações", "Pilares", "Vigas", "Lajes", "Escadas"],
  Vedação:     ["Alvenaria", "Esquadrias", "Impermeabilização", "Revestimento externo"],
  Hidráulica:  ["Tubulação água fria", "Tubulação água quente", "Esgoto", "Registros"],
  Elétrica:    ["Fiação", "Quadro de distribuição", "Tomadas", "Iluminação", "Aterramento"],
  Acabamento:  ["Pintura", "Piso", "Rodapé", "Louças sanitárias", "Metais"],
};

export default function VistoriasPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [obras, setObras]         = useState<Obra[]>([]);
  const [loading, setLoading]     = useState(true);
  const [selObraId, setSelObraId] = useState<string | null>(null);
  const [selPavId, setSelPavId]   = useState<string | null>(null);
  const [selApt, setSelApt]       = useState<Apartamento | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [activeScope, setActiveScope] = useState<Scope | null>(null);
  const [scopeResults, setScopeResults] = useState<Record<string, ScopeResult>>({});
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [itemResults, setItemResults] = useState<Record<string, ScopeItemResult>>({});
  const [obs, setObs] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getObras();
    setObras(data);
    if (data.length > 0 && !selObraId) setSelObraId(data[0].id ?? null);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const selObra = obras.find(o => o.id === selObraId) ?? null;
  const pavimentos = selObra?.pavimentos ?? [];
  const selPav = pavimentos.find(p => p.id === selPavId) ?? pavimentos[0] ?? null;

  function openVistoria(apt: Apartamento) {
    setSelApt(apt);
    setScopeResults({});
    setActiveScope(null);
    setObs("");
    setShowModal(true);
  }

  async function openScope(scope: Scope) {
    try {
      const template = await getChecklistByScope(scope);
      const items = template?.items ?? DEFAULT_ITEMS[scope].map((text, i) => ({ id: `${scope}-${i}`, text }));
      setChecklistItems(items);

      const prev = scopeResults[scope];
      if (prev) {
        const resMap: Record<string, ScopeItemResult> = {};
        prev.items.forEach(ir => { resMap[ir.itemId] = ir; });
        setItemResults(resMap);
      } else {
        setItemResults({});
      }

      setActiveScope(scope);
    } catch (e) {
      console.error("Erro ao carregar checklist:", e);
      addToast("Erro ao carregar checklist", "error");
    }
  }

  function setItemStatus(itemId: string, status: ScopeStatus) {
    setItemResults(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], itemId, status },
    }));
  }

  function saveScope() {
    if (!activeScope) return;
    const items = checklistItems.map(ci => itemResults[ci.id] ?? { itemId: ci.id, status: "pendente" as ScopeStatus });
    const hasNc = items.some(i => i.status === "nao_conforme");
    const hasAtencao = items.some(i => i.status === "atencao");
    const allConforme = items.every(i => i.status === "conforme");

    const scopeStatus: ScopeStatus = hasNc ? "nao_conforme" : hasAtencao ? "atencao" : allConforme ? "conforme" : "pendente";

    setScopeResults(prev => ({
      ...prev,
      [activeScope]: { scope: activeScope, items, status: scopeStatus },
    }));
    setActiveScope(null);
  }

  async function concludeVistoria(status: "aprovado" | "reprovado") {
    if (!selObra?.id || !selApt || !user) return;
    const today = new Date().toISOString().slice(0, 10);

    await createVistoria({
      obraId: selObra.id,
      pavimentoId: selPav?.id ?? "",
      apartamentoId: selApt.id,
      scopes: scopeResults,
      observation: obs,
      status,
      dataVistoria: today,
      createdBy: user.uid,
    });

    await updateApartamento(selObra.id, selObra.pavimentos, selApt.id, {
      status,
      dataVistoria: today,
    });

    await createLog({
      userId: user.uid,
      userEmail: user.email ?? "",
      action: "create",
      target: "vistoria",
      targetId: selApt.id,
      details: `Vistoria ${status}: ${selApt.name} em ${selObra.name}`,
    });

    addToast(`Vistoria ${status === "aprovado" ? "aprovada" : "reprovada"}!`, status === "aprovado" ? "success" : "warning");
    setShowModal(false);
    await load();
  }

  const allScopesCompleted = SCOPES.every(s => scopeResults[s]?.status && scopeResults[s].status !== "pendente");
  const anyNonConforme = SCOPES.some(s => scopeResults[s]?.status === "nao_conforme");
  const allConforme = SCOPES.every(s => scopeResults[s]?.status === "conforme");

  const aptsByStatus = (pav: Pavimento) => ({
    aprovado:  pav.apts.filter(a => a.status === "aprovado").length,
    reprovado: pav.apts.filter(a => a.status === "reprovado").length,
    pendente:  pav.apts.filter(a => a.status === "pendente").length,
  });

  return (
    <PageTransition>
      <div style={{ flex: 1, overflowY: "auto", padding: "36px 40px 48px" }} className="dot-grid">
        <div style={{ marginBottom: 28 }}>
          <div className="section-label" style={{ marginBottom: 6 }}>INSPEÇÃO</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-.02em" }}>Vistorias</h1>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.35)", marginTop: 4 }}>Selecione um apartamento para realizar a vistoria</div>
        </div>

        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 20 }}>
            <SkeletonCard /><SkeletonCard />
          </div>
        )}

        {!loading && obras.length === 0 && (
          <div className="card" style={{ padding: 56, textAlign: "center" }}>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.3)" }}>Cadastre obras com pavimentos e apartamentos para realizar vistorias</div>
          </div>
        )}

        {!loading && obras.length > 0 && (
          <>
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
                <div className="card" style={{ overflow: "hidden" }}>
                  <div style={{ padding: "14px 16px", borderBottom: "2px solid #000" }}>
                    <div className="section-label">Pavimentos</div>
                  </div>
                  <div style={{ padding: 6 }}>
                    {pavimentos.length === 0 && (
                      <div style={{ padding: 20, fontSize: 11, color: "rgba(255,255,255,.25)", textAlign: "center" }}>Nenhum</div>
                    )}
                    {pavimentos.map(pav => {
                      const s = aptsByStatus(pav);
                      const active = selPav?.id === pav.id || (!selPavId && pav.id === pavimentos[0]?.id);
                      return (
                        <div key={pav.id} onClick={() => setSelPavId(pav.id)} style={{
                          padding: "10px 12px", cursor: "pointer", marginBottom: 2,
                          borderLeft: `3px solid ${active ? "var(--red-accent)" : "transparent"}`,
                          background: active ? "var(--charcoal)" : "transparent",
                        }}>
                          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{pav.name}</div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <span className="pill pill-green" style={{ fontSize: 7 }}>{s.aprovado}</span>
                            <span className="pill pill-red" style={{ fontSize: 7 }}>{s.reprovado}</span>
                            <span className="pill pill-gray" style={{ fontSize: 7 }}>{s.pendente}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

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
                        <div style={{ display: "flex", gap: 14 }}>
                          {(["aprovado", "reprovado", "pendente"] as const).map(st => (
                            <div key={st} style={{ textAlign: "center" }}>
                              <div style={{ fontSize: 18, fontWeight: 900, color: APT_STATUS_COLOR[st] }}>
                                {selPav.apts.filter(a => a.status === st).length}
                              </div>
                              <div style={{ fontSize: 8, color: "rgba(255,255,255,.25)", textTransform: "capitalize" }}>{st}</div>
                            </div>
                          ))}
                        </div>
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
                              onClick={() => openVistoria(apt)}
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
                              {apt.dataVistoria && <div style={{ fontSize: 8, color: "rgba(255,255,255,.15)", marginTop: 4 }}>{apt.dataVistoria}</div>}
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

        {/* Modal de Vistoria */}
        <AnimatePresence>
          {showModal && selApt && (
            <motion.div
              onClick={e => { if (e.target === e.currentTarget) { setShowModal(false); setActiveScope(null); } }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "fixed", inset: 0, background: "rgba(0,0,0,.88)", zIndex: 9998,
                display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
              }}
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.175, 0.885, 0.32, 1.275] }}
                style={{
                  background: "var(--surface)", border: "2px solid var(--border-hard)",
                  boxShadow: "10px 10px 0 #000", width: 600, maxHeight: "90vh",
                  overflow: "hidden", display: "flex", flexDirection: "column",
                }}
              >
                <div style={{ padding: "20px 24px", borderBottom: "2px solid #000", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div className="section-label" style={{ marginBottom: 4 }}>VISTORIA</div>
                    <div style={{ fontSize: 18, fontWeight: 900 }}>{selApt.name}</div>
                  </div>
                  <button onClick={() => { setShowModal(false); setActiveScope(null); }} style={{
                    width: 28, height: 28, background: "var(--charcoal)", border: "2px solid #000",
                    boxShadow: "2px 2px 0 #000", color: "white", cursor: "pointer", fontSize: 12, fontWeight: 900,
                  }}>✕</button>
                </div>

                <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
                  <AnimatePresence mode="wait">
                    {!activeScope ? (
                      <motion.div
                        key="scopes"
                        initial={{ x: "-100%", opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: "-100%", opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        style={{ padding: "20px 24px", overflowY: "auto", maxHeight: "calc(90vh - 180px)" }}
                      >
                        <div className="section-label" style={{ marginBottom: 14 }}>ESCOPOS DE VERIFICAÇÃO</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {SCOPES.map((scope, i) => {
                            const result = scopeResults[scope];
                            const st = result?.status ?? "pendente";
                            const sty = STATUS_STYLES[st];
                            return (
                              <motion.button
                                key={scope}
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2, delay: i * 0.05 }}
                                onClick={() => openScope(scope)}
                                style={{
                                  display: "flex", alignItems: "center", justifyContent: "space-between",
                                  padding: "14px 18px", width: "100%", textAlign: "left",
                                  background: sty.bg, border: `2px solid ${sty.border}`,
                                  boxShadow: "4px 4px 0 #000", cursor: "pointer", fontFamily: "inherit",
                                  transition: "transform .1s, box-shadow .1s",
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = "translate(-2px,-2px)"; e.currentTarget.style.boxShadow = "6px 6px 0 #000"; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "4px 4px 0 #000"; }}
                              >
                                <div>
                                  <div style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,.85)" }}>{scope}</div>
                                  {result && (
                                    <div style={{ fontSize: 9, color: sty.color, marginTop: 2, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}>
                                      {sty.label} · {result.items.filter(x => x.status === "conforme").length}/{result.items.length} itens
                                    </div>
                                  )}
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  {result && <div style={{ width: 8, height: 8, background: sty.color, boxShadow: `0 0 6px ${sty.color}` }} />}
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={sty.color} strokeWidth="2.5">
                                    <path d="M9 18l6-6-6-6" strokeLinecap="square"/>
                                  </svg>
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>

                        <div style={{ marginTop: 20 }}>
                          <label className="form-label">Observações Gerais</label>
                          <textarea className="form-textarea" rows={3} value={obs} onChange={e => setObs(e.target.value)} placeholder="Registre observações..." />
                        </div>

                        <div style={{ display: "flex", gap: 10, paddingTop: 18, marginTop: 10, borderTop: "2px solid #000" }}>
                          <button className="btn-ghost" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancelar</button>
                          <button onClick={() => concludeVistoria("reprovado")} disabled={!allScopesCompleted} className="btn-primary"
                            style={{ flex: 1, background: anyNonConforme ? "var(--red-accent)" : "var(--charcoal)", opacity: allScopesCompleted ? 1 : 0.35 }}>
                            Reprovar
                          </button>
                          <button onClick={() => concludeVistoria("aprovado")} disabled={!allConforme} className="btn-primary"
                            style={{ flex: 1, background: allConforme ? "#22c55e" : "var(--charcoal)", opacity: allConforme ? 1 : 0.35 }}>
                            Aprovar
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key={`checklist-${activeScope}`}
                        initial={{ x: "100%", opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: "100%", opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        style={{ padding: "20px 24px", overflowY: "auto", maxHeight: "calc(90vh - 180px)" }}
                      >
                        <button onClick={saveScope} style={{
                          display: "flex", alignItems: "center", gap: 6, marginBottom: 16,
                          background: "none", border: "none", cursor: "pointer",
                          fontSize: 10, fontWeight: 800, color: "var(--red-accent)",
                          letterSpacing: ".1em", textTransform: "uppercase", fontFamily: "inherit",
                        }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M15 18l-6-6 6-6" strokeLinecap="square"/>
                          </svg>
                          Voltar aos Escopos
                        </button>

                        <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 4 }}>{activeScope}</div>
                        <div className="section-label" style={{ marginBottom: 16 }}>CHECKLIST DE VERIFICAÇÃO</div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {checklistItems.map((item, i) => {
                            const result = itemResults[item.id];
                            const st = result?.status ?? "pendente";
                            return (
                              <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.15, delay: i * 0.03 }}
                                style={{
                                  display: "flex", alignItems: "center", justifyContent: "space-between",
                                  padding: "10px 14px",
                                  background: STATUS_STYLES[st].bg,
                                  borderLeft: `3px solid ${STATUS_STYLES[st].border}`,
                                }}
                              >
                                <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.75)" }}>{item.text}</span>
                                <div style={{ display: "flex", gap: 4 }}>
                                  {(["conforme", "atencao", "nao_conforme"] as ScopeStatus[]).map(s => {
                                    const active = st === s;
                                    const ss = STATUS_STYLES[s];
                                    return (
                                      <button key={s} onClick={() => setItemStatus(item.id, s)} style={{
                                        padding: "3px 8px", fontSize: 7, fontWeight: 800,
                                        letterSpacing: ".08em", textTransform: "uppercase",
                                        background: active ? ss.bg : "var(--charcoal)",
                                        border: `1.5px solid ${active ? ss.border : "rgba(255,255,255,.06)"}`,
                                        color: active ? ss.color : "rgba(255,255,255,.25)",
                                        cursor: "pointer", fontFamily: "inherit",
                                        boxShadow: active ? "2px 2px 0 #000" : "none",
                                      }}>
                                        {ss.label.slice(0, 3)}
                                      </button>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>

                        <div style={{ marginTop: 20 }}>
                          <button className="btn-primary" onClick={saveScope} style={{ width: "100%" }}>
                            Salvar e Voltar
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
