import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { IdEstadio } from "../../../../compartido/catalogo.js";
import { contiene } from "../fisica/charcos.js";
import { crearRegistro, type RegistroPartida } from "../reglas/partida.js";
import { avanzarCharcos } from "./charcos.js";
import { APARICION_DE_CHARCOS, CHARCOS } from "./configuracionEstadios.js";

function partidaEn(estadio: IdEstadio, semilla = 1): RegistroPartida {
  return crearRegistro(
    {
      modo: "eliminatoria",
      local: { equipo: "bolivar", tipo: "humano" },
      visitante: { equipo: "theStrongest", tipo: "humano" },
      perroActivo: false,
      estadio,
    },
    "p_charcos",
    1_000_000,
    semilla,
  );
}

describe("charcos de cada estadio", () => {
  it("en Santa Cruz y Cochabamba no hay charcos", () => {
    for (const estadio of ["ramonAguilera", "felixCapriles"] as const) {
      const registro = partidaEn(estadio);
      for (let tiro = 0; tiro < 10; tiro++) avanzarCharcos(registro);
      assert.deepEqual(registro.charcos, [], `aparecieron charcos en ${estadio}`);
    }
  });

  it("La Paz y Oruro tienen charcos de agua; El Alto y Potosí, de nieve", () => {
    const tipos: [IdEstadio, string][] = [
      ["hernandoSiles", "agua"],
      ["jesusBermudez", "agua"],
      ["villaIngenio", "nieve"],
      ["victorAgustin", "nieve"],
    ];
    for (const [estadio, tipo] of tipos) {
      const { charcos } = partidaEn(estadio);
      assert.equal(charcos.length, APARICION_DE_CHARCOS.alEmpezar);
      assert.ok(charcos.every((charco) => charco.tipo === tipo), `${estadio} no tiene charcos de ${tipo}`);
    }
  });

  it("un charco nuevo nunca nace debajo de la pelota ni encima de otro, y nunca hay más de tres", () => {
    for (let semilla = 0; semilla < 100; semilla++) {
      const registro = partidaEn("villaIngenio", semilla);
      let anteriores: string[] = [];
      for (let tiro = 0; tiro < 10; tiro++) {
        assert.ok(registro.charcos.length <= APARICION_DE_CHARCOS.maximoEnCancha);
        registro.charcos.forEach((charco, i) => {
          const esNuevo = !anteriores.includes(charco.id);
          assert.ok(!esNuevo || !contiene(charco, registro.pelota), `semilla ${semilla}: un charco nació bajo la pelota`);
          for (const otro of registro.charcos.slice(i + 1)) {
            const seEnciman =
              Math.abs(otro.posicion.x - charco.posicion.x) < charco.ancho &&
              Math.abs(otro.posicion.y - charco.posicion.y) < charco.alto;
            assert.ok(!seEnciman, `semilla ${semilla}: dos charcos encimados`);
          }
        });
        // Entre tiro y tiro la pelota cambia de lugar, como en un partido.
        registro.pelota = { x: 100 + ((tiro * 137) % 1000), y: 60 + ((tiro * 211) % 580) };
        anteriores = registro.charcos.map((charco) => charco.id);
        avanzarCharcos(registro);
      }
    }
  });

  it("el agua se seca a los 2 tiros y la nieve a los 4", () => {
    for (const [estadio, tipo] of [["hernandoSiles", "agua"], ["villaIngenio", "nieve"]] as const) {
      const registro = partidaEn(estadio);
      const iniciales = registro.charcos.map((charco) => charco.id);
      const quedan = () => registro.charcos.filter((charco) => iniciales.includes(charco.id)).length;

      for (let tiro = 1; tiro < CHARCOS[tipo].duracionTurnos; tiro++) avanzarCharcos(registro);
      assert.equal(quedan(), iniciales.length, `el ${tipo} se secó antes de tiempo`);

      avanzarCharcos(registro);
      assert.equal(quedan(), 0, `el ${tipo} no se secó`);
    }
  });

  it("si se seca el charco con la pelota adentro, la pelota queda libre", () => {
    const registro = partidaEn("hernandoSiles");
    const [charco] = registro.charcos;
    charco.turnosRestantes = 1;
    registro.pelotaAtrapada = { charco: charco.id, golpesParaLiberar: 1 };

    assert.deepEqual(avanzarCharcos(registro), [{ tipo: "pelotaLiberada" }]);
    assert.equal(registro.pelotaAtrapada, null);
  });

  it("con la misma semilla aparecen los mismos charcos", () => {
    assert.deepEqual(partidaEn("jesusBermudez", 5).charcos, partidaEn("jesusBermudez", 5).charcos);
  });
});
