import { expect, test, type APIRequestContext } from "@playwright/test";
import type { Partida, RespuestaTiro } from "../compartido/partida.js";

const PARTIDA_BASE = {
  modo: "eliminatoria",
  local: { equipo: "bolivar", tipo: "humano" },
  visitante: { equipo: "theStrongest", tipo: "humano" },
  perroActivo: false,
};

async function crearPartida(request: APIRequestContext): Promise<Partida> {
  const respuesta = await request.post("/api/partidas", { data: PARTIDA_BASE });
  expect(respuesta.status()).toBe(201);
  return respuesta.json();
}

test("el catálogo trae los diez equipos y los seis estadios desde el servidor", async ({ request }) => {
  const equipos = await (await request.get("/api/equipos")).json();
  const estadios = await (await request.get("/api/estadios")).json();

  expect(equipos).toHaveLength(10);
  expect(estadios).toHaveLength(6);
});

test("crear una partida devuelve el estado inicial y se puede volver a consultar", async ({ request }) => {
  const partida = await crearPartida(request);

  expect(partida.tapitas).toHaveLength(10);
  expect(partida.marcador).toEqual({ local: 0, visitante: 0 });

  const consulta = await request.get(`/api/partidas/${partida.id}`);
  expect(consulta.ok()).toBeTruthy();
  expect((await consulta.json()).id).toBe(partida.id);
});

test("un tiro válido devuelve el recorrido y pasa el turno", async ({ request }) => {
  const partida = await crearPartida(request);
  const lado = partida.turno.lado;

  const respuesta = await request.post(`/api/partidas/${partida.id}/tiros`, {
    data: { lado, tapita: `${lado}-1`, direccion: { x: 0, y: 1 }, fuerza: 0.2 },
  });
  expect(respuesta.ok()).toBeTruthy();

  const { recorrido, partida: despues }: RespuestaTiro = await respuesta.json();
  expect(recorrido.length).toBeGreaterThan(1);
  expect(despues.turno.lado).not.toBe(lado);
});

test("elegir dos veces el mismo equipo devuelve el mensaje del servidor", async ({ request }) => {
  const respuesta = await request.post("/api/partidas", {
    data: { ...PARTIDA_BASE, visitante: { equipo: "bolivar", tipo: "humano" } },
  });

  expect(respuesta.status()).toBe(400);
  expect(await respuesta.json()).toEqual({
    error: "Elijan equipos distintos: todavía no hay camisetas alternativas",
  });
});

test("tirar con una tapita del rival se rechaza", async ({ request }) => {
  const partida = await crearPartida(request);
  const lado = partida.turno.lado;
  const rival = lado === "local" ? "visitante" : "local";

  const respuesta = await request.post(`/api/partidas/${partida.id}/tiros`, {
    data: { lado, tapita: `${rival}-1`, direccion: { x: 1, y: 0 }, fuerza: 0.5 },
  });

  expect(respuesta.status()).toBe(400);
  expect(await respuesta.json()).toEqual({ error: "Ese jugador no es tuyo" });
});

test("una partida que no existe responde 404", async ({ request }) => {
  const respuesta = await request.get("/api/partidas/p_noexiste");

  expect(respuesta.status()).toBe(404);
  expect(await respuesta.json()).toEqual({ error: "Esa partida no existe" });
});
