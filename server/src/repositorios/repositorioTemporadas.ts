import type { RegistroTemporada } from "../dominio/temporada/temporada.js";

export interface RepositorioTemporadas {
  guardar(temporada: RegistroTemporada): void;
  buscar(id: string): RegistroTemporada | undefined;
}

/** Guarda las temporadas en memoria: un reinicio del servidor las borra. */
export class RepositorioTemporadasEnMemoria implements RepositorioTemporadas {
  private readonly temporadas = new Map<string, RegistroTemporada>();

  guardar(temporada: RegistroTemporada): void {
    this.temporadas.set(temporada.id, temporada);
  }

  buscar(id: string): RegistroTemporada | undefined {
    return this.temporadas.get(id);
  }
}
