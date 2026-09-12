# Tupay — API REST

Toda la comunicación es JSON, de entrada y de salida. Los tipos de cada cuerpo están en
`compartido/` y los comparten el cliente y el servidor, así que un cambio en el contrato rompe la
compilación de ambos lados en vez de fallar recién en tiempo de ejecución.

> Los ejemplos de este documento son el diseño previo a la implementación. La tarea 5.9 del plan los
> reemplaza por solicitudes y respuestas reales capturadas del servidor.

## Convenciones

- Base: la misma dirección que sirve el frontend. En producción, `https://tupay.onrender.com`.
- Los errores siempre tienen la misma forma: `{ "error": "mensaje" }`, con el texto exacto que se
  muestra en pantalla (ver la tabla de acciones inválidas en `docs/reglas.md`).
- Los campos que no aplican viajan como `null`, nunca ausentes. `JSON.stringify` descarta
  `undefined`, así que un campo opcional desaparecería del JSON y el cliente no podría distinguir
  "no aplica" de "me olvidé de mandarlo".
- Las posiciones están en unidades de cancha, no en píxeles. Cada partida informa sus medidas en
  `cancha`, y el cliente escala el SVG a la pantalla.

## Códigos de estado

| Código | Cuándo |
|---|---|
| `200` | Consulta o acción correcta. |
| `201` | Partida o temporada creada. |
| `400` | Acción inválida: turno ajeno, fuerza fuera de rango, equipos repetidos, emote en enfriamiento. |
| `404` | No existe la partida, la temporada o la ruta. |
| `409` | La partida ya terminó. |

## Catálogo

### `GET /api/salud`

Estado y versión del servidor. Es lo que usa el pipeline para confirmar qué commit está publicado.

```json
{ "estado": "ok", "juego": "Tupay", "version": "ec51f6b62479f41df4d919ad8f88e8c14c3d0338" }
```

### `GET /api/equipos`

Los diez equipos. El cliente nunca tiene la lista escrita: la pide al servidor.

```json
[
  {
    "id": "bolivar",
    "nombre": "Bolívar",
    "departamento": "La Paz",
    "estadio": "hernandoSiles",
    "colorPrincipal": "#1e9ade",
    "colorSecundario": "#ffffff"
  }
]
```

### `GET /api/estadios`

```json
[
  {
    "id": "hernandoSiles",
    "nombre": "Hernando Siles",
    "ciudad": "La Paz",
    "efecto": "charcosDeAgua"
  },
  {
    "id": "ramonAguilera",
    "nombre": "Ramón Aguilera Costas",
    "ciudad": "Santa Cruz",
    "efecto": "ninguno"
  }
]
```

## Partida

### `POST /api/partidas`

Crea un partido, de Eliminatoria o de Liga suelta. El servidor arma la formación de cinco tapitas
por equipo, sortea el saque y devuelve el estado inicial completo.

Entrada mínima:

```json
{
  "modo": "eliminatoria",
  "local": { "equipo": "bolivar", "tipo": "humano" },
  "visitante": { "equipo": "theStrongest", "tipo": "servidor", "dificultad": "medio" }
}
```

Entrada completa, con las opciones que hacen repetibles las pruebas:

```json
{
  "modo": "liga",
  "local": { "equipo": "wilstermann", "tipo": "humano" },
  "visitante": { "equipo": "aurora", "tipo": "humano" },
  "estadio": "felixCapriles",
  "perroActivo": false,
  "golesParaGanar": 1,
  "semilla": 12345,
  "duracionRealSegundos": 10,
  "limiteTurnoSegundos": 5
}
```

Respuesta `201`:

```json
{
  "id": "p_8fa31c",
  "modo": "eliminatoria",
  "estado": "enJuego",
  "estadio": "hernandoSiles",
  "cancha": {
    "ancho": 1200,
    "alto": 700,
    "altoDelArco": 180,
    "radioTapita": 28,
    "radioPelota": 18
  },
  "local": {
    "lado": "local",
    "equipo": "bolivar",
    "tipo": "humano",
    "dificultad": null,
    "tirosDePoder": 2,
    "emote": null,
    "esperaEmote": 0
  },
  "visitante": {
    "lado": "visitante",
    "equipo": "theStrongest",
    "tipo": "servidor",
    "dificultad": "medio",
    "tirosDePoder": 2,
    "emote": null,
    "esperaEmote": 0
  },
  "tapitas": [
    { "id": "local-1", "lado": "local", "posicion": { "x": 120, "y": 350 } },
    { "id": "local-2", "lado": "local", "posicion": { "x": 330, "y": 180 } }
  ],
  "pelota": { "posicion": { "x": 600, "y": 350 }, "atrapadaEn": null, "golpesParaLiberar": 0 },
  "charcos": [],
  "turno": { "lado": "local", "segundosRestantes": 15 },
  "marcador": { "local": 0, "visitante": 0 },
  "perro": { "activo": true, "apariciones": 0 },
  "golesParaGanar": 3,
  "reloj": null,
  "resultado": null
}
```

Errores:

| Situación | Código | Respuesta |
|---|---|---|
| Ambos equipos iguales | `400` | `{ "error": "Elijan equipos distintos: todavía no hay camisetas alternativas" }` |
| `golesParaGanar` fuera de 1 a 5 | `400` | `{ "error": "Elige una meta de goles entre 1 y 5" }` |

### `GET /api/partidas/:id`

Devuelve el mismo objeto `Partida` de arriba, con el estado actual. Si no existe, `404` con
`{ "error": "Esa partida no existe" }`.

### `POST /api/partidas/:id/tiros`

El corazón del juego: valida el tiro, lo simula hasta que todo se detiene, decide si hubo gol,
cambia el turno y devuelve el recorrido para que React lo anime.

Entrada:

```json
{
  "tapita": "local-3",
  "direccion": { "x": 0.94, "y": -0.34 },
  "fuerza": 0.8,
  "tiroDePoder": false
}
```

Respuesta `200`. El recorrido va recortado en el ejemplo; en la práctica son decenas de cuadros:

```json
{
  "recorrido": [
    {
      "tapitas": [{ "x": 120, "y": 350 }, { "x": 330, "y": 180 }],
      "pelota": { "x": 600, "y": 350 },
      "perro": null
    },
    {
      "tapitas": [{ "x": 120, "y": 350 }, { "x": 352, "y": 172 }],
      "pelota": { "x": 600, "y": 350 },
      "perro": null
    }
  ],
  "eventos": [{ "tipo": "gol", "lado": "local" }],
  "partida": { "...": "el estado completo, ya con el marcador y el turno actualizados" }
}
```

Las posiciones de `tapitas` en cada cuadro van **en el mismo orden** que `partida.tapitas`. Repetir
los identificadores en cada cuadro multiplicaría el tamaño de la respuesta sin agregar información.

Errores:

| Situación | Código | Respuesta |
|---|---|---|
| No es su turno | `400` | `{ "error": "No es tu turno" }` |
| Tapita del rival | `400` | `{ "error": "Ese jugador no es tuyo" }` |
| Fuerza o dirección fuera de rango | `400` | `{ "error": "Tiro inválido" }` |
| Se acabó el tiempo del turno | `400` | `{ "error": "Se acabó tu tiempo: pierdes el turno" }` |
| Sin tiros de poder | `400` | `{ "error": "Ya no te quedan tiros de poder" }` |
| Partida terminada | `409` | `{ "error": "La partida ya terminó" }` |

### `POST /api/partidas/:id/turno-rival`

Pide al servidor que juegue su turno en el modo de 1 jugador. No lleva cuerpo y responde igual que
`/tiros`: recorrido, eventos y estado.

### `POST /api/partidas/:id/emotes`

Lanza una carita sobre las cinco tapitas del jugador. No afecta la física ni el turno.

```json
{ "lado": "local", "emote": "felizEuforico" }
```

Respuesta `200`: el objeto `Partida`, con el emote activo y su enfriamiento.

```json
{
  "local": {
    "emote": { "id": "felizEuforico", "segundosRestantes": 5 },
    "esperaEmote": 15
  }
}
```

Si todavía está en enfriamiento, `400` con
`{ "error": "Espera unos segundos para volver a usar un emote" }`.

## Temporada

### `POST /api/temporadas`

Crea una temporada y genera el calendario de todos contra todos, a una vuelta.

```json
{
  "equipos": ["bolivar", "theStrongest", "aurora", "wilstermann"],
  "humanos": ["bolivar"],
  "perroActivo": true,
  "semilla": 777
}
```

Respuesta `201`: el objeto `Temporada` con las jornadas en `pendiente` y la tabla en cero.

### `GET /api/temporadas/:id`

Calendario, tabla de posiciones y estado de cada jornada.

```json
{
  "id": "t_4b19e0",
  "equipos": ["bolivar", "theStrongest", "aurora", "wilstermann"],
  "humanos": ["bolivar"],
  "jornadas": [
    {
      "id": "j1",
      "numero": 1,
      "local": "bolivar",
      "visitante": "aurora",
      "estado": "pendiente",
      "marcador": null,
      "partida": null
    }
  ],
  "tabla": [
    {
      "equipo": "bolivar",
      "jugados": 0,
      "ganados": 0,
      "empatados": 0,
      "perdidos": 0,
      "golesAFavor": 0,
      "golesEnContra": 0,
      "diferencia": 0,
      "puntos": 0
    }
  ],
  "estado": "enCurso",
  "campeon": null
}
```

### `POST /api/temporadas/:id/jornadas/:jornadaId/jugar`

Si la jornada involucra a una persona, crea el partido individual y lo enlaza. Si no involucra a
nadie, la resuelve con la semilla de la temporada, sin física completa, y actualiza la tabla.

```json
{ "rivalControladoPor": "humano" }
```

Respuesta `200`:

```json
{
  "jornada": {
    "id": "j1",
    "numero": 1,
    "local": "bolivar",
    "visitante": "aurora",
    "estado": "enJuego",
    "marcador": null,
    "partida": "p_8fa31c"
  },
  "temporada": { "...": "la temporada con su tabla actualizada" },
  "modo": "liga"
}
```
