import Phaser from 'phaser';
import { ANCHO, ALTO } from '../config.js';
import Storage from '../systems/Storage.js';
import Sonido from '../systems/Sonido.js';
import { crearTexto, crearBoton } from '../systems/Interfaz.js';
import { esDispositivoTactil } from '../systems/TouchControls.js';
import { nivelHistoria } from '../systems/Mapas.js';

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
    const guardada = Storage.obtenerHistoria();
    const nivel = guardada ? nivelHistoria(guardada.nivel) : null;
    if (!nivel) {
      crearBoton(this, ANCHO / 2, y, 'Modo historia', () => this.iniciarHistoria(null), ANCHO_BOTON, ALTO_BOTON);
      return;
    }
    const texto = 'Continuar historia ' + nivel.mundo + '-' + nivel.numero;
    crearBoton(this, ANCHO / 2, y, texto, () => this.iniciarHistoria(guardada), ANCHO_BOTON, ALTO_BOTON);
    crearBoton(this, ANCHO / 2 + ANCHO_BOTON / 2 + 70, y, 'Nueva', () => {
      Storage.borrarHistoria();
      this.iniciarHistoria(null);
    }, 120, ALTO_BOTON);
  }

  iniciarHistoria(guardada) {
    this.scene.start('Game', {
      modo: 'historia',
      nivel: guardada ? guardada.nivel : 0,
      estado: guardada ? guardada.estado : null,
      puntos: guardada ? guardada.puntos : 0
    });
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
      return 'Mover: joystick (lado izquierdo)\nDisparar: mantén pulsado el lado derecho (apunta solo)\nHabilidades: botones E, Q (oleada 4) y R (oleada 8)';
    }
    return 'Mover: WASD o flechas   ·   Apuntar: mouse\nDisparar: clic izquierdo (mantener)   ·   Pausa: P o Esc\nHabilidades: E   ·   Q (oleada 4)   ·   R (oleada 8)';
  }

  jugar() {
    this.scene.start('Game', { modo: 'supervivencia' });
  }
}
