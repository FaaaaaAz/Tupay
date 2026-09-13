import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { IdEquipo } from "../../../../compartido/catalogo.js";
import type { Marcador } from "../../../../compartido/partida.js";
import type { PartidoDeTemporada, PeticionCrearTemporada } from "../../../../compartido/temporada.js";
import { crearAzar } from "../../utilidades/azar.js";
import { EQUIPOS } from "../catalogo.js";
import { ErrorDeJuego } from "../errores.js";
import { MENSAJES } from "../mensajes.js";
import { generarCalendario } from "./calendario.js";
import { simularMarcador } from "./marcadorSimulado.js";
import { calcularTabla } from "./tabla.js";
import {
  aTemporadaPublica,
  avanzarTemporada,
  crearRegistroTemporada,
  involucraAUnaPersona,
  jornadaActual,
  peticionParaJugar,
  proximosPartidos,
  registrarResultado,
  type RegistroTemporada,
} from "./temporada.js";

const DIEZ = Object.keys(EQUIPOS) as IdEquipo[];
const CUATRO: IdEquipo[] = ["bolivar", "theStrongest", "aurora", "wilstermann"];

function crear(cambios: Partial<PeticionCrearTemporada> = {}, semilla = 1): RegistroTemporada {
  return crearRegistroTemporada({ humanos: ["bolivar"], perroActivo: false, ...cambios }, "t_prueba", semilla);
}

/** Resuelve el próximo partido con victoria 1 a 0 de la persona y avanza la temporada. */
function ganarElProximo(registro: RegistroTemporada): void {
  const [partido] = proximosPartidos(registro);
  const personaDeLocal = registro.humanos.includes(partido.local);
  registrarResultado(partido, personaDeLocal ? { local: 1, visitante: 0 } : { local: 0, visitante: 1 });
  avanzarTemporada(registro);
}

function rechaza(accion: () => unknown, mensaje: string): void {
  assert.throws(accion, (error) => error instanceof ErrorDeJuego && error.message === mensaje);
}

function partido(local: IdEquipo, visitante: IdEquipo, marcador: Marcador | null): PartidoDeTemporada {
  return { id: `${local}-${visitante}`, jornada: 1, local, visitante, estado: "jugado", marcador, partida: null };
}

describe("calendario todos contra todos", () => {
  it("con diez equipos arma 9 jornadas de 5 partidos y cada par se cruza una sola vez", () => {
    const cruces = generarCalendario(DIEZ);
    const pares = new Set(cruces.map((cruce) => [cruce.local, cruce.visitante].sort().join(" vs ")));

    assert.equal(cruces.length, 45);
    assert.equal(new Set(cruces.map((cruce) => cruce.jornada)).size, 9);
    assert.equal(pares.size, 45);
  });

  it("nadie juega dos veces en la misma jornada", () => {
    const cruces = generarCalendario(DIEZ);
    for (let jornada = 1; jornada <= 9; jornada++) {
      const equipos = cruces
        .filter((cruce) => cruce.jornada === jornada)
        .flatMap((cruce) => [cruce.local, cruce.visitante]);
      assert.equal(new Set(equipos).size, 10, `en la jornada ${jornada} alguien falta o se repite`);
    }
  });

  it("con una cantidad impar de equipos, cada uno descansa una jornada", () => {
    const cinco: IdEquipo[] = [...CUATRO, "sanJose"];
    const cruces = generarCalendario(cinco);

    assert.equal(cruces.length, 10);
    assert.equal(new Set(cruces.map((cruce) => cruce.jornada)).size, 5);
    for (const equipo of cinco) {
      const jugados = cruces.filter((cruce) => cruce.local === equipo || cruce.visitante === equipo);
      assert.equal(jugados.length, 4);
    }
  });

  it("con la misma semilla el calendario sale igual, y con otra cambia", () => {
    assert.deepEqual(crear({}, 5).partidos, crear({}, 5).partidos);
    assert.notDeepEqual(crear({}, 5).partidos, crear({}, 6).partidos);
  });
});

describe("tabla de posiciones", () => {
  it("suma 3 por victoria y 1 por empate, y ordena por puntos y diferencia de gol", () => {
    const tabla = calcularTabla(CUATRO, [
      partido("bolivar", "aurora", { local: 2, visitante: 0 }),
      partido("theStrongest", "wilstermann", { local: 1, visitante: 1 }),
      partido("aurora", "theStrongest", { local: 0, visitante: 3 }),
      partido("wilstermann", "bolivar", null),
    ]);

    assert.deepEqual(
      tabla.map((fila) => [fila.equipo, fila.jugados, fila.puntos, fila.diferencia]),
      [
        ["theStrongest", 2, 4, 3],
        ["bolivar", 1, 3, 2],
        ["wilstermann", 1, 1, 0],
        ["aurora", 2, 0, -5],
      ],
    );
  });

  it("con los mismos puntos, gana la mejor diferencia de gol", () => {
    const tabla = calcularTabla(CUATRO, [
      partido("aurora", "bolivar", { local: 1, visitante: 0 }),
      partido("wilstermann", "theStrongest", { local: 4, visitante: 0 }),
    ]);

    assert.deepEqual(tabla.slice(0, 2).map((fila) => fila.equipo), ["wilstermann", "aurora"]);
  });

  it("los goles simulados están entre 0 y 4, y se repiten con la misma semilla", () => {
    const azar = crearAzar(11);
    const otroAzar = crearAzar(11);
    for (let i = 0; i < 500; i++) {
      const marcador = simularMarcador(azar);
      assert.deepEqual(marcador, simularMarcador(otroAzar));
      assert.ok([marcador.local, marcador.visitante].every((goles) => goles >= 0 && goles <= 4));
    }
  });
});

describe("temporada", () => {
  it("rechaza cero o tres personas, y a dos personas con el mismo equipo", () => {
    rechaza(() => crear({ humanos: [] }), MENSAJES.humanosInvalidos);
    rechaza(() => crear({ humanos: ["bolivar", "aurora", "sanJose"] }), MENSAJES.humanosInvalidos);
    rechaza(() => crear({ humanos: ["bolivar", "bolivar"] }), MENSAJES.equiposRepetidos);
  });

  it("al empezar, el próximo partido es el de la persona en la jornada 1", () => {
    const registro = crear({ equipos: CUATRO });
    const proximos = proximosPartidos(registro);

    assert.equal(jornadaActual(registro), 1);
    assert.equal(proximos.length, 1);
    assert.equal(proximos[0].jornada, 1);
    assert.ok(involucraAUnaPersona(registro, proximos[0]));
  });

  it("cuando la persona termina su partido, se simulan los demás de la jornada", () => {
    const registro = crear({ equipos: CUATRO });
    ganarElProximo(registro);
    const primeraJornada = registro.partidos.filter((cruce) => cruce.jornada === 1);

    assert.deepEqual(primeraJornada.map((cruce) => cruce.estado).sort(), ["jugado", "simulado"]);
    assert.equal(jornadaActual(registro), 2);
  });

  it("con diez equipos la persona juega 9 partidos, y al final hay campeón", () => {
    const registro = crear();
    let jugados = 0;
    while (proximosPartidos(registro).length > 0) {
      ganarElProximo(registro);
      jugados++;
    }
    const temporada = aTemporadaPublica(registro);

    assert.equal(jugados, 9);
    assert.equal(temporada.estado, "finalizada");
    assert.ok(temporada.partidos.every((cruce) => cruce.marcador !== null));
    assert.equal(temporada.campeon, "bolivar", "ganó todos sus partidos y no salió campeón");
  });

  it("si la tabla termina empatada en todo, el campeón lo decide el sorteo y no el orden de la lista", () => {
    const campeones = new Set(
      Array.from({ length: 10 }, (_, semilla) => {
        const registro = crear({ equipos: ["bolivar", "theStrongest"] }, semilla);
        registrarResultado(proximosPartidos(registro)[0], { local: 0, visitante: 0 });
        avanzarTemporada(registro);
        return aTemporadaPublica(registro).campeon;
      }),
    );

    assert.equal(campeones.size, 2, "con empate total gana siempre el mismo equipo");
  });

  it("no se puede adelantar un partido de una jornada posterior", () => {
    const registro = crear({ equipos: CUATRO });
    const posterior = registro.partidos.find(
      (cruce) => cruce.jornada === 2 && involucraAUnaPersona(registro, cruce),
    );
    assert.ok(posterior);

    rechaza(() => peticionParaJugar(registro, posterior), MENSAJES.jornadaAnterior(1));
  });

  it("un partido sin personas no se puede jugar a mano", () => {
    const registro = crear({ equipos: CUATRO });
    const ajeno = registro.partidos.find((cruce) => !involucraAUnaPersona(registro, cruce));
    assert.ok(ajeno);

    rechaza(() => peticionParaJugar(registro, ajeno), MENSAJES.partidoSinPersonas);
  });

  it("la partida es de Liga: la persona juega y el rival lo maneja el servidor", () => {
    const registro = crear({ equipos: CUATRO, dificultad: "dificil" });
    const [proximo] = proximosPartidos(registro);
    const peticion = peticionParaJugar(registro, proximo);
    const jugadores = [peticion.local, peticion.visitante];

    assert.equal(peticion.modo, "liga");
    assert.deepEqual(
      jugadores.map((jugador) => jugador.tipo).sort(),
      ["humano", "servidor"],
    );
    assert.equal(jugadores.find((jugador) => jugador.tipo === "servidor")?.dificultad, "dificil");
  });

  it("el rival solo lo puede tomar un segundo jugador", () => {
    const deUno = crear({ equipos: CUATRO });
    rechaza(
      () => peticionParaJugar(deUno, proximosPartidos(deUno)[0], "humano"),
      MENSAJES.rivalSoloConDosJugadores,
    );

    const deDos = crear({ equipos: CUATRO, humanos: ["bolivar", "aurora"] });
    const contraUnEquipoDeNadie = () =>
      proximosPartidos(deDos).find(
        (cruce) => !(deDos.humanos.includes(cruce.local) && deDos.humanos.includes(cruce.visitante)),
      );
    while (!contraUnEquipoDeNadie()) ganarElProximo(deDos);
    const peticion = peticionParaJugar(deDos, contraUnEquipoDeNadie() as PartidoDeTemporada, "humano");

    assert.equal(peticion.local.tipo, "humano");
    assert.equal(peticion.visitante.tipo, "humano");
  });
});
