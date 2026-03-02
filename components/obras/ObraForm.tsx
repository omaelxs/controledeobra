"use client";

import { useState, useEffect } from "react";
import { Obra, ObraFormData, ObraStatus } from "@/types";

const statusOptions: { value: ObraStatus; label: string }[] = [
  { value: "planejamento", label: "Planejamento" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "pausada", label: "Pausada" },
  { value: "concluida", label: "Concluída" },
];

interface ObraFormProps {
  initial?: Obra;
  onSubmit: (data: ObraFormData) => Promise<void>;
  onCancel: () => void;
}

export default function ObraForm({ initial, onSubmit, onCancel }: ObraFormProps) {
  const [form, setForm] = useState<ObraFormData>({
    nome: "",
    endereco: "",
    status: "planejamento",
    responsavel: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        nome: initial.nome,
        endereco: initial.endereco,
        status: initial.status,
        responsavel: initial.responsavel,
      });
    }
  }, [initial]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(form);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Nome da obra</label>
        <input
          name="nome"
          required
          value={form.nome}
          onChange={handleChange}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          placeholder="Ex: Residência Silva"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Endereço</label>
        <input
          name="endereco"
          required
          value={form.endereco}
          onChange={handleChange}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          placeholder="Rua, número, bairro"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Responsável</label>
        <input
          name="responsavel"
          required
          value={form.responsavel}
          onChange={handleChange}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          placeholder="Nome do responsável"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Status</label>
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 bg-white"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-zinc-200 rounded-lg py-2 text-sm hover:bg-zinc-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-zinc-900 text-white rounded-lg py-2 text-sm font-medium hover:bg-zinc-700 transition-colors disabled:opacity-50"
        >
          {loading ? "Salvando..." : initial ? "Salvar alterações" : "Criar obra"}
        </button>
      </div>
    </form>
  );
}
