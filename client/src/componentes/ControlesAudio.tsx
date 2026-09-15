import { useId, useSyncExternalStore } from "react";
import { audio } from "../audio/audio";

export function ControlesAudio() {
  const id = useId();
  const { preferencias, aviso } = useSyncExternalStore(audio.suscribir, audio.obtenerEstado);
  const estado = preferencias.silenciado ? "Sonido silenciado" : "Sonido activado";
  return (
    <details className="controles-audio">
      <summary aria-label={estado} title={estado}>
        <IconoDeSonido silenciado={preferencias.silenciado} />
      </summary>
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

/** Parlante con ondas cuando suena; con una cruz cuando está silenciado. */
function IconoDeSonido({ silenciado }: { silenciado: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" fillOpacity="0.2" />
      {silenciado
        ? <path d="m16 9 6 6m0-6-6 6" />
        : <path d="M16.5 8.5a5 5 0 0 1 0 7M19.5 5.5a9 9 0 0 1 0 13" />}
    </svg>
  );
}
