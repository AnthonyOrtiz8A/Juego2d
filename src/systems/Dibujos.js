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

function oscurecer(color, factor) {
  const r = Math.round(((color >> 16) & 255) * factor);
  const v = Math.round(((color >> 8) & 255) * factor);
  const a = Math.round((color & 255) * factor);
  return (r << 16) | (v << 8) | a;
}

const ESTILOS_TILES = {
  suburbio: { piso: 0x2c2d31, estiloPiso: 'asfalto', acera: 0x7d7a70, linea: 0xd9c56b, pared: 0x7a5a36, estiloPared: 'valla', exterior: [0x2f4423, 0x36502a, 0x7a3428], estiloExterior: 'jardin' },
  avenida: { piso: 0x2a2b2f, estiloPiso: 'asfalto', acera: 0x6a6b70, linea: 0xd9c56b, pared: 0x3a3d44, estiloPared: 'edificio', exterior: [0x1f2126, 0x25282e, 0x2b2e35], estiloExterior: 'techo' },
  plaza: { piso: 0x5f594f, estiloPiso: 'adoquin', acera: 0x77726a, linea: 0xd8d8d8, pared: 0x4a4740, estiloPared: 'muro', exterior: [0x23252a, 0x2a2c32, 0x30333a], estiloExterior: 'techo' },
  centro: { piso: 0x26272b, estiloPiso: 'asfalto', acera: 0x5d5f66, linea: 0xd9c56b, pared: 0x2c2f36, estiloPared: 'edificio', exterior: [0x15171b, 0x1a1c21, 0x202329], estiloExterior: 'rascacielos' },
  hospital: { piso: 0xbfc8ce, estiloPiso: 'baldosa', acera: 0x6fa8a0, linea: 0x3ea8ff, pared: 0xdfe4e8, estiloPared: 'muroBlanco', exterior: [0x5c6267, 0x656b71, 0x6e757b], estiloExterior: 'techo' },
  industrial: { piso: 0x58533f, estiloPiso: 'concreto', acera: 0x58533f, linea: 0xe0b52a, pared: 0x4a4f57, estiloPared: 'lamina', exterior: [0x3b4048, 0x434951, 0x353940], estiloExterior: 'lamina', aceraPeligro: true },
  puerto: { piso: 0x4c4f53, estiloPiso: 'concreto', acera: 0x4c4f53, linea: 0xe0b52a, pared: 0x6b6b66, estiloPared: 'barandal', exterior: [0x10283a, 0x13304a, 0x0e2233], estiloExterior: 'agua', aceraPeligro: true },
  autopista: { piso: 0x252629, estiloPiso: 'asfalto', acera: 0x8c8c88, linea: 0xe8e8e8, pared: 0x6e6f72, estiloPared: 'muro', exterior: [0x2f3824, 0x37412b, 0x2a3320], estiloExterior: 'pasto' },
  militar: { piso: 0x5a4f38, estiloPiso: 'tierra', acera: 0x6e6a52, linea: 0xc9a227, pared: 0x8a7a52, estiloPared: 'sacos', exterior: [0x1f2e18, 0x26381d, 0x2f4423], estiloExterior: 'bosque' },
  puente: { piso: 0x2a2b2e, estiloPiso: 'asfalto', acera: 0x8c8c88, linea: 0xe8e8e8, pared: 0x6b6b66, estiloPared: 'barandal', exterior: [0x10283a, 0x13304a, 0x0e2233], estiloExterior: 'agua' }
};

function aclarar(color, cantidad) {
  const r = Math.min(255, ((color >> 16) & 255) + cantidad);
  const v = Math.min(255, ((color >> 8) & 255) + cantidad);
  const a = Math.min(255, (color & 255) + cantidad);
  return (r << 16) | (v << 8) | a;
}

function pisoBase(g, rng, e, x, s) {
  g.fillStyle(e.piso, 1);
  g.fillRect(x, 0, s, s);
  if (e.estiloPiso === 'baldosa') {
    g.lineStyle(1, oscurecer(e.piso, 0.85), 1);
    g.strokeRect(x + 0.5, 0.5, 15, 15);
    g.strokeRect(x + 16.5, 16.5, 15, 15);
    g.strokeRect(x + 16.5, 0.5, 15, 15);
    g.strokeRect(x + 0.5, 16.5, 15, 15);
  } else if (e.estiloPiso === 'adoquin') {
    g.lineStyle(1, oscurecer(e.piso, 0.75), 1);
    for (let fila = 0; fila < 4; fila++) {
      const y = fila * 8;
      g.lineBetween(x, y + 0.5, x + s, y + 0.5);
      const desplazamiento = fila % 2 === 0 ? 0 : 8;
      for (let col = desplazamiento; col < s; col += 16) g.lineBetween(x + col + 0.5, y, x + col + 0.5, y + 8);
    }
  } else if (e.estiloPiso === 'concreto') {
    g.lineStyle(1, oscurecer(e.piso, 0.8), 1);
    g.strokeRect(x + 0.5, 0.5, s - 1, s - 1);
  } else if (e.estiloPiso === 'tierra') {
    for (let i = 0; i < 6; i++) {
      g.fillStyle(rng.frac() < 0.5 ? oscurecer(e.piso, 0.75) : aclarar(e.piso, 20), 1);
      g.fillCircle(x + rng.between(3, s - 3), rng.between(3, s - 3), rng.between(1, 2));
    }
  }
  for (let i = 0; i < 5; i++) {
    g.fillStyle(rng.frac() < 0.5 ? oscurecer(e.piso, 0.85) : aclarar(e.piso, 10), 0.8);
    g.fillRect(x + rng.between(1, s - 3), rng.between(1, s - 3), 2, 2);
  }
}

function dibujarExteriorTile(g, rng, e, x, s, variante) {
  const estilo = e.estiloExterior;
  const color = estilo === 'jardin' && variante === 2 ? e.exterior[2] : e.exterior[0];
  g.fillStyle(color, 1);
  g.fillRect(x, 0, s, s);
  for (let i = 0; i < 4; i++) {
    g.fillStyle(rng.frac() < 0.5 ? oscurecer(color, 0.9) : aclarar(color, 6), 1);
    g.fillRect(x + rng.between(0, s - 6), rng.between(0, s - 6), rng.between(3, 6), rng.between(3, 6));
  }
  if (estilo === 'techo') {
    if (variante === 1) {
      g.fillStyle(aclarar(color, 25), 1);
      g.fillRect(x + 8, 8, 14, 12);
      g.lineStyle(1, oscurecer(color, 0.6), 1);
      g.lineBetween(x + 10, 14, x + 20, 14);
    }
    if (variante === 2) {
      g.fillStyle(0x0d0d0e, 0.6);
      g.fillCircle(x + 16, 16, 11);
    }
  } else if (estilo === 'rascacielos') {
    g.fillStyle(0xd9c56b, variante === 2 ? 0.35 : 0.12);
    for (let i = 4; i < s; i += 8) for (let j = 4; j < s; j += 8) if (rng.frac() < 0.45) g.fillRect(x + i, j, 3, 3);
  } else if (estilo === 'jardin') {
    if (variante === 2) {
      g.lineStyle(1, oscurecer(color, 0.7), 1);
      for (let y = 4; y < s; y += 6) g.lineBetween(x, y, x + s, y);
    } else {
      g.fillStyle(oscurecer(color, 0.8), 1);
      for (let i = 0; i < 6; i++) g.fillRect(x + rng.between(1, s - 3), rng.between(1, s - 3), 2, 3);
    }
  } else if (estilo === 'lamina') {
    g.lineStyle(2, oscurecer(color, 0.75), 1);
    for (let i = 3; i < s; i += 6) g.lineBetween(x + i, 0, x + i, s);
    if (variante === 2) {
      g.fillStyle(0x6b3a1a, 0.5);
      g.fillCircle(x + 20, 12, 6);
    }
  } else if (estilo === 'agua') {
    g.lineStyle(2, aclarar(color, 30), 0.6);
    const y = 8 + variante * 7;
    g.lineBetween(x + 4, y, x + 14, y);
    g.lineBetween(x + 18, y + 10, x + 28, y + 10);
  } else if (estilo === 'pasto' || estilo === 'bosque') {
    g.fillStyle(oscurecer(color, 0.7), 1);
    for (let i = 0; i < 8; i++) g.fillRect(x + rng.between(1, s - 2), rng.between(1, s - 3), 1, 3);
    if (estilo === 'bosque' && variante > 0) {
      g.fillStyle(aclarar(color, 12), 1);
      g.fillCircle(x + 16, 16, 12);
      g.fillStyle(oscurecer(color, 0.7), 1);
      g.fillCircle(x + 12, 13, 5);
    }
  }
}

function dibujarParedTile(g, e, x, s) {
  const c = e.pared;
  g.fillStyle(c, 1);
  g.fillRect(x, 0, s, s);
  const estilo = e.estiloPared;
  if (estilo === 'edificio') {
    g.fillStyle(aclarar(c, 25), 1);
    g.fillRect(x, 0, s, 5);
    g.fillStyle(0xd9c56b, 0.25);
    g.fillRect(x + 6, 12, 6, 8);
    g.fillRect(x + 20, 12, 6, 8);
  } else if (estilo === 'valla') {
    g.fillStyle(oscurecer(c, 0.7), 1);
    for (let i = 0; i < s; i += 8) g.fillRect(x + i, 0, 1, s);
    g.fillStyle(aclarar(c, 20), 1);
    g.fillRect(x, 10, s, 3);
    g.fillRect(x, 22, s, 3);
  } else if (estilo === 'muro' || estilo === 'muroBlanco') {
    g.lineStyle(1, oscurecer(c, 0.75), 1);
    g.lineBetween(x, 10.5, x + s, 10.5);
    g.lineBetween(x, 21.5, x + s, 21.5);
    g.lineBetween(x + 12.5, 0, x + 12.5, 10);
    g.lineBetween(x + 24.5, 11, x + 24.5, 21);
    g.lineBetween(x + 6.5, 22, x + 6.5, s);
    if (estilo === 'muroBlanco') {
      g.fillStyle(0x3ea8ff, 0.6);
      g.fillRect(x, 14, s, 3);
    }
  } else if (estilo === 'lamina') {
    g.lineStyle(2, oscurecer(c, 0.7), 1);
    for (let i = 3; i < s; i += 6) g.lineBetween(x + i, 0, x + i, s);
    g.fillStyle(0xe0b52a, 1);
    g.fillRect(x, 0, s, 4);
  } else if (estilo === 'barandal') {
    g.fillStyle(oscurecer(c, 0.6), 1);
    g.fillRect(x, 12, s, 8);
    g.fillStyle(aclarar(c, 30), 1);
    g.fillRect(x, 14, s, 3);
    for (let i = 2; i < s; i += 10) g.fillRect(x + i, 10, 3, 12);
  } else if (estilo === 'sacos') {
    g.fillStyle(oscurecer(c, 0.75), 1);
    g.fillRect(x, 0, s, s);
    g.fillStyle(c, 1);
    for (let fila = 0; fila < 3; fila++) {
      for (let col = 0; col < 3; col++) g.fillEllipse(x + col * 11 + (fila % 2 ? 6 : 1) + 4, fila * 11 + 5, 12, 9);
    }
  }
  g.lineStyle(1, 0x000000, 0.4);
  g.strokeRect(x + 0.5, 0.5, s - 1, s - 1);
}

export function dibujarTileset(g, temaId) {
  const e = ESTILOS_TILES[temaId] || ESTILOS_TILES.avenida;
  const s = TAMANO_TILE;
  const rng = new Phaser.Math.RandomDataGenerator(['tiles-' + temaId]);
  const enX = (indice) => indice * s;

  dibujarExteriorTile(g, rng, e, enX(0), s, 0);

  pisoBase(g, rng, e, enX(1), s);

  pisoBase(g, rng, e, enX(2), s);
  g.fillStyle(0x4f0909, 0.8);
  g.fillCircle(enX(2) + 12, 14, 7);
  g.fillCircle(enX(2) + 20, 20, 4);
  g.fillCircle(enX(2) + 6, 24, 2);

  pisoBase(g, rng, e, enX(3), s);
  g.lineStyle(1.5, 0x141416, 0.85);
  g.lineBetween(enX(3) + 4, 6, enX(3) + 14, 15);
  g.lineBetween(enX(3) + 14, 15, enX(3) + 11, 27);
  g.lineBetween(enX(3) + 14, 15, enX(3) + 27, 18);

  dibujarParedTile(g, e, enX(4), s);

  const xd = enX(5);
  g.fillStyle(0x5a5f66, 1);
  g.fillRect(xd, 0, s, s);
  g.fillStyle(0x3a3e44, 1);
  for (let y = 3; y < s; y += 6) g.fillRect(xd + 2, y, s - 4, 2);
  g.fillStyle(0xc9a227, 1);
  g.fillRect(xd, 0, s, 3);
  g.fillRect(xd, s - 3, s, 3);
  g.fillStyle(0xc0392b, 1);
  g.fillCircle(xd + s / 2, s / 2, 3);

  pisoBase(g, rng, e, enX(6), s);
  g.fillStyle(e.linea, 0.85);
  g.fillRect(enX(6) + 2, s / 2 - 2, 14, 4);

  pisoBase(g, rng, e, enX(7), s);
  g.fillStyle(e.linea, 0.85);
  g.fillRect(enX(7) + s / 2 - 2, 2, 4, 14);

  const xa = enX(8);
  g.fillStyle(e.acera, 1);
  g.fillRect(xa, 0, s, s);
  if (e.aceraPeligro) {
    g.fillStyle(0xe0b52a, 0.9);
    for (let i = -s; i < s; i += 12) g.fillTriangle(xa + Math.max(0, i), 0, xa + Math.min(s, i + 6), 0, xa + Math.max(0, i), Math.min(s, 6 - i));
    g.fillStyle(0x1b1b1b, 0.9);
    g.fillRect(xa, s - 6, s, 6);
  } else {
    g.lineStyle(1, oscurecer(e.acera, 0.8), 1);
    g.strokeRect(xa + 0.5, 0.5, 15, 15);
    g.strokeRect(xa + 16.5, 16.5, 15, 15);
    g.strokeRect(xa + 16.5, 0.5, 15, 15);
    g.strokeRect(xa + 0.5, 16.5, 15, 15);
  }

  dibujarExteriorTile(g, rng, e, enX(9), s, 1);
  dibujarExteriorTile(g, rng, e, enX(10), s, 2);

  pisoBase(g, rng, e, enX(11), s);
  if (e.estiloPiso === 'baldosa') {
    g.fillStyle(0x7a8085, 1);
    g.fillRect(enX(11) + 12, 12, 8, 8);
    g.lineStyle(1, 0x3a3e44, 1);
    for (let i = 13; i < 20; i += 2) g.lineBetween(enX(11) + i, 13, enX(11) + i, 19);
  } else {
    g.fillStyle(0x17181a, 1);
    g.fillCircle(enX(11) + 16, 16, 9);
    g.lineStyle(1, 0x3a3b40, 1);
    g.strokeCircle(enX(11) + 16, 16, 9);
    g.lineBetween(enX(11) + 10, 16, enX(11) + 22, 16);
  }

  pisoBase(g, rng, e, enX(12), s);
  g.fillStyle(0xe8e8e8, 0.55);
  for (let y = 2; y < s; y += 8) g.fillRect(enX(12) + 3, y, s - 6, 4);

  pisoBase(g, rng, e, enX(13), s);
  g.fillStyle(0xe8e8e8, 0.55);
  for (let x = 2; x < s; x += 8) g.fillRect(enX(13) + x, 3, 4, s - 6);
}

function sombra(g, x, y, w, h) {
  g.fillStyle(0x000000, 0.35);
  g.fillRoundedRect(x + 3, y + 3, w, h, 4);
}

const DIBUJOS_DECORACION = {
  auto(g) {
    sombra(g, 2, 3, 56, 28);
    g.fillStyle(0x8a2a2a, 1);
    g.fillRoundedRect(2, 3, 56, 28, 6);
    g.fillStyle(0x1b1d22, 1);
    g.fillRect(18, 7, 7, 20);
    g.fillRect(37, 7, 9, 20);
    g.fillStyle(0xd8d8d8, 1);
    g.fillRect(55, 6, 3, 5);
    g.fillRect(55, 23, 3, 5);
    g.lineStyle(1, 0x000000, 0.5);
    g.lineBetween(30, 4, 26, 30);
  },
  autoQuemado(g) {
    sombra(g, 2, 3, 56, 28);
    g.fillStyle(0x2b2622, 1);
    g.fillRoundedRect(2, 3, 56, 28, 6);
    g.fillStyle(0x6e3b1f, 1);
    g.fillRect(18, 7, 7, 20);
    g.fillRect(37, 7, 9, 20);
    g.fillStyle(0x6e3b1f, 0.8);
    g.fillCircle(12, 17, 6);
    g.fillCircle(48, 12, 4);
    g.fillStyle(0x111111, 1);
    g.fillCircle(30, 17, 5);
  },
  barricada(g) {
    sombra(g, 1, 2, 48, 12);
    g.fillStyle(0x7a5a2e, 1);
    g.fillRect(1, 2, 48, 12);
    g.fillStyle(0xd8d8d8, 1);
    for (let i = 0; i < 4; i++) g.fillRect(4 + i * 12, 2, 6, 12);
  },
  bolsas(g) {
    [[9, 10, 8], [20, 9, 9], [14, 18, 8], [26, 18, 6]].forEach(([x, y, r]) => {
      g.fillStyle(0x000000, 0.3);
      g.fillCircle(x + 2, y + 2, r);
      g.fillStyle(0x1b1d22, 1);
      g.fillCircle(x, y, r);
      g.fillStyle(0x3a3d44, 1);
      g.fillCircle(x - 2, y - 2, r * 0.4);
    });
  },
  farola(g) {
    g.fillStyle(0x000000, 0.3);
    g.fillCircle(14, 14, 7);
    g.fillStyle(0x3a3d44, 1);
    g.fillCircle(12, 12, 6);
    g.fillStyle(0xfff2b0, 0.9);
    g.fillCircle(12, 12, 3);
  },
  cono(g) {
    g.fillStyle(0x000000, 0.3);
    g.fillCircle(9, 9, 7);
    g.fillStyle(0xff7a1a, 1);
    g.fillCircle(8, 8, 7);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(8, 8, 4);
    g.fillStyle(0xff7a1a, 1);
    g.fillCircle(8, 8, 2);
  },
  arbol(g) {
    g.fillStyle(0x000000, 0.3);
    g.fillCircle(32, 33, 26);
    g.fillStyle(0x1f3318, 1);
    g.fillCircle(28, 28, 26);
    g.fillStyle(0x2f4a23, 1);
    g.fillCircle(22, 22, 14);
    g.fillCircle(36, 30, 12);
    g.fillCircle(26, 38, 10);
    g.fillStyle(0x3f6230, 1);
    g.fillCircle(19, 18, 6);
  },
  arbusto(g) {
    g.fillStyle(0x000000, 0.3);
    g.fillCircle(16, 17, 13);
    g.fillStyle(0x24381c, 1);
    g.fillCircle(14, 14, 13);
    g.fillStyle(0x36522a, 1);
    g.fillCircle(11, 11, 6);
  },
  banca(g) {
    sombra(g, 1, 2, 40, 14);
    g.fillStyle(0x5a3d22, 1);
    g.fillRect(1, 2, 40, 14);
    g.lineStyle(1, 0x3a2614, 1);
    g.lineBetween(1, 7, 41, 7);
    g.lineBetween(1, 11, 41, 11);
    g.fillStyle(0x2a2a2a, 1);
    g.fillRect(1, 1, 3, 16);
    g.fillRect(38, 1, 3, 16);
  },
  cama(g) {
    sombra(g, 2, 2, 34, 58);
    g.fillStyle(0x9aa0a5, 1);
    g.fillRect(2, 2, 34, 58);
    g.fillStyle(0xf2f2f2, 1);
    g.fillRect(4, 4, 30, 54);
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(8, 6, 22, 10, 3);
    g.fillStyle(0x3e78b8, 1);
    g.fillRect(4, 26, 30, 32);
    g.fillStyle(0x6b0f0f, 0.85);
    g.fillCircle(20, 30, 6);
    g.fillCircle(26, 40, 3);
  },
  camilla(g) {
    sombra(g, 2, 2, 26, 50);
    g.fillStyle(0x6e7378, 1);
    g.fillRect(2, 2, 26, 50);
    g.fillStyle(0xe8e8e8, 1);
    g.fillRect(4, 4, 22, 46);
    g.fillStyle(0x6b0f0f, 0.85);
    g.fillCircle(15, 26, 7);
    g.fillStyle(0x222222, 1);
    g.fillCircle(4, 4, 2);
    g.fillCircle(26, 4, 2);
    g.fillCircle(4, 50, 2);
    g.fillCircle(26, 50, 2);
  },
  portasuero(g) {
    g.fillStyle(0x000000, 0.3);
    g.fillCircle(10, 10, 8);
    g.lineStyle(2, 0x9aa0a5, 1);
    g.strokeCircle(9, 9, 7);
    g.fillStyle(0xbfe3ff, 0.9);
    g.fillRoundedRect(5, 3, 8, 10, 2);
    g.fillStyle(0xc0392b, 0.8);
    g.fillRect(6, 9, 6, 3);
  },
  sillaRuedas(g) {
    sombra(g, 3, 3, 22, 22);
    g.fillStyle(0x222222, 1);
    g.fillRect(2, 3, 4, 22);
    g.fillRect(20, 3, 4, 22);
    g.fillStyle(0x3e78b8, 1);
    g.fillRect(6, 6, 14, 16);
    g.fillStyle(0x9aa0a5, 1);
    g.fillRect(6, 3, 14, 4);
  },
  carrito(g) {
    sombra(g, 2, 2, 30, 22);
    g.fillStyle(0xdfe4e8, 1);
    g.fillRect(2, 2, 30, 22);
    g.fillStyle(0xc0392b, 1);
    g.fillRect(14, 6, 6, 14);
    g.fillRect(10, 10, 14, 6);
    g.lineStyle(1, 0x6e7378, 1);
    g.strokeRect(2.5, 2.5, 29, 21);
  },
  caja(g) {
    sombra(g, 2, 2, 26, 26);
    g.fillStyle(0x8a6234, 1);
    g.fillRect(2, 2, 26, 26);
    g.lineStyle(2, 0x5a3d1e, 1);
    g.strokeRect(3, 3, 24, 24);
    g.lineBetween(3, 3, 27, 27);
    g.lineBetween(27, 3, 3, 27);
  },
  barril(g) {
    g.fillStyle(0x000000, 0.3);
    g.fillCircle(14, 14, 10);
    g.fillStyle(0x2f5d3a, 1);
    g.fillCircle(12, 12, 10);
    g.lineStyle(1.5, 0x111111, 0.8);
    g.strokeCircle(12, 12, 10);
    g.strokeCircle(12, 12, 5);
  },
  contenedor(g) {
    sombra(g, 2, 2, 116, 42);
    g.fillStyle(0xa33b2b, 1);
    g.fillRect(2, 2, 116, 42);
    g.lineStyle(1, 0x000000, 0.35);
    for (let i = 10; i < 116; i += 8) g.lineBetween(2 + i, 4, 2 + i, 42);
    g.lineStyle(2, 0x5a1f16, 1);
    g.strokeRect(3, 3, 114, 40);
  },
  barreraJersey(g) {
    sombra(g, 1, 2, 60, 12);
    g.fillStyle(0x9a9a96, 1);
    g.fillRect(1, 2, 60, 12);
    g.fillStyle(0xb8b8b4, 1);
    g.fillRect(1, 5, 60, 5);
    g.fillStyle(0xc0392b, 0.8);
    g.fillRect(4, 2, 6, 12);
    g.fillRect(52, 2, 6, 12);
  },
  sacos(g) {
    for (let i = 0; i < 5; i++) {
      const x = 8 + i * 13;
      const y = 10 + Math.abs(i - 2) * 3;
      g.fillStyle(0x000000, 0.3);
      g.fillEllipse(x + 2, y + 2, 16, 11);
      g.fillStyle(0x8a7a52, 1);
      g.fillEllipse(x, y, 16, 11);
      g.lineStyle(1, 0x5a4f35, 1);
      g.strokeEllipse(x, y, 16, 11);
    }
  },
  tienda(g) {
    sombra(g, 2, 2, 78, 54);
    g.fillStyle(0x4b5a33, 1);
    g.fillRect(2, 2, 78, 54);
    g.fillStyle(0x3a4627, 1);
    g.fillRect(2, 26, 78, 6);
    g.lineStyle(1, 0x2a331c, 1);
    g.strokeRect(2.5, 2.5, 77, 53);
  },
  cajaMunicion(g) {
    sombra(g, 2, 2, 24, 16);
    g.fillStyle(0x4b5a33, 1);
    g.fillRect(2, 2, 24, 16);
    g.fillStyle(0xc9a227, 1);
    g.fillRect(6, 7, 16, 3);
  },
  jeep(g) {
    sombra(g, 2, 3, 54, 30);
    g.fillStyle(0x4b5a33, 1);
    g.fillRoundedRect(2, 3, 54, 30, 4);
    g.fillStyle(0x2a331c, 1);
    g.fillRect(16, 7, 8, 22);
    g.fillStyle(0x3a4627, 1);
    g.fillRect(30, 6, 20, 24);
  },
  aire(g) {
    sombra(g, 2, 2, 24, 20);
    g.fillStyle(0x6e7378, 1);
    g.fillRect(2, 2, 24, 20);
    g.lineStyle(1, 0x3a3e44, 1);
    for (let i = 6; i < 22; i += 4) g.lineBetween(4, i, 24, i);
    g.fillStyle(0x3a3e44, 1);
    g.fillCircle(14, 12, 5);
  },
  tragaluz(g) {
    g.fillStyle(0x5a5f66, 1);
    g.fillRect(1, 1, 30, 30);
    g.fillStyle(0x7fb8d8, 0.5);
    g.fillRect(4, 4, 24, 24);
    g.lineStyle(1, 0x3a3e44, 1);
    g.lineBetween(16, 4, 16, 28);
    g.lineBetween(4, 16, 28, 16);
  },
  helipuerto(g) {
    g.fillStyle(0x3a3d44, 1);
    g.fillCircle(45, 45, 44);
    g.lineStyle(3, 0xe8e8e8, 0.9);
    g.strokeCircle(45, 45, 36);
    g.fillStyle(0xe8e8e8, 0.9);
    g.fillRect(31, 28, 6, 34);
    g.fillRect(53, 28, 6, 34);
    g.fillRect(31, 42, 28, 6);
  },
  escombros(g) {
    const colores = [0x55565c, 0x6b5a45, 0x3e3f44, 0x8c8c8c];
    for (let i = 0; i < 9; i++) {
      g.fillStyle(colores[i % colores.length], 1);
      g.fillRect(3 + ((i * 7) % 26), 3 + ((i * 11) % 22), 4 + (i % 3), 3 + (i % 2));
    }
  },
  sangre(g) {
    g.fillStyle(0x4f0909, 0.85);
    g.fillCircle(16, 14, 9);
    g.fillCircle(24, 18, 6);
    g.fillCircle(10, 20, 5);
    g.fillStyle(0x6b0f0f, 0.9);
    g.fillCircle(30, 8, 2);
    g.fillCircle(4, 6, 2);
  }
};

export const TAMANO_DECORACION = {
  auto: [62, 36], autoQuemado: [62, 36], barricada: [52, 18], bolsas: [36, 30], farola: [24, 24], cono: [18, 18],
  arbol: [62, 64], arbusto: [32, 32], banca: [44, 20], cama: [40, 64], camilla: [32, 56], portasuero: [20, 20],
  sillaRuedas: [28, 28], carrito: [36, 28], caja: [32, 32], barril: [26, 26], contenedor: [122, 48],
  barreraJersey: [64, 18], sacos: [76, 24], tienda: [84, 60], cajaMunicion: [30, 22], jeep: [60, 36],
  aire: [30, 26], tragaluz: [32, 32], helipuerto: [90, 90], escombros: [34, 30], sangre: [34, 30]
};

export const DECORACIONES = Object.keys(TAMANO_DECORACION);

export function dibujarDecoracion(g, tipo) {
  DIBUJOS_DECORACION[tipo](g);
}

export function dibujarLlama(g) {
  g.fillStyle(0xc0391b, 0.85);
  g.fillEllipse(14, 24, 24, 22);
  g.fillTriangle(4, 22, 14, 0, 24, 22);
  g.fillStyle(0xff7a1a, 0.95);
  g.fillEllipse(14, 26, 16, 16);
  g.fillTriangle(8, 24, 14, 6, 20, 24);
  g.fillStyle(0xffd23f, 1);
  g.fillEllipse(14, 28, 9, 9);
  g.fillTriangle(11, 28, 14, 14, 17, 28);
}

export function dibujarBrillo(g) {
  for (let i = 8; i >= 1; i--) {
    g.fillStyle(0xff7a1a, 0.06);
    g.fillCircle(64, 64, i * 8);
  }
  g.fillStyle(0xffd27a, 0.12);
  g.fillCircle(64, 64, 14);
}

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
