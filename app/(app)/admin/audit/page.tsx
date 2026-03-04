"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import { validateLogIntegrityChain, getLogs } from "@/services/logs.service";
import { useToast } from "@/hooks/useToast";
import { LogDoc } from "@/types/log";

interface IntegrityResult {
  valid: boolean;
  issues: string[];
  logsChecked: number;
}

export default function AuditPage() {
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState<IntegrityResult | null>(null);
  const [recentLogs, setRecentLogs] = useState<LogDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadRecentLogs();
  }, []);

  async function loadRecentLogs() {
    try {
      setLoading(true);
      const logs = await getLogs({ limitCount: 50 });
      setRecentLogs(logs);
    } catch (error) {
      showToast("Erro ao carregar logs recentes", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleValidate() {
    try {
      setValidating(true);
      const result = await validateLogIntegrityChain(100);
      setResult(result);

      if (result.valid) {
        showToast("✅ Cadeia de logs íntegra - Nenhuma alteração detectada", "success");
      } else {
        showToast("⚠️ ALERTA: Possível tamper detectado nos logs!", "error");
      }
    } catch (error) {
      showToast("Erro ao validar integridade", "error");
    } finally {
      setValidating(false);
    }
  }

  return (
    <PageTransition>
      <div style={{ flex: 1, overflow: "auto", padding: 32 }} className="dot-grid">
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Cabeçalho */}
          <div style={{ marginBottom: 32 }}>
            <div className="section-label" style={{ marginBottom: 8 }}>ADMINISTRAÇÃO</div>
            <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-.01em" }}>
              Auditoria e Compliance
            </h1>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,.35)", marginTop: 6 }}>
              Validar integridade de logs e verificar tentativas suspeitas.
            </p>
          </div>

          {/* Seção de Validação */}
          <div className="card" style={{ marginBottom: 24, padding: 24 }}>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
                🔐 Validar Integridade da Cadeia de Logs
              </h2>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,.5)" }}>
                Verificar se a cadeia de hash dos logs está íntegra (anti-tamper)
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleValidate}
              disabled={validating}
              className="btn-primary"
              style={{ marginBottom: 16 }}
            >
              {validating ? "Validando..." : "Iniciar Validação"}
            </motion.button>

            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: 16,
                  borderRadius: 8,
                  background: result.valid ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                  border: `1px solid ${result.valid ? "#22c55e" : "#ef4444"}`,
                }}
              >
                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: result.valid ? "#22c55e" : "#ef4444" }}>
                    {result.valid ? "✅ CADEIA ÍNTEGRA" : "⚠️ PROBLEMAS DETECTADOS"}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.7)", marginBottom: 8 }}>
                  Logs validados: {result.logsChecked}
                </div>

                {result.issues.length > 0 && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: "#ef4444" }}>
                      Problemas encontrados:
                    </div>
                    <ul style={{ fontSize: 11, color: "rgba(255,255,255,.7)", marginLeft: 16 }}>
                      {result.issues.map((issue, i) => (
                        <li key={i} style={{ marginBottom: 4 }}>
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Seção de Logs Recentes */}
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
              📋 Últimas Ações do Sistema
            </h2>

            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      height: 40,
                      background: "rgba(255,255,255,.05)",
                      borderRadius: 4,
                      animation: "pulse 2s infinite",
                    }}
                  />
                ))}
              </div>
            ) : recentLogs.length === 0 ? (
              <div style={{ color: "rgba(255,255,255,.35)", fontSize: 12, textAlign: "center", padding: 24 }}>
                Nenhum log disponível
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,.1)" }}>
                      <th style={{ textAlign: "left", padding: 8, fontWeight: 600 }}>Usuário</th>
                      <th style={{ textAlign: "left", padding: 8, fontWeight: 600 }}>Ação</th>
                      <th style={{ textAlign: "left", padding: 8, fontWeight: 600 }}>Alvo</th>
                      <th style={{ textAlign: "left", padding: 8, fontWeight: 600 }}>Data/Hora</th>
                      <th style={{ textAlign: "left", padding: 8, fontWeight: 600 }}>Hash</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLogs.map((log, i) => (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        style={{ borderBottom: "1px solid rgba(255,255,255,.05)" }}
                      >
                        <td style={{ padding: 8, color: "rgba(255,255,255,.7)" }}>
                          {log.userEmail.split("@")[0]}
                        </td>
                        <td style={{ padding: 8 }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "2px 6px",
                              borderRadius: 4,
                              fontSize: 10,
                              fontWeight: 600,
                              background: log.action === "delete" ? "rgba(239, 68, 68, 0.2)" : "rgba(59, 130, 246, 0.2)",
                              color: log.action === "delete" ? "#ef4444" : "#3b82f6",
                            }}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td style={{ padding: 8, color: "rgba(255,255,255,.7)" }}>
                          {log.target}
                        </td>
                        <td style={{ padding: 8, color: "rgba(255,255,255,.5)" }}>
                          {new Date(log.timestamp).toLocaleDateString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td
                          style={{
                            padding: 8,
                            color: "rgba(255,255,255,.3)",
                            fontSize: 10,
                            fontFamily: "monospace",
                            maxWidth: 80,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={log.hash}
                        >
                          {log.hash?.slice(0, 8)}...
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
