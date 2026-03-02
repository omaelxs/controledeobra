"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ObrasProvider } from "@/context/ObrasContext";

const NAV = [
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
    section: "Equipe",
    items: [
      { href: "/responsaveis", label: "Responsáveis", icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="square"/>
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
    <ObrasProvider>
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
          }}>
            {/* dot grid overlay */}
            <div style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "radial-gradient(rgba(0,0,0,.15) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
              pointerEvents: "none",
              borderRadius: "inherit",
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
            {NAV.map(group => (
              <div key={group.section}>
                <div style={{
                  fontSize: 8, fontWeight: 800, letterSpacing: ".26em", textTransform: "uppercase",
                  color: "rgba(255,255,255,.22)", padding: "18px 20px 6px",
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
                background: "var(--red)",
                border: "2px solid #000",
                boxShadow: "2px 2px 0 #000",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 900, flexShrink: 0, color: "#fff",
              }}>{initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "rgba(255,255,255,.8)" }}>
                  {user.email}
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
            <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
              <div style={{ width: 6, height: 6, background: "#22c55e", boxShadow: "0 0 6px #22c55e" }} />
              <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(255,255,255,.3)" }}>Online</span>
            </div>
          </div>
          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {children}
          </div>
        </div>
      </div>
    </ObrasProvider>
  );
}
