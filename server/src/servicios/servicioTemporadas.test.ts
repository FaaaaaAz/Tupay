import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { IdEquipo } from "../../../compartido/catalogo.js";
import type { PeticionCrearTemporada } from "../../../compartido/temporada.js";
import { ErrorDeJuego } from "../dominio/errores.js";
import { RepositorioPartidasEnMemoria } from "../repositorios/repositorioPartidas.js";
import { RepositorioTemporadasEnMemoria } from "../repositorios/repositorioTemporadas.js";
import { ServicioPartidas } from "./servicioPartidas.js";
import { ServicioTemporadas } from "./servicioTemporadas.js";

const PETICION: PeticionCrearTemporada = {
  equipos: ["bolivar", "theStrongest", "aurora", "wilstermann"] as IdEquipo[],
  humanos: ["bolivar"],
  duracionRealSegundos: 1,
  perroActivo: false,
  semilla: 3,
};

/** Un servidor de prueba sin Express, con un reloj que se adelanta a mano. */
function armarServidor(repositorioTemporadas = new RepositorioTemporadasEnMemoria()) {
  const reloj = { ahora: 1_000_000 };
  let partidasCreadas = 0;
  const partidas = new ServicioPartidas({
    repositorio: new RepositorioPartidasEnMemoria(),
    ahora: () => reloj.ahora,
    crearId: () => `p_${++partidasCreadas}`,
    semillaAleatoria: () => 1,
  });
  const temporadas = new ServicioTemporadas({
    repositorio: repositorioTemporadas,
    partidas,
    crearId: () => "t_1",
    semillaAleatoria: () => 1,
  });
  return { reloj, temporadas };
}

describe("servicio de temporadas", () => {
  it("cuando termina la partida de la persona, se anota el resultado y avanza la jornada", () => {
    const { reloj, temporadas } = armarServidor();
    const creada = temporadas.crear(PETICION);
    const [proximo] = creada.proximosPartidos;

    const { partida } = temporadas.jugar(creada.id, proximo, {});
    assert.equal(partida.modo, "liga");
    assert.equal(temporadas.obtener(creada.id).partidos.find((p) => p.id === proximo)?.estado, "enJuego");

    reloj.ahora += 1000;
    const despues = temporadas.obtener(creada.id);

    assert.equal(despues.partidos.find((p) => p.id === proximo)?.estado, "jugado");
    assert.equal(despues.jornadaActual, 2);
    assert.ok(despues.tabla.every((fila) => fila.jugados === 1), "algún equipo no sumó su partido");
  });

  it("si la partida se perdió en un reinicio, el partido vuelve a quedar pendiente", () => {
    const repositorioTemporadas = new RepositorioTemporadasEnMemoria();
    const antesDelReinicio = armarServidor(repositorioTemporadas);
    const creada = antesDelReinicio.temporadas.crear(PETICION);
    const [proximo] = creada.proximosPartidos;
    antesDelReinicio.temporadas.jugar(creada.id, proximo, {});

    // Otro servicio de partidas, vacío: la partida que se estaba jugando ya no existe.
    const despuesDelReinicio = armarServidor(repositorioTemporadas);
    const partido = despuesDelReinicio.temporadas.obtener(creada.id).partidos.find((p) => p.id === proximo);

    assert.equal(partido?.estado, "pendiente");
    assert.equal(partido?.partida, null);
  });

  it("una temporada que no existe responde 404", () => {
    const { temporadas } = armarServidor();
    assert.throws(
      () => temporadas.obtener("t_noexiste"),
      (error) => error instanceof ErrorDeJuego && error.estado === 404,
    );
  });
});
