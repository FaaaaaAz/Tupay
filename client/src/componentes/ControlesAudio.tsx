import { useId, useSyncExternalStore } from "react";
import { audio } from "../audio/audio";

export function ControlesAudio() {
  const id = useId();
  const { preferencias, aviso } = useSyncExternalStore(audio.suscribir, audio.obtenerEstado);
  return (
    <details className="controles-audio">
      <summary>Sonido · {preferencias.silenciado ? "silenciado" : "activado"}</summary>
      <div className="controles-audio__opciones">
        <button type="button" className="boton boton--secundario" aria-pressed={preferencias.silenciado}
          onClick={() => {
            audio.configurar({ silenciado: !preferencias.silenciado });
            void audio.desbloquear();
          }}>Silenciar todo</button>
        <label htmlFor={`${id}-musica`}>Música · {Math.round(preferencias.musica * 100)} %</label>
        <input id={`${id}-musica`} type="range" min="0" max="100" step="1" aria-label="Volumen de música"
          value={Math.round(preferencias.musica * 100)} onChange={(evento) => {
            audio.configurar({ musica: Number(evento.target.value) / 100 }); void audio.desbloquear();
          }} />
        <label htmlFor={`${id}-efectos`}>Efectos e interfaz · {Math.round(preferencias.efectos * 100)} %</label>
        <input id={`${id}-efectos`} type="range" min="0" max="100" step="1" aria-label="Volumen de efectos"
          value={Math.round(preferencias.efectos * 100)} onChange={(evento) => {
            audio.configurar({ efectos: Number(evento.target.value) / 100 }); void audio.desbloquear();
          }} />
        <button type="button" className="boton boton--enlace" disabled={preferencias.silenciado || preferencias.efectos === 0}
          onClick={() => { void audio.desbloquear().then((listo) => { if (listo) void audio.efecto("clic"); }); }}>
          Probar efecto
        </button>
        {aviso && <p role="status">{aviso}</p>}
      </div>
    </details>
  );
}
