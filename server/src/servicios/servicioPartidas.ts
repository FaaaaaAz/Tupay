import type {
  Partida,
  PeticionCrearPartida,
  PeticionEmote,
  PeticionTiro,
  RespuestaTiro,
} from "../../../compartido/partida.js";
import { ErrorDeJuego } from "../dominio/errores.js";
import { CUADROS_POR_SEGUNDO } from "../dominio/fisica/configuracionFisica.js";
import { MENSAJES } from "../dominio/mensajes.js";
import { lanzarEmote } from "../dominio/reglas/emotes.js";
import { crearRegistro, type RegistroPartida } from "../dominio/reglas/partida.js";
import { actualizarTiempo } from "../dominio/reglas/tiempo.js";
import { cambiarPausa } from "../dominio/reglas/pausa.js";
import {
  jugarTurnoDelRival,
  tirarComoHumano,
  type ResultadoDelTiro,
} from "../dominio/reglas/tiro.js";
import { aPartidaPublica } from "../dominio/reglas/vistaPublica.js";
import type { RepositorioPartidas } from "../repositorios/repositorioPartidas.js";

export interface DependenciasServicioPartidas {
  repositorio: RepositorioPartidas;
  /** Instante actual en milisegundos. */
  ahora: () => number;
  crearId: () => string;
  /** Semilla para las partidas que no piden una. */
  semillaAleatoria: () => number;
}

type Jugada = (registro: RegistroPartida, ahora: number) => ResultadoDelTiro;

/** Coordina cada caso de uso: busca la partida, le aplica las reglas y la guarda. */
export class ServicioPartidas {
  private readonly dependencias: DependenciasServicioPartidas;

  constructor(dependencias: DependenciasServicioPartidas) {
    this.dependencias = dependencias;
  }

  crear(peticion: PeticionCrearPartida): Partida {
    const { repositorio, ahora, crearId, semillaAleatoria } = this.dependencias;
    const momento = ahora();
    const semilla = peticion.semilla ?? semillaAleatoria();
    const registro = crearRegistro(peticion, crearId(), momento, semilla);

    repositorio.guardar(registro);
    return aPartidaPublica(registro, momento);
  }

  obtener(id: string): Partida {
    const registro = this.buscar(id);
    const momento = this.dependencias.ahora();
    actualizarTiempo(registro, momento);

    this.dependencias.repositorio.guardar(registro);
    return aPartidaPublica(registro, momento);
  }

  tirar(id: string, peticion: PeticionTiro): RespuestaTiro {
    return this.jugar(id, (registro, momento) => tirarComoHumano(registro, peticion, momento));
  }

  pausar(id: string, pausada: boolean): Partida {
    const registro = this.buscar(id);
    const ahora = this.dependencias.ahora();
    cambiarPausa(registro, pausada, ahora);
    this.dependencias.repositorio.guardar(registro);
    return aPartidaPublica(registro, ahora);
  }

  abandonar(id: string): void {
    const registro = this.buscar(id);
    // Un resultado ya confirmado debe seguir disponible para la tabla de temporada.
    if (registro.estado !== "finalizada") this.dependencias.repositorio.eliminar(id);
  }

  turnoRival(id: string): RespuestaTiro {
    return this.jugar(id, (registro, momento) => jugarTurnoDelRival(registro, momento));
  }

  lanzarEmote(id: string, peticion: PeticionEmote): Partida {
    const registro = this.buscar(id);
    const momento = this.dependencias.ahora();
    lanzarEmote(registro, peticion, momento);

    this.dependencias.repositorio.guardar(registro);
    return aPartidaPublica(registro, momento);
  }

  private jugar(id: string, jugada: Jugada): RespuestaTiro {
    const registro = this.buscar(id);
    const momento = this.dependencias.ahora();
    const { recorrido, eventos, contactos } = jugada(registro, momento);

    this.dependencias.repositorio.guardar(registro);
    return {
      recorrido,
      eventos,
      contactos,
      cuadrosPorSegundo: CUADROS_POR_SEGUNDO,
      partida: aPartidaPublica(registro, momento),
    };
  }

  private buscar(id: string): RegistroPartida {
    const registro = this.dependencias.repositorio.buscar(id);
    if (!registro) throw new ErrorDeJuego(MENSAJES.partidaInexistente, 404);
    return registro;
  }
}
