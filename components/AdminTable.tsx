"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  width?: string;
}

interface AdminTableProps<T extends { id?: string }> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  renderActions?: (row: T) => React.ReactNode;
}

export function AdminTable<T extends { id?: string }>({
  columns,
  data,
  loading = false,
  pageSize = 10,
  onRowClick,
  renderActions,
}: AdminTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / pageSize);
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const displayData = data.slice(startIdx, endIdx);

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="card text-center py-8 text-gray-500">
        Nenhum item encontrado
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-300">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className="text-left px-4 py-3 font-semibold text-gray-700"
                  style={{ width: col.width }}
                >
                  {col.label}
                </th>
              ))}
              {renderActions && (
                <th className="text-left px-4 py-3 font-semibold text-gray-700">
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {displayData.map((row, idx) => (
              <motion.tr
                key={String(row.id) || idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-gray-200 hover:bg-gray-50 ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
              >
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-3">
                    {col.render
                      ? col.render(row[col.key], row)
                      : String(row[col.key] ?? "-")}
                  </td>
                ))}
                {renderActions && (
                  <td className="px-4 py-3">{renderActions(row)}</td>
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="btn-ghost px-3 py-1 text-sm disabled:opacity-50"
          >
            Anterior
          </button>

          {[...Array(totalPages)].map((_, i) => {
            const page = i + 1;
            const showPage =
              page === 1 ||
              page === totalPages ||
              Math.abs(page - currentPage) <= 1;

            if (!showPage && i > 0 && page === 2) {
              return <span key="dots">...</span>;
            }

            return (
              showPage && (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 text-sm rounded ${
                    currentPage === page
                      ? "btn-primary"
                      : "btn-ghost"
                  }`}
                >
                  {page}
                </button>
              )
            );
          })}

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="btn-ghost px-3 py-1 text-sm disabled:opacity-50"
          >
            Próximo
          </button>
        </div>
      )}
    </div>
  );
}
