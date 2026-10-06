import Phaser from 'phaser';
import { ANCHO, ALTO, COLORES, ENEMIGOS, TACTIL, PACMAN } from '../config.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    this.crearTextura('fondo', ANCHO, ALTO, (g) => {
      g.fillStyle(COLORES.fondo, 1);
      g.fillRect(0, 0, ANCHO, ALTO);
      g.lineStyle(1, COLORES.rejilla, 1);
      for (let x = 0; x <= ANCHO; x += 40) g.lineBetween(x + 0.5, 0, x + 0.5, ALTO);
      for (let y = 0; y <= ALTO; y += 40) g.lineBetween(0, y + 0.5, ANCHO, y + 0.5);
    });

    this.crearTextura('celda', 40, 40, (g) => {
      g.fillStyle(COLORES.fondo, 1);
      g.fillRect(0, 0, 40, 40);
      g.lineStyle(1, COLORES.rejilla, 1);
      g.lineBetween(0.5, 0, 0.5, 40);
      g.lineBetween(0, 0.5, 40, 0.5);
    });

    this.crearTextura('bala-enemiga', 12, 12, (g) => {
      g.fillStyle(0xff3b6b, 0.45);
      g.fillCircle(6, 6, 6);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(6, 6, 2.5);
    });

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

    this.crearControlesTactiles();

    this.crearTextura('escudo', 64, 64, (g) => {
      g.fillStyle(0x7dffb0, 0.15);
      g.fillCircle(32, 32, 28);
      g.lineStyle(3, 0x7dffb0, 0.9);
      g.strokeCircle(32, 32, 28);
    });

    this.crearTextura('onda', 132, 132, (g) => {
      g.lineStyle(6, 0xffffff, 1);
      g.strokeCircle(66, 66, 62);
    });

    this.crearPacman();

    this.scene.start('Menu');
  }

  crearPacman() {
    const t = PACMAN.celda;
    const colores = PACMAN.colores;
    const mapa = PACMAN.mapa;
    const columnas = mapa[0].length;
    const filas = mapa.length;
    const esPared = (c, f) => f >= 0 && f < filas && c >= 0 && c < columnas && mapa[f][c] === '#';

    this.crearTextura('laberinto', columnas * t, filas * t, (g) => {
      for (let f = 0; f < filas; f++) {
        for (let c = 0; c < columnas; c++) {
          const x = c * t;
          const y = f * t;
          if (mapa[f][c] === '-') {
            g.fillStyle(colores.puerta, 1);
            g.fillRect(x, y + t / 2 - 2, t, 4);
          }
          if (mapa[f][c] !== '#') continue;
          g.fillStyle(colores.pared, 0.35);
          g.fillRect(x, y, t, t);
          g.lineStyle(2, colores.borde, 1);
          if (!esPared(c, f - 1) && f > 0) g.lineBetween(x, y + 1, x + t, y + 1);
          if (!esPared(c, f + 1) && f < filas - 1) g.lineBetween(x, y + t - 1, x + t, y + t - 1);
          if (!esPared(c - 1, f) && c > 0) g.lineBetween(x + 1, y, x + 1, y + t);
          if (!esPared(c + 1, f) && c < columnas - 1) g.lineBetween(x + t - 1, y, x + t - 1, y + t);
        }
      }
    });

    this.crearTextura('punto', 6, 6, (g) => {
      g.fillStyle(colores.punto, 1);
      g.fillCircle(3, 3, 2.5);
    });

    this.crearTextura('super-punto', 14, 14, (g) => {
      g.fillStyle(colores.punto, 1);
      g.fillCircle(7, 7, 6.5);
    });

    [0, 25, 45].forEach((boca, i) => {
      this.crearTextura('pacman-' + i, 22, 22, (g) => {
        g.fillStyle(colores.pacman, 1);
        if (boca === 0) {
          g.fillCircle(11, 11, 10);
          return;
        }
        g.beginPath();
        g.slice(11, 11, 10, Phaser.Math.DegToRad(boca), Phaser.Math.DegToRad(360 - boca), false);
        g.fillPath();
      });
    });

    PACMAN.fantasmas.forEach((fantasma) => {
      this.crearTextura('fantasma-' + fantasma.nombre, 22, 22, (g) => {
        this.dibujarCuerpoFantasma(g, fantasma.color);
        this.dibujarOjosFantasma(g);
      });
    });

    this.crearTextura('fantasma-asustado', 22, 22, (g) => {
      this.dibujarCuerpoFantasma(g, 0x2a3cff);
      this.dibujarCaraAsustada(g, 0xffd9b0);
    });

    this.crearTextura('fantasma-blanco', 22, 22, (g) => {
      this.dibujarCuerpoFantasma(g, 0xffffff);
      this.dibujarCaraAsustada(g, 0xff3b3b);
    });

    this.crearTextura('ojos', 22, 22, (g) => this.dibujarOjosFantasma(g));
  }

  dibujarCuerpoFantasma(g, color) {
    g.fillStyle(color, 1);
    g.fillCircle(11, 10, 10);
    g.fillRect(1, 10, 20, 8);
    g.fillTriangle(1, 18, 4.5, 22, 8, 18);
    g.fillTriangle(7.5, 18, 11, 22, 14.5, 18);
    g.fillTriangle(14, 18, 17.5, 22, 21, 18);
  }

  dibujarOjosFantasma(g) {
    g.fillStyle(0xffffff, 1);
    g.fillCircle(7, 9, 3.5);
    g.fillCircle(15, 9, 3.5);
    g.fillStyle(0x1b2bd6, 1);
    g.fillCircle(8, 10, 1.8);
    g.fillCircle(16, 10, 1.8);
  }

  dibujarCaraAsustada(g, color) {
    g.fillStyle(color, 1);
    g.fillRect(6, 7, 3, 3);
    g.fillRect(13, 7, 3, 3);
    g.lineStyle(1.5, color, 1);
    g.beginPath();
    g.moveTo(4, 15);
    g.lineTo(6.5, 13);
    g.lineTo(9, 15);
    g.lineTo(11, 13);
    g.lineTo(13, 15);
    g.lineTo(15.5, 13);
    g.lineTo(18, 15);
    g.strokePath();
  }

  crearControlesTactiles() {
    const rj = TACTIL.radioJoystick;
    this.crearTextura('joy-base', rj * 2 + 4, rj * 2 + 4, (g) => {
      g.fillStyle(COLORES.borde, 0.12);
      g.fillCircle(rj + 2, rj + 2, rj);
      g.lineStyle(3, COLORES.borde, 0.8);
      g.strokeCircle(rj + 2, rj + 2, rj);
    });

    const rp = TACTIL.radioPerilla;
    this.crearTextura('joy-perilla', rp * 2 + 4, rp * 2 + 4, (g) => {
      g.fillStyle(COLORES.jugador, 0.9);
      g.fillCircle(rp + 2, rp + 2, rp);
      g.lineStyle(2, COLORES.borde, 1);
      g.strokeCircle(rp + 2, rp + 2, rp);
    });

    const rb = TACTIL.radioBoton;
    const c = rb + 2;
    this.crearTextura('boton-disparo', c * 2, c * 2, (g) => {
      g.fillStyle(0xff4d6d, 0.35);
      g.fillCircle(c, c, rb);
      g.lineStyle(3, COLORES.borde, 0.9);
      g.strokeCircle(c, c, rb);
      g.strokeCircle(c, c, rb * 0.4);
      g.lineBetween(c - rb * 0.75, c, c - rb * 0.2, c);
      g.lineBetween(c + rb * 0.2, c, c + rb * 0.75, c);
      g.lineBetween(c, c - rb * 0.75, c, c - rb * 0.2);
      g.lineBetween(c, c + rb * 0.2, c, c + rb * 0.75);
    });
  }

  crearEnemigos() {
    const { normal, rapido, tanque, tirador } = ENEMIGOS.tipos;

    const lti = tirador.radio + 8;
    this.crearTextura('enemigo-tirador', lti * 2, lti * 2, (g) => {
      g.fillStyle(COLORES.borde, 0.9);
      g.fillRect(lti, lti - 3, tirador.radio + 7, 6);
      g.fillStyle(tirador.color, 1);
      g.fillRect(lti - tirador.radio, lti - tirador.radio, tirador.radio * 2, tirador.radio * 2);
      g.lineStyle(2, COLORES.borde, 0.9);
      g.strokeRect(lti - tirador.radio, lti - tirador.radio, tirador.radio * 2, tirador.radio * 2);
      g.fillStyle(0x000000, 0.5);
      g.fillCircle(lti, lti, 4);
    });

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
