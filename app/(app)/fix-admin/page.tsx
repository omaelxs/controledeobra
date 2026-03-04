"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/context/AuthContext";

export default function FixAdminPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState("Carregando...");
  const [logs, setLogs] = useState<string[]>([]);

  function log(msg: string) {
    setLogs(prev => [...prev, msg]);
  }

  useEffect(() => {
    if (!user) return;

    async function fix() {
      try {
        log(`Usuário logado: ${user!.email} (uid: ${user!.uid})`);

        // Ler todos os users
        const snap = await getDocs(collection(db, "users"));
        log(`Total de users no Firestore: ${snap.size}`);

        snap.docs.forEach(d => {
          const data = d.data();
          log(`  - ${d.id}: email=${data.email}, role=${data.role}`);
        });

        // Tentar atualizar o role do user atual
        log(`Tentando atualizar role para admin...`);
        await updateDoc(doc(db, "users", user!.uid), { role: "admin" });
        log(`✅ Role atualizado para admin com sucesso!`);
        setStatus("FEITO! Faz logout e login novamente.");
      } catch (e: any) {
        log(`❌ ERRO: ${e.message}`);
        setStatus(`Erro: ${e.message}`);
      }
    }

    fix();
  }, [user]);

  return (
    <div style={{ padding: 40, fontFamily: "monospace" }}>
      <h1 style={{ fontSize: 20, marginBottom: 20 }}>Fix Admin Role</h1>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: status.includes("FEITO") ? "#22c55e" : status.includes("Erro") ? "#ef4444" : "#fff" }}>
        {status}
      </div>
      <div style={{ background: "#111", padding: 16, borderRadius: 8, fontSize: 12, lineHeight: 1.8 }}>
        {logs.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
    </div>
  );
}
