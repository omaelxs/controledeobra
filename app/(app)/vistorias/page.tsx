"use client";

import { useState, useEffect, useCallback } from "react";
import { Obra, Pavimento, Apartamento } from "@/types";
import { getObras, updateApartamento } from "@/services/obras.service";

const SECTIONS = ["Estrutura", "Vedação", "Hidráulica", "Elétrica", "Acabamento"] as const;
type Section = typeof SECTIONS[number];

const APT_STATUS_COLOR: Record<Apartamento["status"], string> = {
  pendente: "rgba(255,255,255,.18)",
  aprovado: "#22c55e",
  reprovado: "var(--red-accent)",
};
const APT_STATUS_BG: Record<Apartamento["status"], string> = {
  pendente: "transparent",
  aprovado: "rgba(34,197,94,.08)",
  reprovado: "rgba(164,22,26,.08)",
};

type VistoriaState = Record<Section, "pendente" | "ok" | "nok">;

function makeEmpty(): VistoriaState {
  return Object.fromEntries(SECTIONS.map(s => [s, "pendente"])) as VistoriaState;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.9)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "var(--surface)", border: "2px solid var(--charcoal)", borderRadius: 12, boxShadow: "14px 14px 0 #000", padding: 34, width: 560, maxHeight: "92vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 900 }}>{title}</div>
          <button onClick={onClose} style={{ width: 28, height: 28, background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 6, color: "white", cursor: "pointer", fontSize: 13 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function VistoriasPage() {
  const [obras, setObras]         = useState<Obra[]>([]);
  const [loading, setLoading]     = useState(true);
  const [selObraId, setSelObraId] = useState<string | null>(null);
  const [selPavId, setSelPavId]   = useState<string | null>(null);
  const [selApt, setSelApt]       = useState<Apartamento | null>(null);
  const [vistoria, setVistoria]   = useState<VistoriaState>(makeEmpty());
  const [showModal, setShowModal] = useState(false);
  const [obs, setObs]             = useState("");

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
    setVistoria(makeEmpty());
    setObs("");
    setShowModal(true);
  }

  async function concludeVistoria(status: "aprovado" | "reprovado") {
    if (!selObra?.id || !selApt) return;
    const today = new Date().toISOString().slice(0, 10);
    await updateApartamento(selObra.id, selObra.pavimentos, selApt.id, {
      status,
      dataVistoria: today,
    });
    setShowModal(false);
    await load();
  }

  const allOk      = SECTIONS.every(s => vistoria[s] === "ok");
  const anyNok     = SECTIONS.some(s => vistoria[s] === "nok");
  const canConclude = SECTIONS.every(s => vistoria[s] !== "pendente");

  const aptsByStatus = (pav: Pavimento) => ({
    aprovado:  pav.apts.filter(a => a.status === "aprovado").length,
    reprovado: pav.apts.filter(a => a.status === "reprovado").length,
    pendente:  pav.apts.filter(a => a.status === "pendente").length,
  });

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "36px 40px 48px" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--red-accent)", marginBottom: 6 }}>Inspeção</div>
        <div style={{ fontSize: 52, fontWeight: 900, letterSpacing: "-.025em", lineHeight: 1 }}>Vistorias</div>
        <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>Selecione um apartamento para realizar a vistoria</div>
      </div>

      {loading && <div style={{ color: "var(--muted)", fontSize: 13 }}>Carregando...</div>}

      {!loading && obras.length === 0 && (
        <div style={{ background: "var(--surface)", border: "2px solid var(--charcoal)", borderRadius: 12, padding: "56px 0", textAlign: "center" }}>
          <div style={{ fontSize: 32, opacity: .18, marginBottom: 10 }}>🏠</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.3)" }}>Cadastre obras com pavimentos e apartamentos para realizar vistorias</div>
        </div>
      )}

      {!loading && obras.length > 0 && (
        <>
          {/* Selector obras */}
          <div style={{ display: "flex", gap: 8, marginBottom: 22, flexWrap: "wrap" }}>
            {obras.map(o => (
              <button key={o.id} onClick={() => { setSelObraId(o.id!); setSelPavId(null); }} style={{
                padding: "6px 16px", fontSize: 10, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase",
                background: selObraId === o.id ? "var(--red-accent)" : "var(--charcoal)",
                border: `1px solid ${selObraId === o.id ? "var(--red-accent)" : "rgba(255,255,255,.1)"}`,
                borderRadius: 6, color: selObraId === o.id ? "#fff" : "rgba(255,255,255,.5)", cursor: "pointer", fontFamily: "inherit",
              }}>{o.name}</button>
            ))}
          </div>

          {selObra && (
            <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 20 }}>
              {/* Pavimentos sidebar */}
              <div style={{ background: "var(--surface)", border: "2px solid var(--charcoal)", borderRadius: 12, boxShadow: "4px 4px 0 #000", overflow: "hidden" }}>
                <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--muted)" }}>Pavimentos</div>
                </div>
                <div style={{ padding: 6 }}>
                  {pavimentos.length === 0 && (
                    <div style={{ padding: "20px 12px", fontSize: 11, color: "var(--muted)", textAlign: "center" }}>Nenhum pavimento</div>
                  )}
                  {pavimentos.map(pav => {
                    const s = aptsByStatus(pav);
                    const active = selPav?.id === pav.id || (!selPavId && pav.id === pavimentos[0]?.id);
                    return (
                      <div key={pav.id} onClick={() => setSelPavId(pav.id)} style={{
                        padding: "10px 12px", borderRadius: 7, cursor: "pointer", marginBottom: 2,
                        borderLeft: `3px solid ${active ? "var(--red-accent)" : "transparent"}`,
                        background: active ? "var(--charcoal)" : "transparent",
                      }}>
                        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{pav.name}</div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <span style={{ fontSize: 9, color: "#22c55e" }}>✓ {s.aprovado}</span>
                          <span style={{ fontSize: 9, color: "var(--red-accent)" }}>✕ {s.reprovado}</span>
                          <span style={{ fontSize: 9, color: "rgba(255,255,255,.35)" }}>◌ {s.pendente}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Apartamentos grid */}
              <div style={{ background: "var(--surface)", border: "2px solid var(--charcoal)", borderRadius: 12, boxShadow: "4px 4px 0 #000", overflow: "hidden" }}>
                {!selPav ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: "var(--muted)", fontSize: 12 }}>Selecione um pavimento</div>
                ) : (
                  <>
                    <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 2 }}>Pavimento</div>
                        <div style={{ fontSize: 16, fontWeight: 900 }}>{selPav.name}</div>
                      </div>
                      <div style={{ display: "flex", gap: 14 }}>
                        {(["aprovado", "reprovado", "pendente"] as const).map(st => {
                          const count = selPav.apts.filter(a => a.status === st).length;
                          return (
                            <div key={st} style={{ textAlign: "center" }}>
                              <div style={{ fontSize: 18, fontWeight: 900, color: APT_STATUS_COLOR[st] }}>{count}</div>
                              <div style={{ fontSize: 8, color: "var(--muted)", textTransform: "capitalize" }}>{st}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div style={{ padding: "18px 20px" }}>
                      {selPav.apts.length === 0 && (
                        <div style={{ textAlign: "center", padding: "40px 0", color: "var(--muted)", fontSize: 12 }}>Nenhum apartamento neste pavimento</div>
                      )}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
                        {selPav.apts.map(apt => (
                          <div key={apt.id} onClick={() => openVistoria(apt)} style={{
                            background: APT_STATUS_BG[apt.status], border: `2px solid ${APT_STATUS_COLOR[apt.status]}`,
                            borderRadius: 10, padding: "14px 12px", cursor: "pointer", textAlign: "center",
                            boxShadow: "3px 3px 0 #000", transition: "transform .12s",
                          }}
                            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.03)")}
                            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}>
                            <div style={{ fontSize: 18, marginBottom: 4 }}>
                              {apt.status === "aprovado" ? "✅" : apt.status === "reprovado" ? "❌" : "🏠"}
                            </div>
                            <div style={{ fontSize: 11, fontWeight: 800 }}>{apt.name}</div>
                            <div style={{ fontSize: 9, color: APT_STATUS_COLOR[apt.status], marginTop: 3, textTransform: "capitalize" }}>{apt.status}</div>
                            {apt.dataVistoria && <div style={{ fontSize: 8, color: "var(--muted)", marginTop: 2 }}>{apt.dataVistoria}</div>}
                          </div>
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

      {/* Modal de vistoria */}
      {showModal && selApt && (
        <Modal title={`Vistoria — ${selApt.name}`} onClose={() => setShowModal(false)}>
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 14 }}>Verificação por Seção</div>
            {SECTIONS.map(sec => (
              <div key={sec} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "rgba(255,255,255,.025)", borderRadius: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{sec}</span>
                <div style={{ display: "flex", gap: 6 }}>
                  {(["pendente", "ok", "nok"] as const).map(v => (
                    <button key={v} onClick={() => setVistoria(p => ({ ...p, [sec]: v }))} style={{
                      width: 60, padding: "4px 0", fontSize: 9, fontWeight: 700, textTransform: "uppercase",
                      background: vistoria[sec] === v
                        ? (v === "ok" ? "rgba(34,197,94,.25)" : v === "nok" ? "rgba(164,22,26,.25)" : "rgba(255,255,255,.1)")
                        : "var(--charcoal)",
                      border: `1px solid ${vistoria[sec] === v
                        ? (v === "ok" ? "rgba(34,197,94,.5)" : v === "nok" ? "rgba(164,22,26,.5)" : "rgba(255,255,255,.2)")
                        : "rgba(255,255,255,.08)"}`,
                      borderRadius: 5,
                      color: vistoria[sec] === v
                        ? (v === "ok" ? "#22c55e" : v === "nok" ? "var(--red-accent)" : "rgba(255,255,255,.6)")
                        : "rgba(255,255,255,.3)",
                      cursor: "pointer", fontFamily: "inherit",
                    }}>
                      {v === "pendente" ? "—" : v === "ok" ? "OK" : "NOK"}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 20 }}>
            <label className="form-label">Observações</label>
            <textarea className="form-textarea" rows={3} value={obs} onChange={e => setObs(e.target.value)} placeholder="Registre observações sobre a vistoria..." />
          </div>
          <div style={{ display: "flex", gap: 10, paddingTop: 18, borderTop: "1px solid var(--border)" }}>
            <button className="btn-ghost" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancelar</button>
            <button onClick={() => concludeVistoria("reprovado")} disabled={!canConclude && !anyNok} style={{
              flex: 1, padding: "10px 0", fontSize: 10, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase",
              background: "rgba(164,22,26,.2)", border: "1px solid rgba(164,22,26,.4)", borderRadius: 8,
              color: "var(--red-accent)", cursor: "pointer", fontFamily: "inherit",
              opacity: canConclude ? 1 : .4,
            }}>Reprovar</button>
            <button onClick={() => concludeVistoria("aprovado")} disabled={!allOk} style={{
              flex: 1, padding: "10px 0", fontSize: 10, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase",
              background: allOk ? "rgba(34,197,94,.2)" : "var(--charcoal)", border: `1px solid ${allOk ? "rgba(34,197,94,.4)" : "rgba(255,255,255,.08)"}`, borderRadius: 8,
              color: allOk ? "#22c55e" : "rgba(255,255,255,.3)", cursor: allOk ? "pointer" : "default", fontFamily: "inherit",
            }}>Aprovar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
