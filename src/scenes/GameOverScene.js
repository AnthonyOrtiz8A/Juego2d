import Phaser from 'phaser';
import { ANCHO, ALTO } from '../config.js';
import Storage from '../systems/Storage.js';
import { crearTexto, crearBoton } from '../systems/Interfaz.js';
import { nivelHistoria, tituloNivel } from '../systems/Mapas.js';

const ESPERA_TECLADO_MS = 500;
const ANCHO_BOTON = 300;

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  init(datos) {
    this.puntos = datos.puntos || 0;
    this.oleada = datos.oleada || 1;
    this.red = datos.red || null;
    this.modo = datos.modo || 'supervivencia';
    this.nivel = Number.isInteger(datos.nivel) ? datos.nivel : 0;
    this.victoria = Boolean(datos.victoria);
    this.estado = datos.estado || null;
    this.puntosNivel = datos.puntosNivel || 0;
    this.sys.settings.data = {};
    if (this.red && !this.red.esAnfitrion) {
      this.nuevoRecord = Storage.guardarRecord(this.puntos);
      this.record = Storage.obtenerRecord();
    } else {
      this.nuevoRecord = Boolean(datos.nuevoRecord);
      this.record = datos.record || 0;
    }
  }

  create() {
    this.add.image(ANCHO / 2, ALTO / 2, 'ciudad');
    this.add.rectangle(0, 0, ANCHO, ALTO, 0x000000, 0.6).setOrigin(0);

    const historia = this.modo === 'historia';
    const titulo = this.victoria ? '¡ESCAPASTE!' : 'FIN DEL JUEGO';
    crearTexto(this, ANCHO / 2, 110, titulo, 56, this.victoria ? '#4cd97b' : '#ff4d6d').setOrigin(0.5);
    crearTexto(this, ANCHO / 2, 180, (this.red ? 'Puntos del equipo: ' : 'Puntos: ') + this.puntos, 30).setOrigin(0.5);

    let detalle = 'Oleada alcanzada: ' + this.oleada;
    if (historia) {
      const nivel = nivelHistoria(this.nivel);
      detalle = this.victoria ? 'Cruzaste toda la ciudad y venciste a la Abominación' : 'Caíste en ' + (nivel ? tituloNivel(nivel) : 'la ciudad');
    }
    crearTexto(this, ANCHO / 2, 222, detalle, 18, '#9aa4c7').setOrigin(0.5);
    crearTexto(this, ANCHO / 2, 254, 'Récord: ' + this.record, 20, '#fff27a').setOrigin(0.5);

    if (this.nuevoRecord) {
      const aviso = crearTexto(this, ANCHO / 2, 292, '¡Nuevo récord!', 24, '#fff27a').setOrigin(0.5);
      this.tweens.add({ targets: aviso, alpha: 0.3, duration: 450, yoyo: true, repeat: -1 });
    }

    const esCliente = Boolean(this.red && !this.red.esAnfitrion);
    const botones = this.red ? this.botonesRed(historia) : this.botonesLocales(historia);
    const inicioY = esCliente ? 400 : 350;
    botones.forEach((boton, i) => crearBoton(this, ANCHO / 2, inicioY + i * 60, boton.texto, boton.accion, ANCHO_BOTON));
    if (esCliente) crearTexto(this, ANCHO / 2, 340, 'Esperando al anfitrión…', 18, '#9aa4c7').setOrigin(0.5);

    if (!this.red && !this.victoria) {
      this.time.delayedCall(ESPERA_TECLADO_MS, () => {
        this.input.keyboard.on('keydown-ENTER', () => botones[0].accion());
        this.input.keyboard.on('keydown-SPACE', (evento) => {
          if (!evento.repeat) botones[0].accion();
        });
      });
    }
  }

  datosReintento() {
    return { red: this.red, modo: 'historia', nivel: this.nivel, estado: this.estado, puntos: this.puntosNivel };
  }

  botonesLocales(historia) {
    const menu = { texto: 'Menú principal', accion: () => this.scene.start('Menu') };
    if (!historia) return [{ texto: 'Reintentar', accion: () => this.scene.start('Game', {}) }, menu];
    if (this.victoria) return [menu];
    return [{ texto: 'Reintentar nivel', accion: () => this.scene.start('Game', this.datosReintento()) }, menu];
  }

  botonesRed(historia) {
    const salir = {
      texto: 'Salir',
      accion: () => {
        this.red.cerrar();
        this.scene.start('Menu');
      }
    };
    if (!this.red.esAnfitrion) return [salir];
    const botones = [];
    if (historia && !this.victoria) {
      botones.push({
        texto: 'Reintentar nivel',
        accion: () => {
          this.red.cambiarNivel(this.nivel);
          this.scene.start('Game', this.datosReintento());
        }
      });
    }
    botones.push({
      texto: 'Volver a la sala',
      accion: () => {
        this.red.volverASala();
        this.scene.start('Lobby', { red: this.red });
      }
    });
    botones.push(salir);
    return botones;
  }
}
