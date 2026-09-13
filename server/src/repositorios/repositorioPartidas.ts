import type { RegistroPartida } from "../dominio/reglas/partida.js";

/** Lo único que el servicio necesita saber sobre dónde se guardan las partidas. */
export interface RepositorioPartidas {
  guardar(partida: RegistroPartida): void;
  buscar(id: string): RegistroPartida | undefined;
}

/** Guarda las partidas en memoria: un reinicio del servidor las borra. */
export class RepositorioPartidasEnMemoria implements RepositorioPartidas {
  private readonly partidas = new Map<string, RegistroPartida>();

  guardar(partida: RegistroPartida): void {
    this.partidas.set(partida.id, partida);
  }

  buscar(id: string): RegistroPartida | undefined {
    return this.partidas.get(id);
  }
}
