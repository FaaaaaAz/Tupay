// Busca con la física del juego un tiro que haga gol desde la formación inicial y que siga
// entrando aunque la dirección se desvíe un poco. De aquí salió `GOL_DESDE_EL_SAQUE` en
// `e2e/ayudantes.ts`. Se ejecuta a mano, solo si cambia la física o la formación:
//
//   npx tsx scripts/buscar-tiro-de-gol.ts

import { crearRegistro } from "../server/src/dominio/reglas/partida.js";
import { simularEnLaPartida } from "../server/src/dominio/reglas/simulacionEnLaPartida.js";

const SEMILLA = 12345;
const PASO = 0.002;
/** Cuánto se aparta la búsqueda de la dirección que va directo a la pelota, en radianes. */
const APERTURA = 0.5;

const registro = crearRegistro(
  {
    modo: "eliminatoria",
    local: { equipo: "bolivar", tipo: "humano" },
    visitante: { equipo: "theStrongest", tipo: "humano" },
    perroActivo: false,
    estadio: "felixCapriles",
    golesParaGanar: 1,
  },
  "busqueda",
  0,
  SEMILLA,
);
const lado = registro.turno;
const arcoQueAtaca = lado === "local" ? "derecho" : "izquierdo";
console.log(`Con la semilla ${SEMILLA} saca el ${lado}, que ataca el arco ${arcoQueAtaca}.`);
console.log("Ventana de ángulos con gol, tirando con toda la fuerza:\n");

for (const [indice, tapita] of registro.tapitas.entries()) {
  if (tapita.lado !== lado) continue;

  const haciaLaPelota = Math.atan2(registro.pelota.y - tapita.posicion.y, registro.pelota.x - tapita.posicion.x);
  let actual: number[] = [];
  let mejor: number[] = [];
  for (let angulo = haciaLaPelota - APERTURA; angulo <= haciaLaPelota + APERTURA; angulo += PASO) {
    const direccion = { x: Math.cos(angulo), y: Math.sin(angulo) };
    const { arcoConGol } = simularEnLaPartida(registro, indice, { direccion, fuerza: 1 });
    if (arcoConGol === arcoQueAtaca) {
      actual.push(angulo);
    } else {
      if (actual.length > mejor.length) mejor = actual;
      actual = [];
    }
  }
  if (actual.length > mejor.length) mejor = actual;

  if (mejor.length === 0) {
    console.log(`${tapita.id}: ningún gol`);
    continue;
  }
  const centro = (mejor[0] + mejor[mejor.length - 1]) / 2;
  const margen = (mejor.length * PASO) / 2;
  console.log(
    `${tapita.id}: gol con ±${margen.toFixed(3)} rad alrededor de { x: ${Math.cos(centro).toFixed(4)}, y: ${Math.sin(centro).toFixed(4)} }`,
  );
}
