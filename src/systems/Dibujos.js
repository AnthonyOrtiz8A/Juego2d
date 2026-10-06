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

function dibujarResplandor(g, x, y, radio) {
  for (let i = 5; i >= 1; i--) {
    g.fillStyle(0xff7a1a, 0.035 * (6 - i));
    g.fillCircle(x, y, (radio * i) / 5);
  }
  g.fillStyle(0xffd27a, 0.35);
  g.fillCircle(x, y, radio * 0.12);
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

export function dibujarCiudad(g, ancho, alto, borde) {
  const rng = new Phaser.Math.RandomDataGenerator(['ciudad-zombie']);
  const anchoCalle = 130;
  const acera = 16;
  const horizontales = [Math.round(alto * 0.27), Math.round(alto * 0.73)];
  const verticales = [Math.round(ancho * 0.28), Math.round(ancho * 0.72)];
  const dentroX = () => rng.between(borde + 30, ancho - borde - 30);
  const dentroY = () => rng.between(borde + 30, alto - borde - 30);

  g.fillStyle(0x34353a, 1);
  g.fillRect(0, 0, ancho, alto);
  g.lineStyle(1, 0x2b2c30, 1);
  for (let x = 0; x <= ancho; x += 48) g.lineBetween(x, 0, x, alto);
  for (let y = 0; y <= alto; y += 48) g.lineBetween(0, y, ancho, y);

  for (let i = 0; i < 14; i++) {
    g.fillStyle(0x3b4429, rng.realInRange(0.35, 0.6));
    g.fillEllipse(dentroX(), dentroY(), rng.between(60, 160), rng.between(40, 110));
  }

  horizontales.forEach((y) => {
    g.fillStyle(0x4a4b50, 1);
    g.fillRect(0, y - anchoCalle / 2 - acera, ancho, anchoCalle + acera * 2);
  });
  verticales.forEach((x) => {
    g.fillStyle(0x4a4b50, 1);
    g.fillRect(x - anchoCalle / 2 - acera, 0, anchoCalle + acera * 2, alto);
  });
  horizontales.forEach((y) => {
    g.fillStyle(0x232427, 1);
    g.fillRect(0, y - anchoCalle / 2, ancho, anchoCalle);
    g.fillStyle(0x8f7d2b, 0.7);
    for (let x = 0; x < ancho; x += 64) g.fillRect(x, y - 2, 32, 4);
  });
  verticales.forEach((x) => {
    g.fillStyle(0x232427, 1);
    g.fillRect(x - anchoCalle / 2, 0, anchoCalle, alto);
    g.fillStyle(0x8f7d2b, 0.7);
    for (let y = 0; y < alto; y += 64) g.fillRect(x - 2, y, 4, 32);
  });

  horizontales.forEach((y) => {
    verticales.forEach((x) => {
      g.fillStyle(0x232427, 1);
      g.fillRect(x - anchoCalle / 2, y - anchoCalle / 2, anchoCalle, anchoCalle);
      g.fillStyle(0xd8d8d8, 0.35);
      for (let i = 0; i < 6; i++) {
        const desplazamiento = -anchoCalle / 2 + 10 + i * 20;
        g.fillRect(x + desplazamiento, y - anchoCalle / 2 - 14, 10, 12);
        g.fillRect(x + desplazamiento, y + anchoCalle / 2 + 2, 10, 12);
        g.fillRect(x - anchoCalle / 2 - 14, y + desplazamiento, 12, 10);
        g.fillRect(x + anchoCalle / 2 + 2, y + desplazamiento, 12, 10);
      }
      g.fillStyle(0x17181a, 1);
      g.fillCircle(x + 30, y - 28, 9);
      g.lineStyle(1, 0x3a3b40, 1);
      g.strokeCircle(x + 30, y - 28, 9);
    });
  });

  for (let i = 0; i < 40; i++) dibujarGrieta(g, rng, dentroX(), dentroY());

  for (let i = 0; i < 12; i++) {
    g.fillStyle(0x161618, 0.9);
    g.fillEllipse(dentroX(), dentroY(), rng.between(14, 30), rng.between(10, 20));
  }

  for (let i = 0; i < 10; i++) {
    const x = dentroX();
    const y = dentroY();
    for (let j = 4; j >= 1; j--) {
      g.fillStyle(0x0b0b0c, 0.12);
      g.fillCircle(x, y, j * 16);
    }
  }

  const coloresAuto = [0x8a2a2a, 0x2d4f7c, 0x6f6f6f, 0xc9a227, 0x2f5d3a, 0xd8d8d8];
  const fuegos = [];
  horizontales.forEach((y) => {
    for (let i = 0; i < 7; i++) {
      const x = rng.between(borde + 60, ancho - borde - 60);
      if (verticales.some((v) => Math.abs(v - x) < anchoCalle)) continue;
      const quemado = rng.frac() < 0.35;
      const autoY = y + (rng.frac() < 0.5 ? -30 : 30);
      dibujarAuto(g, x, autoY, true, rng.pick(coloresAuto), quemado);
      if (quemado) fuegos.push({ x, y: autoY });
    }
  });
  verticales.forEach((x) => {
    for (let i = 0; i < 5; i++) {
      const y = rng.between(borde + 60, alto - borde - 60);
      if (horizontales.some((hz) => Math.abs(hz - y) < anchoCalle)) continue;
      const quemado = rng.frac() < 0.35;
      const autoX = x + (rng.frac() < 0.5 ? -30 : 30);
      dibujarAuto(g, autoX, y, false, rng.pick(coloresAuto), quemado);
      if (quemado) fuegos.push({ x: autoX, y });
    }
  });

  for (let i = 0; i < 26; i++) dibujarSangre(g, rng, dentroX(), dentroY(), rng.realInRange(0.6, 1.4));

  for (let i = 0; i < 70; i++) {
    g.fillStyle(rng.pick([0x55565c, 0x6b5a45, 0x3e3f44, 0x8c8c8c]), 1);
    g.fillRect(dentroX(), dentroY(), rng.between(3, 9), rng.between(3, 7));
  }

  for (let i = 0; i < 6; i++) {
    const x = dentroX();
    const y = dentroY();
    g.fillStyle(0x7a5a2e, 1);
    g.fillRect(x - 22, y - 4, 44, 8);
    g.fillStyle(0xd8d8d8, 1);
    for (let j = 0; j < 4; j++) g.fillRect(x - 20 + j * 11, y - 4, 5, 8);
  }

  fuegos.forEach((fuego) => dibujarResplandor(g, fuego.x, fuego.y, rng.between(70, 110)));

  g.fillStyle(0x1b1c21, 1);
  g.fillRect(0, 0, ancho, borde);
  g.fillRect(0, alto - borde, ancho, borde);
  g.fillRect(0, 0, borde, alto);
  g.fillRect(ancho - borde, 0, borde, alto);

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
    if (rng.frac() < 0.6) {
      g.fillStyle(0x2e3138, 1);
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

  for (let i = 0; i < 4; i++) {
    const enX = rng.frac() < 0.5;
    const x = enX ? rng.between(200, ancho - 200) : (rng.frac() < 0.5 ? borde / 2 : ancho - borde / 2);
    const y = enX ? (rng.frac() < 0.5 ? borde / 2 : alto - borde / 2) : rng.between(200, alto - 200);
    g.fillStyle(0x0a0a0b, 0.8);
    g.fillCircle(x, y, 24);
    dibujarResplandor(g, x, y, 70);
  }

  g.lineStyle(3, 0x40434b, 1);
  g.strokeRect(borde, borde, ancho - borde * 2, alto - borde * 2);
}
