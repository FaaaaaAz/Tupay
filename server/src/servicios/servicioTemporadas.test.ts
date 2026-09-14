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
  return { reloj, temporadas, partidas };
}

describe("servicio de temporadas", () => {
  it("abandonar un partido pausado lo deja pendiente sin registrar un empate", () => {
    const { reloj, temporadas, partidas } = armarServidor();
    const temporada = temporadas.crear(PETICION);
    const id = temporada.proximosPartidos[0];
    const { partida } = temporadas.jugar(temporada.id, id, {});
    partidas.pausar(partida.id, true);
    reloj.ahora += 60000;
    assert.equal(temporadas.obtener(temporada.id).jornadaActual, 1);
    partidas.abandonar(partida.id);
    const actual = temporadas.obtener(temporada.id);
    assert.equal(actual.partidos.find((p) => p.id === id)?.estado, "pendiente");
    assert.ok(actual.tabla.every((fila) => fila.jugados === 0));
    assert.notEqual(temporadas.jugar(temporada.id, id, {}).partida.id, partida.id);
  });

  it("salir después de finalizar conserva el resultado para la tabla", () => {
    const { reloj, temporadas, partidas } = armarServidor();
    const temporada = temporadas.crear(PETICION);
    const { partida } = temporadas.jugar(temporada.id, temporada.proximosPartidos[0], {});
    reloj.ahora += 1001;
    partidas.obtener(partida.id);
    partidas.abandonar(partida.id);
    assert.equal(temporadas.obtener(temporada.id).jornadaActual, 2);
  });
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
