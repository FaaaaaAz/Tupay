import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Dificultad, TipoCharco } from "../../../../compartido/partida.js";
import { ErrorDeJuego } from "../errores.js";
import type { ResultadoSimulacion } from "../fisica/simulacion.js";
import { MENSAJES } from "../mensajes.js";
import { RIVAL } from "../reglas/configuracionReglas.js";
import { crearRegistro, type RegistroPartida } from "../reglas/partida.js";
import { jugarTurnoDelRival, tirarComoHumano } from "../reglas/tiro.js";
import { decidirTiroDelRival, generarCandidatos, puntuar } from "./rivalPorMuestreo.js";

const INICIO = 1_000_000;

function contraElServidor(semilla: number, dificultad: Dificultad = "dificil"): RegistroPartida {
  const registro = crearRegistro(
    {
      modo: "eliminatoria",
      local: { equipo: "bolivar", tipo: "humano" },
      visitante: { equipo: "theStrongest", tipo: "servidor", dificultad },
      perroActivo: false,
      estadio: "felixCapriles",
    },
    "p_rival",
    INICIO,
    semilla,
  );
  registro.turno = "visitante";
  return registro;
}

/** Partido a un gol entre dos equipos del servidor. Devuelve quién ganó, o `null` si nadie anotó. */
function jugarEntreServidores(local: Dificultad, visitante: Dificultad, semilla: number) {
  const registro = crearRegistro(
    {
      modo: "eliminatoria",
      local: { equipo: "bolivar", tipo: "servidor", dificultad: local },
      visitante: { equipo: "theStrongest", tipo: "servidor", dificultad: visitante },
      perroActivo: false,
      estadio: "felixCapriles",
      golesParaGanar: 1,
    },
    "p_duelo",
    INICIO,
    semilla,
  );
  for (let tiro = 0; tiro < 60 && registro.estado === "enJuego"; tiro++) {
    jugarTurnoDelRival(registro, registro.inicioTurno);
  }
  return registro.resultado?.ganador ?? null;
}

function resultadoCon(pelota: { x: number; y: number }, arcoConGol: "izquierdo" | "derecho" | null = null) {
  return { pelota, arcoConGol } as ResultadoSimulacion;
}

function rechaza(accion: () => unknown, mensaje: string): void {
  assert.throws(accion, (error) => error instanceof ErrorDeJuego && error.message === mensaje);
}

describe("rival del servidor", () => {
  it("tira con una tapita propia y le devuelve el turno a la persona", () => {
    const registro = contraElServidor(1);
    const posicionesPropias = () =>
      registro.tapitas.filter((tapita) => tapita.lado === "visitante").map((tapita) => tapita.posicion);
    const antes = posicionesPropias();

    const { recorrido } = jugarTurnoDelRival(registro, INICIO);

    assert.ok(recorrido.length > 1);
    assert.notDeepEqual(posicionesPropias(), antes, "no movió ninguna tapita propia");
    assert.equal(registro.turno, "local");
  });

  it("no juega cuando le toca a una persona", () => {
    const registro = contraElServidor(1);
    registro.turno = "local";

    rechaza(() => jugarTurnoDelRival(registro, INICIO), MENSAJES.noEsTurnoDelRival);
  });

  it("una persona no puede tirar con el equipo del servidor", () => {
    const registro = contraElServidor(1);
    const tiro = { lado: "visitante" as const, tapita: "visitante-1", direccion: { x: -1, y: 0 }, fuerza: 0.5 };

    rechaza(() => tirarComoHumano(registro, tiro, INICIO), MENSAJES.noEsTuTurno);
  });

  it("con la misma semilla juega exactamente igual", () => {
    assert.deepEqual(
      jugarTurnoDelRival(contraElServidor(9), INICIO),
      jugarTurnoDelRival(contraElServidor(9), INICIO),
    );
  });

  it("en difícil casi siempre empuja la pelota hacia el arco que ataca", () => {
    const semillas = Array.from({ length: 20 }, (_, indice) => indice + 1);
    const haciaSuArco = semillas.filter((semilla) => {
      const registro = contraElServidor(semilla);
      jugarTurnoDelRival(registro, INICIO);
      return registro.marcador.visitante > 0 || registro.pelota.x < 600;
    });

    assert.ok(haciaSuArco.length >= 16, `solo ${haciaSuArco.length} de 20 tiros fueron hacia su arco`);
  });
});

describe("rival por muestreo", () => {
  it("cada dificultad prueba su cantidad de candidatos, empezando por un tiro de billar por tapita", () => {
    for (const dificultad of ["facil", "medio", "dificil"] as const) {
      const registro = contraElServidor(3, dificultad);
      const cantidad = RIVAL.dificultades[dificultad].candidatos;
      const candidatos = generarCandidatos(registro, "visitante", cantidad);

      assert.equal(candidatos.length, cantidad);
      assert.ok(candidatos.every(({ indice }) => registro.tapitas[indice].lado === "visitante"));
    }
    const puros = generarCandidatos(contraElServidor(3), "visitante", 5);
    assert.equal(new Set(puros.map(({ indice }) => indice)).size, 5, "no probó cada tapita una vez");
  });

  it("la puntuación prefiere el gol, castiga el autogol y dejar la pelota cerca del propio arco", () => {
    // El visitante ataca el arco izquierdo y defiende el derecho.
    const gol = puntuar(resultadoCon({ x: -20, y: 350 }, "izquierdo"), "visitante");
    const autogol = puntuar(resultadoCon({ x: 1220, y: 350 }, "derecho"), "visitante");
    const cercaDelArcoRival = puntuar(resultadoCon({ x: 200, y: 350 }), "visitante");
    const alMedio = puntuar(resultadoCon({ x: 600, y: 350 }), "visitante");
    const cercaDelPropio = puntuar(resultadoCon({ x: 1100, y: 350 }), "visitante");

    assert.ok(gol > cercaDelArcoRival && cercaDelArcoRival > alMedio && alMedio > cercaDelPropio);
    assert.ok(cercaDelPropio > autogol);
  });

  it("con un gol servido, lo convierte", () => {
    const registro = contraElServidor(2);
    registro.pelota = { x: 90, y: 350 };
    registro.tapitas = registro.tapitas.map((tapita) =>
      tapita.id === "visitante-4" ? { ...tapita, posicion: { x: 220, y: 350 } } : tapita,
    );
    registro.tapitas = registro.tapitas.map((tapita) =>
      tapita.id === "local-1" ? { ...tapita, posicion: { x: 60, y: 120 } } : tapita,
    );

    jugarTurnoDelRival(registro, INICIO);
    assert.equal(registro.marcador.visitante, 1);
  });

  it("gasta un tiro de poder solo para sacar la pelota de la nieve", () => {
    const conCharco = (tipo: TipoCharco, golpesParaLiberar: number) => {
      const registro = contraElServidor(4);
      registro.charcos = [
        { id: `${tipo}-1`, tipo, posicion: registro.pelota, ancho: 170, alto: 80, turnosRestantes: 2 },
      ];
      registro.pelotaAtrapada = { charco: `${tipo}-1`, golpesParaLiberar };
      return decidirTiroDelRival(registro).tiroDePoder;
    };

    assert.equal(decidirTiroDelRival(contraElServidor(4)).tiroDePoder, false);
    assert.equal(conCharco("agua", 1), false);
    assert.equal(conCharco("nieve", 2), true);
  });

  it("en difícil le gana a fácil la mayoría de los partidos", () => {
    let ganaDificil = 0;
    const partidos = 10;
    for (let semilla = 1; semilla <= partidos; semilla++) {
      // Se alternan los lados para que no influya quién defiende cada arco.
      const dificilEsLocal = semilla % 2 === 0;
      const ganador = dificilEsLocal
        ? jugarEntreServidores("dificil", "facil", semilla)
        : jugarEntreServidores("facil", "dificil", semilla);
      if (ganador === (dificilEsLocal ? "local" : "visitante")) ganaDificil += 1;
    }

    assert.ok(ganaDificil >= 7, `difícil ganó solo ${ganaDificil} de ${partidos}`);
  });
});
