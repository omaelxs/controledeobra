"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getAllUsers, changeUserRole } from "@/services/users.service";
import { UserDoc, UserRole } from "@/types/user";
import { useToast } from "@/context/ToastContext";
import { createLog } from "@/services/logs.service";
import { useAuth } from "@/context/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import PageTransition from "@/components/PageTransition";
import { SkeletonCard } from "@/components/Skeleton";

const ROLE_COLOR: Record<string, string> = { admin: "var(--red-accent)", dev: "#eab308", user: "rgba(255,255,255,.4)" };
const ROLE_OPTIONS: UserRole[] = ["admin", "dev", "user"];

export default function AdminUsersPage() {
  const { user } = useAuth();
  const { role } = useUserRole();
  const { addToast } = useToast();
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllUsers().then(u => { setUsers(u); setLoading(false); });
  }, []);

  async function handleRoleChange(target: UserDoc, newRole: UserRole) {
    if (!user) return;
    try {
      await changeUserRole(target.uid, newRole, role);
      setUsers(prev => prev.map(u => u.uid === target.uid ? { ...u, role: newRole } : u));
      await createLog({
        userId: user.uid,
        userEmail: user.email ?? "",
        action: "update",
        target: "user",
        targetId: target.uid,
        details: `Role alterada para ${newRole}: ${target.email}`,
      });
      addToast(`Role de ${target.displayName} alterada para ${newRole}`, "success");
    } catch {
      addToast("Erro ao alterar role.", "error");
    }
  }

  return (
    <PageTransition>
      <div style={{ flex: 1, overflow: "auto", padding: 32 }} className="dot-grid">
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ marginBottom: 32 }}>
            <div className="section-label" style={{ marginBottom: 8 }}>ADMINISTRAÇÃO</div>
            <h1 style={{ fontSize: 22, fontWeight: 900 }}>Gestão de Usuários</h1>
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <SkeletonCard /><SkeletonCard /><SkeletonCard />
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {users.map((u, i) => (
                <motion.div
                  key={u.uid}
                  className="card"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.05 }}
                  style={{ padding: "16px 20px" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    {/* Avatar */}
                    <div style={{
                      width: 36, height: 36,
                      background: u.photoURL ? "transparent" : "var(--raised)",
                      border: "2px solid #000", boxShadow: "2px 2px 0 #000",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 900, color: "rgba(255,255,255,.5)",
                      overflow: "hidden", flexShrink: 0,
                    }}>
                      {u.photoURL ? (
                        <img src={u.photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : u.displayName.slice(0, 2).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>{u.displayName}</span>
                        <span className="pill" style={{
                          borderColor: ROLE_COLOR[u.role],
                          color: ROLE_COLOR[u.role],
                          background: `${ROLE_COLOR[u.role]}15`,
                        }}>
                          {u.role.toUpperCase()}
                        </span>
                        {u.online && (
                          <span className="pill pill-green" style={{ fontSize: 7 }}>
                            <span className="pill-dot" />ONLINE
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)", marginTop: 2 }}>{u.email}</div>
                    </div>

                    {/* Role select */}
                    <select
                      value={u.role}
                      onChange={e => handleRoleChange(u, e.target.value as UserRole)}
                      className="form-select"
                      style={{ width: 110, padding: "6px 10px", fontSize: 10, fontWeight: 700 }}
                    >
                      {ROLE_OPTIONS.map(r => (
                        <option key={r} value={r}>{r.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
