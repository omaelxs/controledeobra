"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { ObrasProvider } from "@/context/ObrasContext";
import { ToastProvider } from "@/context/ToastContext";
import ToastContainer from "@/components/Toast";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useOnlineUsers } from "@/hooks/useOnlineUsers";
import NotificationBell from "@/components/NotificationBell";

type NavItem = { href: string; label: string; icon: React.ReactNode; adminOnly?: boolean };
type NavGroup = { section: string; items: NavItem[]; adminOnly?: boolean };

const NAV: NavGroup[] = [
  {
    section: "Principal",
    items: [
      { href: "/dashboard", label: "Painel Geral", icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
        </svg>
      )},
      { href: "/obras", label: "Obras", icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 21H21M5 21V7L12 3L19 7V21M9 21V15H15V21" strokeLinecap="square" strokeLinejoin="miter"/>
        </svg>
      )},
    ],
  },
  {
    section: "Qualidade",
    items: [
      { href: "/fvs", label: "FVS – Fichas", icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12l2 2 4-4" strokeLinecap="square"/>
        </svg>
      )},
      { href: "/nc", label: "Não Conformidades", icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" strokeLinecap="square"/>
        </svg>
      )},
      { href: "/vistorias", label: "Vistorias", icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 12l2 2 4-4M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" strokeLinecap="square"/>
        </svg>
      )},
    ],
  },
  {
    section: "Comunicação",
    items: [
      { href: "/chat", label: "Chat Geral", icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="square"/>
        </svg>
      )},
    ],
  },
  {
    section: "Equipe",
    items: [
      { href: "/perfil", label: "Meu Perfil", icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" strokeLinecap="square"/>
        </svg>
      )},
    ],
  },
  {
    section: "Administração",
    adminOnly: true,
    items: [
      { href: "/admin", label: "Painel Admin", adminOnly: true, icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="square"/>
        </svg>
      )},
      { href: "/admin/users", label: "Usuários", adminOnly: true, icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z" strokeLinecap="square"/>
        </svg>
      )},
      { href: "/admin/notifications", label: "Notificações", adminOnly: true, icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" strokeLinecap="square"/>
        </svg>
      )},
      { href: "/admin/logs", label: "Logs", adminOnly: true, icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="square"/>
          <polyline points="14 2 14 8 20 8" strokeLinecap="square"/>
          <line x1="16" y1="13" x2="8" y2="13" strokeLinecap="square"/>
          <line x1="16" y1="17" x2="8" y2="17" strokeLinecap="square"/>
        </svg>
      )},
      { href: "/admin/settings", label: "Configurações", adminOnly: true, icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" strokeLinecap="square"/>
          <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24" strokeLinecap="square"/>
        </svg>
      )},
      { href: "/admin/chat", label: "Chat Moderadores", adminOnly: true, icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" strokeLinecap="square"/>
        </svg>
      )},
    ],
  },
];

const ROLE_LABEL: Record<string, string> = {
  admin: "ADMIN",
  dev: "DEV",
  user: "USER",
};
const ROLE_COLOR: Record<string, string> = {
  admin: "var(--red-accent)",
  dev: "#eab308",
  user: "rgba(255,255,255,.35)",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const { userDoc, role, isAdminOrDev } = useUserRole();
  const router   = useRouter();
  const pathname = usePathname();
  useOnlineStatus();
  const { onlineCount } = useOnlineUsers();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  // Timeout: se auth não resolver em 5s, redireciona para login
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => {
      if (!user) router.push("/login");
    }, 5000);
    return () => clearTimeout(timer);
  }, [loading, user, router]);

  if (loading || !user) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid var(--red-accent)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(255,255,255,.3)" }}>Carregando...</div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const displayName = userDoc?.displayName ?? user.email?.split("@")[0] ?? "?";
  const initials = displayName.slice(0, 2).toUpperCase();

  const filteredNav = NAV
    .filter(g => !g.adminOnly || isAdminOrDev)
    .map(g => ({ ...g, items: g.items.filter(i => !i.adminOnly || isAdminOrDev) }));

  return (
    <ToastProvider>
    <ObrasProvider>
      <ToastContainer />
      <div style={{ display: "flex", height: "100vh", background: "var(--bg)", color: "var(--white)" }}>

        {/* SIDEBAR */}
        <aside style={{
          width: 248, minWidth: 248,
          background: "var(--surface)",
          borderRight: "2px solid #000",
          display: "flex", flexDirection: "column",
          zIndex: 100,
          boxShadow: "4px 0 0 #000",
        }}>

          {/* Logo */}
          <div style={{
            padding: "24px 20px",
            borderBottom: "2px solid #000",
            background: "var(--red)",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: "radial-gradient(rgba(0,0,0,.15) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
              pointerEvents: "none",
            }} />
            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 32, height: 32,
                background: "#000",
                border: "2px solid rgba(255,255,255,.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
                boxShadow: "3px 3px 0 rgba(0,0,0,.5)",
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M3 21H21M5 21V7L12 3L19 7V21M9 21V15H15V21" stroke="white" strokeWidth="2.2" strokeLinecap="square" strokeLinejoin="miter"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: ".22em", textTransform: "uppercase", color: "#fff" }}>
                  Controle
                </div>
                <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(255,255,255,.6)", marginTop: 2 }}>
                  de Obras
                </div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "8px 0", overflowY: "auto" }}>
            {filteredNav.map(group => (
              <div key={group.section}>
                <div style={{
                  fontSize: 8, fontWeight: 800, letterSpacing: ".26em", textTransform: "uppercase",
                  color: group.adminOnly ? "rgba(229,56,59,.35)" : "rgba(255,255,255,.22)", padding: "18px 20px 6px",
                }}>{group.section}</div>
                {group.items.map(item => {
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link key={item.href} href={item.href} style={{
                      position: "relative", display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 20px", fontSize: 12, fontWeight: active ? 700 : 500,
                      color: active ? "#fff" : "rgba(255,255,255,.45)",
                      background: active ? "var(--charcoal)" : "transparent",
                      textDecoration: "none", transition: "all .1s",
                      borderLeft: active ? "3px solid var(--red-accent)" : "3px solid transparent",
                    }}>
                      <span style={{ color: active ? "var(--red-accent)" : "rgba(255,255,255,.3)" }}>
                        {item.icon}
                      </span>
                      {item.label}
                      {active && (
                        <span style={{
                          marginLeft: "auto", width: 6, height: 6,
                          background: "var(--red-accent)",
                          boxShadow: "2px 2px 0 #000",
                        }} />
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div style={{
            padding: "14px 20px",
            borderTop: "2px solid #000",
            background: "var(--charcoal)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 32, height: 32,
                background: userDoc?.photoURL ? "transparent" : "var(--red)",
                border: "2px solid #000",
                boxShadow: "2px 2px 0 #000",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 900, flexShrink: 0, color: "#fff",
                overflow: "hidden",
              }}>
                {userDoc?.photoURL ? (
                  <img src={userDoc.photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "rgba(255,255,255,.8)" }}>
                    {displayName}
                  </span>
                  <span style={{
                    fontSize: 7, fontWeight: 800, letterSpacing: ".1em",
                    padding: "1px 5px", borderRadius: 3,
                    background: `${ROLE_COLOR[role]}20`,
                    border: `1px solid ${ROLE_COLOR[role]}40`,
                    color: ROLE_COLOR[role],
                  }}>{ROLE_LABEL[role]}</span>
                </div>
                <button onClick={logout} style={{
                  fontSize: 8, color: "var(--red-accent)", textTransform: "uppercase",
                  letterSpacing: ".14em", fontWeight: 800, background: "none", border: "none",
                  cursor: "pointer", padding: 0, marginTop: 3, fontFamily: "inherit",
                }}>→ Sair</button>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0, background: "var(--bg)" }}>
          {/* Top bar */}
          <div style={{
            height: 48, borderBottom: "2px solid #000",
            background: "var(--surface)",
            display: "flex", alignItems: "center",
            padding: "0 32px",
            gap: 8, flexShrink: 0,
            boxShadow: "0 4px 0 #000",
          }}>
            <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(255,255,255,.2)" }}>
              Sistema de Controle de Obras
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 14, alignItems: "center" }}>
              <NotificationBell />
              {/* Role badge */}
              <span style={{
                fontSize: 8, fontWeight: 800, letterSpacing: ".14em",
                padding: "2px 8px", borderRadius: 3,
                background: `${ROLE_COLOR[role]}15`,
                border: `1px solid ${ROLE_COLOR[role]}30`,
                color: ROLE_COLOR[role],
              }}>{ROLE_LABEL[role]}</span>
              {/* Online indicator */}
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <div style={{ width: 6, height: 6, background: "#22c55e", boxShadow: "0 0 6px #22c55e" }} />
                <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(255,255,255,.3)" }}>{onlineCount} Online</span>
              </div>
            </div>
          </div>
          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {children}
          </div>
        </div>
      </div>
    </ObrasProvider>
    </ToastProvider>
  );
}
