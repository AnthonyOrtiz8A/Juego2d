import { APARICION } from '../config.js';

const COLOR_TIERRA = 0x6b4a2e;
const RADIO_MARCA = 55;
const RADIO_ANILLO = 130;

export function efectoAparicion(scene, x, y, jefe) {
  const duracion = jefe ? APARICION.duracionJefeMs : APARICION.duracionMs;
  const hoyo = scene.add.image(x, y, 'hoyo').setDepth(2).setScale(jefe ? 2.2 : 1).setAlpha(0).setAngle(Math.random() * 360);
  scene.tweens.add({
    targets: hoyo,
    alpha: 1,
    duration: 140,
    hold: duracion,
    yoyo: true,
    onComplete: () => hoyo.destroy()
  });
  scene.explosion.setParticleTint(COLOR_TIERRA);
  scene.explosion.explode(jefe ? 26 : 9, x, y);
}

export function mostrarMarca(scene, x, y, duracionMs, radio) {
  const marca = scene.add.image(x, y, 'marca').setDepth(4).setScale(0.2).setAlpha(0.9);
  scene.tweens.add({ targets: marca, scale: radio / RADIO_MARCA, duration: 250, ease: 'Back.Out' });
  scene.tweens.add({ targets: marca, alpha: 0.35, duration: 180, yoyo: true, repeat: -1 });
  scene.time.delayedCall(duracionMs, () => marca.destroy());
}

export function actualizarAnillo(scene, portador, activo, x, y, radio, time) {
  if (!activo) {
    if (portador.anillo) portador.anillo.setVisible(false);
    return;
  }
  if (!portador.anillo) {
    portador.anillo = scene.add.image(x, y, 'anillo-fuego').setDepth(9).setBlendMode('ADD');
  }
  portador.anillo
    .setVisible(true)
    .setPosition(x, y)
    .setScale((radio / RADIO_ANILLO) * (1 + Math.sin(time / 90) * 0.04))
    .setRotation(time / 400)
    .setAlpha(0.75 + Math.sin(time / 60) * 0.2);
}
