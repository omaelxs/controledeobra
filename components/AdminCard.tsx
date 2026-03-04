"use client";

import React from "react";
import { motion } from "framer-motion";

interface AdminCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  status?: "success" | "warning" | "danger" | "neutral";
  onClick?: () => void;
  loading?: boolean;
}

export function AdminCard({
  icon,
  label,
  value,
  subtext,
  status = "neutral",
  onClick,
  loading = false,
}: AdminCardProps) {
  const statusColors = {
    success: { bg: "bg-green-50", text: "text-green-600", border: "border-green-200" },
    warning: { bg: "bg-yellow-50", text: "text-yellow-600", border: "border-yellow-200" },
    danger: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
    neutral: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
  };

  const colors = statusColors[status];

  return (
    <motion.div
      whileHover={{ translateY: -4 }}
      onClick={onClick}
      className={`card ${colors.bg} border-2 ${colors.border} cursor-pointer transition-all ${
        onClick ? "hover:shadow-lg" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-sm text-gray-600 mb-2">{label}</div>
          <div className={`text-3xl font-bold ${colors.text}`}>
            {loading ? (
              <div className="h-9 w-24 bg-gray-300 rounded animate-pulse" />
            ) : (
              value
            )}
          </div>
          {subtext && (
            <div className="text-xs text-gray-500 mt-2">{subtext}</div>
          )}
        </div>
        <div className={`${colors.text} text-2xl`}>{icon}</div>
      </div>
    </motion.div>
  );
}
