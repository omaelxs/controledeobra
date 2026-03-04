import { useState, useEffect, useCallback } from "react";
import { Obra, ObraFormData } from "@/types";
import { UserRole } from "@/types/user";
import {
  getObras,
  getObra,
  createObra,
  updateObra,
  deleteObra,
} from "@/services/obras.service";
import { useUserRole } from "@/hooks/useUserRole";

export function useObras() {
  const { role, userDoc } = useUserRole();
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const obraIdPermitida = userDoc?.obraIdPermitida;
  const isRestricted = !!obraIdPermitida && role === "user";

  const fetchObras = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data = await getObras();
      if (isRestricted) {
        data = data.filter(o => o.id === obraIdPermitida);
      }
      setObras(data);
    } catch (err) {
      setError("Erro ao carregar obras.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isRestricted, obraIdPermitida]);

  useEffect(() => {
    fetchObras();
  }, [fetchObras]);

  async function create(data: ObraFormData) {
    const id = await createObra(data, role);
    await fetchObras();
    return id;
  }

  async function update(id: string, data: Partial<ObraFormData>) {
    await updateObra(id, data, role);
    await fetchObras();
  }

  async function remove(id: string) {
    await deleteObra(id, role);
    setObras((prev) => prev.filter((o) => o.id !== id));
  }

  async function fetchOne(id: string): Promise<Obra | null> {
    return getObra(id);
  }

  return { obras, loading, error, create, update, remove, fetchOne, refresh: fetchObras };
}
