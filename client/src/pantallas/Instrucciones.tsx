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
            Dos veces por partido puedes activar el <strong>tiro de poder</strong>, que sale con 50 %
            más de fuerza.
          </li>
        </ul>

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

        <h2>El perro</h2>
        <p>
          Después de cualquier tiro puede meterse a la cancha y llevarse la pelota al otro lado.
          Nunca hace un gol, y el turno pasa al equipo que tiene que defender.
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
