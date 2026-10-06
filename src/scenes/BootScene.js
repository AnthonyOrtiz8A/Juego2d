import Phaser from 'phaser';
import { COLORES } from '../config.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    this.crearTextura('jugador', 36, 36, (g) => {
      g.fillStyle(COLORES.jugador, 1);
      g.lineStyle(2, COLORES.borde, 1);
      g.beginPath();
      g.moveTo(34, 18);
      g.lineTo(4, 4);
      g.lineTo(11, 18);
      g.lineTo(4, 32);
      g.closePath();
      g.fillPath();
      g.strokePath();
    });

    this.crearTextura('bala', 10, 10, (g) => {
      g.fillStyle(COLORES.bala, 0.35);
      g.fillCircle(5, 5, 5);
      g.fillStyle(COLORES.bala, 1);
      g.fillCircle(5, 5, 3);
    });

    this.scene.start('Game');
  }

  crearTextura(clave, ancho, alto, dibujar) {
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    dibujar(g);
    g.generateTexture(clave, ancho, alto);
    g.destroy();
  }
}
