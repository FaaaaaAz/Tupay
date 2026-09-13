import type {
  PeticionCrearTemporada,
  PeticionJugarPartidoDeTemporada,
  RespuestaJugarPartidoDeTemporada,
  Temporada,
} from "../../../compartido/temporada.js";
import { ErrorDeJuego } from "../dominio/errores.js";
import { MENSAJES } from "../dominio/mensajes.js";
import {
  aTemporadaPublica,
  avanzarTemporada,
  crearRegistroTemporada,
  empezarPartido,
  peticionParaJugar,
  registrarResultado,
  reiniciarPartido,
  type RegistroTemporada,
} from "../dominio/temporada/temporada.js";
import type { RepositorioTemporadas } from "../repositorios/repositorioTemporadas.js";
import type { ServicioPartidas } from "./servicioPartidas.js";

export interface DependenciasServicioTemporadas {
  repositorio: RepositorioTemporadas;
  /** La temporada crea y consulta partidas comunes: no tiene un motor de juego propio. */
  partidas: ServicioPartidas;
  crearId: () => string;
  semillaAleatoria: () => number;
}

export class ServicioTemporadas {
  private readonly dependencias: DependenciasServicioTemporadas;

  constructor(dependencias: DependenciasServicioTemporadas) {
    this.dependencias = dependencias;
  }

  crear(peticion: PeticionCrearTemporada): Temporada {
    const { repositorio, crearId, semillaAleatoria } = this.dependencias;
    const registro = crearRegistroTemporada(peticion, crearId(), peticion.semilla ?? semillaAleatoria());

    repositorio.guardar(registro);
    return aTemporadaPublica(registro);
  }

  obtener(id: string): Temporada {
    const registro = this.buscar(id);
    this.sincronizar(registro);

    this.dependencias.repositorio.guardar(registro);
    return aTemporadaPublica(registro);
  }

  jugar(
    id: string,
    partidoId: string,
    peticion: PeticionJugarPartidoDeTemporada,
  ): RespuestaJugarPartidoDeTemporada {
    const registro = this.buscar(id);
    this.sincronizar(registro);

    const partido = registro.partidos.find((candidato) => candidato.id === partidoId);
    if (!partido) throw new ErrorDeJuego(MENSAJES.partidoDeTemporadaInexistente, 404);

    const partida = this.dependencias.partidas.crear(
      peticionParaJugar(registro, partido, peticion.rivalControladoPor),
    );
    empezarPartido(partido, partida.id);

    this.dependencias.repositorio.guardar(registro);
    return { temporada: aTemporadaPublica(registro), partida };
  }

  /**
   * Igual que el reloj de las partidas, la temporada no recibe avisos: al consultarla, revisa sus
   * partidas en juego, anota las que terminaron y cierra las jornadas que ya se pueden cerrar.
   */
  private sincronizar(registro: RegistroTemporada): void {
    for (const partido of registro.partidos) {
      if (partido.estado !== "enJuego" || !partido.partida) continue;
      try {
        const partida = this.dependencias.partidas.obtener(partido.partida);
        if (partida.estado === "finalizada") registrarResultado(partido, partida.marcador);
      } catch (error) {
        if (!(error instanceof ErrorDeJuego && error.estado === 404)) throw error;
        reiniciarPartido(partido);
      }
    }
    avanzarTemporada(registro);
  }

  private buscar(id: string): RegistroTemporada {
    const registro = this.dependencias.repositorio.buscar(id);
    if (!registro) throw new ErrorDeJuego(MENSAJES.temporadaInexistente, 404);
    return registro;
  }
}
