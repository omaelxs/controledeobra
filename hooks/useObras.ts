import { useState, useEffect, useCallback } from "react";
import { Obra, ObraFormData } from "@/types";
import {
  getObras,
  getObra,
  createObra,
  updateObra,
  deleteObra,
} from "@/services/obras.service";

export function useObras() {
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchObras = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getObras();
      setObras(data);
    } catch (err) {
      setError("Erro ao carregar obras.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchObras();
  }, [fetchObras]);

  async function create(data: ObraFormData) {
    const id = await createObra(data);
    await fetchObras();
    return id;
  }

  async function update(id: string, data: Partial<ObraFormData>) {
    await updateObra(id, data);
    await fetchObras();
  }

  async function remove(id: string) {
    await deleteObra(id);
    setObras((prev) => prev.filter((o) => o.id !== id));
  }

  async function fetchOne(id: string): Promise<Obra | null> {
    return getObra(id);
  }

  return { obras, loading, error, create, update, remove, fetchOne, refresh: fetchObras };
}
