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
│  Estadio:  [ Hernando Siles ▾ ]   ┌──────────┐           │
│  Charcos de agua: atrapan la      │ miniatura│           │
│  pelota y un golpe la saca        └──────────┘           │
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

Debajo del selector de estadio se describe su efecto y, al lado, una miniatura del estadio elegido:
así se sabe qué va a pasar en la cancha antes de empezar.

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

**Charcos**: se dibujan sobre el césped, con la imagen estirada para cubrir exactamente la elipse
que usa la física. En su último tiro se ven más claros, porque están por secarse. Cuando la pelota
queda atrapada, un anillo punteado titila a su alrededor y el mensaje de abajo dice cuántos golpes
faltan para sacarla.

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

**Emotes**: cada persona tiene su fila de siete caritas junto a su equipo, en el marcador. Al elegir
una, aparece sobre sus cinco tapitas durante 5 segundos. Después la fila queda deshabilitada 15
segundos, con la cuenta regresiva encima. El boceto original la ponía abajo a la izquierda, pero con
dos jugadores cada uno necesita la suya, y junto a su equipo se entiende de quién es cada fila.

### Pausa y confirmación de salida

El pie de la cancha incorpora **Pausar** (también `Esc`) y **Salir**. Los modales son componentes React
con `<dialog>` y CSS: panel azul oscuro, iluminación verde, borde dorado, entrada breve y fondo
oscurecido/desenfocado. Muestran el marcador y priorizan la acción de continuar sobre abandonar.

El foco empieza en la acción segura, `Tab`/`Shift+Tab` recorren el modal y `Esc` vuelve; al cerrarlo
se restaura el foco. Si falla la conexión, el error permanece dentro del diálogo y se puede reintentar.
El mensaje de salida distingue partida suelta y temporada. La preferencia de movimiento reducido
elimina la entrada animada del modal y el giro decorativo de la pelota.

Capturas locales verificadas en 1280 × 720, 1366 × 768 y 1920 × 1080. Evidencias de pausa y salida
en `docs/evidencias/fase-10-pausa.jpg` y `docs/evidencias/fase-10-salida.jpg`.

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
| Verde oscuro | `#0d3b24` | iluminación y degradado de fondo |
| Azul noche | `#0b1626` | fondo base y superficies oscuras |
| Crema | `#f4efe4` | texto principal |
| Dorado | `#f2c14e` | título, acentos, botón principal |
| Rojo | `#ff6b57` | errores y acciones inválidas |

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

### Pulido de interfaz (10.5–10.6)

El menú conserva su ilustración con viñeta, y cada tarjeta lleva su propia ilustración centrada
(tapitas con la copa, el cronómetro, el calendario o el árbitro). Las tarjetas, los paneles y los
modales comparten superficies azul nocturno, acentos dorados, radios y sombras definidos en
`global.css`. Configuración, instrucciones, temporada y resultado comparten un mismo estadio
nocturno de fondo, con viñeta, detrás de un panel algo translúcido. Las entradas y los estados de
foco/selección son breves y respetan la preferencia de movimiento reducido.

En la cancha, la flecha se acompaña de un anillo y un porcentaje de potencia. El poder activo
se distingue también con texto. Avisos pequeños y no bloqueantes anuncian turno, gol, perro,
pelota atrapada y final; junto a la pelota se indica cuántos golpes faltan para liberarla.
Los avisos conservan su duración restante durante la pausa.

Se verificaron las pantallas a 1280 × 720, 1366 × 768 y 1920 × 1080. La configuración mantiene
su botón de jugar visible en los tres tamaños; la temporada admite desplazamiento vertical en
pantallas bajas. Véanse las capturas de [menú](evidencias/fase-10-menu-pulido.jpg),
[configuración](evidencias/fase-10-configuracion-pulida.jpg) y
[apuntado](evidencias/fase-10-potencia.jpg).

### Recursos

Los originales sin comprimir están en `assets/` y pesan 60,1 MB; no se publican. Las versiones que usa
el juego están en `client/src/recursos/` y las imágenes pesan 2,8 MB en total, generadas con
`scripts/optimizar-recursos.mjs`.

| Carpeta | Contenido | Medida |
|---|---|---|
| `equipos/` | las 10 tapitas: las fichas de la cancha | 256 × 256 |
| `escudos/` | los 10 escudos: identifican a cada equipo fuera de la cancha | 256 × 256 |
| `estadios/` | los 6 estadios | 1672 × 941 |
| `pantallas/` | portada y menú; fondo de los paneles; árbitro de los modales | 1672 × 941; 1811 × 868; 360 × 284 |
| `tarjetas/` | las 4 ilustraciones de las tarjetas del menú, recortadas a su dibujo | hasta 560 × 420 |
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
