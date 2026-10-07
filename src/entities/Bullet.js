import Phaser from 'phaser';
import { BALA } from '../config.js';

const MARGEN = 40;

export default class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'bala');
    this.expiraEn = 0;
    this.danio = BALA.danio;
    this.perforacion = 0;
    this.explosivo = 0;
    this.duenio = null;
    this.ultimoGolpe = null;
  }

  disparar(x, y, angulo, tiempo, velocidad = BALA.velocidad, vidaMs = BALA.vidaMs) {
    this.enableBody(true, x, y, true, true);
    this.danio = BALA.danio;
    this.perforacion = 0;
    this.explosivo = 0;
    this.duenio = null;
    this.ultimoGolpe = null;
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
    const mundo = this.scene.limitesMundo;
    const fuera = this.x < -MARGEN || this.x > mundo.ancho + MARGEN || this.y < -MARGEN || this.y > mundo.alto + MARGEN;
    if (time <= this.expiraEn && !fuera) return;
    if (this.explosivo && this.scene.detonar) this.scene.detonar(this);
    else this.desactivar();
  }
}
