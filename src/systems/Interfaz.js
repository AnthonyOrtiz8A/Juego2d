export const FUENTE = 'monospace';

export function crearTexto(scene, x, y, texto, tamano, color = '#ffffff') {
  return scene.add.text(x, y, texto, {
    fontFamily: FUENTE,
    fontSize: tamano + 'px',
    fontStyle: 'bold',
    color,
    stroke: '#000000',
    strokeThickness: Math.max(2, Math.round(tamano / 7)),
    align: 'center'
  }).setScrollFactor(0);
}

export function crearBoton(scene, x, y, texto, accion, ancho = 240, alto = 52) {
  const fondo = scene.add.rectangle(x, y, ancho, alto, 0x1d2442, 0.95)
    .setStrokeStyle(2, 0x3ee8ff, 1)
    .setScrollFactor(0)
    .setInteractive({ useHandCursor: true });
  const etiqueta = crearTexto(scene, x, y, texto, 22).setOrigin(0.5);

  fondo.on('pointerover', () => fondo.setFillStyle(0x2c3766, 1));
  fondo.on('pointerout', () => fondo.setFillStyle(0x1d2442, 0.95));
  fondo.on('pointerdown', () => fondo.setFillStyle(0x3ee8ff, 0.35));
  fondo.on('pointerup', () => {
    fondo.setFillStyle(0x1d2442, 0.95);
    accion();
  });

  return { fondo, etiqueta };
}

