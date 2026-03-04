"use client";

import React, { ReactNode } from "react";
import { motion } from "framer-motion";

interface AdminFormProps {
  title: string;
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  children: ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
}

export function AdminForm({
  title,
  onSubmit,
  onCancel,
  loading = false,
  children,
  submitLabel = "Salvar",
  cancelLabel = "Cancelar",
}: AdminFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = onSubmit(e);
      if (result instanceof Promise) {
        await result;
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50"
      onClick={onCancel}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
      >
        <h2 className="text-xl font-bold mb-6 text-gray-800">{title}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {children}

          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="btn-ghost px-4 py-2"
            >
              {cancelLabel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="btn-primary px-4 py-2"
            >
              {isSubmitting ? "Salvando..." : submitLabel}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  defaultValue?: string;
  help?: string;
}

export function FormField({
  label,
  name,
  type = "text",
  placeholder = "",
  required = false,
  options,
  defaultValue = "",
  help,
}: FormFieldProps) {
  return (
    <div>
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>

      {type === "select" && options ? (
        <select
          id={name}
          name={name}
          defaultValue={defaultValue}
          required={required}
          className="form-input"
        >
          <option value="">Selecione...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          id={name}
          name={name}
          placeholder={placeholder}
          required={required}
          defaultValue={defaultValue}
          className="form-input"
          rows={3}
        />
      ) : (
        <input
          id={name}
          type={type}
          name={name}
          placeholder={placeholder}
          required={required}
          defaultValue={defaultValue}
          className="form-input"
        />
      )}

      {help && <p className="text-xs text-gray-500 mt-1">{help}</p>}
    </div>
  );
}
