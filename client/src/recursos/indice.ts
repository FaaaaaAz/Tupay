import type { IdEmote, IdEquipo, IdEstadio } from "../../../compartido/catalogo.js";
import type { TipoCharco } from "../../../compartido/partida.js";
import dormido from "./emotes/dormido.webp";
import enojado from "./emotes/enojado.webp";
import enojadoSerio from "./emotes/enojadoSerio.webp";
import feliz from "./emotes/feliz.webp";
import felizEuforico from "./emotes/felizEuforico.webp";
import llorando from "./emotes/llorando.webp";
import sorprendido from "./emotes/sorprendido.webp";
import escudoAlwaysReady from "./escudos/alwaysReady.webp";
import escudoAurora from "./escudos/aurora.webp";
import escudoBlooming from "./escudos/blooming.webp";
import escudoBolivar from "./escudos/bolivar.webp";
import escudoNacionalPotosi from "./escudos/nacionalPotosi.webp";
import escudoOrientePetrolero from "./escudos/orientePetrolero.webp";
import escudoRealPotosi from "./escudos/realPotosi.webp";
import escudoSanJose from "./escudos/sanJose.webp";
import escudoTheStrongest from "./escudos/theStrongest.webp";
import escudoWilstermann from "./escudos/wilstermann.webp";
import alwaysReady from "./equipos/alwaysReady.webp";
import aurora from "./equipos/aurora.webp";
import blooming from "./equipos/blooming.webp";
import bolivar from "./equipos/bolivar.webp";
import nacionalPotosi from "./equipos/nacionalPotosi.webp";
import orientePetrolero from "./equipos/orientePetrolero.webp";
import realPotosi from "./equipos/realPotosi.webp";
import sanJose from "./equipos/sanJose.webp";
import theStrongest from "./equipos/theStrongest.webp";
import wilstermann from "./equipos/wilstermann.webp";
import felixCapriles from "./estadios/felixCapriles.webp";
import hernandoSiles from "./estadios/hernandoSiles.webp";
import jesusBermudez from "./estadios/jesusBermudez.webp";
import ramonAguilera from "./estadios/ramonAguilera.webp";
import victorAgustin from "./estadios/victorAgustin.webp";
import villaIngenio from "./estadios/villaIngenio.webp";
import arco from "./juego/arco.webp";
import charcoDeAgua from "./juego/charcoDeAgua.webp";
import charcoDeNieve from "./juego/charcoDeNieve.webp";
import pelota from "./juego/pelota.webp";
import perro from "./juego/perro.webp";
import inicio from "./pantallas/inicio.webp";
import menu from "./pantallas/menu.webp";
import paneles from "./pantallas/paneles.webp";
import pausa from "./pantallas/pausa.webp";
import salir from "./pantallas/salir.webp";
import titulo from "./pantallas/titulo.webp";
import marcador from "./juego/marcador.webp";
import tarjetaEliminatoria from "./tarjetas/eliminatoria.webp";
import tarjetaInstrucciones from "./tarjetas/instrucciones.webp";
import tarjetaLiga from "./tarjetas/liga.webp";
import tarjetaTemporada from "./tarjetas/temporada.webp";

// Vite les agrega un hash a las imágenes importadas, así el navegador puede guardarlas en caché.
// Si falta la imagen de un equipo, estadio, emote o charco del contrato, TypeScript no compila.

/** La tapita de cada equipo: la ficha que se mueve en la cancha. */
export const IMAGEN_DE_EQUIPO: Record<IdEquipo, string> = {
  alwaysReady,
  aurora,
  blooming,
  bolivar,
  nacionalPotosi,
  orientePetrolero,
  realPotosi,
  sanJose,
  theStrongest,
  wilstermann,
};

/** El escudo de cada equipo: lo identifica en el marcador, la configuración, el resultado y la temporada. */
export const IMAGEN_DE_ESCUDO: Record<IdEquipo, string> = {
  alwaysReady: escudoAlwaysReady,
  aurora: escudoAurora,
  blooming: escudoBlooming,
  bolivar: escudoBolivar,
  nacionalPotosi: escudoNacionalPotosi,
  orientePetrolero: escudoOrientePetrolero,
  realPotosi: escudoRealPotosi,
  sanJose: escudoSanJose,
  theStrongest: escudoTheStrongest,
  wilstermann: escudoWilstermann,
};

export const IMAGEN_DE_ESTADIO: Record<IdEstadio, string> = {
  felixCapriles,
  hernandoSiles,
  jesusBermudez,
  ramonAguilera,
  victorAgustin,
  villaIngenio,
};

export const IMAGEN_DE_EMOTE: Record<IdEmote, string> = {
  dormido,
  enojado,
  enojadoSerio,
  feliz,
  felizEuforico,
  llorando,
  sorprendido,
};

export const IMAGEN_DE_CHARCO: Record<TipoCharco, string> = {
  agua: charcoDeAgua,
  nieve: charcoDeNieve,
};

/** La ilustración de cada tarjeta del menú. */
export const IMAGEN_DE_TARJETA = {
  eliminatoria: tarjetaEliminatoria,
  liga: tarjetaLiga,
  temporada: tarjetaTemporada,
  instrucciones: tarjetaInstrucciones,
};

/**
 * `paneles` es el fondo de configuración, instrucciones, temporada y resultado; lo dibuja `global.css`.
 * `pausa` y `salir` son los árbitros que encabezan los modales de la partida.
 * `titulo` encabeza el menú; `marcador` es el fondo del marcador, que también dibuja `partida.css`.
 */
export const IMAGENES = { arco, pelota, perro, inicio, menu, paneles, pausa, salir, titulo, marcador };
