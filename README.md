# Shooter 2D

Shooter top-down de arena con oleadas infinitas, hecho con **Phaser 3** y **Vite**. Pensado para correr fluido en PCs y celulares de bajos recursos: todos los gráficos se generan por código, no hay imágenes ni audio externos y el build pesa ~1.2 MB.

## Cómo se juega

| Acción   | Teclado y mouse               | Pantalla táctil                                    |
|----------|-------------------------------|----------------------------------------------------|
| Mover    | WASD o flechas                | Joystick (mitad izquierda de la pantalla)          |
| Apuntar  | Mouse                         | Automático al enemigo más cercano                  |
| Disparar | Clic izquierdo (mantener) o Espacio | Mantener pulsada la mitad derecha            |
| Pausa    | P o Esc                       | Botón **II** (arriba a la derecha, solo táctil)    |
| Habilidad 1 | E                          | Botón **E** (sobre el botón de disparo)            |
| Habilidad 2 | Q (desde la oleada 4)      | Botón **Q** (a la izquierda del disparo)           |
| Habilidad 3 | C (desde la oleada 8)      | Botón **C** (arriba a la izquierda del disparo)    |
| Cambiar arma (historia) | X o rueda del mouse | Botón **ARMA** |
| Usar / comprar (historia) | F | Botón **F** (aparece cerca de armas y tiendas) |

En PC no se muestran botones en pantalla: los enfriamientos aparecen como texto bajo las vidas. El mapa mide 1600 × 1200 y la cámara sigue al jugador.

### Habilidades

Empiezas con **Impulso** en la tecla E. Al terminar la oleada 3 se desbloquea la tecla Q y al terminar la 7 la tecla C; en cada caso eliges la habilidad para esa tecla. Cada 2 oleadas (2, 4, 6…) puedes elegir uno de 3 poderes al azar para reemplazar uno de los tuyos, o mantener los que tienes.

| Poder          | Efecto                                              | Enfriamiento |
|----------------|-----------------------------------------------------|--------------|
| Impulso        | Dash rápido en la dirección de movimiento, invulnerable | 2,5 s    |
| Escudo         | 3,5 s de burbuja que destruye a los enemigos que te tocan | 12 s   |
| Onda expansiva | Daña (4) y empuja a los enemigos cercanos           | 9 s          |
| Ráfaga         | 16 balas en todas las direcciones                   | 6 s          |
| Frenesí        | Triplica la cadencia de disparo durante 4 s         | 14 s         |
| Congelación    | Enemigos al 30 % de velocidad durante 4 s           | 15 s         |

Los enfriamientos se detienen mientras el juego está en pausa o eligiendo poder. Todos los valores se ajustan en `HABILIDADES` dentro de `src/config.js`.

- Juegas como un estudiante con mochila en una ciudad en ruinas (calles, autos quemados, sangre y edificios que hacen de muro en el borde).
- Tipos de zombie: **normal** (ropa rota, brazos estirados), **rápido** (flaco y pálido, poca vida), **tanque** (enorme, lento y resistente) y **escupidor** (inflado y verde, desde la oleada 3: se mantiene a distancia y te escupe ácido; el Escudo lo bloquea).
- Tienes 3 vidas y un breve tiempo de invulnerabilidad tras recibir daño.
- El récord se guarda en el navegador (`localStorage`).
- El sonido (generado con WebAudio) está desactivado por defecto; se activa desde el menú.

## Modo historia (estilo *roguelike*)

Cruza la ciudad infestada en 3 mundos y 10 niveles, solo o con hasta 3 amigos (el anfitrión elige **Historia** en la sala).

| Mundo | Niveles |
|-------|---------|
| 1 · Las afueras | Barrio residencial → Avenida principal → Plaza del centro (**minijefe: El Bruto**) |
| 2 · El centro | Distrito financiero → Hospital general → Zona industrial (**minijefe: El Bruto**) |
| 3 · La salida | Puerto → Autopista → Base militar → Puente de escape (**jefe final: La Abominación**) |

- **Mazmorras generadas al azar en cada partida**, al estilo Soul Knight: cada nivel es un conjunto de salas amplias unidas por calles, con un minimapa arriba a la derecha.
- **Se siente como cruzar la ciudad:** fuera de las salas no hay vacío, sino el escenario de cada zona (techos de edificios en llamas, casas y jardines, rascacielos, el techo del hospital con helipuerto, agua del puerto, bosque de la base militar). Las salas parecen calles y plazas con aceras y pasos de cebra, decoradas según la zona: autos chocados y quemados con fuego animado, barricadas y farolas en la ciudad; camas, camillas, sueros y sillas de ruedas en el hospital; contenedores y barriles en el puerto y la zona industrial; sacos, tiendas y jeeps en la base militar.
  - **Combate:** al entrar se cierran las puertas hasta acabar con las oleadas.
  - **Tesoro:** cofres para todos (uno por jugador, más uno).
  - **Tienda:** un vendedor con artículos que se pagan con **dedos de zombie**.
  - **Salida:** un portal; todo el equipo debe pararse en él para avanzar. En los niveles con jefe, el portal aparece al derrotarlo.
- **Armas:** llevas 2 (con munición infinita) y cambias cuando quieras. Hay 7: pistola, revólver, escopeta, subfusil, ametralladora, rifle (perforante) y lanzagranadas (daño en área). Las armas nuevas caen al suelo (de cofres o al cambiar) y se recogen con **F**; si tienes las dos ranuras llenas, sueltas la que tienes en la mano.
- **Dedos de zombie:** algunos zombies los sueltan al morir (los grandes y los jefes, más). Se recogen al pasar cerca y cada jugador tiene los suyos. En las tiendas compras armas, habilidades activas, pasivas y mejoras que aún no tienes.
- **Cofres:** cada tipo tiene su diseño: azul con rayo (**habilidad activa**, eliges en E, Q o C), caja militar verde (**arma**), madera con corazón (**pasiva**) y morado con flecha (**mejora**). Las armas, pasivas y mejoras caen al suelo y se recogen con **F**.
- **Límites:** 2 armas, **3 pasivas** y **3 mejoras**. Si recoges una mejora que ya tienes, **sube de nivel** (hasta V). Si estás al máximo, eliges cuál soltar y queda en el suelo (las mejoras conservan su nivel).
- **Pasivas con ventaja y desventaja:**

| Pasiva | Ventaja | Desventaja |
|--------|---------|------------|
| Vitalidad | +2 vidas máximas | −15 % velocidad |
| Agilidad | +25 % velocidad | −1 vida máxima |
| Vampiro | Cada 15 bajas recuperas 1 vida | −20 % de daño |
| Blindaje | +80 % invulnerabilidad tras un golpe | −15 % cadencia |
| Recarga rápida | −35 % enfriamiento de habilidades | Zombies 10 % más rápidos |
| Regeneración | +1 vida al despejar cada sala | −15 % de daño |
| Furia | +70 % de daño con 1 vida | −1 vida máxima |
| Codicia | Doble de dedos | Zombies con 20 % más vida |
| Cañón de cristal | +50 % de daño | −50 % invulnerabilidad |
| Gatillo loco | +40 % cadencia | Mucha menos precisión |
| Imán | Atraes los dedos desde lejos | −10 % velocidad |

- **Mejoras (niveles I a V):** Munición pesada (daño), Gatillo ligero (cadencia), Calibre perforante, Cañón múltiple (balas extra), Cañón largo (alcance) y Punto débil (golpes críticos x3).
- **Enemigos propios de cada zona**, además de los normales:

| Enemigo | Comportamiento | Zonas |
|---------|----------------|-------|
| Perro zombie | Muy rápido y errático, poca vida | Barrio, avenida, plaza, autopista |
| Policía antidisturbios | Su escudo frontal bloquea el 75 % del daño: flanquéalo | Avenida, centro, autopista |
| Chillona | Grita y acelera a los zombies cercanos | Plaza, centro, hospital |
| Hinchado | Explota al morir y daña a quien esté cerca | Hospital, industrial, autopista, puente |
| Obrero con casco | Recibe 40 % menos daño | Industrial, puerto, militar |
| Ahogado | Al morir se parte en 2 zombies rápidos | Puerto, puente |
| Soldado zombie | Dispara ráfagas de 3 balas desde lejos | Militar, puente |
- **Jefes:** embisten tras un aviso; la Abominación además lanza ácido e invoca zombies, y se enfurece con poca vida.
- **Muerte permanente:** el equipo se conserva de nivel en nivel, pero si caes (o cae todo el equipo) la partida se pierde y empiezas de nuevo desde el Barrio residencial. No se guarda progreso.

## Multijugador (hasta 4 jugadores)

Cooperativo: todos contra las mismas oleadas, con puntaje de equipo.

1. Un jugador pulsa **Multijugador → Crear partida** y recibe un código de 4 letras.
2. Los demás (hasta 3 más) pulsan **Multijugador**, escriben su nombre y el código, y pulsan **Unirse**.
3. El anfitrión pulsa **Empezar partida**.

- Funciona con WebRTC (PeerJS): los dispositivos se conectan directamente entre sí. Para encontrarse usan el servidor público gratuito de PeerJS, así que se necesita internet al conectar; en la misma WiFi el tráfico del juego va directo entre los dispositivos.
- El anfitrión ejecuta la partida: si cierra la pestaña o la deja en segundo plano, el juego se detiene para todos.
- Para reducir el retraso, cada jugador mueve y dispara a su personaje al instante en su propia pantalla (predicción local) y el anfitrión solo corrige cuando hace falta. Las posiciones viajan por un canal rápido sin orden y cada jugador recibe solo lo que está cerca de él.
- Si un jugador pierde todas sus vidas queda caído y revive con 1 vida al empezar la siguiente oleada. La partida termina cuando caen todos.
- En multijugador no hay pausa ni selector de poderes: al desbloquear Q (oleada 4) y C (oleada 8) cada jugador recibe una habilidad al azar.
- Al terminar, el anfitrión puede volver a la sala con los mismos jugadores.

## Pantalla completa

- El juego ocupa toda la pantalla: el ancho se adapta a la proporción del dispositivo (16:9, 20:9…) en lugar de dejar bandas negras.
- Botón **Pantalla completa** en el menú principal. En celulares Android se activa sola al primer toque y bloquea la orientación horizontal.
- En iPhone, Safari no permite pantalla completa en páginas web: usa **Compartir → Agregar a pantalla de inicio** y abre el juego desde ese ícono (se abre sin barras del navegador).

## Minijuego: Pac-Man

Desde el menú principal, el botón **Minijuego: Pac-Man** abre un Pac-Man completo: laberinto con 150 puntos y 4 súper puntos, túnel lateral, y 4 fantasmas con su comportamiento clásico (Blinky te persigue, Pinky se adelanta, Inky flanquea y Clyde huye si se acerca), alternando entre dispersión y persecución. Al comer un súper punto los fantasmas se vuelven azules y valen 200, 400, 800 y 1600 puntos; sus ojos regresan a la casa para revivir.

- Controles: flechas o WASD en PC (P pausa, Esc vuelve al menú); en celular, desliza el dedo.
- 3 vidas, niveles cada vez más rápidos y récord propio guardado aparte.
- Los valores (velocidades, tiempos, puntos y el laberinto) están en `PACMAN` dentro de `src/config.js`.

## Requisitos

- Node.js **20.19+** o **22.12+**

## Ejecutar en desarrollo

```bash
npm install
npm run dev
```

Abre la URL que muestra la terminal (normalmente `http://localhost:5173`). Para probar en el celular dentro de la misma red Wi‑Fi:

```bash
npm run dev -- --host
```

y abre en el teléfono la dirección "Network" que aparece.

## Compilar

```bash
npm run build
```

Genera la carpeta `dist/` lista para publicar. Para revisarla localmente:

```bash
npm run preview
```

## Publicar en itch.io

1. Ejecuta `npm run build`.
2. Comprime el **contenido** de `dist/` (no la carpeta en sí) en un `.zip`, de modo que `index.html` quede en la raíz del zip:
   - Windows (PowerShell):
     ```powershell
     Compress-Archive -Path dist\* -DestinationPath shooter-2d.zip -Force
     ```
   - macOS / Linux:
     ```bash
     cd dist && zip -r ../shooter-2d.zip . && cd ..
     ```
3. En itch.io: **Upload new project** → *Kind of project*: **HTML**.
4. Sube `shooter-2d.zip` y marca **"This file will be played in the browser"**.
5. En *Embed options* usa un tamaño de **800 × 600** (o activa *Automatically start on page load* y el botón de pantalla completa) y guarda.

## Publicar en GitHub Pages

El repositorio incluye el workflow `.github/workflows/deploy.yml`, que compila y despliega `dist/` automáticamente en cada push a `main`.

1. Crea un repositorio en GitHub y sube el proyecto:
   ```bash
   git remote add origin https://github.com/<usuario>/<repositorio>.git
   git push -u origin main
   ```
2. En GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Ve a la pestaña **Actions** y espera a que termine "Desplegar en GitHub Pages" (si el primer run falló porque Pages aún no estaba activado, pulsa *Re-run jobs*).
4. El juego quedará en `https://<usuario>.github.io/<repositorio>/`.

Como `vite.config.js` usa `base: './'`, el build funciona en cualquier ruta sin cambios.

## Estructura

```
├── index.html
├── vite.config.js
├── .github/workflows/deploy.yml
└── src/
    ├── main.js              Configuración de Phaser
    ├── config.js            Valores de balance (velocidades, vida, cadencia, oleadas…)
    ├── scenes/              Boot (genera texturas), Menu, Game, GameOver, Pacman, Lobby, Cliente
    ├── entities/            Player, Enemy, Bullet
    └── systems/             WaveManager, TouchControls, Storage, Sonido, Interfaz, Dibujos, Red, Protocolo,
                             Mapas, Recompensas, SelectorRecompensa, Mazmorra, Historia, VistaHistoria,
                             HudArmas, Minimapa, BotonesAccion,
                             Habilidades, BotonesHabilidad, SelectorHabilidades
```

Para ajustar la dificultad, edita `src/config.js`.

## Rendimiento

- Balas (90) y enemigos (120) se reutilizan desde pools creados al inicio; no se crean ni destruyen objetos durante la partida.
- Fondo prerenderizado en una textura; el HUD solo se actualiza cuando cambian los valores.
- Partículas limitadas (máx. 120 vivas, 280 ms de vida).
- Prueba de estrés: con 100 enemigos en pantalla, disparo continuo y CPU limitada 6× en Chrome, el juego se mantuvo a 60 FPS con ~4 ms de CPU por frame.
