import Phaser from 'phaser';
import { MAZMORRA, TIENDA } from '../config.js';
import { dibujarTileset, TAMANO_DECORACION } from './Dibujos.js';

export const TILE = {
  exterior: 0,
  suelo: 1,
  sueloSangre: 2,
  sueloGrieta: 3,
  pared: 4,
  puerta: 5,
  pasilloH: 6,
  pasilloV: 7,
  acera: 8,
  exteriorB: 9,
  exteriorC: 10,
  sueloDetalle: 11,
  cebraH: 12,
  cebraV: 13
};
export const CANTIDAD_TILES = 14;
export const SOLIDOS = [TILE.exterior, TILE.exteriorB, TILE.exteriorC, TILE.pared, TILE.puerta];

export const ESCENARIOS = {
  suburbio: { sala: ['auto', 'arbol', 'arbusto', 'bolsas', 'sangre', 'escombros', 'cono'], exterior: ['arbol', 'arbol', 'arbusto', 'aire'], quemados: 0.25 },
  avenida: { sala: ['auto', 'auto', 'autoQuemado', 'barricada', 'bolsas', 'farola', 'sangre', 'escombros', 'cono'], exterior: ['aire', 'tragaluz', 'aire'], quemados: 0.45 },
  plaza: { sala: ['banca', 'arbol', 'farola', 'autoQuemado', 'sangre', 'escombros', 'bolsas'], exterior: ['aire', 'tragaluz', 'arbol'], quemados: 0.5 },
  centro: { sala: ['auto', 'auto', 'autoQuemado', 'barricada', 'farola', 'sangre', 'escombros', 'cono', 'bolsas'], exterior: ['aire', 'tragaluz', 'helipuerto'], quemados: 0.55 },
  hospital: { sala: ['cama', 'camilla', 'portasuero', 'sillaRuedas', 'carrito', 'sangre', 'cama', 'escombros'], exterior: ['aire', 'helipuerto', 'tragaluz'], quemados: 0.15 },
  industrial: { sala: ['caja', 'barril', 'contenedor', 'sangre', 'escombros', 'barril'], exterior: ['aire', 'tragaluz'], quemados: 0.35 },
  puerto: { sala: ['contenedor', 'caja', 'barril', 'sangre', 'contenedor'], exterior: [], quemados: 0.3 },
  autopista: { sala: ['auto', 'autoQuemado', 'barreraJersey', 'cono', 'escombros', 'sangre', 'auto'], exterior: ['arbusto', 'arbol'], quemados: 0.6 },
  militar: { sala: ['sacos', 'tienda', 'cajaMunicion', 'jeep', 'sangre', 'sacos'], exterior: ['arbol', 'arbol', 'arbusto'], quemados: 0.35 },
  puente: { sala: ['auto', 'autoQuemado', 'barreraJersey', 'escombros', 'sangre', 'autoQuemado'], exterior: [], quemados: 0.7 }
};

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

function tallarSala(datos, sala, rng) {
  for (let y = sala.y; y < sala.y + sala.h; y++) {
    for (let x = sala.x; x < sala.x + sala.w; x++) {
      const borde = x === sala.x || y === sala.y || x === sala.x + sala.w - 1 || y === sala.y + sala.h - 1;
      const anillo = x === sala.x + 1 || y === sala.y + 1 || x === sala.x + sala.w - 2 || y === sala.y + sala.h - 2;
      if (borde) datos[y][x] = TILE.pared;
      else if (anillo) datos[y][x] = TILE.acera;
      else {
        const azar = rng.frac();
        datos[y][x] = azar < 0.025 ? TILE.sueloSangre : azar < 0.06 ? TILE.sueloGrieta : azar < 0.068 ? TILE.sueloDetalle : TILE.suelo;
      }
    }
  }
}

function tallarPasillo(datos, a, b) {
  const { celda } = MAZMORRA;
  const mitad = Math.floor(MAZMORRA.anchoPasillo / 2);
  const horizontal = a.f === b.f;
  const centro = horizontal ? a.f * celda + Math.floor(celda / 2) : a.c * celda + Math.floor(celda / 2);
  const desde = horizontal ? a.x + a.w - 1 : a.y + a.h - 1;
  const hasta = horizontal ? b.x : b.y;
  const piso = horizontal ? TILE.pasilloH : TILE.pasilloV;
  const cebra = horizontal ? TILE.cebraV : TILE.cebraH;
  const fijar = (largo, ancho, valor) => {
    const x = horizontal ? largo : ancho;
    const y = horizontal ? ancho : largo;
    datos[y][x] = valor;
  };
  const leer = (largo, ancho) => (horizontal ? datos[ancho][largo] : datos[largo][ancho]);
  for (let largo = desde; largo <= hasta; largo++) {
    for (let d = -mitad - 1; d <= mitad + 1; d++) {
      const ancho = centro + d;
      if (Math.abs(d) === mitad + 1) {
        if (SOLIDOS.includes(leer(largo, ancho)) && leer(largo, ancho) !== TILE.pared) fijar(largo, ancho, TILE.pared);
      } else {
        fijar(largo, ancho, largo === desde || largo === hasta ? cebra : piso);
      }
    }
  }
  for (let d = -mitad; d <= mitad; d++) {
    const puertaA = horizontal ? { x: desde, y: centro + d } : { x: centro + d, y: desde };
    const puertaB = horizontal ? { x: hasta, y: centro + d } : { x: centro + d, y: hasta };
    a.puertas.push({ ...puertaA, abierta: cebra });
    b.puertas.push({ ...puertaB, abierta: cebra });
  }
}

function decorar(mazmorra, rng, tema) {
  const escenario = ESCENARIOS[tema] || ESCENARIOS.avenida;
  const t = MAZMORRA.tile;
  const { datos, salas } = mazmorra;
  salas.forEach((sala) => {
    sala.decoraciones = [];
    sala.fuegos = [];
    if (sala.tipo === 'tienda' || sala.tipo === 'jefe' || sala.tipo === 'inicio') return;
    const cantidad = Math.round((sala.w - 4) * (sala.h - 4) * MAZMORRA.decoracionPorTile);
    for (let i = 0; i < cantidad; i++) {
      let tipo = rng.pick(escenario.sala);
      if (tipo === 'auto' && rng.frac() < escenario.quemados) tipo = 'autoQuemado';
      const x = (sala.x + rng.between(3, sala.w - 4)) * t + t / 2;
      const y = (sala.y + rng.between(3, sala.h - 4)) * t + t / 2;
      sala.decoraciones.push({ tipo, x, y, angulo: rng.between(0, 3) * 90 + rng.between(-12, 12) });
      if (tipo === 'autoQuemado' && sala.fuegos.length < MAZMORRA.fuegosPorSala) sala.fuegos.push({ x, y, escala: rng.realInRange(0.8, 1.2) });
    }
  });

  mazmorra.exteriores = [];
  mazmorra.fuegosExteriores = [];
  const cercaDeJuego = (x, y) => {
    for (let dy = -4; dy <= 4; dy += 2) {
      for (let dx = -4; dx <= 4; dx += 2) {
        const fila = datos[y + dy];
        if (fila && fila[x + dx] !== undefined && !SOLIDOS.includes(fila[x + dx])) return true;
      }
    }
    return false;
  };
  const exteriores = [];
  for (let y = 1; y < mazmorra.alto - 1; y++) {
    for (let x = 1; x < mazmorra.ancho - 1; x++) {
      if ([TILE.exterior, TILE.exteriorB, TILE.exteriorC].includes(datos[y][x]) && cercaDeJuego(x, y)) exteriores.push({ x, y });
    }
  }
  const cantidadExterior = Math.round(exteriores.length * MAZMORRA.decoracionExterior);
  for (let i = 0; i < cantidadExterior && escenario.exterior.length > 0; i++) {
    const celda = rng.pick(exteriores);
    mazmorra.exteriores.push({ tipo: rng.pick(escenario.exterior), x: celda.x * t + t / 2, y: celda.y * t + t / 2, angulo: rng.between(0, 3) * 90 });
  }
  if (escenario.quemados > 0.2) {
    for (let i = 0; i < MAZMORRA.fuegosExterior && exteriores.length > 0; i++) {
      const celda = rng.pick(exteriores);
      mazmorra.fuegosExteriores.push({ x: celda.x * t + t / 2, y: celda.y * t + t / 2, escala: rng.realInRange(1, 1.8) });
    }
  }
}

export function generarMazmorra(semilla, nivel) {
  const rng = new Phaser.Math.RandomDataGenerator(['mazmorra-' + semilla]);
  const { columnas, filas, celda } = MAZMORRA;
  const ancho = columnas * celda;
  const alto = filas * celda;
  const datos = Array.from({ length: alto }, () => new Array(ancho).fill(TILE.exterior));
  for (let y = 0; y < alto; y++) {
    for (let x = 0; x < ancho; x++) {
      const azar = rng.frac();
      if (azar < 0.12) datos[y][x] = TILE.exteriorC;
      else if (azar < 0.4) datos[y][x] = TILE.exteriorB;
    }
  }

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
    sala.w = grande ? MAZMORRA.salaMax.ancho : rng.between(MAZMORRA.salaMin.ancho, MAZMORRA.salaMax.ancho);
    sala.h = grande ? MAZMORRA.salaMax.alto : rng.between(MAZMORRA.salaMin.alto, MAZMORRA.salaMax.alto);
    sala.x = sala.c * celda + Math.floor((celda - sala.w) / 2);
    sala.y = sala.f * celda + Math.floor((celda - sala.h) / 2);
    sala.puertas = [];
    sala.conexiones = [];
    tallarSala(datos, sala, rng);
  });

  salas.forEach((sala) => {
    if (sala.padre < 0) return;
    const padre = salas[sala.padre];
    sala.conexiones.push(padre.id);
    padre.conexiones.push(sala.id);
    const [a, b] = padre.c < sala.c || padre.f < sala.f ? [padre, sala] : [sala, padre];
    tallarPasillo(datos, a, b);
  });

  const mazmorra = { ancho, alto, datos, salas, inicio: 0 };
  decorar(mazmorra, rng, nivel.tema);
  return mazmorra;
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

function crearFuego(scene, fuego) {
  const brillo = scene.add.image(fuego.x, fuego.y, 'brillo').setDepth(2).setBlendMode(Phaser.BlendModes.ADD).setScale(fuego.escala * 1.4).setAlpha(0.55);
  const llama = scene.add.image(fuego.x, fuego.y - 6, 'fuego').setDepth(7).setScale(fuego.escala);
  const duracion = 180 + Math.floor((fuego.x * 7 + fuego.y * 3) % 160);
  scene.tweens.add({ targets: llama, scaleX: fuego.escala * 0.85, scaleY: fuego.escala * 1.15, alpha: 0.8, duration: duracion, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
  scene.tweens.add({ targets: brillo, alpha: 0.35, duration: duracion * 1.7, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
}

function crearDecoracion(scene, deco, profundidad) {
  const tamano = TAMANO_DECORACION[deco.tipo];
  if (!tamano) return;
  scene.add.image(deco.x, deco.y, 'deco-' + deco.tipo).setAngle(deco.angulo).setDepth(profundidad);
}

function crearAmbiente(scene) {
  const clave = 'vineta';
  const { width, height } = scene.scale;
  if (!scene.textures.exists(clave)) {
    const lienzo = scene.textures.createCanvas(clave, width, height);
    const ctx = lienzo.getContext();
    const gradiente = ctx.createRadialGradient(width / 2, height / 2, height * 0.35, width / 2, height / 2, Math.max(width, height) * 0.75);
    gradiente.addColorStop(0, 'rgba(0,0,0,0)');
    gradiente.addColorStop(1, 'rgba(10,4,0,0.75)');
    ctx.fillStyle = gradiente;
    ctx.fillRect(0, 0, width, height);
    lienzo.refresh();
  }
  scene.add.image(0, 0, clave).setOrigin(0).setScrollFactor(0).setDepth(25);
}

export function crearMapaMazmorra(scene, mazmorra, tema) {
  const claveTiles = 'tiles-' + tema;
  const t = MAZMORRA.tile;
  if (!scene.textures.exists(claveTiles)) {
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    dibujarTileset(g, tema);
    g.generateTexture(claveTiles, t * CANTIDAD_TILES, t);
    g.destroy();
  }
  const mapa = scene.make.tilemap({ data: mazmorra.datos.map((fila) => fila.slice()), tileWidth: t, tileHeight: t });
  const tileset = mapa.addTilesetImage(claveTiles, claveTiles, t, t, 0, 0);
  const capa = mapa.createLayer(0, tileset, 0, 0);
  capa.setCollision(SOLIDOS);
  capa.setDepth(0);

  mazmorra.exteriores.forEach((deco) => crearDecoracion(scene, deco, 1));
  mazmorra.salas.forEach((sala) => {
    sala.decoraciones.forEach((deco) => crearDecoracion(scene, deco, 1));
    sala.fuegos.forEach((fuego) => crearFuego(scene, fuego));
  });
  mazmorra.fuegosExteriores.forEach((fuego) => crearFuego(scene, fuego));
  crearAmbiente(scene);
  return { mapa, capa };
}

export function fijarPuertas(capa, sala, cerradas) {
  sala.puertas.forEach((puerta) => capa.putTileAt(cerradas ? TILE.puerta : puerta.abierta, puerta.x, puerta.y));
}

export function salaEn(mazmorra, x, y) {
  const t = MAZMORRA.tile;
  const tx = Math.floor(x / t);
  const ty = Math.floor(y / t);
  return mazmorra.salas.find((sala) => tx > sala.x && ty > sala.y && tx < sala.x + sala.w - 1 && ty < sala.y + sala.h - 1) || null;
}
