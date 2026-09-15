import { expect, type Page, type Response } from "@playwright/test";
import type { IdEstadio } from "../compartido/catalogo.js";
import type { Vector } from "../compartido/geometria.js";
import type { OpcionesDePrueba, Partida, RespuestaTiro, Tapita } from "../compartido/partida.js";

// Lo que comparten las pruebas del navegador. Los localizadores siguen un orden fijo:
// primero el rol y el nombre visible (lo que ve una persona), después la etiqueta de un
// campo y, solo donde no hay nada semántico estable (la cancha, las tapitas, el marcador),
// un `data-testid`. Nunca clases de CSS, que cambian con el diseño.

/**
 * Con esta semilla saca el visitante, y `visitante-4` hace un gol en el arco izquierdo tirando
 * con toda la fuerza en esta dirección. Lo encontró `scripts/buscar-tiro-de-gol.ts` probando
 * ángulos con la física del juego: el gol entra aunque la dirección se desvíe hasta 0,021
 * radianes, y un píxel de error del mouse son unos 0,004. Vale solo en un estadio sin charcos.
 */
export const GOL_DESDE_EL_SAQUE = {
  semilla: 12345,
  estadio: "felixCapriles",
  tapita: "visitante-4",
  direccion: { x: -0.9359, y: 0.3523 },
} as const;

/** Unidades de arrastre con las que el tiro sale con toda la fuerza (`ARRASTRE_MAXIMO` en `Cancha.tsx`). */
const ARRASTRE_MAXIMO = 240;

type OpcionDelMenu = "Eliminatoria" | "Liga" | "Temporada" | "Cómo se juega";

export interface ConfiguracionDePartido {
  modo?: "Eliminatoria" | "Liga";
  jugadores?: 1 | 2;
  estadio?: IdEstadio;
  golesParaGanar?: number;
  perro?: boolean;
  /** Lo que la pantalla no ofrece, como la semilla: se agrega al pedido antes de que salga. */
  opciones?: OpcionesDePrueba;
}

/** Abre la portada, confirma que Express respondió y entra al menú. */
export async function abrirMenu(page: Page): Promise<void> {
  await page.goto("/");
  await expect(page.getByTestId("estado-servidor")).toContainText("Servidor en línea");
  await page.getByRole("button", { name: "Iniciar" }).click();
}

/** Las tarjetas del menú se llaman por su título; el detalle que sigue cambia con el texto. */
export async function elegirEnElMenu(page: Page, opcion: OpcionDelMenu): Promise<void> {
  await page.getByRole("button", { name: new RegExp(`^${opcion}`) }).click();
}

/** Avanza un carrusel (equipo o estadio) con su flecha hasta que muestra la opción pedida. */
export async function elegirEnCarrusel(page: Page, etiqueta: string, id: string): Promise<void> {
  const carrusel = page.getByRole("group", { name: etiqueta, exact: true });
  for (let intento = 0; intento < 12; intento++) {
    if ((await carrusel.getAttribute("data-valor")) === id) return;
    await carrusel.getByRole("button", { name: "Siguiente" }).click();
  }
  await expect(carrusel).toHaveAttribute("data-valor", id);
}

/** Agrega opciones de prueba al pedido de creación de la partida. El servidor las valida igual que siempre. */
export async function agregarOpcionesDePrueba(page: Page, opciones: OpcionesDePrueba): Promise<void> {
  await page.route("**/api/partidas", async (ruta) => {
    if (ruta.request().method() !== "POST") return ruta.continue();
    await ruta.continue({ postData: JSON.stringify({ ...ruta.request().postDataJSON(), ...opciones }) });
  });
}

/** Configura un partido desde la pantalla, lo crea y devuelve la partida que respondió Express. */
export async function empezarPartido(page: Page, configuracion: ConfiguracionDePartido = {}): Promise<Partida> {
  const { modo = "Eliminatoria", jugadores = 2, estadio, golesParaGanar, perro = false, opciones } = configuracion;
  if (opciones) await agregarOpcionesDePrueba(page, opciones);

  await abrirMenu(page);
  await elegirEnElMenu(page, modo);
  if (jugadores === 2) await page.getByLabel("2 jugadores en este dispositivo").check();
  if (estadio) await elegirEnCarrusel(page, "Estadio", estadio);
  if (golesParaGanar) {
    await page.getByRole("group", { name: "Meta de goles" }).getByLabel(String(golesParaGanar), { exact: true }).check();
  }
  // La casilla empieza desactivada; marcarla hace ladrar al perro en la configuración.
  await page.getByLabel("El perro puede meterse a la cancha").setChecked(perro);

  const creacion = page.waitForResponse(esPedido("POST", "/api/partidas"));
  await page.getByRole("button", { name: "Jugar" }).click();
  const respuesta = await creacion;
  expect(respuesta.status()).toBe(201);
  await expect(page.getByTestId("cancha")).toBeVisible();
  return respuesta.json();
}

export function tapitaDe(partida: Partida, id: string): Tapita {
  const tapita = partida.tapitas.find((candidata) => candidata.id === id);
  if (!tapita) throw new Error(`La partida no tiene la tapita ${id}`);
  return tapita;
}

/** Pasa de unidades de cancha a píxeles de la pantalla con la misma matriz que usa React para apuntar. */
export async function aPantalla(page: Page, punto: Vector): Promise<Vector> {
  return page.getByTestId("cancha").evaluate((cancha, { x, y }) => {
    const matriz = cancha.querySelector<SVGGElement>(":scope > g")?.getScreenCTM();
    if (!matriz) throw new Error("La cancha todavía no está dibujada");
    const enPantalla = new DOMPoint(x, y).matrixTransform(matriz);
    return { x: enPantalla.x, y: enPantalla.y };
  }, punto);
}

/**
 * Tira como lo haría una persona: presiona la tapita y arrastra hacia el lado contrario al del
 * tiro. Espera la respuesta real de Express y la devuelve.
 */
export async function tirar(page: Page, tapita: Tapita, direccion: Vector, fuerza: number): Promise<RespuestaTiro> {
  const largo = Math.hypot(direccion.x, direccion.y);
  // Con toda la fuerza se arrastra de más: pasado el máximo, un píxel de error ya no cambia la fuerza.
  const arrastre = fuerza >= 1 ? ARRASTRE_MAXIMO * 1.25 : fuerza * ARRASTRE_MAXIMO;
  const desde = await aPantalla(page, tapita.posicion);
  const hasta = await aPantalla(page, {
    x: tapita.posicion.x - (direccion.x / largo) * arrastre,
    y: tapita.posicion.y - (direccion.y / largo) * arrastre,
  });

  const tiro = page.waitForResponse(esPedido("POST", "/tiros"));
  await page.mouse.move(desde.x, desde.y);
  await page.mouse.down();
  await page.mouse.move(hasta.x, hasta.y, { steps: 10 });
  await page.mouse.up();

  const respuesta = await tiro;
  expect(respuesta.ok()).toBeTruthy();
  return respuesta.json();
}

export function esPedido(metodo: string, finDeRuta: string) {
  return (respuesta: Response) =>
    respuesta.request().method() === metodo && new URL(respuesta.url()).pathname.endsWith(finDeRuta);
}
