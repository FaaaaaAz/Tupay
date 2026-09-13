import type {
  Partida,
  PeticionCrearPartida,
  PeticionTiro,
  RespuestaTiro,
} from "../../../compartido/partida.js";
import { ErrorDeJuego } from "../dominio/errores.js";
import { CUADROS_POR_SEGUNDO } from "../dominio/fisica/configuracionFisica.js";
import { MENSAJES } from "../dominio/mensajes.js";
import { crearRegistro, type RegistroPartida } from "../dominio/reglas/partida.js";
import { actualizarTiempo } from "../dominio/reglas/tiempo.js";
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

  turnoRival(id: string): RespuestaTiro {
    return this.jugar(id, (registro, momento) => jugarTurnoDelRival(registro, momento));
  }

  private jugar(id: string, jugada: Jugada): RespuestaTiro {
    const registro = this.buscar(id);
    const momento = this.dependencias.ahora();
    const { recorrido, eventos } = jugada(registro, momento);

    this.dependencias.repositorio.guardar(registro);
    return {
      recorrido,
      eventos,
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
