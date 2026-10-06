import Phaser from 'phaser';
import { ANCHO, ALTO, BALA } from '../config.js';

const MARGEN = 20;

export default class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'bala');
    this.expiraEn = 0;
    this.danio = BALA.danio;
  }

  disparar(x, y, angulo, tiempo) {
    this.enableBody(true, x, y, true, true);
    this.rotation = angulo;
    this.scene.physics.velocityFromRotation(angulo, BALA.velocidad, this.body.velocity);
    this.expiraEn = tiempo + BALA.vidaMs;
  }

  desactivar() {
    this.disableBody(true, true);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (!this.active) return;
    if (time > this.expiraEn || this.x < -MARGEN || this.x > ANCHO + MARGEN || this.y < -MARGEN || this.y > ALTO + MARGEN) {
      this.desactivar();
    }
  }
}
