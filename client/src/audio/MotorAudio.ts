export type CanalAudio = "musica" | "interfaz" | "efectos" | "reacciones";
export interface RecursoAudio {
  url: string;
  canal: CanalAudio;
  ganancia: number;
  intervaloMs: number;
  bucle?: boolean;
}
export interface PreferenciasAudio { silenciado: boolean; musica: number; efectos: number }
interface EstadoAudio {
  preferencias: PreferenciasAudio;
  aviso: string | null;
}
const CLAVE = "tupay.audio.v1";
const INICIALES: PreferenciasAudio = { silenciado: false, musica: 0.25, efectos: 0.6 };
const volumen = (valor: unknown, respaldo: number) =>
  typeof valor === "number" && Number.isFinite(valor) ? Math.min(1, Math.max(0, valor)) : respaldo;

/** Un contexto, una música y canales independientes. No conoce React ni reglas del partido. */
export class MotorAudio {
  private contexto: AudioContext | null = null;
  private canales: Partial<Record<CanalAudio, GainNode>> = {};
  private buffers = new Map<string, Promise<AudioBuffer>>();
  private oyentes = new Set<() => void>();
  private ultimos = new Map<string, number>();
  private activos = new Map<AudioBufferSourceNode, { id: string; canal: CanalAudio }>();
  private versiones = new Map<string, number>();
  private generacionEfectos = 0;
  private generacionMusica = 0;
  private musica: { id: string; nodo: AudioBufferSourceNode; inicio: number; offset: number } | null = null;
  private musicaDeseada: string | null = null;
  private offsetMusica = 0;
  private pausado = false;
  private oculto = false;
  private estado: EstadoAudio = { preferencias: { ...INICIALES }, aviso: null };

  constructor(private recursos: Record<string, RecursoAudio>) {
    try {
      const guardado: unknown = JSON.parse(localStorage.getItem(CLAVE) ?? "null");
      if (guardado && typeof guardado === "object") {
        const p = guardado as Partial<PreferenciasAudio>;
        this.estado.preferencias = {
          silenciado: typeof p.silenciado === "boolean" ? p.silenciado : false,
          musica: volumen(p.musica, INICIALES.musica), efectos: volumen(p.efectos, INICIALES.efectos),
        };
      }
    } catch { /* El almacenamiento privado o corrupto no impide jugar. */ }
  }

  obtenerEstado = () => this.estado;
  suscribir = (oyente: () => void) => { this.oyentes.add(oyente); return () => { this.oyentes.delete(oyente); }; };
  private avisar(aviso: string | null) {
    if (aviso === this.estado.aviso) return;
    this.estado = { ...this.estado, aviso };
    this.oyentes.forEach((oyente) => oyente());
  }

  /** Llamar directamente desde un clic/tecla, nunca desde un efecto de montaje. */
  async desbloquear(): Promise<boolean> {
    try {
      if (!this.contexto) {
        this.contexto = new AudioContext();
        for (const canal of ["musica", "interfaz", "efectos", "reacciones"] as const) {
          this.canales[canal] = this.contexto.createGain();
          this.canales[canal]!.connect(this.contexto.destination);
        }
        this.aplicarVolumen();
      }
      await this.contexto.resume();
      if (this.contexto.state !== "running") return false;
      this.avisar(null);
      void this.actualizarMusica();
      return true;
    } catch {
      this.avisar("El audio no está disponible. Puedes seguir jugando sin sonido.");
      return false;
    }
  }

  configurar(cambios: Partial<PreferenciasAudio>) {
    const previo = this.estado.preferencias;
    this.estado = { ...this.estado, preferencias: {
      silenciado: cambios.silenciado ?? previo.silenciado,
      musica: volumen(cambios.musica, previo.musica), efectos: volumen(cambios.efectos, previo.efectos),
    } };
    try { localStorage.setItem(CLAVE, JSON.stringify(this.estado.preferencias)); } catch { /* Solo memoria. */ }
    this.aplicarVolumen();
    if (this.estado.preferencias.silenciado || this.estado.preferencias.efectos === 0) this.detenerEfectos();
    void this.actualizarMusica();
    this.oyentes.forEach((oyente) => oyente());
  }

  private aplicarVolumen() {
    const p = this.estado.preferencias;
    for (const [canal, nodo] of Object.entries(this.canales)) {
      nodo.gain.value = p.silenciado ? 0 : canal === "musica" ? p.musica : p.efectos;
    }
  }

  private cargar(id: string): Promise<AudioBuffer> {
    const existente = this.buffers.get(id);
    if (existente) return existente;
    const contexto = this.contexto;
    const recurso = this.recursos[id];
    if (!contexto || !recurso) return Promise.reject(new Error("Audio no disponible"));
    const carga = fetch(recurso.url, { signal: AbortSignal.timeout(8000) })
      .then((respuesta) => { if (!respuesta.ok) throw new Error("No se pudo cargar el audio"); return respuesta.arrayBuffer(); })
      .then((datos) => contexto.decodeAudioData(datos))
      .catch((error: unknown) => { this.buffers.delete(id); throw error; });
    this.buffers.set(id, carga);
    return carga;
  }

  /** Precarga acotada después del gesto inicial; nunca retrasa una llamada al servidor. */
  async preparar(ids: readonly string[]) {
    if (!this.contexto || this.estado.preferencias.silenciado) return;
    await Promise.allSettled(ids.map((id) => this.cargar(id)));
  }

  private puedeSonar(canal: CanalAudio): boolean {
    const p = this.estado.preferencias;
    return this.contexto?.state === "running" && !p.silenciado && !this.oculto &&
      (canal === "musica" ? p.musica > 0 && !this.pausado : p.efectos > 0 && (canal === "interfaz" || !this.pausado));
  }

  /**
   * No encola efectos viejos: descarta cargas lentas, duplicados y ráfagas. Por `interfaz`, un sonido
   * del juego puede sonar durante la pausa, como el silbato que la anuncia.
   */
  async efecto(id: string, canalAlternativo?: "reacciones" | "interfaz"): Promise<boolean> {
    const recurso = this.recursos[id];
    const canal = canalAlternativo ?? recurso?.canal;
    if (!recurso || !canal || canal === "musica" || !this.puedeSonar(canal)) return false;
    const ahora = performance.now();
    if (ahora - (this.ultimos.get(id) ?? -Infinity) < recurso.intervaloMs) return false;
    this.ultimos.set(id, ahora);
    const generacion = this.generacionEfectos;
    const version = this.versiones.get(id);
    try {
      const buffer = await this.cargar(id);
      if (generacion !== this.generacionEfectos || version !== this.versiones.get(id) || !this.puedeSonar(canal) || performance.now() - ahora > 350) return false;
      if (canal === "reacciones" && [...this.activos.values()].some((activo) => activo.canal === "efectos" || activo.canal === "reacciones")) return false;
      if (canal === "efectos") {
        for (const [nodo, activo] of this.activos) if (activo.canal === "reacciones") { nodo.stop(); this.activos.delete(nodo); }
      }
      if (this.activos.size >= 4) return false;
      const nodo = this.crearFuente(buffer, { ...recurso, canal, ganancia: canalAlternativo === "reacciones" ? Math.min(0.25, recurso.ganancia) : recurso.ganancia });
      this.activos.set(nodo, { id, canal });
      nodo.onended = () => { this.activos.delete(nodo); nodo.disconnect(); };
      nodo.start();
      return true;
    } catch {
      this.avisar("No se pudo cargar un sonido. El juego sigue disponible.");
      return false;
    }
  }

  private crearFuente(buffer: AudioBuffer, recurso: RecursoAudio) {
    const contexto = this.contexto!;
    const nodo = contexto.createBufferSource();
    const nivel = contexto.createGain();
    nodo.buffer = buffer;
    nivel.gain.value = recurso.ganancia;
    nodo.connect(nivel);
    nivel.connect(this.canales[recurso.canal]!);
    nodo.addEventListener("ended", () => nivel.disconnect(), { once: true });
    return nodo;
  }

  reproducirMusica(id: string | null) {
    if (id !== null && this.recursos[id]?.canal !== "musica") return;
    if (id !== this.musicaDeseada) {
      this.pararMusica();
      this.offsetMusica = 0;
      this.musicaDeseada = id;
    }
    void this.actualizarMusica();
  }

  private async actualizarMusica() {
    const id = this.musicaDeseada;
    if (!id || !this.puedeSonar("musica")) { this.pararMusica(); return; }
    if (this.musica?.id === id) return;
    const generacion = ++this.generacionMusica;
    try {
      const buffer = await this.cargar(id);
      if (generacion !== this.generacionMusica || !this.puedeSonar("musica") || this.musicaDeseada !== id) return;
      const nodo = this.crearFuente(buffer, this.recursos[id]!);
      nodo.loop = this.recursos[id]!.bucle ?? false;
      const offset = this.offsetMusica % buffer.duration;
      this.musica = { id, nodo, inicio: this.contexto!.currentTime, offset };
      nodo.onended = () => {
        nodo.disconnect();
        if (this.musica?.nodo === nodo) { this.musica = null; this.musicaDeseada = null; this.offsetMusica = 0; }
      };
      nodo.start(0, offset);
    } catch { this.avisar("No se pudo cargar la música. Puedes continuar sin ella."); }
  }

  private pararMusica() {
    this.generacionMusica++;
    if (!this.musica) return;
    const { nodo, inicio, offset } = this.musica;
    this.offsetMusica = offset + this.contexto!.currentTime - inicio;
    this.musica = null;
    nodo.stop();
  }

  detenerEfecto(id: string) {
    this.versiones.set(id, (this.versiones.get(id) ?? 0) + 1);
    for (const [nodo, activo] of this.activos) if (activo.id === id) { nodo.stop(); this.activos.delete(nodo); }
  }

  detenerEfectos() {
    this.generacionEfectos++;
    for (const nodo of this.activos.keys()) nodo.stop();
    this.activos.clear();
  }

  /** Solo corta los efectos al entrar en pausa: confirmarla otra vez no apaga lo que suena en ella. */
  pausar(pausado: boolean) {
    if (pausado && !this.pausado) this.detenerEfectos();
    this.pausado = pausado;
    void this.actualizarMusica();
  }

  ocultar(oculto: boolean) {
    this.oculto = oculto;
    if (oculto) this.detenerEfectos();
    void this.actualizarMusica();
  }

  detenerTodo() { this.reproducirMusica(null); this.detenerEfectos(); }
}
