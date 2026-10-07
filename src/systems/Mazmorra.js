import Phaser from 'phaser';
import { MAZMORRA, TIENDA } from '../config.js';
import { dibujarTileset, DECORACIONES } from './Dibujos.js';

export const TILE = { vacio: 0, suelo: 1, sueloSangre: 2, sueloGrieta: 3, pared: 4, puerta: 5, pasillo: 6 };
export const SOLIDOS = [TILE.vacio, TILE.pared, TILE.puerta];
const DIRECCIONES = [[1, 0], [-1, 0], [0, 1], [0, -1]];

function clave(c, f) {
  return c + ',' + f;
}

function caminoAleatorio(rng, largo) {
  const { columnas, filas } = MAZMORRA;
  for (let intento = 0; intento < 200; intento++) {
    const camino = [{ c: rng.between(0, columnas - 1), f: rng.between(0, filas - 1) }];
    const usadas = new Set([clave(camino[0].c, camino[0].f)]);
    while (camino.length < largo) {
      const ultima = camino[camino.length - 1];
      const opciones = DIRECCIONES
        .map(([dc, df]) => ({ c: ultima.c + dc, f: ultima.f + df }))
        .filter((celda) => celda.c >= 0 && celda.f >= 0 && celda.c < columnas && celda.f < filas && !usadas.has(clave(celda.c, celda.f)));
      if (opciones.length === 0) break;
      const siguiente = rng.pick(opciones);
      camino.push(siguiente);
      usadas.add(clave(siguiente.c, siguiente.f));
    }
    if (camino.length === largo) return camino;
  }
  return null;
}

export function generarMazmorra(semilla, nivel) {
  const rng = new Phaser.Math.RandomDataGenerator(['mazmorra-' + semilla]);
  const { columnas, filas, celda } = MAZMORRA;
  const ancho = columnas * celda;
  const alto = filas * celda;
  const datos = Array.from({ length: alto }, () => new Array(ancho).fill(TILE.vacio));

  const combates = MAZMORRA.combatesBase + nivel.mundo - 1;
  const camino = caminoAleatorio(rng, combates + 2);
  const tipos = ['inicio'];
  for (let i = 0; i < combates; i++) tipos.push('combate');
  tipos.push(nivel.jefe ? 'jefe' : 'salida');

  const salas = camino.map((celdaCamino, i) => ({ id: i, tipo: tipos[i], c: celdaCamino.c, f: celdaCamino.f, padre: i > 0 ? i - 1 : -1 }));
  const ocupadas = new Set(salas.map((sala) => clave(sala.c, sala.f)));

  const extras = ['tesoro'];
  if (nivel.jefe || rng.frac() < TIENDA.probabilidad) extras.push('tienda');
  if (nivel.mundo >= 2) extras.push('combate');
  extras.forEach((tipo) => {
    const candidatas = [];
    salas.forEach((sala) => {
      if (sala.tipo === 'jefe' || sala.tipo === 'salida') return;
      DIRECCIONES.forEach(([dc, df]) => {
        const c = sala.c + dc;
        const f = sala.f + df;
        if (c < 0 || f < 0 || c >= columnas || f >= filas || ocupadas.has(clave(c, f))) return;
        candidatas.push({ c, f, padre: sala.id });
      });
    });
    if (candidatas.length === 0) return;
    const elegida = rng.pick(candidatas);
    ocupadas.add(clave(elegida.c, elegida.f));
    salas.push({ id: salas.length, tipo, c: elegida.c, f: elegida.f, padre: elegida.padre });
  });

  salas.forEach((sala) => {
    const grande = sala.tipo === 'jefe';
    const w = grande ? MAZMORRA.salaMax.ancho : rng.between(MAZMORRA.salaMin.ancho, MAZMORRA.salaMax.ancho);
    const h = grande ? MAZMORRA.salaMax.alto : rng.between(MAZMORRA.salaMin.alto, MAZMORRA.salaMax.alto);
    sala.x = sala.c * celda + Math.floor((celda - w) / 2);
    sala.y = sala.f * celda + Math.floor((celda - h) / 2);
    sala.w = w;
    sala.h = h;
    sala.puertas = [];
    sala.conexiones = [];
    for (let y = sala.y; y < sala.y + h; y++) {
      for (let x = sala.x; x < sala.x + w; x++) {
        const borde = x === sala.x || y === sala.y || x === sala.x + w - 1 || y === sala.y + h - 1;
        if (borde) datos[y][x] = TILE.pared;
        else {
          const azar = rng.frac();
          datos[y][x] = azar < 0.06 ? TILE.sueloSangre : azar < 0.12 ? TILE.sueloGrieta : TILE.suelo;
        }
      }
    }
  });

  const mitadPasillo = Math.floor(MAZMORRA.anchoPasillo / 2);
  salas.forEach((sala) => {
    if (sala.padre < 0) return;
    const padre = salas[sala.padre];
    sala.conexiones.push(padre.id);
    padre.conexiones.push(sala.id);
    const [a, b] = padre.c < sala.c || padre.f < sala.f ? [padre, sala] : [sala, padre];
    if (a.f === b.f) {
      const yc = a.f * celda + Math.floor(celda / 2);
      const desde = a.x + a.w - 1;
      const hasta = b.x;
      for (let x = desde; x <= hasta; x++) {
        for (let d = -mitadPasillo - 1; d <= mitadPasillo + 1; d++) {
          const y = yc + d;
          const lateral = Math.abs(d) === mitadPasillo + 1;
          if (lateral) {
            if (datos[y][x] === TILE.vacio) datos[y][x] = TILE.pared;
          } else {
            datos[y][x] = TILE.pasillo;
          }
        }
      }
      for (let d = -mitadPasillo; d <= mitadPasillo; d++) {
        a.puertas.push({ x: desde, y: yc + d });
        b.puertas.push({ x: hasta, y: yc + d });
      }
    } else {
      const xc = a.c * celda + Math.floor(celda / 2);
      const desde = a.y + a.h - 1;
      const hasta = b.y;
      for (let y = desde; y <= hasta; y++) {
        for (let d = -mitadPasillo - 1; d <= mitadPasillo + 1; d++) {
          const x = xc + d;
          const lateral = Math.abs(d) === mitadPasillo + 1;
          if (lateral) {
            if (datos[y][x] === TILE.vacio) datos[y][x] = TILE.pared;
          } else {
            datos[y][x] = TILE.pasillo;
          }
        }
      }
      for (let d = -mitadPasillo; d <= mitadPasillo; d++) {
        a.puertas.push({ x: xc + d, y: desde });
        b.puertas.push({ x: xc + d, y: hasta });
      }
    }
  });

  const t = MAZMORRA.tile;
  salas.forEach((sala) => {
    sala.decoraciones = [];
    if (sala.tipo === 'tienda' || sala.tipo === 'jefe') return;
    for (let i = 0; i < MAZMORRA.decoracionPorSala; i++) {
      sala.decoraciones.push({
        tipo: rng.pick(DECORACIONES),
        x: (sala.x + rng.between(2, sala.w - 3)) * t + t / 2,
        y: (sala.y + rng.between(2, sala.h - 3)) * t + t / 2,
        angulo: rng.pick([0, 90, 180, 270])
      });
    }
  });

  return { ancho, alto, datos, salas, inicio: 0 };
}

export function rectanguloSala(sala, margenTiles = 1) {
  const t = MAZMORRA.tile;
  return new Phaser.Geom.Rectangle(
    (sala.x + margenTiles) * t,
    (sala.y + margenTiles) * t,
    (sala.w - margenTiles * 2) * t,
    (sala.h - margenTiles * 2) * t
  );
}

export function centroSala(sala) {
  const t = MAZMORRA.tile;
  return { x: (sala.x + sala.w / 2) * t, y: (sala.y + sala.h / 2) * t };
}

export function crearMapaMazmorra(scene, mazmorra, tema) {
  const claveTiles = 'tiles-' + tema;
  const t = MAZMORRA.tile;
  if (!scene.textures.exists(claveTiles)) {
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    dibujarTileset(g, tema);
    g.generateTexture(claveTiles, t * 7, t);
    g.destroy();
  }
  const mapa = scene.make.tilemap({ data: mazmorra.datos.map((fila) => fila.slice()), tileWidth: t, tileHeight: t });
  const tileset = mapa.addTilesetImage(claveTiles, claveTiles, t, t, 0, 0);
  const capa = mapa.createLayer(0, tileset, 0, 0);
  capa.setCollision(SOLIDOS);
  capa.setDepth(0);

  mazmorra.salas.forEach((sala) => {
    sala.decoraciones.forEach((deco) => {
      scene.add.image(deco.x, deco.y, 'deco-' + deco.tipo).setAngle(deco.angulo).setDepth(1);
    });
  });
  return { mapa, capa };
}

export function fijarPuertas(capa, sala, cerradas) {
  const indice = cerradas ? TILE.puerta : TILE.pasillo;
  sala.puertas.forEach((puerta) => capa.putTileAt(indice, puerta.x, puerta.y));
}

export function salaEn(mazmorra, x, y) {
  const t = MAZMORRA.tile;
  const tx = Math.floor(x / t);
  const ty = Math.floor(y / t);
  return mazmorra.salas.find((sala) => tx > sala.x && ty > sala.y && tx < sala.x + sala.w - 1 && ty < sala.y + sala.h - 1) || null;
}
