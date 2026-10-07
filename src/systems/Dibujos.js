import Phaser from 'phaser';

const SANGRE = 0x6b0f0f;
const OJO_ZOMBIE = 0xff3b2f;

export const ESTUDIANTE = {
  tamano: 46,
  piel: 0xf1c27d,
  pelo: 0x3b2416,
  sudadera: 0x2f6fd6,
  sudaderaSombra: 0x245bb3,
  mochila: 0xc0392b,
  mochilaSombra: 0x922b21,
  arma: 0x222222,
  armaDetalle: 0x5a5a5a
};

export const ZOMBIES = {
  normal: {
    tamano: 46, hombros: 13, profundidad: 14, cabeza: 7, alcance: 18, grosorBrazo: 4.5,
    piel: 0x7fa36b, pielOscura: 0x5a7a4a, ropa: 0x5b5040, ropaOscura: 0x40382c
  },
  rapido: {
    tamano: 38, hombros: 9, profundidad: 9, cabeza: 5.5, alcance: 15, grosorBrazo: 3,
    piel: 0xa8bf96, pielOscura: 0x7d9370, ropa: 0x6d2a2a, ropaOscura: 0x4a1b1b
  },
  tanque: {
    tamano: 72, hombros: 23, profundidad: 24, cabeza: 9, alcance: 26, grosorBrazo: 9,
    piel: 0x5e7a45, pielOscura: 0x435a31, ropa: 0x3d4f6b, ropaOscura: 0x2b3a50, torsoDesnudo: true
  },
  tirador: {
    tamano: 42, hombros: 12, profundidad: 18, cabeza: 7, alcance: 6, grosorBrazo: 3.5,
    piel: 0xa6c94a, pielOscura: 0x7d9a33, ropa: 0x8a8f3a, ropaOscura: 0x5f6427, escupidor: true
  },
  minijefe: {
    tamano: 100, hombros: 31, profundidad: 32, cabeza: 12, alcance: 36, grosorBrazo: 12,
    piel: 0x6d5a3f, pielOscura: 0x4e3f2b, ropa: 0x2b2b2b, ropaOscura: 0x1c1c1c, torsoDesnudo: true, jefe: 1
  },
  jefe: {
    tamano: 150, hombros: 47, profundidad: 50, cabeza: 16, alcance: 52, grosorBrazo: 17,
    piel: 0x6b4a6e, pielOscura: 0x4a3150, ropa: 0x1e1420, ropaOscura: 0x120b14, torsoDesnudo: true, escupidor: true, jefe: 2
  }
};

export function dibujarEstudiante(g) {
  const e = ESTUDIANTE;
  const c = e.tamano / 2;

  g.fillStyle(0x000000, 0.3);
  g.fillEllipse(c + 2, c + 3, 24, 32);

  g.fillStyle(e.mochila, 1);
  g.fillRoundedRect(c - 15, c - 9, 10, 18, 3);
  g.fillStyle(e.mochilaSombra, 1);
  g.fillRoundedRect(c - 14, c - 6, 5, 12, 2);

  g.lineStyle(5, e.sudadera, 1);
  g.lineBetween(c, c - 10, c + 7, c - 8);
  g.lineBetween(c, c + 10, c + 7, c + 8);
  g.lineStyle(4, e.piel, 1);
  g.lineBetween(c + 6, c - 8, c + 14, c - 2);
  g.lineBetween(c + 6, c + 8, c + 14, c + 2);

  g.fillStyle(e.arma, 1);
  g.fillRect(c + 12, c - 2.5, 11, 5);
  g.fillStyle(e.armaDetalle, 1);
  g.fillRect(c + 12, c - 2.5, 4, 5);

  g.fillStyle(e.sudadera, 1);
  g.fillEllipse(c, c, 15, 27);
  g.fillStyle(e.sudaderaSombra, 1);
  g.fillEllipse(c - 3, c, 7, 18);
  g.lineStyle(1.5, e.mochilaSombra, 1);
  g.lineBetween(c - 5, c - 8, c + 3, c - 10);
  g.lineBetween(c - 5, c + 8, c + 3, c + 10);

  g.fillStyle(e.pelo, 1);
  g.fillCircle(c, c, 7.5);
  g.fillStyle(e.piel, 1);
  g.fillEllipse(c + 4.5, c, 5, 9);
  g.fillStyle(e.pelo, 1);
  g.fillTriangle(c + 2, c - 6, c + 6, c - 3, c + 1, c - 1);
}

export function dibujarZombie(g, tipo) {
  const z = ZOMBIES[tipo];
  const c = z.tamano / 2;
  const h = z.hombros;

  g.fillStyle(0x000000, 0.3);
  g.fillEllipse(c + 2, c + 3, z.profundidad + 8, h * 2 + 6);

  g.lineStyle(z.grosorBrazo, z.piel, 1);
  const manoA = { x: c + z.alcance, y: c - h * 0.45 };
  const manoB = { x: c + z.alcance * 0.82, y: c + h * 0.55 };
  g.lineBetween(c, c - h * 0.75, manoA.x, manoA.y);
  g.lineBetween(c, c + h * 0.75, manoB.x, manoB.y);
  g.fillStyle(z.pielOscura, 1);
  g.fillCircle(manoA.x, manoA.y, z.grosorBrazo * 0.75);
  g.fillCircle(manoB.x, manoB.y, z.grosorBrazo * 0.75);

  if (z.torsoDesnudo) {
    g.fillStyle(z.piel, 1);
    g.fillEllipse(c, c, z.profundidad, h * 2);
    g.fillStyle(z.pielOscura, 1);
    g.fillEllipse(c - 3, c - h * 0.4, z.profundidad * 0.35, h * 0.5);
    g.fillEllipse(c - 1, c + h * 0.45, z.profundidad * 0.3, h * 0.45);
    g.lineStyle(1.5, 0x2a1a12, 1);
    g.lineBetween(c - 6, c - 4, c + 4, c - 9);
    for (let i = 0; i < 4; i++) g.lineBetween(c - 4 + i * 2.5, c - 4 - i * 1.3 - 2, c - 3 + i * 2.5, c - 4 - i * 1.3 + 2);
    g.lineStyle(3, z.ropa, 1);
    g.lineBetween(c - z.profundidad * 0.35, c - h * 0.85, c - z.profundidad * 0.35, c + h * 0.85);
  } else {
    g.fillStyle(z.ropa, 1);
    g.fillEllipse(c, c, z.profundidad, h * 2);
    g.fillStyle(z.ropaOscura, 1);
    g.fillEllipse(c - z.profundidad * 0.2, c, z.profundidad * 0.45, h * 1.4);
    g.fillStyle(z.piel, 1);
    g.fillCircle(c + 1, c + h * 0.45, h * 0.18);
    g.fillCircle(c - 2, c - h * 0.5, h * 0.14);
  }

  if (z.escupidor) {
    g.fillStyle(0xe8f070, 1);
    g.fillCircle(c - 3, c - 4, 2.2);
    g.fillCircle(c + 2, c + 5, 2.6);
    g.fillCircle(c - 5, c + 3, 1.8);
  }

  if (z.jefe) {
    g.fillStyle(0xe8dcc0, 1);
    for (let i = -2; i <= 2; i++) {
      const y = c + i * h * 0.38;
      g.fillTriangle(c - z.profundidad * 0.35, y - 4, c - z.profundidad * 0.35, y + 4, c - z.profundidad * 0.75, y);
    }
    g.fillStyle(z.pielOscura, 1);
    g.fillCircle(c - z.profundidad * 0.15, c - h * 0.55, h * 0.18);
    g.fillCircle(c + z.profundidad * 0.1, c + h * 0.6, h * 0.15);
    g.fillStyle(0xc96b8a, 0.9);
    g.fillCircle(c - z.profundidad * 0.2, c + h * 0.25, h * 0.12);
  }

  g.fillStyle(SANGRE, 0.9);
  g.fillCircle(c + 2, c - h * 0.2, h * 0.16);
  g.fillCircle(c + 4, c - h * 0.05, h * 0.09);

  g.fillStyle(z.piel, 1);
  g.fillCircle(c + 1, c, z.cabeza);
  g.fillStyle(z.pielOscura, 1);
  g.fillCircle(c - 1.5, c - z.cabeza * 0.35, z.cabeza * 0.45);
  if (tipo === 'normal') {
    g.fillStyle(0xd98a96, 1);
    g.fillCircle(c - 2, c + z.cabeza * 0.3, z.cabeza * 0.3);
  }
  g.fillStyle(OJO_ZOMBIE, 1);
  g.fillCircle(c + 1 + z.cabeza * 0.6, c - z.cabeza * 0.38, Math.max(1.1, z.cabeza * 0.17));
  g.fillCircle(c + 1 + z.cabeza * 0.6, c + z.cabeza * 0.38, Math.max(1.1, z.cabeza * 0.17));

  if (z.jefe === 2) {
    g.fillStyle(0xffd23f, 1);
    g.fillCircle(c + z.cabeza * 0.2, c - z.cabeza * 0.65, z.cabeza * 0.14);
    g.fillCircle(c + z.cabeza * 0.2, c + z.cabeza * 0.65, z.cabeza * 0.14);
    g.fillCircle(c - z.cabeza * 0.3, c, z.cabeza * 0.12);
  }

  if (z.escupidor) {
    g.fillStyle(0x1a1a0a, 1);
    g.fillEllipse(c + z.cabeza * 0.9, c, 3, 5);
    g.fillStyle(0x9be22d, 1);
    g.fillCircle(c + z.cabeza + 2, c + 1, 1.8);
    g.fillCircle(c + z.cabeza + 4, c + 2.5, 1.2);
  }
}

export function dibujarAcido(g) {
  g.fillStyle(0x9be22d, 0.45);
  g.fillCircle(7, 7, 7);
  g.fillStyle(0xd8ff6a, 1);
  g.fillCircle(7, 7, 3.5);
  g.fillStyle(0xffffff, 0.8);
  g.fillCircle(6, 5.5, 1.2);
}

export function dibujarCorazon(g) {
  g.fillStyle(0xe63946, 1);
  g.fillCircle(5, 5, 4.5);
  g.fillCircle(13, 5, 4.5);
  g.fillTriangle(0.8, 6.5, 17.2, 6.5, 9, 15.5);
  g.fillStyle(0xffffff, 0.5);
  g.fillCircle(4, 3.5, 1.4);
}

function dibujarAuto(g, x, y, horizontal, color, quemado) {
  const largo = 56;
  const ancho = 28;
  const w = horizontal ? largo : ancho;
  const h = horizontal ? ancho : largo;
  g.fillStyle(0x000000, 0.35);
  g.fillRoundedRect(x - w / 2 + 3, y - h / 2 + 3, w, h, 6);
  g.fillStyle(quemado ? 0x2b2622 : color, 1);
  g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 6);
  g.fillStyle(quemado ? 0x6e3b1f : 0x1b1d22, 1);
  if (horizontal) {
    g.fillRect(x - 10, y - h / 2 + 4, 6, h - 8);
    g.fillRect(x + 8, y - h / 2 + 4, 8, h - 8);
  } else {
    g.fillRect(x - w / 2 + 4, y - 10, w - 8, 6);
    g.fillRect(x - w / 2 + 4, y + 8, w - 8, 8);
  }
  if (quemado) {
    g.fillStyle(0x6e3b1f, 0.8);
    g.fillCircle(x - 6, y + 3, 5);
    g.fillCircle(x + 9, y - 4, 4);
  }
}

function dibujarSangre(g, rng, x, y, escala) {
  g.fillStyle(0x4f0909, 0.85);
  for (let i = 0; i < 5; i++) {
    g.fillCircle(x + rng.between(-14, 14) * escala, y + rng.between(-10, 10) * escala, rng.between(5, 11) * escala);
  }
  g.fillStyle(0x6b0f0f, 0.9);
  for (let i = 0; i < 6; i++) {
    g.fillCircle(x + rng.between(-30, 30) * escala, y + rng.between(-24, 24) * escala, rng.between(1, 3));
  }
}

function dibujarGrieta(g, rng, x, y) {
  g.lineStyle(1.5, 0x141416, 0.8);
  g.beginPath();
  g.moveTo(x, y);
  let px = x;
  let py = y;
  for (let i = 0; i < 6; i++) {
    px += rng.between(-18, 18);
    py += rng.between(-18, 18);
    g.lineTo(px, py);
  }
  g.strokePath();
}


const BASE_TEMA = {
  suelo: 0x34353a,
  juntas: 0x2b2c30,
  acera: 0x4a4b50,
  asfalto: 0x232427,
  linea: 0x8f7d2b,
  techo: 0x1b1c21,
  techoDetalle: 0x2e3138,
  cesped: 14,
  colorCesped: 0x3b4429,
  sangre: 26,
  escombros: 70,
  grietas: 40,
  baches: 12,
  quemaduras: 10,
  autos: [7, 5],
  quemados: 0.35,
  coloresAuto: [0x8a2a2a, 0x2d4f7c, 0x6f6f6f, 0xc9a227, 0x2f5d3a, 0xd8d8d8],
  fuegosTecho: 4,
  calles: { h: [0.27, 0.73], v: [0.28, 0.72] },
  anchoCalle: 130,
  bordeTipo: 'edificios',
  extras: ['barricadas']
};

export const TEMAS = {
  ciudad: {},
  avenida: { autos: [9, 6] },
  suburbio: {
    suelo: 0x33452b, juntas: 0x2e3f27, colorCesped: 0x2a3a20, cesped: 30, techo: 0x6b2f24, techoDetalle: 0x8a3d2e,
    calles: { h: [0.5], v: [0.33, 0.68] }, autos: [4, 3], quemados: 0.2, sangre: 16, escombros: 30, grietas: 15,
    bordeTipo: 'casas', extras: ['vallas', 'arbustos']
  },
  plaza: {
    suelo: 0x57524a, juntas: 0x4a463f, calles: { h: [0.16, 0.84], v: [0.14, 0.86] }, sangre: 40, autos: [5, 3],
    extras: ['fuente', 'bancas', 'arbustos', 'barricadas']
  },
  centro: {
    suelo: 0x303238, techo: 0x111216, techoDetalle: 0x23252c, calles: { h: [0.25, 0.75], v: [0.22, 0.5, 0.78] },
    autos: [10, 6], quemados: 0.45, fuegosTecho: 6, bordeTipo: 'rascacielos', extras: ['barricadas']
  },
  hospital: {
    suelo: 0x6c7176, juntas: 0x5f6468, acera: 0x7f8489, techo: 0xb9bec2, techoDetalle: 0x9aa0a5, cesped: 6,
    coloresAuto: [0xe8e8e8, 0xe8e8e8, 0x2d4f7c, 0x6f6f6f], sangre: 40, calles: { h: [0.3], v: [0.5] },
    autos: [6, 4], quemados: 0.15, extras: ['cruces', 'camillas', 'barricadas']
  },
  industrial: {
    suelo: 0x4a4535, juntas: 0x3e3a2d, acera: 0x5a5547, techo: 0x2f3338, techoDetalle: 0x454a52, cesped: 4,
    colorCesped: 0x3a3a26, calles: { h: [0.5], v: [0.3, 0.7] }, autos: [4, 3], extras: ['contenedores', 'barriles', 'manchas']
  },
  puerto: {
    suelo: 0x3a3d41, juntas: 0x313438, cesped: 0, calles: { h: [0.35], v: [0.5] }, autos: [4, 3],
    bordeTipo: 'agua', extras: ['contenedores', 'gruas', 'barriles']
  },
  autopista: {
    suelo: 0x2c2d30, juntas: 0x26272a, cesped: 6, calles: { h: [0.3, 0.7], v: [0.5] }, anchoCalle: 220,
    autos: [14, 6], quemados: 0.4, bordeTipo: 'muros', extras: ['barreras']
  },
  militar: {
    suelo: 0x3d4630, juntas: 0x353d2a, colorCesped: 0x2f3824, cesped: 24, acera: 0x55594a, techo: 0x2f3a26,
    techoDetalle: 0x46523a, coloresAuto: [0x4b5a33, 0x4b5a33, 0x6b6b4a], calles: { h: [0.5], v: [0.5] },
    autos: [5, 4], bordeTipo: 'vallas', extras: ['sacos', 'tiendas', 'alambre']
  },
  puente: {
    suelo: 0x2a2b2e, juntas: 0x252629, cesped: 0, calles: { h: [0.5], v: [] }, anchoCalle: 760, autos: [16, 0],
    quemados: 0.5, fuegosTecho: 0, sangre: 30, bordeTipo: 'agua', extras: ['barreras']
  }
};

function dibujarFuego(g, x, y, radio) {
  for (let i = 5; i >= 1; i--) {
    g.fillStyle(0xff7a1a, 0.035 * (6 - i));
    g.fillCircle(x, y, (radio * i) / 5);
  }
  g.fillStyle(0xffd27a, 0.35);
  g.fillCircle(x, y, radio * 0.12);
}

function dibujarExtras(g, rng, t, ancho, alto, borde, dentroX, dentroY) {
  const extras = t.extras;
  if (extras.includes('barricadas')) {
    for (let i = 0; i < 6; i++) {
      const x = dentroX();
      const y = dentroY();
      g.fillStyle(0x7a5a2e, 1);
      g.fillRect(x - 22, y - 4, 44, 8);
      g.fillStyle(0xd8d8d8, 1);
      for (let j = 0; j < 4; j++) g.fillRect(x - 20 + j * 11, y - 4, 5, 8);
    }
  }
  if (extras.includes('arbustos')) {
    for (let i = 0; i < 26; i++) {
      const x = dentroX();
      const y = dentroY();
      g.fillStyle(0x1f2e18, 1);
      g.fillCircle(x, y, rng.between(9, 16));
      g.fillStyle(0x2f4423, 1);
      g.fillCircle(x - 3, y - 3, rng.between(5, 9));
    }
  }
  if (extras.includes('vallas')) {
    g.lineStyle(3, 0x8a6b45, 1);
    for (let i = 0; i < 10; i++) {
      const x = dentroX();
      const y = dentroY();
      const largo = rng.between(60, 140);
      if (rng.frac() < 0.5) g.lineBetween(x, y, x + largo, y);
      else g.lineBetween(x, y, x, y + largo);
    }
  }
  if (extras.includes('fuente')) {
    const x = ancho / 2;
    const y = alto / 2;
    g.fillStyle(0x6e6a62, 1);
    g.fillCircle(x, y, 92);
    g.fillStyle(0x1d3a3f, 1);
    g.fillCircle(x, y, 78);
    g.fillStyle(0x3d1a1a, 0.6);
    g.fillCircle(x + 20, y - 10, 30);
    g.fillStyle(0x6e6a62, 1);
    g.fillCircle(x, y, 18);
  }
  if (extras.includes('bancas')) {
    for (let i = 0; i < 10; i++) {
      const x = dentroX();
      const y = dentroY();
      g.fillStyle(0x5a3d22, 1);
      g.fillRect(x - 18, y - 5, 36, 10);
      g.fillStyle(0x2a2a2a, 1);
      g.fillRect(x - 18, y - 6, 3, 12);
      g.fillRect(x + 15, y - 6, 3, 12);
    }
  }
  if (extras.includes('cruces')) {
    for (let i = 0; i < 6; i++) {
      const x = dentroX();
      const y = dentroY();
      g.fillStyle(0xd8d8d8, 0.8);
      g.fillCircle(x, y, 26);
      g.fillStyle(0xc0392b, 1);
      g.fillRect(x - 6, y - 18, 12, 36);
      g.fillRect(x - 18, y - 6, 36, 12);
    }
  }
  if (extras.includes('camillas')) {
    for (let i = 0; i < 10; i++) {
      const x = dentroX();
      const y = dentroY();
      g.fillStyle(0x9a9fa5, 1);
      g.fillRect(x - 20, y - 8, 40, 16);
      g.fillStyle(0xe8e8e8, 1);
      g.fillRect(x - 17, y - 6, 34, 12);
      g.fillStyle(0x6b0f0f, 0.8);
      g.fillCircle(x + 4, y, 5);
    }
  }
  if (extras.includes('contenedores')) {
    const colores = [0xa33b2b, 0x2d5f8a, 0x2f7d4a, 0xc98a2b, 0x6b3d8a];
    for (let i = 0; i < 14; i++) {
      const x = dentroX();
      const y = dentroY();
      const horizontal = rng.frac() < 0.6;
      const w = horizontal ? 110 : 40;
      const h = horizontal ? 40 : 110;
      g.fillStyle(0x000000, 0.35);
      g.fillRect(x + 4, y + 4, w, h);
      g.fillStyle(rng.pick(colores), 1);
      g.fillRect(x, y, w, h);
      g.lineStyle(1, 0x000000, 0.35);
      if (horizontal) for (let j = 8; j < w; j += 8) g.lineBetween(x + j, y + 2, x + j, y + h - 2);
      else for (let j = 8; j < h; j += 8) g.lineBetween(x + 2, y + j, x + w - 2, y + j);
    }
  }
  if (extras.includes('barriles')) {
    for (let i = 0; i < 24; i++) {
      const x = dentroX();
      const y = dentroY();
      g.fillStyle(rng.frac() < 0.5 ? 0x2f5d3a : 0x8a3a1a, 1);
      g.fillCircle(x, y, 9);
      g.lineStyle(1.5, 0x111111, 0.8);
      g.strokeCircle(x, y, 9);
      g.strokeCircle(x, y, 5);
    }
  }
  if (extras.includes('manchas')) {
    for (let i = 0; i < 18; i++) {
      g.fillStyle(0x0d0d0f, 0.55);
      g.fillEllipse(dentroX(), dentroY(), rng.between(30, 90), rng.between(18, 50));
    }
  }
  if (extras.includes('gruas')) {
    g.fillStyle(0xc9a227, 1);
    const y = Math.round(alto * 0.62);
    g.fillRect(borde, y, ancho - borde * 2, 6);
    g.fillRect(borde, y + 46, ancho - borde * 2, 6);
    for (let x = borde + 80; x < ancho - borde; x += 320) {
      g.fillStyle(0xd9b13a, 1);
      g.fillRect(x, y - 6, 26, 64);
      g.fillStyle(0x3a3a3a, 1);
      g.fillRect(x + 6, y + 4, 14, 44);
    }
  }
  if (extras.includes('barreras')) {
    t.calles.h.forEach((relacion) => {
      const y = Math.round(alto * relacion);
      g.fillStyle(0x8c8c88, 1);
      for (let x = borde + 20; x < ancho - borde - 40; x += 60) {
        if (rng.frac() < 0.25) continue;
        g.fillRect(x, y - 4, 44, 8);
      }
    });
  }
  if (extras.includes('sacos')) {
    for (let i = 0; i < 10; i++) {
      const x = dentroX();
      const y = dentroY();
      g.fillStyle(0x8a7a52, 1);
      for (let j = 0; j < 5; j++) g.fillEllipse(x + j * 14, y + Math.abs(j - 2) * 3, 16, 10);
      g.lineStyle(1, 0x5a4f35, 1);
      for (let j = 0; j < 5; j++) g.strokeEllipse(x + j * 14, y + Math.abs(j - 2) * 3, 16, 10);
    }
  }
  if (extras.includes('tiendas')) {
    for (let i = 0; i < 6; i++) {
      const x = dentroX();
      const y = dentroY();
      g.fillStyle(0x4b5a33, 1);
      g.fillRect(x - 40, y - 26, 80, 52);
      g.fillStyle(0x3a4627, 1);
      g.fillRect(x - 40, y - 3, 80, 6);
      g.lineStyle(1, 0x2a331c, 1);
      g.strokeRect(x - 40, y - 26, 80, 52);
    }
  }
  if (extras.includes('alambre')) {
    g.lineStyle(1.5, 0x9a9a9a, 0.9);
    for (let i = 0; i < 8; i++) {
      const x = dentroX();
      const y = dentroY();
      g.beginPath();
      g.moveTo(x, y);
      for (let j = 1; j <= 12; j++) g.lineTo(x + j * 10, y + (j % 2 === 0 ? -5 : 5));
      g.strokePath();
    }
  }
}

function dibujarBorde(g, rng, t, ancho, alto, borde) {
  const bandas = [[0, 0, ancho, borde], [0, alto - borde, ancho, borde], [0, 0, borde, alto], [ancho - borde, 0, borde, alto]];
  if (t.bordeTipo === 'agua') {
    g.fillStyle(0x10283a, 1);
    bandas.forEach(([x, y, w, h]) => g.fillRect(x, y, w, h));
    g.lineStyle(2, 0x2c5a78, 0.7);
    for (let i = 0; i < 60; i++) {
      const [bx, by, bw, bh] = bandas[rng.between(0, 3)];
      const x = bx + rng.between(4, Math.max(5, bw - 24));
      const y = by + rng.between(4, Math.max(5, bh - 8));
      g.lineBetween(x, y, x + 16, y);
    }
    g.lineStyle(4, 0x6b6b66, 1);
    g.strokeRect(borde, borde, ancho - borde * 2, alto - borde * 2);
    return;
  }
  if (t.bordeTipo === 'vallas') {
    g.fillStyle(0x2c3424, 1);
    bandas.forEach(([x, y, w, h]) => g.fillRect(x, y, w, h));
    g.lineStyle(1, 0x8a8a8a, 0.6);
    for (let x = 0; x < ancho; x += 10) {
      g.lineBetween(x, borde - 14, x + 10, borde - 4);
      g.lineBetween(x + 10, borde - 14, x, borde - 4);
      g.lineBetween(x, alto - borde + 4, x + 10, alto - borde + 14);
      g.lineBetween(x + 10, alto - borde + 4, x, alto - borde + 14);
    }
    for (let y = 0; y < alto; y += 10) {
      g.lineBetween(borde - 14, y, borde - 4, y + 10);
      g.lineBetween(borde - 4, y, borde - 14, y + 10);
      g.lineBetween(ancho - borde + 4, y, ancho - borde + 14, y + 10);
      g.lineBetween(ancho - borde + 14, y, ancho - borde + 4, y + 10);
    }
    g.lineStyle(3, 0x6b6b66, 1);
    g.strokeRect(borde, borde, ancho - borde * 2, alto - borde * 2);
    return;
  }
  if (t.bordeTipo === 'muros') {
    g.fillStyle(0x5a5b5e, 1);
    bandas.forEach(([x, y, w, h]) => g.fillRect(x, y, w, h));
    g.fillStyle(0x47484b, 1);
    for (let x = 0; x < ancho; x += 40) {
      g.fillRect(x, 0, 2, borde);
      g.fillRect(x, alto - borde, 2, borde);
    }
    for (let y = 0; y < alto; y += 40) {
      g.fillRect(0, y, borde, 2);
      g.fillRect(ancho - borde, y, borde, 2);
    }
    g.lineStyle(3, 0x8c8c88, 1);
    g.strokeRect(borde, borde, ancho - borde * 2, alto - borde * 2);
    return;
  }

  g.fillStyle(t.techo, 1);
  bandas.forEach(([x, y, w, h]) => g.fillRect(x, y, w, h));
  g.lineStyle(2, 0x0e0f12, 1);
  for (let x = rng.between(120, 220); x < ancho; x += rng.between(140, 260)) {
    g.lineBetween(x, 0, x, borde);
    g.lineBetween(x, alto - borde, x, alto);
  }
  for (let y = rng.between(120, 220); y < alto; y += rng.between(140, 260)) {
    g.lineBetween(0, y, borde, y);
    g.lineBetween(ancho - borde, y, ancho, y);
  }

  for (let i = 0; i < 40; i++) {
    const lado = rng.between(0, 3);
    const x = lado < 2 ? rng.between(10, ancho - 40) : lado === 2 ? rng.between(8, borde - 30) : rng.between(ancho - borde + 8, ancho - 30);
    const y = lado >= 2 ? rng.between(10, alto - 40) : lado === 0 ? rng.between(8, borde - 30) : rng.between(alto - borde + 8, alto - 30);
    if (t.bordeTipo === 'casas') {
      g.lineStyle(2, t.techoDetalle, 1);
      g.lineBetween(x, y + 9, x + 26, y + 9);
      g.fillStyle(0x3a3a3a, 1);
      g.fillRect(x + 18, y + 2, 6, 6);
    } else if (t.bordeTipo === 'rascacielos') {
      g.fillStyle(t.techoDetalle, 1);
      g.fillRect(x, y, 24, 24);
      g.fillStyle(0xd9c56b, 0.25);
      g.fillRect(x + 4, y + 4, 4, 4);
      g.fillRect(x + 14, y + 12, 4, 4);
    } else if (rng.frac() < 0.6) {
      g.fillStyle(t.techoDetalle, 1);
      g.fillRect(x, y, 22, 18);
      g.lineStyle(1, 0x464a53, 1);
      g.strokeRect(x, y, 22, 18);
      g.lineBetween(x + 3, y + 9, x + 19, y + 9);
    } else {
      g.fillStyle(0x26282e, 1);
      g.fillCircle(x + 8, y + 8, 7);
      g.fillStyle(0x111214, 1);
      g.fillCircle(x + 8, y + 8, 3);
    }
  }

  for (let i = 0; i < t.fuegosTecho; i++) {
    const enX = rng.frac() < 0.5;
    const x = enX ? rng.between(200, ancho - 200) : (rng.frac() < 0.5 ? borde / 2 : ancho - borde / 2);
    const y = enX ? (rng.frac() < 0.5 ? borde / 2 : alto - borde / 2) : rng.between(200, alto - 200);
    g.fillStyle(0x0a0a0b, 0.8);
    g.fillCircle(x, y, 24);
    dibujarFuego(g, x, y, 70);
  }

  g.lineStyle(3, 0x40434b, 1);
  g.strokeRect(borde, borde, ancho - borde * 2, alto - borde * 2);
}

export function dibujarCiudad(g, ancho, alto, borde, temaId = 'ciudad') {
  const t = { ...BASE_TEMA, ...(TEMAS[temaId] || {}) };
  const rng = new Phaser.Math.RandomDataGenerator(['zombies-' + temaId]);
  const anchoCalle = t.anchoCalle;
  const acera = 16;
  const horizontales = t.calles.h.map((r) => Math.round(alto * r));
  const verticales = t.calles.v.map((r) => Math.round(ancho * r));
  const dentroX = () => rng.between(borde + 30, ancho - borde - 30);
  const dentroY = () => rng.between(borde + 30, alto - borde - 30);

  g.fillStyle(t.suelo, 1);
  g.fillRect(0, 0, ancho, alto);
  g.lineStyle(1, t.juntas, 1);
  for (let x = 0; x <= ancho; x += 48) g.lineBetween(x, 0, x, alto);
  for (let y = 0; y <= alto; y += 48) g.lineBetween(0, y, ancho, y);

  for (let i = 0; i < t.cesped; i++) {
    g.fillStyle(t.colorCesped, rng.realInRange(0.35, 0.6));
    g.fillEllipse(dentroX(), dentroY(), rng.between(60, 160), rng.between(40, 110));
  }

  horizontales.forEach((y) => {
    g.fillStyle(t.acera, 1);
    g.fillRect(0, y - anchoCalle / 2 - acera, ancho, anchoCalle + acera * 2);
  });
  verticales.forEach((x) => {
    g.fillStyle(t.acera, 1);
    g.fillRect(x - anchoCalle / 2 - acera, 0, anchoCalle + acera * 2, alto);
  });
  horizontales.forEach((y) => {
    g.fillStyle(t.asfalto, 1);
    g.fillRect(0, y - anchoCalle / 2, ancho, anchoCalle);
    g.fillStyle(t.linea, 0.7);
    const carriles = Math.max(1, Math.round(anchoCalle / 130));
    for (let c = 1; c <= carriles; c++) {
      const yLinea = y - anchoCalle / 2 + (anchoCalle * c) / (carriles + 1);
      for (let x = 0; x < ancho; x += 64) g.fillRect(x, yLinea - 2, 32, 4);
    }
  });
  verticales.forEach((x) => {
    g.fillStyle(t.asfalto, 1);
    g.fillRect(x - anchoCalle / 2, 0, anchoCalle, alto);
    g.fillStyle(t.linea, 0.7);
    for (let y = 0; y < alto; y += 64) g.fillRect(x - 2, y, 4, 32);
  });

  horizontales.forEach((y) => {
    verticales.forEach((x) => {
      g.fillStyle(t.asfalto, 1);
      g.fillRect(x - anchoCalle / 2, y - anchoCalle / 2, anchoCalle, anchoCalle);
      g.fillStyle(0xd8d8d8, 0.35);
      const pasos = Math.floor((anchoCalle - 20) / 20);
      for (let i = 0; i < pasos; i++) {
        const desplazamiento = -anchoCalle / 2 + 10 + i * 20;
        g.fillRect(x + desplazamiento, y - anchoCalle / 2 - 14, 10, 12);
        g.fillRect(x + desplazamiento, y + anchoCalle / 2 + 2, 10, 12);
        g.fillRect(x - anchoCalle / 2 - 14, y + desplazamiento, 12, 10);
        g.fillRect(x + anchoCalle / 2 + 2, y + desplazamiento, 12, 10);
      }
    });
  });

  for (let i = 0; i < t.grietas; i++) dibujarGrieta(g, rng, dentroX(), dentroY());

  for (let i = 0; i < t.baches; i++) {
    g.fillStyle(0x161618, 0.9);
    g.fillEllipse(dentroX(), dentroY(), rng.between(14, 30), rng.between(10, 20));
  }

  for (let i = 0; i < t.quemaduras; i++) {
    const x = dentroX();
    const y = dentroY();
    for (let j = 4; j >= 1; j--) {
      g.fillStyle(0x0b0b0c, 0.12);
      g.fillCircle(x, y, j * 16);
    }
  }

  dibujarExtras(g, rng, t, ancho, alto, borde, dentroX, dentroY);

  const fuegos = [];
  horizontales.forEach((y) => {
    for (let i = 0; i < t.autos[0]; i++) {
      const x = rng.between(borde + 60, ancho - borde - 60);
      if (verticales.some((v) => Math.abs(v - x) < anchoCalle)) continue;
      const quemado = rng.frac() < t.quemados;
      const autoY = y + rng.between(-anchoCalle / 2 + 20, anchoCalle / 2 - 20);
      dibujarAuto(g, x, autoY, true, rng.pick(t.coloresAuto), quemado);
      if (quemado) fuegos.push({ x, y: autoY });
    }
  });
  verticales.forEach((x) => {
    for (let i = 0; i < t.autos[1]; i++) {
      const y = rng.between(borde + 60, alto - borde - 60);
      if (horizontales.some((hz) => Math.abs(hz - y) < anchoCalle)) continue;
      const quemado = rng.frac() < t.quemados;
      const autoX = x + (rng.frac() < 0.5 ? -30 : 30);
      dibujarAuto(g, autoX, y, false, rng.pick(t.coloresAuto), quemado);
      if (quemado) fuegos.push({ x: autoX, y });
    }
  });

  for (let i = 0; i < t.sangre; i++) dibujarSangre(g, rng, dentroX(), dentroY(), rng.realInRange(0.6, 1.4));

  for (let i = 0; i < t.escombros; i++) {
    g.fillStyle(rng.pick([0x55565c, 0x6b5a45, 0x3e3f44, 0x8c8c8c]), 1);
    g.fillRect(dentroX(), dentroY(), rng.between(3, 9), rng.between(3, 7));
  }

  fuegos.forEach((fuego) => dibujarFuego(g, fuego.x, fuego.y, rng.between(70, 110)));
  dibujarBorde(g, rng, t, ancho, alto, borde);
}

const DISENO_COFRE = {
  activa: { caja: 0x1f4f8a, tapa: 0x2f6fbf, borde: 0x9ad4ff, brillo: 0x3ea8ff },
  arma: { caja: 0x4b5a33, tapa: 0x5d6e40, borde: 0x2a331c, brillo: 0xd9a03a },
  pasiva: { caja: 0x6b4a2b, tapa: 0x8a5f37, borde: 0x4cd97b, brillo: 0x4cd97b },
  mejora: { caja: 0x4a2a6b, tapa: 0x63398f, borde: 0xf0c94a, brillo: 0xb36bff }
};

export const TAMANO_COFRE = { ancho: 48, alto: 44 };

function dibujarIconoCofre(g, tipo, cx, cy, color) {
  g.fillStyle(color, 1);
  if (tipo === 'activa') {
    g.fillTriangle(cx + 2, cy - 9, cx - 6, cy + 2, cx + 1, cy + 1);
    g.fillTriangle(cx - 2, cy + 9, cx + 6, cy - 2, cx - 1, cy - 1);
  } else if (tipo === 'arma') {
    g.fillRect(cx - 9, cy - 3, 14, 5);
    g.fillRect(cx - 9, cy - 3, 4, 10);
    g.fillRect(cx + 5, cy - 2, 5, 3);
  } else if (tipo === 'pasiva') {
    g.fillCircle(cx - 3.5, cy - 2, 4);
    g.fillCircle(cx + 3.5, cy - 2, 4);
    g.fillTriangle(cx - 7.5, cy - 1, cx + 7.5, cy - 1, cx, cy + 7);
  } else {
    g.fillTriangle(cx, cy - 9, cx - 8, cy, cx + 8, cy);
    g.fillRect(cx - 3, cy, 6, 9);
  }
}

export function dibujarCofre(g, tipo, abierto) {
  const d = DISENO_COFRE[tipo];
  const w = TAMANO_COFRE.ancho;
  const h = TAMANO_COFRE.alto;
  const x = 4;
  const y = 12;
  const cw = w - 8;
  const ch = h - 16;

  if (abierto) {
    for (let i = 4; i >= 1; i--) {
      g.fillStyle(d.brillo, 0.08 * (5 - i));
      g.fillCircle(w / 2, y + 4, 6 + i * 5);
    }
  }
  g.fillStyle(0x000000, 0.35);
  g.fillRoundedRect(x + 2, y + 3, cw, ch, 4);
  g.fillStyle(d.caja, 1);
  g.fillRoundedRect(x, y, cw, ch, 4);
  g.lineStyle(2, d.borde, 1);
  g.strokeRoundedRect(x, y, cw, ch, 4);

  if (tipo === 'arma') {
    g.fillStyle(0x2a331c, 1);
    g.fillRect(x + 8, y, 4, ch);
    g.fillRect(x + cw - 12, y, 4, ch);
  }
  if (tipo === 'mejora' || tipo === 'pasiva') {
    g.fillStyle(d.borde, 1);
    g.fillRect(x, y + ch / 2 - 1.5, cw, 3);
  }
  if (tipo === 'activa') {
    g.lineStyle(1, d.borde, 0.6);
    g.lineBetween(x + 4, y + ch - 6, x + cw - 4, y + ch - 6);
  }

  if (abierto) {
    g.fillStyle(0x0b0b0c, 1);
    g.fillRect(x + 3, y + 2, cw - 6, 6);
    g.fillStyle(d.tapa, 1);
    g.fillRoundedRect(x, 0, cw, 10, 3);
    g.lineStyle(2, d.borde, 1);
    g.strokeRoundedRect(x, 0, cw, 10, 3);
    dibujarIconoCofre(g, tipo, w / 2, y + ch / 2 + 2, d.brillo);
  } else {
    g.fillStyle(d.tapa, 1);
    g.fillRoundedRect(x, y - 6, cw, 12, 4);
    g.lineStyle(2, d.borde, 1);
    g.strokeRoundedRect(x, y - 6, cw, 12, 4);
    g.fillStyle(d.borde, 1);
    g.fillRect(w / 2 - 4, y + 2, 8, 8);
    dibujarIconoCofre(g, tipo, w / 2, y + ch / 2 + 6, d.brillo);
  }
}

export const TAMANO_TILE = 32;

export function temaCompleto(temaId) {
  return { ...BASE_TEMA, ...(TEMAS[temaId] || {}) };
}

function oscurecer(color, factor) {
  const r = Math.round(((color >> 16) & 255) * factor);
  const v = Math.round(((color >> 8) & 255) * factor);
  const a = Math.round((color & 255) * factor);
  return (r << 16) | (v << 8) | a;
}

export function dibujarTileset(g, temaId) {
  const t = temaCompleto(temaId);
  const s = TAMANO_TILE;
  const rng = new Phaser.Math.RandomDataGenerator(['tiles-' + temaId]);

  g.fillStyle(oscurecer(t.techo, 0.2), 1);
  g.fillRect(0, 0, s, s);
  g.fillStyle(oscurecer(t.techo, 0.3), 1);
  g.fillRect(4, 4, 6, 6);
  g.fillRect(20, 18, 5, 5);

  for (let i = 1; i <= 3; i++) {
    const x = i * s;
    g.fillStyle(t.suelo, 1);
    g.fillRect(x, 0, s, s);
    g.lineStyle(1, t.juntas, 1);
    g.strokeRect(x + 0.5, 0.5, s - 1, s - 1);
    g.lineBetween(x + s / 2, 0, x + s / 2, s);
    if (i === 2) {
      g.fillStyle(0x4f0909, 0.75);
      g.fillCircle(x + 12, 14, 6);
      g.fillCircle(x + 19, 19, 3);
    }
    if (i === 3) {
      g.lineStyle(1.5, 0x141416, 0.9);
      g.lineBetween(x + 4, 6, x + 14, 15);
      g.lineBetween(x + 14, 15, x + 11, 26);
      g.lineBetween(x + 14, 15, x + 26, 18);
    }
    for (let j = 0; j < 4; j++) {
      g.fillStyle(t.juntas, 0.8);
      g.fillRect(x + rng.between(2, s - 4), rng.between(2, s - 4), 2, 2);
    }
  }

  const xp = 4 * s;
  g.fillStyle(t.techo, 1);
  g.fillRect(xp, 0, s, s);
  g.fillStyle(t.techoDetalle, 1);
  g.fillRect(xp, 0, s, 6);
  g.lineStyle(1, oscurecer(t.techo, 0.6), 1);
  g.strokeRect(xp + 0.5, 0.5, s - 1, s - 1);
  g.lineBetween(xp, 16, xp + s, 16);
  g.lineBetween(xp + 8, 6, xp + 8, 16);
  g.lineBetween(xp + 24, 16, xp + 24, s);

  const xd = 5 * s;
  g.fillStyle(0x5a5f66, 1);
  g.fillRect(xd, 0, s, s);
  g.fillStyle(0x3a3e44, 1);
  for (let y = 3; y < s; y += 6) g.fillRect(xd + 2, y, s - 4, 2);
  g.fillStyle(0xc9a227, 1);
  g.fillRect(xd, 0, s, 3);
  g.fillRect(xd, s - 3, s, 3);
  g.fillStyle(0xc0392b, 1);
  g.fillCircle(xd + s / 2, s / 2, 3);

  const xc = 6 * s;
  g.fillStyle(t.asfalto, 1);
  g.fillRect(xc, 0, s, s);
  g.fillStyle(t.linea, 0.35);
  g.fillRect(xc + 14, 4, 4, 10);
  g.fillRect(xc + 14, 20, 4, 8);
}

export function dibujarDecoracion(g, tipo) {
  if (tipo === 'auto') {
    g.fillStyle(0x000000, 0.35);
    g.fillRoundedRect(4, 6, 56, 28, 6);
    g.fillStyle(0x2b2622, 1);
    g.fillRoundedRect(2, 3, 56, 28, 6);
    g.fillStyle(0x6e3b1f, 1);
    g.fillRect(20, 7, 6, 20);
    g.fillRect(38, 7, 8, 20);
    g.fillStyle(0x6e3b1f, 0.8);
    g.fillCircle(14, 18, 5);
    return;
  }
  if (tipo === 'caja') {
    g.fillStyle(0x000000, 0.3);
    g.fillRect(4, 4, 26, 26);
    g.fillStyle(0x8a6234, 1);
    g.fillRect(2, 2, 26, 26);
    g.lineStyle(2, 0x5a3d1e, 1);
    g.strokeRect(3, 3, 24, 24);
    g.lineBetween(3, 3, 27, 27);
    g.lineBetween(27, 3, 3, 27);
    return;
  }
  if (tipo === 'barril') {
    g.fillStyle(0x2f5d3a, 1);
    g.fillCircle(12, 12, 10);
    g.lineStyle(1.5, 0x111111, 0.8);
    g.strokeCircle(12, 12, 10);
    g.strokeCircle(12, 12, 5);
    return;
  }
  if (tipo === 'escombros') {
    const colores = [0x55565c, 0x6b5a45, 0x3e3f44, 0x8c8c8c];
    for (let i = 0; i < 9; i++) {
      g.fillStyle(colores[i % colores.length], 1);
      g.fillRect(3 + ((i * 7) % 26), 3 + ((i * 11) % 22), 4 + (i % 3), 3 + (i % 2));
    }
    return;
  }
  g.fillStyle(0x4f0909, 0.85);
  g.fillCircle(16, 14, 9);
  g.fillCircle(24, 18, 6);
  g.fillCircle(10, 20, 5);
  g.fillStyle(0x6b0f0f, 0.9);
  g.fillCircle(30, 8, 2);
  g.fillCircle(4, 6, 2);
}

export const DECORACIONES = ['auto', 'caja', 'barril', 'escombros', 'sangre'];
export const TAMANO_DECORACION = { auto: [62, 36], caja: [32, 32], barril: [24, 24], escombros: [34, 30], sangre: [34, 30] };

export function dibujarArma(g, armaId, color) {
  const largos = { pistola: 18, revolver: 22, escopeta: 34, subfusil: 26, ametralladora: 38, rifle: 40, lanzagranadas: 32 };
  const largo = largos[armaId] || 24;
  const y = 10;
  g.fillStyle(0x000000, 0.35);
  g.fillRect(4, y + 2, largo, 7);
  g.fillStyle(color, 1);
  g.fillRect(2, y - 3, largo, 7);
  g.fillStyle(0x1b1b1b, 1);
  g.fillRect(2 + largo - 4, y - 2, 6, 4);
  g.fillStyle(oscurecer(color, 0.6), 1);
  g.fillRect(4, y + 3, 6, 8);
  if (armaId === 'escopeta' || armaId === 'rifle' || armaId === 'ametralladora') {
    g.fillRect(0, y - 2, 6, 9);
  }
  if (armaId === 'subfusil' || armaId === 'ametralladora') {
    g.fillStyle(0x1b1b1b, 1);
    g.fillRect(14, y + 3, 5, 9);
  }
  if (armaId === 'revolver') {
    g.fillStyle(oscurecer(color, 0.7), 1);
    g.fillCircle(10, y, 4);
  }
  if (armaId === 'lanzagranadas') {
    g.fillStyle(0x1b1b1b, 1);
    g.fillCircle(largo - 2, y, 5);
  }
  if (armaId === 'rifle') {
    g.fillStyle(0x1b1b1b, 1);
    g.fillRect(16, y - 7, 10, 3);
  }
}

export function dibujarPortal(g) {
  const c = 40;
  for (let i = 6; i >= 1; i--) {
    g.fillStyle(i % 2 === 0 ? 0x6b3dd9 : 0x3ee8ff, 0.12 + i * 0.05);
    g.fillCircle(c, c, 6 + i * 5.5);
  }
  g.lineStyle(3, 0xb36bff, 1);
  g.strokeCircle(c, c, 36);
  g.lineStyle(2, 0x3ee8ff, 0.9);
  for (let i = 0; i < 4; i++) {
    const a = (Math.PI / 2) * i;
    g.beginPath();
    g.arc(c, c, 22, a, a + 1, false);
    g.strokePath();
  }
  g.fillStyle(0xffffff, 0.9);
  g.fillCircle(c, c, 4);
}

export function dibujarVendedor(g) {
  const c = 22;
  g.fillStyle(0x000000, 0.3);
  g.fillEllipse(c + 2, c + 3, 24, 32);
  g.fillStyle(0x6b4a2b, 1);
  g.fillEllipse(c, c, 16, 28);
  g.fillStyle(0xe8e0c8, 1);
  g.fillRect(c + 2, c - 8, 6, 16);
  g.fillStyle(0xd9a27a, 1);
  g.fillCircle(c, c, 7);
  g.fillStyle(0x3a2a1a, 1);
  g.fillRect(c - 8, c - 9, 9, 18);
  g.fillStyle(0xc9a227, 1);
  g.fillRect(c + 4, c - 3, 4, 6);
}

export function dibujarPedestal(g) {
  g.fillStyle(0x000000, 0.35);
  g.fillRect(6, 10, 36, 32);
  g.fillStyle(0x6e6a62, 1);
  g.fillRect(4, 8, 36, 32);
  g.fillStyle(0x8c877d, 1);
  g.fillRect(4, 8, 36, 6);
  g.lineStyle(1, 0x4a463f, 1);
  g.strokeRect(4.5, 8.5, 35, 31);
}

export function dibujarDedo(g) {
  g.fillStyle(0x000000, 0.3);
  g.fillEllipse(10, 10, 18, 8);
  g.fillStyle(0x9db58a, 1);
  g.fillRoundedRect(1, 3, 16, 7, 3);
  g.lineStyle(1, 0x5a7a4a, 1);
  g.lineBetween(7, 3, 7, 10);
  g.lineBetween(12, 3, 12, 10);
  g.fillStyle(0xe8dcc0, 1);
  g.fillRect(15, 4, 3, 5);
  g.fillStyle(0x6b0f0f, 1);
  g.fillCircle(2, 6, 2.5);
}
