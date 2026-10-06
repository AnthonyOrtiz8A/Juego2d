# Shooter 2D

Shooter top-down de arena con oleadas infinitas, hecho con **Phaser 3** y **Vite**. Pensado para correr fluido en PCs y celulares de bajos recursos: todos los gráficos se generan por código, no hay imágenes ni audio externos y el build pesa ~1.2 MB.

## Cómo se juega

| Acción   | Teclado y mouse               | Pantalla táctil                                    |
|----------|-------------------------------|----------------------------------------------------|
| Mover    | WASD o flechas                | Joystick (mitad izquierda de la pantalla)          |
| Apuntar  | Mouse                         | Automático al enemigo más cercano                  |
| Disparar | Clic izquierdo (mantener) o Espacio | Mantener pulsada la mitad derecha            |
| Pausa    | P o Esc                       | Botón **II** (arriba a la derecha)                 |

- Tipos de enemigo: **normal** (rojo), **rápido** (naranja, poca vida) y **tanque** (morado, lento y resistente).
- Tienes 3 vidas y un breve tiempo de invulnerabilidad tras recibir daño.
- El récord se guarda en el navegador (`localStorage`).
- El sonido (generado con WebAudio) está desactivado por defecto; se activa desde el menú.

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
    ├── scenes/              Boot (genera texturas), Menu, Game, GameOver
    ├── entities/            Player, Enemy, Bullet
    └── systems/             WaveManager, TouchControls, Storage, Sonido, Interfaz
```

Para ajustar la dificultad, edita `src/config.js`.

## Rendimiento

- Balas (60) y enemigos (120) se reutilizan desde pools creados al inicio; no se crean ni destruyen objetos durante la partida.
- Fondo prerenderizado en una textura; el HUD solo se actualiza cuando cambian los valores.
- Partículas limitadas (máx. 120 vivas, 280 ms de vida).
- Prueba de estrés: con 100 enemigos en pantalla, disparo continuo y CPU limitada 6× en Chrome, el juego se mantuvo a 60 FPS con ~4 ms de CPU por frame.
