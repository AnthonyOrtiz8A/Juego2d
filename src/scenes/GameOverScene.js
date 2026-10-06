import Phaser from 'phaser';
import { ANCHO } from '../config.js';
import { crearTexto, crearBoton } from '../systems/Interfaz.js';

const ESPERA_TECLADO_MS = 500;

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  init(datos) {
    this.puntos = datos.puntos || 0;
    this.record = datos.record || 0;
    this.nuevoRecord = Boolean(datos.nuevoRecord);
    this.oleada = datos.oleada || 1;
  }

  create() {
    this.add.image(0, 0, 'fondo').setOrigin(0);
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.45).setOrigin(0);

    crearTexto(this, ANCHO / 2, 120, 'FIN DEL JUEGO', 56, '#ff4d6d').setOrigin(0.5);
    crearTexto(this, ANCHO / 2, 200, 'Puntos: ' + this.puntos, 30).setOrigin(0.5);
    crearTexto(this, ANCHO / 2, 242, 'Oleada alcanzada: ' + this.oleada, 20, '#9aa4c7').setOrigin(0.5);
    crearTexto(this, ANCHO / 2, 276, 'Récord: ' + this.record, 20, '#fff27a').setOrigin(0.5);

    if (this.nuevoRecord) {
      const aviso = crearTexto(this, ANCHO / 2, 320, '¡Nuevo récord!', 26, '#fff27a').setOrigin(0.5);
      this.tweens.add({ targets: aviso, alpha: 0.3, duration: 450, yoyo: true, repeat: -1 });
    }

    crearBoton(this, ANCHO / 2, 395, 'Reintentar', () => this.scene.start('Game'));
    crearBoton(this, ANCHO / 2, 460, 'Menú principal', () => this.scene.start('Menu'));

    this.time.delayedCall(ESPERA_TECLADO_MS, () => {
      this.input.keyboard.on('keydown-ENTER', () => this.scene.start('Game'));
      this.input.keyboard.on('keydown-SPACE', (evento) => {
        if (!evento.repeat) this.scene.start('Game');
      });
    });
  }
}
