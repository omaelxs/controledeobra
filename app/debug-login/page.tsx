"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useRouter } from "next/navigation";

export default function DebugLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("maelcost10@gmail.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleLogin() {
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      console.log("Tentando login com:", email, password);
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log("Login bem-sucedido:", result.user);
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1000);
    } catch (err: any) {
      console.error("Erro de login:", err);
      console.error("Código:", err.code);
      console.error("Mensagem:", err.message);
      setError(`${err.code}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0B090A", padding: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ maxWidth: 400, background: "#161A1D", border: "1px solid rgba(255,255,255,.1)", borderRadius: 12, padding: 32 }}>
        <h1 style={{ fontSize: 20, fontWeight: 900, marginBottom: 24, color: "#fff" }}>Debug Login</h1>

        {success && (
          <div style={{ background: "rgba(34,197,94,.2)", border: "2px solid #22c55e", color: "#22c55e", padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 12, fontWeight: 600 }}>
            ✓ Login bem-sucedido! Redirecionando...
          </div>
        )}

        {error && (
          <div style={{ background: "rgba(164,22,26,.2)", border: "2px solid var(--red-accent)", color: "var(--red-accent)", padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 11, fontWeight: 600, fontFamily: "monospace", wordBreak: "break-word" }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.4)", marginBottom: 6 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              width: "100%", boxSizing: "border-box",
              background: "rgba(255,255,255,.05)",
              border: "1px solid rgba(255,255,255,.1)",
              borderRadius: 8, padding: "10px 12px",
              fontSize: 12, color: "#fff", fontFamily: "monospace",
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.4)", marginBottom: 6 }}>Senha</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Digite a senha"
            style={{
              width: "100%", boxSizing: "border-box",
              background: "rgba(255,255,255,.05)",
              border: "1px solid rgba(255,255,255,.1)",
              borderRadius: 8, padding: "10px 12px",
              fontSize: 12, color: "#fff",
            }}
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%", padding: "11px 0",
            background: loading ? "rgba(164,22,26,.3)" : "var(--red-accent)",
            border: "none", borderRadius: 8,
            color: "#fff", fontSize: 12, fontWeight: 700,
            cursor: loading ? "default" : "pointer",
            fontFamily: "inherit",
          }}
        >
          {loading ? "Entrando..." : "Login"}
        </button>

        <div style={{ marginTop: 20, padding: 12, background: "rgba(255,255,255,.05)", borderRadius: 8 }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)", marginBottom: 8, fontWeight: 600 }}>Dicas:</div>
          <ul style={{ fontSize: 10, color: "rgba(255,255,255,.3)", margin: 0, paddingLeft: 16 }}>
            <li>Verifique se tem espaços no email</li>
            <li>Abra F12 Console e veja o erro completo</li>
            <li>Se disser "user-not-found", o email não existe</li>
            <li>Se disser "wrong-password", a senha está errada</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
