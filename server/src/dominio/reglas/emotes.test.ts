import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { PeticionCrearPartida } from "../../../../compartido/partida.js";
import { ErrorDeJuego } from "../errores.js";
import { MENSAJES } from "../mensajes.js";
import { lanzarEmote } from "./emotes.js";
import { crearRegistro, finalizar, type RegistroPartida } from "./partida.js";
import { aPartidaPublica } from "./vistaPublica.js";

const INICIO = 1_000_000;

function crearPartida(cambios: Partial<PeticionCrearPartida> = {}): RegistroPartida {
  return crearRegistro(
    {
      modo: "eliminatoria",
      local: { equipo: "bolivar", tipo: "humano" },
      visitante: { equipo: "theStrongest", tipo: "humano" },
      perroActivo: false,
      estadio: "felixCapriles",
      ...cambios,
    },
    "p_emotes",
    INICIO,
    1,
  );
}

function rechaza(accion: () => unknown, mensaje: string, estado = 400): void {
  assert.throws(
    accion,
    (error) => error instanceof ErrorDeJuego && error.message === mensaje && error.estado === estado,
  );
}

describe("emotes", () => {
  it("la carita aparece sobre el jugador que la lanzó y empieza la espera", () => {
    const registro = crearPartida();
    lanzarEmote(registro, { lado: "local", emote: "felizEuforico" }, INICIO);
    const { local, visitante } = aPartidaPublica(registro, INICIO);

    assert.deepEqual(local.emote, { id: "felizEuforico", segundosRestantes: 5 });
    assert.equal(local.esperaEmote, 15);
    assert.equal(visitante.emote, null, "la carita apareció también en el rival");
  });

  it("se puede lanzar aunque no sea su turno", () => {
    const registro = crearPartida();
    registro.turno = "visitante";

    lanzarEmote(registro, { lado: "local", emote: "enojado" }, INICIO);
    assert.equal(aPartidaPublica(registro, INICIO).local.emote?.id, "enojado");
  });

  it("la carita se va a los 5 segundos, y recién a los 15 se puede lanzar otra", () => {
    const registro = crearPartida();
    lanzarEmote(registro, { lado: "local", emote: "feliz" }, INICIO);

    const aLosCinco = aPartidaPublica(registro, INICIO + 5_000).local;
    assert.equal(aLosCinco.emote, null);
    assert.equal(aLosCinco.esperaEmote, 10);

    rechaza(() => lanzarEmote(registro, { lado: "local", emote: "llorando" }, INICIO + 14_000), MENSAJES.esperaEmote);
    lanzarEmote(registro, { lado: "local", emote: "llorando" }, INICIO + 15_000);
    assert.equal(aPartidaPublica(registro, INICIO + 15_000).local.emote?.id, "llorando");
  });

  it("cada jugador tiene su propia espera", () => {
    const registro = crearPartida();
    lanzarEmote(registro, { lado: "local", emote: "feliz" }, INICIO);

    lanzarEmote(registro, { lado: "visitante", emote: "sorprendido" }, INICIO + 1_000);
    assert.equal(aPartidaPublica(registro, INICIO + 1_000).visitante.emote?.id, "sorprendido");
  });

  it("nadie puede lanzar emotes por el equipo del servidor", () => {
    const registro = crearPartida({ visitante: { equipo: "theStrongest", tipo: "servidor" } });

    rechaza(() => lanzarEmote(registro, { lado: "visitante", emote: "feliz" }, INICIO), MENSAJES.tapitaRival);
  });

  it("con la partida terminada ya no se puede", () => {
    const registro = crearPartida();
    finalizar(registro);

    rechaza(() => lanzarEmote(registro, { lado: "local", emote: "feliz" }, INICIO), MENSAJES.partidaTerminada, 409);
  });

  it("las pruebas pueden acortar la duración y la espera", () => {
    const registro = crearPartida({ duracionEmoteSegundos: 1, esperaEmoteSegundos: 2 });
    lanzarEmote(registro, { lado: "local", emote: "dormido" }, INICIO);

    assert.equal(aPartidaPublica(registro, INICIO + 1_000).local.emote, null);
    lanzarEmote(registro, { lado: "local", emote: "dormido" }, INICIO + 2_000);
  });

  it("rechaza duraciones que no son positivas", () => {
    rechaza(() => crearPartida({ esperaEmoteSegundos: 0 }), MENSAJES.configuracionInvalida);
  });
});
