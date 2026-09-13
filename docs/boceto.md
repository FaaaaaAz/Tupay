# Tupay — Boceto de pantallas e identidad visual

Diseñado para navegador de escritorio en horizontal, que es donde se hace la defensa. No hay versión
para celular en esta entrega.

## Recorrido entre pantallas

```text
Portada ──▶ Menú ──┬──▶ Configurar partido ──▶ Partida ──▶ Resultado ──┬──▶ Menú
                   │                                                    └──▶ Revancha
                   ├──▶ Configurar temporada ──▶ Temporada ──▶ Partida ──▶ Resultado ──▶ Temporada
                   └──▶ Instrucciones ──▶ Menú
```

`App` controla en qué pantalla estamos con estado de React, sin React Router: el examen no permite
librerías de routing, y con seis pantallas un `switch` sobre una variable de estado es más fácil de
explicar que cualquier alternativa.

## Portada

Fondo: `recursos/pantallas/inicio.webp`, que ya trae el logotipo de Tupay. Encima, un solo botón.

```text
┌──────────────────────────────────────────────────────────┐
│                                                          │
│                  [ imagen de portada                     │
│                    con el logo TUPAY ]                   │
│                                                          │
│                     ┌──────────────┐                     │
│                     │   INICIAR    │                     │
│                     └──────────────┘                     │
│                                                          │
│  Tupay · fútbol de tapitas            versión publicada  │
└──────────────────────────────────────────────────────────┘
```

La versión publicada se muestra abajo a la derecha, tomada de `GET /api/salud`. Sirve para demostrar
en la defensa que lo que está en pantalla es exactamente el commit desplegado.

## Menú

Fondo: `recursos/pantallas/menu.webp`, que tiene el centro libre a propósito. Encima, tres tarjetas.

```text
┌──────────────────────────────────────────────────────────┐
│                        TUPAY                             │
│                                                          │
│   ┌────────────┐   ┌────────────┐   ┌────────────┐       │
│   │ELIMINATORIA│   │    LIGA    │   │   CÓMO SE  │       │
│   │            │   │            │   │    JUEGA   │       │
│   │ Partido a  │   │ Temporada  │   │            │       │
│   │ X goles,   │   │ o partido  │   │ Reglas y   │       │
│   │ sin empate │   │ con reloj  │   │ controles  │       │
│   └────────────┘   └────────────┘   └────────────┘       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## Configurar partido

Una sola pantalla con todo lo que el jugador decide antes de empezar. Los equipos y los estadios se
piden al servidor (`GET /api/equipos` y `GET /api/estadios`): el cliente no los tiene escritos.

```text
┌──────────────────────────────────────────────────────────┐
│  ← Volver                  ELIMINATORIA                  │
│                                                          │
│  Jugadores:   ( • ) 1 jugador    (   ) 2 jugadores       │
│  Dificultad:  ( ) Fácil  ( • ) Medio  ( ) Difícil        │
│                                                          │
│  ┌────────────────────┐        ┌────────────────────┐    │
│  │  EQUIPO LOCAL      │        │  EQUIPO VISITANTE  │    │
│  │  ○ tapita grande   │   vs   │  ○ tapita grande   │    │
│  │  [ Bolívar      ▾] │        │  [ The Strongest ▾]│    │
│  └────────────────────┘        └────────────────────┘    │
│                                                          │
│  Estadio:  [ Hernando Siles ▾ ]   charcos de agua        │
│  Meta de goles:  ( ) 1  ( ) 2  ( • ) 3  ( ) 4  ( ) 5     │
│  Perro en la cancha:  [ ✓ ] activado                     │
│                                                          │
│                    ┌──────────────┐                      │
│                    │   JUGAR      │                      │
│                    └──────────────┘                      │
└──────────────────────────────────────────────────────────┘
```

Si los dos equipos son el mismo, al pulsar **Jugar** el servidor responde con el error y la pantalla
muestra *"Elijan equipos distintos: todavía no hay camisetas alternativas"*. La validación vive en
Express a propósito: es la acción inválida que exige la rúbrica y debe demostrarse con una respuesta
real, no con una comprobación escondida en el navegador.

En modo Liga, en lugar de la meta de goles aparece la duración real del partido.

## Partida

La cancha ocupa casi toda la pantalla. Todo lo demás es una franja delgada arriba y otra abajo.

```text
┌──────────────────────────────────────────────────────────┐
│ BOLÍVAR  2 — 1  THE STRONGEST     ⏱ 12s    min 34'       │
│ ▸ turno de Bolívar        tiros de poder: ●●   ●○        │
├──────────────────────────────────────────────────────────┤
│ ╔══════════════════════════════════════════════════════╗ │
│ ║ ▓▓▓ fondo del estadio ▓▓▓                            ║ │
│ ║  ┃                    ·  ·  ·                     ┃  ║ │
│ ║  ┃ ◎        ◍      ~charco~        ◍         ◎    ┃  ║ │
│ ║ ▐┃      ◍        ◍    ●pelota   ◍        ◍       ┃▌ ║ │
│ ║ arco     ◍                             ◍       arco  ║ │
│ ║  ┃ ◎              ◍            ◍             ◎    ┃  ║ │
│ ║  ┃                                               ┃  ║ │
│ ╚══════════════════════════════════════════════════════╝ │
├──────────────────────────────────────────────────────────┤
│ 😀 😠 😢 😮 😴      ¡El perro entró a la cancha!          │
└──────────────────────────────────────────────────────────┘
```

**Orden de capas**, de atrás hacia adelante: fondo del estadio → charcos → pelota y tapitas →
caritas de emote sobre cada tapita → **arcos por encima de todo**. Los arcos van al final para que la
pelota se vea entrando dentro del arco y no por delante de la red. El arco es un único archivo: para
el lado derecho se voltea en espejo horizontal, nunca se rota.

**Turno**: las tapitas del equipo que tiene el turno titilan con un borde brillante, y su recuadro en
el marcador se enmarca con el color del club. Así se sabe qué tapitas se pueden mover sin leer nada,
y no se confunden equipos con tapitas parecidas, como Always Ready y Nacional Potosí.

**Apuntar**: se arrastra hacia atrás desde una tapita propia, como en el billar. Mientras se arrastra
aparece una flecha que muestra dirección y fuerza; al soltar, el tiro se envía a Express. Si el
gesto empieza sobre una tapita rival o el arrastre es demasiado corto, se cancela sin enviar nada.

**Durante la animación** no se aceptan tiros nuevos. React reproduce los cuadros que devolvió el
servidor y, al terminar, aplica el estado confirmado: la posición final siempre la decide Express,
nunca el navegador.

**Emotes**: la fila de caritas de abajo a la izquierda. Al elegir una, aparece sobre las cinco
tapitas del jugador durante 5 segundos. Después quedan deshabilitadas 15 segundos, con la cuenta
regresiva visible sobre el botón.

## Resultado

```text
┌──────────────────────────────────────────────────────────┐
│                     ¡GANÓ BOLÍVAR!                       │
│                                                          │
│              ◎  BOLÍVAR   3 — 1   THE STRONGEST  ◎       │
│                                                          │
│        ┌──────────────┐      ┌──────────────┐            │
│        │   REVANCHA   │      │  VOLVER AL   │            │
│        │              │      │     MENÚ     │            │
│        └──────────────┘      └──────────────┘            │
└──────────────────────────────────────────────────────────┘
```

En Liga puede decir *"Empate"*, y si el partido pertenece a una temporada, el botón de la derecha
vuelve a la pantalla de Temporada en vez del menú.

## Temporada

```text
┌──────────────────────────────────────────────────────────┐
│  ← Menú            TEMPORADA · jornada 4 de 9            │
│                                                          │
│  PRÓXIMO PARTIDO                                         │
│  ◎ Bolívar  vs  Aurora ◎     [ rival: servidor ▾ ] JUGAR │
│                                                          │
│  TABLA DE POSICIONES                                     │
│  ┌───┬──────────────────┬───┬───┬───┬───┬────┬────┐      │
│  │ # │ Equipo           │ J │ G │ E │ P │ DG │ Pts│      │
│  ├───┼──────────────────┼───┼───┼───┼───┼────┼────┤      │
│  │ 1 │ Bolívar          │ 3 │ 3 │ 0 │ 0 │ +5 │  9 │      │
│  │ 2 │ The Strongest    │ 3 │ 2 │ 0 │ 1 │ +2 │  6 │      │
│  └───┴──────────────────┴───┴───┴───┴───┴────┴────┘      │
│                                                          │
│  CALENDARIO   j1 ✓ 2-1 · j2 ✓ 0-0 · j3 ~ simulada · j4 ▸ │
└──────────────────────────────────────────────────────────┘
```

El selector *rival* solo aparece en dos jugadores y solo en las jornadas donde el rival no es el
equipo de la otra persona: ahí se elige si ese partido lo juega el servidor o lo toma el segundo
jugador, como cuando alguien agarra el control del equipo de la máquina.

## Identidad visual

### Paleta

| Color | Valor | Dónde |
|---|---|---|
| Verde cancha | `#1f6f43` | fondo general fuera de la cancha |
| Verde oscuro | `#12492c` | degradado de fondo, bordes |
| Crema | `#f4efe4` | texto principal |
| Dorado | `#f2c14e` | título, acentos, botón principal |
| Rojo | `#c0392b` | errores y acciones inválidas |

Los colores de cada equipo llegan desde el servidor en `GET /api/equipos` y se usan para los
marcadores y los indicadores de turno, para que se note de quién es cada cosa sin leer el nombre.

### Tipografía

Fuentes del sistema, sin descargar nada: `Trebuchet MS` como principal por su aire deportivo y
redondeado, con `Segoe UI` y la fuente del sistema como respaldo. Evitar una fuente web ahorra una
petición externa y elimina el parpadeo de texto al cargar, que en la defensa se nota.

### Estilo

Las tapitas son chapas de botella reales, con su borde metálico dentado y los colores del club. La
pelota, el perro, los charcos y los arcos siguen la misma línea ilustrada. Los estadios son fondos
completos y reconocibles por su pista y sus tribunas.

**Escudos:** ningún equipo usa su escudo oficial. Las tapitas llevan los colores y el nombre del
club, que es lo que permite reconocerlo, pero la ilustración es propia. El criterio y su motivo
están en `docs/introduccion.md` y en `docs/decisiones.md`.

### Recursos

Los originales sin comprimir están en `assets/` y pesan 46 MB; no se publican. Las versiones que usa
el juego están en `client/src/recursos/` y pesan 2,2 MB en total, generadas con
`scripts/optimizar-recursos.mjs`.

| Carpeta | Contenido | Medida |
|---|---|---|
| `equipos/` | las 10 tapitas | 256 × 256 |
| `estadios/` | los 6 estadios | 1672 × 941 |
| `pantallas/` | portada y menú | 1672 × 941 |
| `juego/` | pelota, perro, arco, charcos de agua y de nieve | según elemento |
| `emotes/` | las 7 caritas | 256 × 256 |

Las caritas están recortadas a su contenido y centradas al 70 % de un lienzo cuadrado. Así se dibujan
en el mismo rectángulo que la tapita y siempre caen dentro del disco, sin cálculos por cada emote.

## Accesibilidad y localizadores

- Botones y controles con rol accesible y nombre visible, para que Playwright los encuentre por
  `getByRole` en vez de por clases de CSS que cambian con el diseño.
- `data-testid` solo donde no hay un selector semántico estable: la cancha, cada tapita, la pelota,
  el marcador y la zona de mensajes.
- Foco visible en todos los controles y contraste suficiente entre el texto crema y los fondos
  oscuros.
