import Phaser from 'phaser';
import { ANCHO, ALTO } from '../config.js';
import Storage from '../systems/Storage.js';
import Sonido from '../systems/Sonido.js';
import { crearTexto, crearBoton } from '../systems/Interfaz.js';
import { esDispositivoTactil } from '../systems/TouchControls.js';

const ALTO_BOTON = 42;
const ANCHO_BOTON = 300;
let pantallaCompletaIntentada = false;

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  init(datos) {
    this.aviso = datos && datos.aviso ? datos.aviso : '';
    this.sys.settings.data = {};
  }

  create() {
    this.add.image(ANCHO / 2, ALTO / 2, 'ciudad');
    this.add.rectangle(0, 0, ANCHO, ALTO, 0x000000, 0.55).setOrigin(0);

    const titulo = crearTexto(this, ANCHO / 2, 110, 'SHOOTER 2D', 64, '#3ee8ff').setOrigin(0.5);
    this.tweens.add({ targets: titulo, scale: 1.05, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut' });

    crearTexto(this, ANCHO / 2, 168, 'Sobrevive a las oleadas infinitas', 18, '#9aa4c7').setOrigin(0.5);
    crearTexto(this, ANCHO / 2, 205, 'Récord: ' + Storage.obtenerRecord(), 22, '#fff27a').setOrigin(0.5);

    crearBoton(this, ANCHO / 2, 252, 'Supervivencia', () => this.jugar(), ANCHO_BOTON, ALTO_BOTON);
    this.crearBotonHistoria(300);
    crearBoton(this, ANCHO / 2, 348, 'Multijugador', () => this.scene.start('Lobby'), ANCHO_BOTON, ALTO_BOTON);
    crearBoton(this, ANCHO / 2, 396, 'Minijuego: Pac-Man', () => this.scene.start('Pacman'), ANCHO_BOTON, ALTO_BOTON);
    const botonSonido = crearBoton(this, ANCHO / 2, 444, this.textoSonido(), () => {
      Sonido.alternar();
      botonSonido.etiqueta.setText(this.textoSonido());
    }, ANCHO_BOTON, ALTO_BOTON);

    crearTexto(this, ANCHO / 2, 528, this.textoControles(), 15, '#9aa4c7').setOrigin(0.5).setLineSpacing(5);
    if (this.aviso) crearTexto(this, ANCHO / 2, 578, this.aviso, 16, '#ff4d6d').setOrigin(0.5);

    this.crearPantallaCompleta();

    this.input.keyboard.on('keydown-ENTER', () => this.jugar());
    this.input.keyboard.on('keydown-SPACE', (evento) => {
      if (!evento.repeat) this.jugar();
    });
  }

  crearBotonHistoria(y) {
    crearBoton(this, ANCHO / 2, y, 'Modo historia', () => this.scene.start('Personajes', { modo: 'historia', nivel: 0 }), ANCHO_BOTON, ALTO_BOTON);
  }

  crearPantallaCompleta() {
    if (!this.scale.fullscreen.available) return;
    const boton = crearBoton(this, ANCHO - 130, 30, this.textoPantallaCompleta(), () => this.scale.toggleFullscreen(), 236, 40);
    const actualizar = () => boton.etiqueta.setText(this.textoPantallaCompleta());
    this.scale.on(Phaser.Scale.Events.ENTER_FULLSCREEN, actualizar);
    this.scale.on(Phaser.Scale.Events.LEAVE_FULLSCREEN, actualizar);
    this.events.once('shutdown', () => {
      this.scale.off(Phaser.Scale.Events.ENTER_FULLSCREEN, actualizar);
      this.scale.off(Phaser.Scale.Events.LEAVE_FULLSCREEN, actualizar);
    });

    if (!pantallaCompletaIntentada && esDispositivoTactil(this.game) && !this.scale.isFullscreen) {
      this.input.once('pointerup', () => {
        pantallaCompletaIntentada = true;
        if (!this.scale.isFullscreen) this.scale.startFullscreen();
      });
    }
  }

  textoPantallaCompleta() {
    return this.scale.isFullscreen ? 'Ventana' : 'Pantalla completa';
  }

  textoSonido() {
    return 'Sonido: ' + (Sonido.activo ? 'SÍ' : 'NO');
  }

  textoControles() {
    if (esDispositivoTactil(this.game)) {
      return 'Mover: joystick (lado izquierdo)   ·   Disparar: lado derecho (apunta solo)\nHabilidades: botones E, Q y C   ·   Ulti: botón ULTI   ·   Historia: ARMA y F';
    }
    return 'Mover: WASD   ·   Apuntar: mouse   ·   Disparar: clic   ·   Pausa: P o Esc\nHabilidades: E, Q y C   ·   Ulti: R   ·   Reanimar: V   ·   Arma: X o rueda   ·   Usar: F';
  }

  jugar() {
    this.scene.start('Personajes', { modo: 'supervivencia' });
  }
}
