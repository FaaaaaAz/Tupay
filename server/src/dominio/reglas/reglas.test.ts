import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { PeticionCrearPartida, PeticionTiro } from "../../../../compartido/partida.js";
import { ErrorDeJuego } from "../errores.js";
import { CUADROS_POR_SEGUNDO } from "../fisica/configuracionFisica.js";
import { MENSAJES } from "../mensajes.js";
import { CENTRO_DE_LA_CANCHA } from "./formacion.js";
import { ladoDelArcoMasCercano, rival } from "./lados.js";
import { crearRegistro, type RegistroPartida } from "./partida.js";
import { actualizarTiempo } from "./tiempo.js";
import { ejecutarTiro } from "./tiro.js";
import { aPartidaPublica } from "./vistaPublica.js";

const INICIO = 1_000_000;

/** En el estadio de referencia, sin charcos: estas pruebas son de las reglas, no de los estadios. */
function crearPartida(cambios: Partial<PeticionCrearPartida> = {}, semilla = 1): RegistroPartida {
  const peticion: PeticionCrearPartida = {
    modo: "eliminatoria",
    local: { equipo: "bolivar", tipo: "humano" },
    visitante: { equipo: "theStrongest", tipo: "humano" },
    perroActivo: false,
    estadio: "felixCapriles",
    ...cambios,
  };
  return crearRegistro(peticion, "p_prueba", INICIO, semilla);
}

/** El arquero de quien tiene el turno patea suave hacia abajo: nunca toca la pelota ni hace gol. */
function tiroInofensivo(registro: RegistroPartida, cambios: Partial<PeticionTiro> = {}): PeticionTiro {
  const lado = registro.turno;
  return { lado, tapita: `${lado}-1`, direccion: { x: 0, y: 1 }, fuerza: 0.2, ...cambios };
}

/** Deja al local frente al arco derecho, con el arquero rival fuera del camino. */
function prepararGolDelLocal(registro: RegistroPartida): PeticionTiro {
  registro.turno = "local";
  registro.tapitas = registro.tapitas.map((tapita) => {
    if (tapita.id === "local-1") return { ...tapita, posicion: { x: 1000, y: 350 } };
    if (tapita.id === "visitante-1") return { ...tapita, posicion: { x: 1100, y: 120 } };
    return tapita;
  });
  registro.pelota = { x: 1080, y: 350 };
  return { lado: "local", tapita: "local-1", direccion: { x: 1, y: 0 }, fuerza: 0.8 };
}

function rechaza(accion: () => unknown, mensaje: string, estado = 400): void {
  assert.throws(
    accion,
    (error) => error instanceof ErrorDeJuego && error.message === mensaje && error.estado === estado,
  );
}

describe("crear una partida", () => {
  it("arma cinco tapitas por lado y deja la pelota en el centro", () => {
    const registro = crearPartida();

    assert.equal(registro.tapitas.filter((tapita) => tapita.lado === "local").length, 5);
    assert.equal(registro.tapitas.filter((tapita) => tapita.lado === "visitante").length, 5);
    assert.deepEqual(registro.pelota, CENTRO_DE_LA_CANCHA);
    assert.deepEqual(registro.marcador, { local: 0, visitante: 0 });
  });

  it("sortea el saque, y con la misma semilla el sorteo se repite", () => {
    assert.equal(crearPartida({}, 7).turno, crearPartida({}, 7).turno);

    const saques = new Set(Array.from({ length: 20 }, (_, semilla) => crearPartida({}, semilla).turno));
    assert.equal(saques.size, 2, "el saque no se sortea: siempre empieza el mismo lado");
  });

  it("juega en el estadio del local, salvo que se elija otro", () => {
    assert.equal(crearPartida({ estadio: undefined }).estadio, "hernandoSiles");
    assert.equal(crearPartida({ estadio: "villaIngenio" }).estadio, "villaIngenio");
  });

  it("rechaza que los dos elijan el mismo equipo", () => {
    rechaza(
      () => crearPartida({ visitante: { equipo: "bolivar", tipo: "humano" } }),
      MENSAJES.equiposRepetidos,
    );
  });

  it("rechaza una meta de goles fuera de 1 a 5", () => {
    rechaza(() => crearPartida({ golesParaGanar: 0 }), MENSAJES.metaDeGolesInvalida);
    rechaza(() => crearPartida({ golesParaGanar: 6 }), MENSAJES.metaDeGolesInvalida);
  });

  it("en Liga no hay meta de goles y sí hay reloj", () => {
    const partida = aPartidaPublica(crearPartida({ modo: "liga" }), INICIO);

    assert.equal(partida.golesParaGanar, null);
    assert.deepEqual(partida.reloj, {
      minutoDeJuego: 0,
      segundosRealesRestantes: 300,
      duracionRealSegundos: 300,
    });
  });
});

describe("turnos y acciones inválidas", () => {
  it("un tiro válido mueve la tapita y pasa el turno al rival", () => {
    const registro = crearPartida();
    const lado = registro.turno;
    const antes = registro.tapitas.find((tapita) => tapita.id === `${lado}-1`)?.posicion;

    const { recorrido } = ejecutarTiro(registro, tiroInofensivo(registro), INICIO);
    const despues = registro.tapitas.find((tapita) => tapita.id === `${lado}-1`)?.posicion;

    assert.equal(registro.turno, rival(lado));
    assert.ok(recorrido.length > 1);
    assert.notDeepEqual(despues, antes);
  });

  it("no se puede tirar fuera de turno", () => {
    const registro = crearPartida();
    const otro = rival(registro.turno);

    rechaza(
      () => ejecutarTiro(registro, tiroInofensivo(registro, { lado: otro, tapita: `${otro}-1` }), INICIO),
      MENSAJES.noEsTuTurno,
    );
  });

  it("no se puede tirar con una tapita del rival", () => {
    const registro = crearPartida();
    const otro = rival(registro.turno);

    rechaza(
      () => ejecutarTiro(registro, tiroInofensivo(registro, { tapita: `${otro}-1` }), INICIO),
      MENSAJES.tapitaRival,
    );
  });

  it("rechaza una fuerza fuera de rango o un tiro sin dirección", () => {
    const registro = crearPartida();

    for (const cambios of [{ fuerza: 0 }, { fuerza: 1.5 }, { direccion: { x: 0, y: 0 } }]) {
      rechaza(() => ejecutarTiro(registro, tiroInofensivo(registro, cambios), INICIO), MENSAJES.tiroInvalido);
    }
  });

  it("si se vence el turno, pasa al rival y quien tardó recibe el aviso de tiempo", () => {
    const registro = crearPartida();
    const lento = registro.turno;
    const tarde = INICIO + 16_000;

    rechaza(() => ejecutarTiro(registro, tiroInofensivo(registro), tarde), MENSAJES.tiempoAgotado);
    assert.equal(registro.turno, rival(lento));
  });

  it("el reloj del turno no corre mientras se anima el tiro anterior", () => {
    const registro = crearPartida();
    const { recorrido } = ejecutarTiro(registro, tiroInofensivo(registro), INICIO);
    const finDeLaAnimacion = INICIO + (recorrido.length / CUADROS_POR_SEGUNDO) * 1000;
    const turno = registro.turno;

    assert.equal(aPartidaPublica(registro, finDeLaAnimacion - 1).turno.segundosRestantes, 15);

    actualizarTiempo(registro, finDeLaAnimacion + 14_000);
    assert.equal(registro.turno, turno, "el turno venció antes de tiempo");
  });

  it("un tiro de poder descuenta uno, y sin tiros de poder no se puede usar", () => {
    const registro = crearPartida();
    const lado = registro.turno;

    ejecutarTiro(registro, tiroInofensivo(registro, { tiroDePoder: true }), INICIO);
    assert.equal(registro.jugadores[lado].tirosDePoder, 1);

    registro.turno = lado;
    registro.jugadores[lado].tirosDePoder = 0;
    rechaza(
      () => ejecutarTiro(registro, tiroInofensivo(registro, { tiroDePoder: true }), INICIO),
      MENSAJES.sinTirosDePoder,
    );
  });
});

describe("goles y final del partido", () => {
  it("un gol suma al marcador, reinicia la formación y saca quien lo recibió", () => {
    const registro = crearPartida();
    const { eventos } = ejecutarTiro(registro, prepararGolDelLocal(registro), INICIO);

    assert.deepEqual(eventos, [{ tipo: "gol", lado: "local" }]);
    assert.deepEqual(registro.marcador, { local: 1, visitante: 0 });
    assert.deepEqual(registro.pelota, CENTRO_DE_LA_CANCHA);
    assert.deepEqual(registro.tapitas.find((tapita) => tapita.id === "local-1")?.posicion, { x: 120, y: 350 });
    assert.equal(registro.turno, "visitante");
  });

  it("en Eliminatoria el partido termina al llegar a la meta de goles", () => {
    const registro = crearPartida({ golesParaGanar: 1 });
    const { eventos } = ejecutarTiro(registro, prepararGolDelLocal(registro), INICIO);

    assert.equal(registro.estado, "finalizada");
    assert.equal(registro.resultado?.ganador, "local");
    assert.equal(eventos.at(-1)?.tipo, "finDelPartido");
  });

  it("con la partida terminada no se puede seguir tirando", () => {
    const registro = crearPartida({ golesParaGanar: 1 });
    ejecutarTiro(registro, prepararGolDelLocal(registro), INICIO);

    rechaza(() => ejecutarTiro(registro, tiroInofensivo(registro), INICIO), MENSAJES.partidaTerminada, 409);
  });

  it("en Liga el partido termina por tiempo y puede quedar empatado", () => {
    const registro = crearPartida({ modo: "liga", duracionRealSegundos: 10 });
    actualizarTiempo(registro, INICIO + 10_000);

    assert.equal(registro.estado, "finalizada");
    assert.deepEqual(registro.resultado, { ganador: null, marcador: { local: 0, visitante: 0 } });
  });
});

describe("los charcos en el partido", () => {
  /** Un charco en el centro de la cancha, con la pelota ya atrapada adentro. */
  function conPelotaAtrapada(tipo: "agua" | "nieve", golpesParaLiberar: number): RegistroPartida {
    const registro = crearPartida({ estadio: tipo === "agua" ? "hernandoSiles" : "villaIngenio" });
    registro.turno = "local";
    registro.charcos = [
      { id: `${tipo}-9`, tipo, posicion: CENTRO_DE_LA_CANCHA, ancho: 170, alto: 80, turnosRestantes: 4 },
    ];
    registro.pelotaAtrapada = { charco: `${tipo}-9`, golpesParaLiberar };
    registro.tapitas = registro.tapitas.map((tapita) =>
      tapita.id === "local-4" ? { ...tapita, posicion: { x: 450, y: 350 } } : tapita,
    );
    return registro;
  }
  const golpeALaPelota = (cambios: Partial<PeticionTiro> = {}): PeticionTiro => ({
    lado: "local",
    tapita: "local-4",
    direccion: { x: 1, y: 0 },
    fuerza: 0.3,
    ...cambios,
  });

  it("si la pelota cae en un charco, el tiro lo avisa y la partida la muestra atrapada", () => {
    const registro = crearPartida({ estadio: "hernandoSiles" });
    registro.turno = "local";
    registro.charcos = [
      { id: "agua-9", tipo: "agua", posicion: { x: 800, y: 350 }, ancho: 170, alto: 80, turnosRestantes: 2 },
    ];
    registro.tapitas = registro.tapitas.map((tapita) =>
      tapita.id === "local-4" ? { ...tapita, posicion: { x: 520, y: 350 } } : tapita,
    );

    const { eventos } = ejecutarTiro(registro, golpeALaPelota({ fuerza: 0.5 }), INICIO);
    const { pelota } = aPartidaPublica(registro, INICIO);

    assert.deepEqual(eventos[0], { tipo: "pelotaAtrapada", charco: "agua-9", tipoCharco: "agua" });
    assert.equal(pelota.atrapadaEn, "agua-9");
    assert.equal(pelota.golpesParaLiberar, 1);
  });

  it("de la nieve un tiro normal no la saca, pero descuenta un golpe", () => {
    const registro = conPelotaAtrapada("nieve", 2);
    ejecutarTiro(registro, golpeALaPelota(), INICIO);

    assert.deepEqual(registro.pelotaAtrapada, { charco: "nieve-9", golpesParaLiberar: 1 });
  });

  it("un tiro de poder saca la pelota de la nieve de una sola vez", () => {
    const registro = conPelotaAtrapada("nieve", 2);
    const { eventos } = ejecutarTiro(registro, golpeALaPelota({ tiroDePoder: true }), INICIO);

    assert.ok(eventos.some((evento) => evento.tipo === "pelotaLiberada"));
    assert.equal(registro.pelotaAtrapada, null);
    assert.equal(registro.jugadores.local.tirosDePoder, 1);
  });

  it("los charcos se secan tiro a tiro", () => {
    const registro = conPelotaAtrapada("agua", 1);
    registro.charcos[0].turnosRestantes = 2;

    ejecutarTiro(registro, tiroInofensivo(registro), INICIO);
    assert.equal(registro.charcos.find((charco) => charco.id === "agua-9")?.turnosRestantes, 1);
  });
});

describe("el perro en el partido", () => {
  it("se lleva la pelota y le da el turno al dueño del arco más cercano", () => {
    const registro = crearPartida({ perroActivo: true, probabilidadPerro: 1 });
    const { eventos, recorrido } = ejecutarTiro(registro, tiroInofensivo(registro), INICIO);
    const perro = eventos.find((evento) => evento.tipo === "perro");

    assert.ok(perro, "el perro no apareció con probabilidad 1");
    assert.equal(registro.turno, ladoDelArcoMasCercano(registro.pelota));
    assert.equal(registro.perro.apariciones, 1);
    assert.ok(recorrido.some((cuadro) => cuadro.perro !== null), "el recorrido no muestra al perro");
  });

  it("no aparece más de cinco veces por partido", () => {
    const registro = crearPartida({ perroActivo: true, probabilidadPerro: 1 });
    for (let tiro = 0; tiro < 8; tiro++) {
      ejecutarTiro(registro, tiroInofensivo(registro), INICIO);
    }

    assert.equal(registro.perro.apariciones, 5);
  });

  it("desactivado, no aparece nunca", () => {
    const registro = crearPartida({ perroActivo: false, probabilidadPerro: 1 });
    const { eventos } = ejecutarTiro(registro, tiroInofensivo(registro), INICIO);

    assert.equal(eventos.length, 0);
  });
});
