"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChecklistItem, ScopeItemResult, ScopeStatus, ChecklistItemPhoto } from "@/types/vistoria";

interface VistoriaTransitionProps {
  scopes: readonly string[];
  checklistItems: ChecklistItem[];
  itemResults: Record<string, ScopeItemResult>;
  activeScope: string | null;
  scopeResults: Record<string, any>;

  onScopeOpen: (scope: string) => void;
  onScopeSave: () => void;
  onItemStatusChange: (itemId: string, status: ScopeStatus) => void;
  onItemObservation: (itemId: string, observation: string) => void;
  onPhotoAdd: (itemId: string, photo: ChecklistItemPhoto) => void;
  onPhotoRemove: (itemId: string, photoId: string) => void;
}

const EASING = "cubic-bezier(0.4, 0, 0.2, 1)"; // Material Design motion curve
const ANIMATION_DURATION = 0.35; // 350ms

const STATUS_COLORS: Record<ScopeStatus, { bg: string; border: string; color: string }> = {
  conforme: { bg: "rgba(34,197,94,.12)", border: "#22c55e", color: "#22c55e" },
  atencao: { bg: "rgba(234,179,8,.10)", border: "#eab308", color: "#eab308" },
  nao_conforme: { bg: "rgba(164,22,26,.12)", border: "var(--red-accent)", color: "var(--red-accent)" },
  pendente: { bg: "var(--charcoal)", border: "rgba(255,255,255,.1)", color: "rgba(255,255,255,.3)" },
};

export function VistoriaTransition({
  scopes,
  checklistItems,
  itemResults,
  activeScope,
  scopeResults,
  onScopeOpen,
  onScopeSave,
  onItemStatusChange,
  onItemObservation,
  onPhotoAdd,
  onPhotoRemove,
}: VistoriaTransitionProps) {
  const [photoUploadingItemId, setPhotoUploadingItemId] = useState<string | null>(null);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
      <AnimatePresence mode="wait">
        {/* VISUALIZAÇÃO DE ESCOPOS */}
        {!activeScope && (
          <motion.div
            key="scopes-view"
            initial={{ opacity: 0.9, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0.9, x: 100 }}
            transition={{ duration: ANIMATION_DURATION, ease: EASING }}
            style={{
              position: "absolute",
              inset: 0,
              overflow: "auto",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
              {scopes.map((scope) => {
                const result = scopeResults[scope];
                const status = result?.status || "pendente";
                const styles = STATUS_COLORS[status as ScopeStatus];

                return (
                  <motion.button
                    key={scope}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onScopeOpen(scope)}
                    style={{
                      padding: 16,
                      borderRadius: 8,
                      border: `2px solid ${styles.border}`,
                      background: styles.bg,
                      color: styles.color,
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: 12,
                      textAlign: "center",
                      transition: "all 150ms",
                    }}
                  >
                    <div style={{ marginBottom: 8 }}>{scope}</div>
                    <div style={{ fontSize: 10, opacity: 0.7 }}>
                      {status === "pendente" ? "○ Pendente" : status === "conforme" ? "✓ Conforme" : status === "atencao" ? "⚠ Atenção" : "✗ Não Conf."}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* VISUALIZAÇÃO DE CHECKLIST */}
        {activeScope && (
          <motion.div
            key="checklist-view"
            initial={{ opacity: 0.9, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0.9, x: -100 }}
            transition={{ duration: ANIMATION_DURATION, ease: EASING }}
            style={{
              position: "absolute",
              inset: 0,
              overflow: "auto",
              padding: "16px 0",
            }}
          >
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>{activeScope}</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {checklistItems.map((item, idx) => {
                const result = itemResults[item.id] || { itemId: item.id, status: "pendente" as ScopeStatus };

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    style={{
                      padding: 12,
                      borderRadius: 6,
                      background: "rgba(255,255,255,.02)",
                      border: `1px solid ${STATUS_COLORS[result.status].border}`,
                      transition: "all 120ms",
                    }}
                  >
                    {/* Status Buttons */}
                    <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                      {(["conforme", "atencao", "nao_conforme"] as ScopeStatus[]).map((status) => (
                        <motion.button
                          key={status}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => onItemStatusChange(item.id, status)}
                          style={{
                            flex: 1,
                            padding: "6px 8px",
                            fontSize: 10,
                            fontWeight: 600,
                            borderRadius: 4,
                            border: `1.5px solid ${result.status === status ? STATUS_COLORS[status].border : "rgba(255,255,255,.1)"}`,
                            background: result.status === status ? STATUS_COLORS[status].bg : "transparent",
                            color: result.status === status ? STATUS_COLORS[status].color : "rgba(255,255,255,.3)",
                            cursor: "pointer",
                            transition: "all 120ms",
                          }}
                        >
                          {status === "conforme" && "✓"}
                          {status === "atencao" && "⚠"}
                          {status === "nao_conforme" && "✗"}
                        </motion.button>
                      ))}
                    </div>

                    {/* Item Text */}
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
                      {item.text}
                    </div>

                    {/* Observation */}
                    <textarea
                      placeholder="Observação..."
                      value={result.observation || ""}
                      onChange={(e) => onItemObservation(item.id, e.target.value)}
                      style={{
                        width: "100%",
                        padding: "6px 8px",
                        fontSize: 11,
                        borderRadius: 4,
                        border: "1px solid rgba(255,255,255,.1)",
                        background: "rgba(255,255,255,.02)",
                        color: "inherit",
                        fontFamily: "inherit",
                        minHeight: 40,
                        marginBottom: 8,
                        resize: "vertical",
                      }}
                    />

                    {/* Photos */}
                    {result.photos && result.photos.length > 0 && (
                      <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                        {result.photos.map((photo) => (
                          <motion.div
                            key={photo.id}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.2 }}
                            style={{
                              position: "relative",
                              width: 60,
                              height: 60,
                              borderRadius: 4,
                              overflow: "hidden",
                              border: "1px solid rgba(255,255,255,.1)",
                            }}
                          >
                            <img
                              src={photo.url}
                              alt="Item foto"
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                            <button
                              onClick={() => onPhotoRemove(item.id, photo.id)}
                              style={{
                                position: "absolute",
                                top: 0,
                                right: 0,
                                width: 20,
                                height: 20,
                                borderRadius: "50%",
                                background: "rgba(0,0,0,.6)",
                                border: "none",
                                color: "#fff",
                                fontSize: 12,
                                cursor: "pointer",
                              }}
                            >
                              ✕
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* Add Photo Button */}
                    <button
                      onClick={() => setPhotoUploadingItemId(item.id)}
                      style={{
                        width: "100%",
                        padding: "6px 8px",
                        fontSize: 10,
                        borderRadius: 4,
                        border: "1px dashed rgba(255,255,255,.2)",
                        background: "transparent",
                        color: "rgba(255,255,255,.5)",
                        cursor: "pointer",
                        transition: "all 150ms",
                      }}
                    >
                      + Adicionar Foto
                    </button>
                  </motion.div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onScopeSave}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  borderRadius: 4,
                  border: "1px solid #22c55e",
                  background: "transparent",
                  color: "#22c55e",
                  cursor: "pointer",
                }}
              >
                OK
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
