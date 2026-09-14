import type { Equipo, Estadio, IdEmote, IdEquipo, IdEstadio } from "../../../compartido/catalogo.js";

// Los colores se tomaron de las tapitas de `assets/players`: son los dos tonos que más
// superficie ocupan en cada una. Agregar o quitar un equipo es cambiar solo este archivo.

export const EQUIPOS: Record<IdEquipo, Equipo> = {
  bolivar: {
    id: "bolivar",
    nombre: "Bolívar",
    departamento: "La Paz",
    estadio: "hernandoSiles",
    colorPrincipal: "#18a8f0",
    colorSecundario: "#ffffff",
  },
  theStrongest: {
    id: "theStrongest",
    nombre: "The Strongest",
    departamento: "La Paz",
    estadio: "hernandoSiles",
    colorPrincipal: "#ffd800",
    colorSecundario: "#181818",
  },
  alwaysReady: {
    id: "alwaysReady",
    nombre: "Always Ready",
    departamento: "El Alto",
    estadio: "villaIngenio",
    colorPrincipal: "#f0f0f0",
    colorSecundario: "#c00000",
  },
  blooming: {
    id: "blooming",
    nombre: "Blooming",
    departamento: "Santa Cruz",
    estadio: "ramonAguilera",
    colorPrincipal: "#0054e0",
    colorSecundario: "#ffffff",
  },
  orientePetrolero: {
    id: "orientePetrolero",
    nombre: "Oriente Petrolero",
    departamento: "Santa Cruz",
    estadio: "ramonAguilera",
    colorPrincipal: "#004818",
    colorSecundario: "#ffffff",
  },
  nacionalPotosi: {
    id: "nacionalPotosi",
    nombre: "Nacional Potosí",
    departamento: "Potosí",
    estadio: "victorAgustin",
    colorPrincipal: "#f0f0f0",
    colorSecundario: "#d80000",
  },
  realPotosi: {
    id: "realPotosi",
    nombre: "Real Potosí",
    departamento: "Potosí",
    estadio: "victorAgustin",
    colorPrincipal: "#6018a8",
    colorSecundario: "#ffffff",
  },
  aurora: {
    id: "aurora",
    nombre: "Aurora",
    departamento: "Cochabamba",
    estadio: "felixCapriles",
    colorPrincipal: "#18a8f0",
    colorSecundario: "#f0f0f0",
  },
  wilstermann: {
    id: "wilstermann",
    nombre: "Wilstermann",
    departamento: "Cochabamba",
    estadio: "felixCapriles",
    colorPrincipal: "#c00018",
    colorSecundario: "#ffffff",
  },
  sanJose: {
    id: "sanJose",
    nombre: "San José",
    departamento: "Oruro",
    estadio: "jesusBermudez",
    colorPrincipal: "#0048a8",
    colorSecundario: "#f0f0f0",
  },
};

export const ESTADIOS: Record<IdEstadio, Estadio> = {
  hernandoSiles: {
    id: "hernandoSiles",
    nombre: "Hernando Siles",
    ciudad: "La Paz",
    efecto: "charcosDeAgua",
  },
  villaIngenio: {
    id: "villaIngenio",
    nombre: "El Titán de Villa Ingenio",
    ciudad: "El Alto",
    efecto: "charcosDeNieve",
  },
  ramonAguilera: {
    id: "ramonAguilera",
    nombre: "Ramón Aguilera Costas",
    ciudad: "Santa Cruz",
    efecto: "ninguno",
  },
  felixCapriles: {
    id: "felixCapriles",
    nombre: "Félix Capriles",
    ciudad: "Cochabamba",
    efecto: "ninguno",
  },
  victorAgustin: {
    id: "victorAgustin",
    nombre: "Víctor Agustín Ugarte",
    ciudad: "Potosí",
    efecto: "charcosDeNieve",
  },
  jesusBermudez: {
    id: "jesusBermudez",
    nombre: "Jesús Bermúdez",
    ciudad: "Oruro",
    efecto: "charcosDeAgua",
  },
};

/** Las siete caritas. Las imágenes viven en el cliente; aquí solo se valida el nombre. */
export const EMOTES: readonly IdEmote[] = [
  "dormido",
  "enojado",
  "enojadoSerio",
  "feliz",
  "felizEuforico",
  "llorando",
  "sorprendido",
];

export function esIdEmote(valor: unknown): valor is IdEmote {
  return typeof valor === "string" && (EMOTES as readonly string[]).includes(valor);
}

export function esIdEquipo(valor: unknown): valor is IdEquipo {
  return typeof valor === "string" && Object.hasOwn(EQUIPOS, valor);
}

export function esIdEstadio(valor: unknown): valor is IdEstadio {
  return typeof valor === "string" && Object.hasOwn(ESTADIOS, valor);
}
