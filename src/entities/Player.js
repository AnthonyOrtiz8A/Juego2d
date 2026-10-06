import Phaser from 'phaser';
import { JUGADOR } from '../config.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'jugador');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setCircle(JUGADOR.radio, this.width / 2 - JUGADOR.radio, this.height / 2 - JUGADOR.radio);
    this.setCollideWorldBounds(true);
    this.setDepth(10);
    this.vidas = JUGADOR.vidas;
    this.invulnerableHasta = 0;
    this.proximoDisparo = 0;
  }

  mover(dx, dy) {
    const largo = Math.hypot(dx, dy);
    if (largo > 1) {
      dx /= largo;
      dy /= largo;
    }
    this.body.setVelocity(dx * JUGADOR.velocidad, dy * JUGADOR.velocidad);
  }

  apuntarA(x, y) {
    this.rotation = Math.atan2(y - this.y, x - this.x);
  }
}
