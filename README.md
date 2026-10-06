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
| Habilidad 3 | R (desde la oleada 8)      | Botón **R** (arriba a la izquierda del disparo)    |

En PC no se muestran botones en pantalla: los enfriamientos aparecen como texto bajo las vidas. El mapa mide 1600 × 1200 y la cámara sigue al jugador.

### Habilidades

Empiezas con **Impulso** en la tecla E. Al terminar la oleada 3 se desbloquea la tecla Q y al terminar la 7 la tecla R; en cada caso eliges la habilidad para esa tecla. Cada 2 oleadas (2, 4, 6…) puedes elegir uno de 3 poderes al azar para reemplazar uno de los tuyos, o mantener los que tienes.

| Poder          | Efecto                                              | Enfriamiento |
|----------------|-----------------------------------------------------|--------------|
| Impulso        | Dash rápido en la dirección de movimiento, invulnerable | 2,5 s    |
| Escudo         | 3,5 s de burbuja que destruye a los enemigos que te tocan | 12 s   |
| Onda expansiva | Daña (4) y empuja a los enemigos cercanos           | 9 s          |
| Ráfaga         | 16 balas en todas las direcciones                   | 6 s          |
| Frenesí        | Triplica la cadencia de disparo durante 4 s         | 14 s         |
| Congelación    | Enemigos al 30 % de velocidad durante 4 s           | 15 s         |

Los enfriamientos se detienen mientras el juego está en pausa o eligiendo poder. Todos los valores se ajustan en `HABILIDADES` dentro de `src/config.js`.

- Tipos de enemigo: **normal** (rojo), **rápido** (naranja, poca vida), **tanque** (morado, lento y resistente) y **tirador** (verde, desde la oleada 3: se mantiene a distancia y te dispara; el Escudo bloquea sus balas).
- Tienes 3 vidas y un breve tiempo de invulnerabilidad tras recibir daño.
- El récord se guarda en el navegador (`localStorage`).
- El sonido (generado con WebAudio) está desactivado por defecto; se activa desde el menú.

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
    ├── scenes/              Boot (genera texturas), Menu, Game, GameOver, Pacman
    ├── entities/            Player, Enemy, Bullet
    └── systems/             WaveManager, TouchControls, Storage, Sonido, Interfaz,
                             Habilidades, BotonesHabilidad, SelectorHabilidades
```

Para ajustar la dificultad, edita `src/config.js`.

## Rendimiento

- Balas (90) y enemigos (120) se reutilizan desde pools creados al inicio; no se crean ni destruyen objetos durante la partida.
- Fondo prerenderizado en una textura; el HUD solo se actualiza cuando cambian los valores.
- Partículas limitadas (máx. 120 vivas, 280 ms de vida).
- Prueba de estrés: con 100 enemigos en pantalla, disparo continuo y CPU limitada 6× en Chrome, el juego se mantuvo a 60 FPS con ~4 ms de CPU por frame.
