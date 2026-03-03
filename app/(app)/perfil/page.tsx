"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useUserContext } from "@/context/UserContext";
import { updateUser } from "@/services/users.service";
import { uploadProfilePhoto } from "@/services/storage.service";
import { useToast } from "@/context/ToastContext";
import PageTransition from "@/components/PageTransition";

const ROLE_LABEL: Record<string, string> = { admin: "Administrador", dev: "Desenvolvedor", user: "Usuário" };
const ROLE_COLOR: Record<string, string> = { admin: "var(--red-accent)", dev: "#eab308", user: "rgba(255,255,255,.4)" };

export default function PerfilPage() {
  const { user } = useAuth();
  const { userDoc } = useUserContext();
  const { addToast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(userDoc?.displayName ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  if (!user || !userDoc) return null;

  async function handleSaveName() {
    if (!displayName.trim() || !user) return;
    setSaving(true);
    try {
      await updateUser(user.uid, { displayName: displayName.trim() });
      addToast("Nome atualizado com sucesso!", "success");
    } catch {
      addToast("Erro ao atualizar nome.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      addToast("Imagem deve ter no máximo 2MB.", "warning");
      return;
    }

    setUploading(true);
    try {
      const url = await uploadProfilePhoto(user.uid, file);
      await updateUser(user.uid, { photoURL: url });
      addToast("Foto atualizada!", "success");
    } catch {
      addToast("Erro ao enviar foto.", "error");
    } finally {
      setUploading(false);
    }
  }

  const initials = (userDoc.displayName || "?").slice(0, 2).toUpperCase();

  return (
    <PageTransition>
      <div style={{ flex: 1, overflow: "auto", padding: 32 }} className="dot-grid">
        <div style={{ maxWidth: 560, margin: "0 auto" }}>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <div className="section-label" style={{ marginBottom: 8 }}>EQUIPE</div>
            <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-.01em" }}>Meu Perfil</h1>
          </div>

          {/* Avatar + Role Card */}
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            style={{ padding: "28px 24px", marginBottom: 20 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              {/* Avatar */}
              <div
                onClick={() => fileRef.current?.click()}
                style={{
                  width: 72, height: 72,
                  background: userDoc.photoURL ? "transparent" : "var(--red)",
                  border: "3px solid #000",
                  boxShadow: "4px 4px 0 #000",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, fontWeight: 900, color: "#fff",
                  cursor: "pointer", overflow: "hidden", flexShrink: 0,
                  position: "relative",
                }}
              >
                {uploading ? (
                  <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.7)" }}>...</div>
                ) : userDoc.photoURL ? (
                  <img src={userDoc.photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : initials}
                <div style={{
                  position: "absolute", inset: 0,
                  background: "rgba(0,0,0,.5)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: 0, transition: "opacity .15s",
                }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "0")}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: "none" }} />

              {/* Info */}
              <div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{userDoc.displayName}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginTop: 2 }}>{userDoc.email}</div>
                <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                  <span className="pill" style={{
                    borderColor: ROLE_COLOR[userDoc.role],
                    color: ROLE_COLOR[userDoc.role],
                    background: `${ROLE_COLOR[userDoc.role]}15`,
                  }}>
                    <span className="pill-dot" />
                    {ROLE_LABEL[userDoc.role]}
                  </span>
                  <span className="pill pill-green">
                    <span className="pill-dot" />
                    Online
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Edit Name */}
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            style={{ padding: "24px 24px", marginBottom: 20 }}
          >
            <div className="section-label" style={{ marginBottom: 16 }}>EDITAR NOME</div>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                className="form-input"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Seu nome"
                style={{ flex: 1 }}
              />
              <button
                className="btn-primary"
                onClick={handleSaveName}
                disabled={saving || !displayName.trim()}
                style={{ opacity: saving ? 0.5 : 1 }}
              >
                {saving ? "..." : "Salvar"}
              </button>
            </div>
          </motion.div>

          {/* Account Info */}
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            style={{ padding: "24px 24px" }}
          >
            <div className="section-label" style={{ marginBottom: 16 }}>INFORMAÇÕES DA CONTA</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <InfoRow label="UID" value={userDoc.uid} />
              <InfoRow label="Email" value={userDoc.email} />
              <InfoRow label="Função" value={ROLE_LABEL[userDoc.role]} />
              <InfoRow label="Criado em" value={new Date(userDoc.createdAt).toLocaleDateString("pt-BR")} />
              <InfoRow label="Última atividade" value={new Date(userDoc.lastSeen).toLocaleString("pt-BR")} />
            </div>
          </motion.div>

        </div>
      </div>
    </PageTransition>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.35)", textTransform: "uppercase", letterSpacing: ".1em" }}>{label}</span>
      <span style={{ fontSize: 12, color: "rgba(255,255,255,.7)", fontWeight: 500 }}>{value}</span>
    </div>
  );
}
