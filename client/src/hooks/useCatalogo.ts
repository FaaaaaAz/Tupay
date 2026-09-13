import { useEffect, useState } from "react";
import type { Equipo, Estadio, IdEquipo } from "../../../compartido/catalogo.js";
import { obtenerEquipos, obtenerEstadios } from "../api/catalogo";

export interface Catalogo {
  equipos: Equipo[];
  estadios: Estadio[];
}

/** Los equipos y estadios vienen de Express: el cliente no tiene la lista escrita. */
export function useCatalogo() {
  const [catalogo, setCatalogo] = useState<Catalogo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([obtenerEquipos(), obtenerEstadios()])
      .then(([equipos, estadios]) => setCatalogo({ equipos, estadios }))
      .catch((causa: unknown) =>
        setError(causa instanceof Error ? causa.message : "No se pudo cargar el catálogo"),
      );
  }, []);

  return { catalogo, error };
}

export function equipoPorId(equipos: Equipo[], id: IdEquipo): Equipo {
  const equipo = equipos.find((candidato) => candidato.id === id);
  if (!equipo) throw new Error(`El catálogo no tiene el equipo ${id}`);
  return equipo;
}
