import Phaser from 'phaser';
import { ANCHO, ALTO } from '../config.js';
import Storage from '../systems/Storage.js';
import Sonido from '../systems/Sonido.js';
import { crearTexto, crearBoton } from '../systems/Interfaz.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    this.add.image(0, 0, 'fondo').setOrigin(0);

    const titulo = crearTexto(this, ANCHO / 2, 130, 'SHOOTER 2D', 64, '#3ee8ff').setOrigin(0.5);
    this.tweens.add({ targets: titulo, scale: 1.05, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut' });

    crearTexto(this, ANCHO / 2, 195, 'Sobrevive a las oleadas infinitas', 18, '#9aa4c7').setOrigin(0.5);
    crearTexto(this, ANCHO / 2, 240, 'Récord: ' + Storage.obtenerRecord(), 22, '#fff27a').setOrigin(0.5);

    crearBoton(this, ANCHO / 2, 315, 'Jugar', () => this.jugar());
    const botonSonido = crearBoton(this, ANCHO / 2, 380, this.textoSonido(), () => {
      Sonido.alternar();
      botonSonido.etiqueta.setText(this.textoSonido());
    });

    crearTexto(this, ANCHO / 2, 475, this.textoControles(), 16, '#9aa4c7').setOrigin(0.5).setLineSpacing(6);

    this.input.keyboard.on('keydown-ENTER', () => this.jugar());
    this.input.keyboard.on('keydown-SPACE', (evento) => {
      if (!evento.repeat) this.jugar();
    });
  }

  textoSonido() {
    return 'Sonido: ' + (Sonido.activo ? 'SÍ' : 'NO');
  }

  textoControles() {
    return 'Mover: WASD o flechas   ·   Apuntar: mouse\nDisparar: clic izquierdo (mantener)   ·   Pausa: P o Esc';
  }

  jugar() {
    this.scene.start('Game');
  }
}
