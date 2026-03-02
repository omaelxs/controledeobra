"use client";

import { createContext, useContext, ReactNode } from "react";
import { useObras } from "@/hooks/useObras";
import { Obra, ObraFormData } from "@/types";

interface ObrasContextValue {
  obras: Obra[];
  loading: boolean;
  error: string | null;
  create: (data: ObraFormData) => Promise<string>;
  update: (id: string, data: Partial<ObraFormData>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  fetchOne: (id: string) => Promise<Obra | null>;
  refresh: () => Promise<void>;
}

const ObrasContext = createContext<ObrasContextValue | null>(null);

export function ObrasProvider({ children }: { children: ReactNode }) {
  const value = useObras();
  return <ObrasContext.Provider value={value}>{children}</ObrasContext.Provider>;
}

export function useObrasContext() {
  const ctx = useContext(ObrasContext);
  if (!ctx) throw new Error("useObrasContext must be used inside ObrasProvider");
  return ctx;
}
