import Phaser from 'phaser';
import { ANCHO, ALTO, COLORES } from '../config.js';
import Player from '../entities/Player.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    this.dibujarFondo();
    this.jugador = new Player(this, ANCHO / 2, ALTO / 2);
    this.teclas = this.input.keyboard.addKeys('W,A,S,D,UP,LEFT,DOWN,RIGHT');
  }

  dibujarFondo() {
    const rejilla = this.add.graphics();
    rejilla.lineStyle(1, COLORES.rejilla, 1);
    for (let x = 0; x <= ANCHO; x += 40) rejilla.lineBetween(x, 0, x, ALTO);
    for (let y = 0; y <= ALTO; y += 40) rejilla.lineBetween(0, y, ANCHO, y);
  }

  update() {
    const t = this.teclas;
    const dx = (t.D.isDown || t.RIGHT.isDown ? 1 : 0) - (t.A.isDown || t.LEFT.isDown ? 1 : 0);
    const dy = (t.S.isDown || t.DOWN.isDown ? 1 : 0) - (t.W.isDown || t.UP.isDown ? 1 : 0);
    this.jugador.mover(dx, dy);

    const puntero = this.input.mousePointer;
    this.jugador.apuntarA(puntero.x, puntero.y);
  }
}
