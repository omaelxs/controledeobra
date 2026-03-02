"use client";

import { Obra, ObraStatus } from "@/types";

const statusConfig: Record<ObraStatus, { label: string; color: string }> = {
  planejamento: { label: "Planejamento", color: "bg-blue-100 text-blue-700" },
  em_andamento: { label: "Em andamento", color: "bg-yellow-100 text-yellow-700" },
  pausada: { label: "Pausada", color: "bg-red-100 text-red-700" },
  concluida: { label: "Concluída", color: "bg-green-100 text-green-700" },
};

interface ObraCardProps {
  obra: Obra;
  onEdit: (obra: Obra) => void;
  onDelete: (id: string) => void;
}

export default function ObraCard({ obra, onEdit, onDelete }: ObraCardProps) {
  const { label, color } = statusConfig[obra.status];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-base font-semibold text-zinc-800 leading-tight">{obra.nome}</h2>
        <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${color}`}>
          {label}
        </span>
      </div>

      <div className="flex flex-col gap-1 text-sm text-zinc-500">
        <span>📍 {obra.endereco}</span>
        <span>👷 {obra.responsavel}</span>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onEdit(obra)}
          className="flex-1 text-sm border border-zinc-200 rounded-lg py-1.5 hover:bg-zinc-50 transition-colors"
        >
          Editar
        </button>
        <button
          onClick={() => onDelete(obra.id!)}
          className="flex-1 text-sm border border-red-100 text-red-500 rounded-lg py-1.5 hover:bg-red-50 transition-colors"
        >
          Excluir
        </button>
      </div>
    </div>
  );
}
