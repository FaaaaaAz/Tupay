import { useSalud } from "../hooks/useSalud";
import { IMAGENES } from "../recursos/indice";

export function Portada({ alIniciar }: { alIniciar: () => void }) {
  const { salud, sinConexion } = useSalud();

  let estadoDelServidor = "Conectando con el servidor…";
  if (sinConexion) estadoDelServidor = "Sin conexión con el servidor";
  else if (salud) estadoDelServidor = `Servidor en línea · versión ${salud.version.slice(0, 7)}`;

  return (
    <main className="portada" style={{ backgroundImage: `url(${IMAGENES.inicio})` }}>
      <h1 className="solo-lectores">Tupay</h1>
      <button type="button" className="boton boton--principal portada__iniciar" onClick={alIniciar}>
        Iniciar
      </button>
      <p className="portada__servidor" data-testid="estado-servidor">
        {estadoDelServidor}
      </p>
    </main>
  );
}
