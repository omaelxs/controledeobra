"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import { AdminTable } from "@/components/AdminTable";
import { AdminForm, FormField } from "@/components/AdminForm";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/useToast";
import { getResponsaveis, createResponsavel, updateResponsavel, deleteResponsavel } from "@/services/responsaveis.service";
import { Responsavel, CARGO_LABELS } from "@/types";

const CARGO_OPTIONS = Object.entries(CARGO_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export default function ResponsaveisPage() {
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<Responsavel> | null>(null);
  const { role, userDoc } = useUserRole();
  const { showToast } = useToast();

  useEffect(() => {
    loadResponsaveis();
  }, []);

  async function loadResponsaveis() {
    try {
      setLoading(true);
      const data = await getResponsaveis();
      setResponsaveis(data);
    } catch (error) {
      showToast("Erro ao carregar responsáveis", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role || !userDoc) return;

    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);

      const data = {
        nome: formData.get("nome") as string,
        cargo: formData.get("cargo") as import("@/types").RtTipo,
        crea: formData.get("crea") as string || undefined,
        telefone: formData.get("tel") as string || undefined,
        email: formData.get("email") as string || undefined,
      };

      if (editingId) {
        await updateResponsavel(editingId, data, role, userDoc?.uid, userDoc?.email);
        showToast("Responsável atualizado com sucesso", "success");
      } else {
        await createResponsavel(data, role, userDoc?.uid, userDoc?.email);
        showToast("Responsável criado com sucesso", "success");
      }

      setShowForm(false);
      setEditingId(null);
      setEditingData(null);
      await loadResponsaveis();
    } catch (error: any) {
      showToast(error.message || "Erro ao salvar", "error");
    }
  }

  function handleEdit(responsavel: Responsavel) {
    setEditingId(responsavel.id || null);
    setEditingData(responsavel);
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    if (!role || !userDoc || !confirm("Tem certeza que quer deletar?")) return;

    try {
      await deleteResponsavel(id, role, userDoc?.uid, userDoc?.email);
      showToast("Responsável deletado com sucesso", "success");
      await loadResponsaveis();
    } catch (error: any) {
      showToast(error.message || "Erro ao deletar", "error");
    }
  }

  return (
    <PageTransition>
      <div style={{ flex: 1, overflow: "auto", padding: 32 }} className="dot-grid">
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Cabeçalho */}
          <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "start" }}>
            <div>
              <div className="section-label" style={{ marginBottom: 8 }}>ADMINISTRAÇÃO</div>
              <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-.01em" }}>
                Responsáveis Técnicos
              </h1>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,.35)", marginTop: 6 }}>
                Gerencie RT, engenheiros, mestres e outros responsáveis técnicos.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEditingId(null);
                setEditingData(null);
                setShowForm(true);
              }}
              className="btn-primary"
            >
              + Novo Responsável
            </motion.button>
          </div>

          {/* Tabela */}
          <div className="card">
            <AdminTable<Responsavel>
              columns={[
                {
                  key: "nome",
                  label: "Nome",
                  width: "25%",
                },
                {
                  key: "cargo",
                  label: "Cargo",
                  width: "20%",
                  render: (value) => CARGO_LABELS[value as keyof typeof CARGO_LABELS] || value,
                },
                {
                  key: "crea",
                  label: "CREA",
                  width: "15%",
                  render: (value) => value || "-",
                },
                {
                  key: "email",
                  label: "Email",
                  width: "25%",
                  render: (value) => value || "-",
                },
                {
                  key: "tel",
                  label: "Telefone",
                  width: "15%",
                  render: (value) => value || "-",
                },
              ]}
              data={responsaveis}
              loading={loading}
              pageSize={10}
              renderActions={(row) => (
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => handleEdit(row)}
                    className="btn-ghost"
                    style={{ padding: "4px 8px", fontSize: 12 }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(row.id || "")}
                    className="btn-ghost"
                    style={{ padding: "4px 8px", fontSize: 12, color: "var(--red-accent)" }}
                  >
                    Deletar
                  </button>
                </div>
              )}
            />
          </div>
        </div>

        {/* Modal de Formulário */}
        {showForm && (
          <AdminForm
            title={editingId ? "Editar Responsável" : "Novo Responsável"}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingId(null);
              setEditingData(null);
            }}
          >
            <FormField
              label="Nome"
              name="nome"
              placeholder="Nome completo"
              required
              defaultValue={editingData?.nome || ""}
            />
            <FormField
              label="Cargo"
              name="cargo"
              type="select"
              options={CARGO_OPTIONS}
              required
              defaultValue={editingData?.cargo || ""}
            />
            <FormField
              label="CREA"
              name="crea"
              placeholder="Número CREA (opcional)"
              defaultValue={editingData?.crea || ""}
            />
            <FormField
              label="Email"
              name="email"
              type="email"
              placeholder="email@example.com (opcional)"
              defaultValue={editingData?.email || ""}
            />
            <FormField
              label="Telefone"
              name="tel"
              placeholder="(XX) XXXXX-XXXX (opcional)"
              defaultValue={editingData?.tel || ""}
            />
          </AdminForm>
        )}
      </div>
    </PageTransition>
  );
}
