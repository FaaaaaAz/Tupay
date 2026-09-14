import { EMOTES } from "../componentes/opcionesDeJuego";
import { IMAGEN_DE_CHARCO, IMAGEN_DE_EMOTE } from "../recursos/indice";

export function Instrucciones({ alVolver }: { alVolver: () => void }) {
  return (
    <main className="fondo-panel">
      <article className="panel instrucciones">
        <header className="panel__cabecera">
          <button type="button" className="boton boton--enlace" onClick={alVolver}>
            ← Volver
          </button>
          <h1>Cómo se juega</h1>
        </header>

        <h2>El objetivo</h2>
        <p>
          Dos equipos de cinco tapitas se turnan para tirar, como en el billar. Gana quien meta la
          pelota en el arco rival.
        </p>

        <h2>Cómo tirar</h2>
        <ul>
          <li>En tu turno, tus tapitas brillan.</li>
          <li>
            Presiona una de ellas y arrastra hacia atrás: la flecha muestra hacia dónde va a salir y
            con cuánta fuerza.
          </li>
          <li>Suelta para tirar. Si arrastras muy poco, el tiro se cancela.</li>
          <li>Tienes 15 segundos por turno. Si se acaban, pierdes el turno.</li>
          <li>
            Dos veces por partido puedes activar el <strong>tiro de poder</strong>: sale con 50 % más
            de fuerza y saca la pelota de cualquier charco de un solo golpe.
          </li>
        </ul>

        <h2>Pausar y salir</h2>
        <p>
          Pulsa <strong>Pausar</strong> o <strong>Esc</strong> para detener el partido, incluso mientras
          las tapitas se mueven. Reanudar continúa desde ese instante. Al salir, puedes confirmar o
          seguir jugando; en una temporada, un partido abandonado sin terminar vuelve a quedar pendiente.
        </p>

        <h2>Los modos</h2>
        <ul>
          <li>
            <strong>Eliminatoria:</strong> gana el primero en llegar a la meta de goles. No hay
            empate.
          </li>
          <li>
            <strong>Liga:</strong> 90 minutos a reloj acelerado. Gana quien tenga más goles al final,
            y puede terminar empatado.
          </li>
          <li>
            <strong>Temporada:</strong> los 10 equipos juegan todos contra todos. Juegas un partido de
            Liga por jornada; los que no juega nadie los resuelve el servidor. Victoria suma 3 puntos,
            empate 1, y al final el primero de la tabla es campeón.
          </li>
        </ul>

        <h2>Los estadios</h2>
        <div className="instrucciones__charcos">
          <figure>
            <img src={IMAGEN_DE_CHARCO.agua} alt="" />
            <figcaption>
              <strong>La Paz y Oruro:</strong> charcos de agua. Si la pelota cae en uno, queda
              atrapada; un golpe la saca, pero sale con poco impulso. Se secan a los 2 tiros.
            </figcaption>
          </figure>
          <figure>
            <img src={IMAGEN_DE_CHARCO.nieve} alt="" />
            <figcaption>
              <strong>El Alto y Potosí:</strong> charcos de nieve. Atrapan la pelota y hacen falta dos
              golpes para sacarla. Duran 4 tiros.
            </figcaption>
          </figure>
        </div>
        <p>
          En Santa Cruz y Cochabamba la cancha está soleada y no pasa nada raro. Los golpes para sacar
          la pelota cuentan desde el tiro siguiente al que la hizo caer.
        </p>

        <h2>El perro</h2>
        <p>
          Después de cualquier tiro puede meterse a la cancha y llevarse la pelota al otro lado.
          Nunca hace un gol, y el turno pasa al equipo que tiene que defender.
        </p>

        <h2>Emotes</h2>
        <div className="instrucciones__emotes">
          {EMOTES.map(({ valor, texto }) => (
            <img key={valor} src={IMAGEN_DE_EMOTE[valor]} alt={texto} title={texto} />
          ))}
        </div>
        <p>
          Junto a tu equipo, en el marcador, tienes siete caritas. La que elijas aparece sobre tus
          cinco tapitas durante 5 segundos, sea o no tu turno. Después hay que esperar 15 segundos para
          lanzar otra.
        </p>

        <h2>El rival del servidor</h2>
        <p>
          Antes de tirar prueba varios tiros con la misma física del juego y elige el mejor. En
          fácil prueba pocos y apunta con bastante error; en difícil prueba muchos y casi no falla.
        </p>

        <h2>Lo que no se puede hacer</h2>
        <ul>
          <li>Tirar fuera de tu turno o con una tapita del rival.</li>
          <li>Elegir el mismo equipo para los dos lados: todavía no hay camisetas alternativas.</li>
        </ul>
      </article>
    </main>
  );
}
