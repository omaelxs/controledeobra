"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";

export default function AdminSettingsPage() {
  const [appName, setAppName] = useState("FVS - Controle de Obras");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maxUploadSize, setMaxUploadSize] = useState(10);
  const [sessionTimeout, setSessionTimeout] = useState(60);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    // TODO: Implementar salvar configurações no Firebase
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <PageTransition>
      <div style={{ flex: 1, overflow: "auto", padding: 32 }} className="dot-grid">
        <div style={{ maxWidth: 700, margin: "0 auto" }}>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <div className="section-label" style={{ marginBottom: 8 }}>ADMINISTRAÇÃO</div>
            <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-.01em" }}>Configurações</h1>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,.35)", marginTop: 6 }}>
              Gerencie as configurações gerais do sistema.
            </p>
          </div>

          {/* Notificação de Sucesso */}
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="card"
              style={{ padding: "14px 18px", marginBottom: 20, background: "rgba(34,197,94,.12)", border: "2px solid #22c55e" }}
            >
              <div style={{ fontSize: 12, fontWeight: 600, color: "#22c55e", display: "flex", alignItems: "center", gap: 8 }}>
                ✓ Configurações salvas com sucesso!
              </div>
            </motion.div>
          )}

          {/* Card: Informações Gerais */}
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            style={{ padding: "24px 24px", marginBottom: 20 }}
          >
            <div className="section-label" style={{ marginBottom: 16 }}>INFORMAÇÕES GERAIS</div>
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Nome da Aplicação</label>
              <input
                className="form-input"
                value={appName}
                onChange={e => setAppName(e.target.value)}
                placeholder="Digite o nome da aplicação"
              />
            </div>
          </motion.div>

          {/* Card: Modo Manutenção */}
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            style={{ padding: "24px 24px", marginBottom: 20 }}
          >
            <div className="section-label" style={{ marginBottom: 16 }}>MODO MANUTENÇÃO</div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={e => setMaintenanceMode(e.target.checked)}
                style={{ width: 18, height: 18, cursor: "pointer" }}
              />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>Ativar Modo Manutenção</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)" }}>
                  Quando ativado, apenas administradores poderão acessar o sistema.
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card: Limites de Upload */}
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            style={{ padding: "24px 24px", marginBottom: 20 }}
          >
            <div className="section-label" style={{ marginBottom: 16 }}>LIMITES DE UPLOAD</div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <label className="form-label">Tamanho Máximo de Arquivo (MB)</label>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--red-accent)" }}>{maxUploadSize} MB</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={maxUploadSize}
                onChange={e => setMaxUploadSize(parseInt(e.target.value))}
                style={{ width: "100%", cursor: "pointer" }}
              />
            </div>
          </motion.div>

          {/* Card: Sessão */}
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.3 }}
            style={{ padding: "24px 24px", marginBottom: 20 }}
          >
            <div className="section-label" style={{ marginBottom: 16 }}>SESÃO</div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <label className="form-label">Timeout de Sessão (minutos)</label>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--red-accent)" }}>{sessionTimeout} min</span>
              </div>
              <input
                type="range"
                min="15"
                max="480"
                step="15"
                value={sessionTimeout}
                onChange={e => setSessionTimeout(parseInt(e.target.value))}
                style={{ width: "100%", cursor: "pointer" }}
              />
            </div>
          </motion.div>

          {/* Botões de Ação */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.4 }}
            style={{ display: "flex", gap: 10 }}
          >
            <button className="btn-ghost" style={{ flex: 1 }}>Cancelar</button>
            <button className="btn-primary" onClick={handleSave} style={{ flex: 1 }}>Salvar Configurações</button>
          </motion.div>

        </div>
      </div>
    </PageTransition>
  );
}
