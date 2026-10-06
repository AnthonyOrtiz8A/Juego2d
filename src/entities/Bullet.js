import Phaser from 'phaser';
import { BALA } from '../config.js';

const MARGEN = 40;

export default class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'bala');
    this.expiraEn = 0;
    this.danio = BALA.danio;
  }

  disparar(x, y, angulo, tiempo, velocidad = BALA.velocidad, vidaMs = BALA.vidaMs) {
    this.enableBody(true, x, y, true, true);
    this.rotation = angulo;
    this.scene.physics.velocityFromRotation(angulo, velocidad, this.body.velocity);
    this.expiraEn = tiempo + vidaMs;
  }

  desactivar() {
    this.disableBody(true, true);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (!this.active) return;
    const vista = this.scene.cameras.main.worldView;
    if (
      time > this.expiraEn ||
      this.x < vista.x - MARGEN ||
      this.x > vista.right + MARGEN ||
      this.y < vista.y - MARGEN ||
      this.y > vista.bottom + MARGEN
    ) {
      this.desactivar();
    }
  }
}
