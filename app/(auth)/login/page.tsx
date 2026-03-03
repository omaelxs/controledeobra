"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch {
      setError("Email ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0B090A",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      padding: 24,
      overflow: "hidden",
    }}>
      {/* Background grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        style={{
          position: "fixed", inset: 0, zIndex: 0,
          backgroundImage: "linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          pointerEvents: "none",
        }}
      />

      {/* Glow - pulsa suavemente */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        style={{
          position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)",
          width: 600, height: 300,
          background: "radial-gradient(ellipse, rgba(164,22,26,.18) 0%, transparent 70%)",
          pointerEvents: "none", zIndex: 0,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.175, 0.885, 0.32, 1.275] }}
        style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 420 }}
      >

        {/* Logo / marca */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
          style={{ textAlign: "center", marginBottom: 40 }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.175, 0.885, 0.32, 1.275] }}
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 48, height: 48, background: "var(--red)", border: "2px solid var(--red-accent)",
              borderRadius: 10, marginBottom: 20, boxShadow: "0 0 24px rgba(164,22,26,.4)",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".28em", textTransform: "uppercase", color: "var(--red-accent)", marginBottom: 8 }}
          >
            Controle de Obra
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-.02em", color: "#fff", lineHeight: 1.1 }}
          >
            Bem-vindo de volta
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.7 }}
            style={{ fontSize: 13, color: "rgba(255,255,255,.35)", marginTop: 8 }}
          >
            Acesse seu painel de gerenciamento
          </motion.div>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: [0.175, 0.885, 0.32, 1.275] }}
          style={{
            background: "#161A1D",
            border: "1.5px solid rgba(255,255,255,.08)",
            borderRadius: 16,
            boxShadow: "0 24px 64px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.03)",
            padding: "36px 32px",
          }}
        >
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(255,255,255,.4)", marginBottom: 8 }}>
                Email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: "rgba(255,255,255,.04)",
                  border: "1.5px solid rgba(255,255,255,.1)",
                  borderRadius: 10, padding: "12px 14px",
                  fontSize: 14, color: "#fff",
                  outline: "none", fontFamily: "inherit",
                  transition: "border-color .2s",
                }}
                onFocus={e => (e.target.style.borderColor = "var(--red-accent)")}
                onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,.1)")}
              />
            </motion.div>

            {/* Senha */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(255,255,255,.4)", marginBottom: 8 }}>
                Senha
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPw ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: "100%", boxSizing: "border-box",
                    background: "rgba(255,255,255,.04)",
                    border: "1.5px solid rgba(255,255,255,.1)",
                    borderRadius: 10, padding: "12px 44px 12px 14px",
                    fontSize: 14, color: "#fff",
                    outline: "none", fontFamily: "inherit",
                    transition: "border-color .2s",
                  }}
                  onFocus={e => (e.target.style.borderColor = "var(--red-accent)")}
                  onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,.1)")}
                />
                <button type="button" onClick={() => setShowPw(p => !p)} style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", padding: 4,
                  color: "rgba(255,255,255,.3)", fontSize: 13,
                }}>
                  {showPw ? "🙈" : "👁"}
                </button>
              </div>
            </motion.div>

            {/* Erro */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                style={{
                  background: "rgba(164,22,26,.15)", border: "1px solid rgba(164,22,26,.3)",
                  borderRadius: 8, padding: "10px 14px",
                  fontSize: 12, color: "var(--red-accent)", fontWeight: 600,
                }}
              >
                {error}
              </motion.div>
            )}

            {/* Botão */}
            <motion.button
              type="submit"
              disabled={loading}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.8 }}
              whileHover={!loading ? { scale: 1.02, boxShadow: "0 6px 28px rgba(164,22,26,.5)" } : {}}
              whileTap={!loading ? { scale: 0.97 } : {}}
              style={{
                width: "100%", padding: "13px 0",
                background: loading ? "rgba(164,22,26,.5)" : "var(--red-accent)",
                border: "none", borderRadius: 10,
                fontSize: 13, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase",
                color: "#fff", cursor: loading ? "default" : "pointer",
                fontFamily: "inherit", marginTop: 4,
                boxShadow: loading ? "none" : "0 4px 20px rgba(164,22,26,.4)",
                transition: "background .2s",
              }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </motion.button>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1 }}
          style={{ textAlign: "center", marginTop: 24, fontSize: 11, color: "rgba(255,255,255,.2)" }}
        >
          Sistema de Controle de Obras · FVS
        </motion.div>
      </motion.div>
    </div>
  );
}
