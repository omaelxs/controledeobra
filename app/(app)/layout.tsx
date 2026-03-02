"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { APP_NAME } from "@/lib/config";

const NAV = [
  {
    section: "Principal",
    items: [
      { href: "/dashboard", label: "Painel Geral", icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
      )},
      { href: "/obras", label: "Obras", icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M3 21H21M5 21V7L12 3L19 7V21M9 21V15H15V21" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )},
    ],
  },
  {
    section: "Qualidade",
    items: [
      { href: "/fvs", label: "FVS – Fichas", icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )},
      { href: "/nc", label: "Não Conformidades", icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )},
      { href: "/vistorias", label: "Vistorias", icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M9 12l2 2 4-4M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )},
    ],
  },
  {
    section: "Equipe",
    items: [
      { href: "/responsaveis", label: "Responsáveis", icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )},
    ],
  },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  if (loading || !user) return null;

  const initials = user.email?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg)", color: "var(--white)" }}>

      {/* SIDEBAR */}
      <aside style={{
        width: 256, minWidth: 256,
        background: "var(--bg)",
        borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column",
        zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ padding: "28px 22px 22px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 30, height: 30, background: "var(--red)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 21H21M5 21V7L12 3L19 7V21M9 21V15H15V21" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: ".18em", textTransform: "uppercase" }}>{APP_NAME}</div>
              <div style={{ fontSize: 9, color: "var(--muted)", letterSpacing: ".12em", textTransform: "uppercase", marginTop: 3 }}>Gestão de Obras</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 0", overflowY: "auto" }}>
          {NAV.map(group => (
            <div key={group.section}>
              <div style={{
                fontSize: 9, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase",
                color: "var(--muted)", padding: "16px 22px 6px",
              }}>{group.section}</div>
              {group.items.map(item => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link key={item.href} href={item.href} style={{
                    position: "relative", display: "flex", alignItems: "center", gap: 10,
                    padding: "11px 22px", fontSize: 12.5, fontWeight: 500,
                    color: active ? "var(--white)" : "rgba(255,255,255,.55)",
                    background: active ? "var(--charcoal)" : "transparent",
                    textDecoration: "none", transition: "background .1s, color .1s",
                  }}>
                    {active && (
                      <span style={{
                        position: "absolute", left: 0, top: 0, bottom: 0,
                        width: 3, background: "var(--red-accent)",
                      }}/>
                    )}
                    <span style={{ opacity: active ? 1 : 0.7 }}>{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: "16px 22px", borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 30, height: 30, background: "var(--red)",
              border: "1px solid rgba(229,56,59,.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 9, fontWeight: 900, flexShrink: 0,
            }}>{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
              <button onClick={logout} style={{
                fontSize: 9, color: "var(--red-accent)", textTransform: "uppercase",
                letterSpacing: ".1em", fontWeight: 600, background: "none", border: "none",
                cursor: "pointer", padding: 0, marginTop: 2,
              }}>Sair</button>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        {children}
      </div>
    </div>
  );
}
