import Phaser from 'phaser';
import { COLORES, ENEMIGOS } from '../config.js';

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

    this.crearEnemigos();

    this.crearTextura('particula', 6, 6, (g) => {
      g.fillStyle(0xffffff, 1);
      g.fillRect(0, 0, 6, 6);
    });

    this.scene.start('Game');
  }

  crearEnemigos() {
    const { normal, rapido, tanque } = ENEMIGOS.tipos;

    const ln = normal.radio + 3;
    this.crearTextura('enemigo-normal', ln * 2, ln * 2, (g) => {
      g.fillStyle(normal.color, 1);
      g.fillCircle(ln, ln, normal.radio);
      g.lineStyle(2, COLORES.borde, 0.9);
      g.strokeCircle(ln, ln, normal.radio);
      g.fillStyle(0x000000, 0.45);
      g.fillCircle(ln + 4, ln, 4);
    });

    const lr = rapido.radio + 3;
    this.crearTextura('enemigo-rapido', lr * 2, lr * 2, (g) => {
      g.fillStyle(rapido.color, 1);
      g.lineStyle(2, COLORES.borde, 0.9);
      g.beginPath();
      g.moveTo(lr * 2 - 2, lr);
      g.lineTo(2, 2);
      g.lineTo(lr * 0.6, lr);
      g.lineTo(2, lr * 2 - 2);
      g.closePath();
      g.fillPath();
      g.strokePath();
    });

    const lt = tanque.radio + 3;
    this.crearTextura('enemigo-tanque', lt * 2, lt * 2, (g) => {
      const puntos = [];
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i;
        puntos.push({ x: lt + Math.cos(a) * tanque.radio, y: lt + Math.sin(a) * tanque.radio });
      }
      g.fillStyle(tanque.color, 1);
      g.fillPoints(puntos, true);
      g.lineStyle(3, COLORES.borde, 0.9);
      g.strokePoints(puntos, true);
      g.fillStyle(0x000000, 0.35);
      g.fillCircle(lt, lt, tanque.radio * 0.45);
    });
  }

  crearTextura(clave, ancho, alto, dibujar) {
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    dibujar(g);
    g.generateTexture(clave, ancho, alto);
    g.destroy();
  }
}
