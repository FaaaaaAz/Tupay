import { useMemo, useRef, useState, type PointerEvent } from "react";
import type { Vector } from "../../../compartido/geometria.js";
import type { Cuadro, Partida, Tapita } from "../../../compartido/partida.js";
import type { TiroDesdeLaCancha } from "../hooks/usePartida";
import { IMAGENES, IMAGEN_DE_EQUIPO, IMAGEN_DE_ESTADIO } from "../recursos/indice";
import { geometriaDeLaCancha, IMAGEN_ESTADIO } from "./calibracionCancha";

/** Arrastrar menos que esto, en unidades de cancha, cuenta como un toque sin tiro. */
const ARRASTRE_MINIMO = 25;
/** Desde esta distancia de arrastre, el tiro sale con toda la fuerza. */
const ARRASTRE_MAXIMO = 240;
const LARGO_MAXIMO_DE_LA_FLECHA = 190;

interface Props {
  partida: Partida;
  /** Cuadro de la animación en curso, o `null` si no se está reproduciendo ninguna jugada. */
  cuadro: Cuadro | null;
  puedeApuntar: boolean;
  tiroDePoder: boolean;
  alTirar: (tiro: TiroDesdeLaCancha) => void;
}

interface Apuntado {
  tapita: Tapita;
  puntero: Vector;
}

/**
 * Dibuja la cancha en SVG y convierte el arrastre sobre una tapita en un tiro. No decide
 * nada del juego: muestra el estado que llegó de Express o el cuadro que se está animando.
 */
export function Cancha({ partida, cuadro, puedeApuntar, tiroDePoder, alTirar }: Props) {
  const { cancha } = partida;
  const geometria = useMemo(() => geometriaDeLaCancha(cancha), [cancha]);
  const grupo = useRef<SVGGElement>(null);
  const [apuntado, setApuntado] = useState<Apuntado | null>(null);

  const quieta = cuadro === null && partida.estado === "enJuego";
  const apuntadoVigente = puedeApuntar ? apuntado : null;
  const pelota = cuadro ? cuadro.pelota : partida.pelota.posicion;
  const perro = cuadro?.perro ?? null;
  const { escala, origen, arco } = geometria;

  /** Pasa del píxel de la pantalla a las unidades de la física, sin importar el tamaño de la ventana. */
  function enUnidadesDeCancha(evento: PointerEvent): Vector | null {
    const matriz = grupo.current?.getScreenCTM();
    if (!matriz) return null;
    const punto = new DOMPoint(evento.clientX, evento.clientY).matrixTransform(matriz.inverse());
    return { x: punto.x, y: punto.y };
  }

  function empezarAApuntar(evento: PointerEvent<SVGGElement>, tapita: Tapita) {
    const puntero = enUnidadesDeCancha(evento);
    if (!puntero) return;
    evento.currentTarget.ownerSVGElement?.setPointerCapture(evento.pointerId);
    setApuntado({ tapita, puntero });
  }

  function seguirApuntando(evento: PointerEvent<SVGSVGElement>) {
    if (!apuntado) return;
    const puntero = enUnidadesDeCancha(evento);
    if (puntero) setApuntado({ tapita: apuntado.tapita, puntero });
  }

  function soltar() {
    const tiro = apuntadoVigente && calcularTiro(apuntadoVigente);
    if (apuntadoVigente && tiro) alTirar({ tapita: apuntadoVigente.tapita.id, ...tiro });
    setApuntado(null);
  }

  return (
    <svg
      className={apuntadoVigente ? "cancha cancha--apuntando" : "cancha"}
      viewBox={geometria.vista}
      preserveAspectRatio="xMidYMid meet"
      data-testid="cancha"
      aria-label="Cancha de juego"
      onPointerMove={seguirApuntando}
      onPointerUp={soltar}
      onPointerCancel={() => setApuntado(null)}
    >
      <image
        href={IMAGEN_DE_ESTADIO[partida.estadio]}
        width={IMAGEN_ESTADIO.ancho}
        height={IMAGEN_ESTADIO.alto}
      />

      <g ref={grupo} transform={`translate(${origen.x} ${origen.y}) scale(${escala})`}>
        {partida.tapitas.map((tapita, indice) => {
          const posicion = cuadro ? cuadro.tapitas[indice] : tapita.posicion;
          const activa = quieta && tapita.lado === partida.turno.lado;
          const apuntable = activa && puedeApuntar;
          const clases = ["tapita", activa && "tapita--activa", apuntable && "tapita--apuntable"]
            .filter(Boolean)
            .join(" ");
          const tamano = geometria.tamanoTapita;

          return (
            <g
              key={tapita.id}
              className={clases}
              data-testid={`tapita-${tapita.id}`}
              data-lado={tapita.lado}
              data-activa={activa}
              transform={`translate(${posicion.x} ${posicion.y})`}
              onPointerDown={apuntable ? (evento) => empezarAApuntar(evento, tapita) : undefined}
            >
              <circle className="tapita__brillo" r={cancha.radioTapita + 6} />
              <image
                href={IMAGEN_DE_EQUIPO[partida[tapita.lado].equipo]}
                x={-tamano / 2}
                y={-tamano / 2}
                width={tamano}
                height={tamano}
              />
            </g>
          );
        })}

        {perro && <Sprite href={IMAGENES.perro} centro={perro} tamano={geometria.tamanoPerro} testId="perro" />}

        {/* La pelota nunca se superpone con una tapita, así que puede ir encima: se ve en la boca del perro. */}
        <Sprite href={IMAGENES.pelota} centro={pelota} tamano={geometria.tamanoPelota} testId="pelota" />

        {/* Los arcos van encima de todo: así la pelota se ve entrando dentro de la red. */}
        <image href={IMAGENES.arco} x={arco.x} y={arco.y} width={arco.ancho} height={arco.alto} />
        <g transform={`translate(${cancha.ancho} 0) scale(-1 1)`}>
          <image href={IMAGENES.arco} x={arco.x} y={arco.y} width={arco.ancho} height={arco.alto} />
        </g>

        {apuntadoVigente && (
          <Flecha apuntado={apuntadoVigente} radio={cancha.radioTapita} poder={tiroDePoder} />
        )}
      </g>
    </svg>
  );
}

interface PropsSprite {
  href: string;
  centro: Vector;
  tamano: number;
  testId: string;
}

function Sprite({ href, centro, tamano, testId }: PropsSprite) {
  return (
    <image
      href={href}
      x={centro.x - tamano / 2}
      y={centro.y - tamano / 2}
      width={tamano}
      height={tamano}
      data-testid={testId}
    />
  );
}

/** Como una honda: la tapita sale hacia el lado contrario al que se arrastra. */
function calcularTiro({ tapita, puntero }: Apuntado): { direccion: Vector; fuerza: number } | null {
  const direccion = { x: tapita.posicion.x - puntero.x, y: tapita.posicion.y - puntero.y };
  const distancia = Math.hypot(direccion.x, direccion.y);
  if (distancia < ARRASTRE_MINIMO) return null;
  return { direccion, fuerza: Math.min(1, distancia / ARRASTRE_MAXIMO) };
}

function Flecha({ apuntado, radio, poder }: { apuntado: Apuntado; radio: number; poder: boolean }) {
  const { tapita, puntero } = apuntado;
  const guia = (
    <line
      className="apuntado__guia"
      x1={tapita.posicion.x}
      y1={tapita.posicion.y}
      x2={puntero.x}
      y2={puntero.y}
    />
  );
  const tiro = calcularTiro(apuntado);
  if (!tiro) return <g className="apuntado">{guia}</g>;

  const largo = Math.hypot(tiro.direccion.x, tiro.direccion.y);
  const unitario = { x: tiro.direccion.x / largo, y: tiro.direccion.y / largo };
  /** Punto a cierta distancia de la tapita en la dirección del tiro, corrido hacia un costado. */
  const punto = (distancia: number, costado = 0) => ({
    x: tapita.posicion.x + unitario.x * distancia - unitario.y * costado,
    y: tapita.posicion.y + unitario.y * distancia + unitario.x * costado,
  });

  const desde = radio + 8;
  const hasta = desde + 20 + LARGO_MAXIMO_DE_LA_FLECHA * tiro.fuerza;
  const inicio = punto(desde);
  const fin = punto(hasta);
  const punta = [punto(hasta + 24), punto(hasta, 14), punto(hasta, -14)]
    .map(({ x, y }) => `${x},${y}`)
    .join(" ");

  return (
    <g className={poder ? "apuntado apuntado--poder" : "apuntado"} data-testid="flecha">
      {guia}
      <line className="apuntado__flecha" x1={inicio.x} y1={inicio.y} x2={fin.x} y2={fin.y} />
      <polygon className="apuntado__punta" points={punta} />
    </g>
  );
}
