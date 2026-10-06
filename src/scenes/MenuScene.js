import Phaser from 'phaser';
import { ANCHO, ALTO } from '../config.js';
import Storage from '../systems/Storage.js';
import Sonido from '../systems/Sonido.js';
import { crearTexto, crearBoton } from '../systems/Interfaz.js';
import { esDispositivoTactil } from '../systems/TouchControls.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    this.add.image(ANCHO / 2, ALTO / 2, 'ciudad');
    this.add.rectangle(0, 0, ANCHO, ALTO, 0x000000, 0.55).setOrigin(0);

    const titulo = crearTexto(this, ANCHO / 2, 130, 'SHOOTER 2D', 64, '#3ee8ff').setOrigin(0.5);
    this.tweens.add({ targets: titulo, scale: 1.05, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut' });

    crearTexto(this, ANCHO / 2, 195, 'Sobrevive a las oleadas infinitas', 18, '#9aa4c7').setOrigin(0.5);
    crearTexto(this, ANCHO / 2, 240, 'Récord: ' + Storage.obtenerRecord(), 22, '#fff27a').setOrigin(0.5);

    crearBoton(this, ANCHO / 2, 300, 'Jugar', () => this.jugar());
    crearBoton(this, ANCHO / 2, 362, 'Minijuego: Pac-Man', () => this.scene.start('Pacman'), 280);
    const botonSonido = crearBoton(this, ANCHO / 2, 424, this.textoSonido(), () => {
      Sonido.alternar();
      botonSonido.etiqueta.setText(this.textoSonido());
    });

    crearTexto(this, ANCHO / 2, 525, this.textoControles(), 16, '#9aa4c7').setOrigin(0.5).setLineSpacing(6);

    this.input.keyboard.on('keydown-ENTER', () => this.jugar());
    this.input.keyboard.on('keydown-SPACE', (evento) => {
      if (!evento.repeat) this.jugar();
    });
  }

  textoSonido() {
    return 'Sonido: ' + (Sonido.activo ? 'SÍ' : 'NO');
  }

  textoControles() {
    if (esDispositivoTactil(this.game)) {
      return 'Mover: joystick (lado izquierdo)\nDisparar: mantén pulsado el lado derecho (apunta solo)\nHabilidades: botones E, Q (oleada 4) y R (oleada 8)';
    }
    return 'Mover: WASD o flechas   ·   Apuntar: mouse\nDisparar: clic izquierdo (mantener)   ·   Pausa: P o Esc\nHabilidades: E   ·   Q (oleada 4)   ·   R (oleada 8)';
  }

  jugar() {
    this.scene.start('Game');
  }
}
