import Phaser from 'phaser';
import { ANCHO, ALTO, COLORES } from '../config.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    const rejilla = this.add.graphics();
    rejilla.lineStyle(1, COLORES.rejilla, 1);
    for (let x = 0; x <= ANCHO; x += 40) rejilla.lineBetween(x, 0, x, ALTO);
    for (let y = 0; y <= ALTO; y += 40) rejilla.lineBetween(0, y, ANCHO, y);

    this.add.text(ANCHO / 2, ALTO / 2, 'Shooter 2D', {
      fontFamily: 'monospace',
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);
  }
}
