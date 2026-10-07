import Phaser from 'phaser';
import { ANCHO, ALTO, PERSONAJES, ENERGIA } from '../config.js';
import Storage from '../systems/Storage.js';
import { IDS_PERSONAJE, personajeValido } from '../systems/Personajes.js';
import { crearTexto, crearBoton } from '../systems/Interfaz.js';

const COLUMNAS = 4;
const ALTO_TARJETA = 150;
const FILAS_Y = [160, 320];
const COLOR_TARJETA = 0x1d2442;
const COLOR_ELEGIDA = 0x2c3766;

function enLinea(texto) {
  return texto.split('\n').join(' ');
}

export default class PersonajesScene extends Phaser.Scene {
  constructor() {
    super('Personajes');
  }

  init(datos) {
    const entrada = datos || {};
    this.modo = entrada.modo || 'supervivencia';
    this.nivel = Number.isInteger(entrada.nivel) ? entrada.nivel : 0;
    this.sys.settings.data = {};
  }

  create() {
    this.add.image(ANCHO / 2, ALTO / 2, 'ciudad');
    this.add.rectangle(0, 0, ANCHO, ALTO, 0x000000, 0.7).setOrigin(0);
    crearTexto(this, ANCHO / 2, 22, 'ELIGE TU PERSONAJE', 30, '#3ee8ff').setOrigin(0.5, 0);
    crearTexto(this, ANCHO / 2, 60, this.modo === 'historia' ? 'Modo historia' : 'Supervivencia', 15, '#9aa4c7').setOrigin(0.5, 0);

    const anchoTarjeta = Math.min(200, (ANCHO - 60) / COLUMNAS - 12);
    const inicioX = ANCHO / 2 - ((anchoTarjeta + 12) * (COLUMNAS - 1)) / 2;
    this.tarjetas = IDS_PERSONAJE.map((id, i) => {
      const x = inicioX + (i % COLUMNAS) * (anchoTarjeta + 12);
      const y = FILAS_Y[Math.floor(i / COLUMNAS)];
      const datos = PERSONAJES[id];
      const fondo = this.add.rectangle(x, y, anchoTarjeta, ALTO_TARJETA, COLOR_TARJETA, 0.92).setStrokeStyle(2, 0x3a4470, 1).setInteractive({ useHandCursor: true });
      fondo.on('pointerdown', () => this.elegir(i));
      const sprite = this.add.image(x, y - 28, 'jugador-' + id).setScale(1.7).setAngle(-90);
      crearTexto(this, x, y + 32, datos.nombre, 18).setOrigin(0.5);
      crearTexto(this, x, y + 54, datos.rol, 13, '#9aa4c7').setOrigin(0.5);
      return { id, fondo, sprite };
    });

    const panelY = 405;
    this.add.rectangle(ANCHO / 2, panelY + 50, Math.min(ANCHO - 40, 4 * (anchoTarjeta + 12)), 112, 0x0f1428, 0.92).setStrokeStyle(2, 0x3a4470, 1);
    this.titulo = crearTexto(this, ANCHO / 2, panelY, '', 20, '#fff27a').setOrigin(0.5, 0);
    this.textoPasiva = crearTexto(this, ANCHO / 2, panelY + 30, '', 14, '#4cd97b').setOrigin(0.5, 0);
    this.textoUlti = crearTexto(this, ANCHO / 2, panelY + 54, '', 14, '#bfe9ff').setOrigin(0.5, 0).setAlign('center');

    crearBoton(this, ANCHO / 2 - 130, ALTO - 36, 'Volver', () => this.scene.start('Menu'), 200, 44);
    crearBoton(this, ANCHO / 2 + 130, ALTO - 36, '¡Jugar!', () => this.jugar(), 200, 44);

    this.indice = Math.max(0, IDS_PERSONAJE.indexOf(personajeValido(Storage.obtenerPersonaje())));
    this.elegir(this.indice);

    const teclado = this.input.keyboard;
    teclado.on('keydown-LEFT', () => this.mover(-1));
    teclado.on('keydown-A', () => this.mover(-1));
    teclado.on('keydown-RIGHT', () => this.mover(1));
    teclado.on('keydown-D', () => this.mover(1));
    teclado.on('keydown-UP', () => this.mover(-COLUMNAS));
    teclado.on('keydown-W', () => this.mover(-COLUMNAS));
    teclado.on('keydown-DOWN', () => this.mover(COLUMNAS));
    teclado.on('keydown-S', () => this.mover(COLUMNAS));
    teclado.on('keydown-ENTER', () => this.jugar());
    teclado.on('keydown-SPACE', (evento) => {
      if (!evento.repeat) this.jugar();
    });
    teclado.on('keydown-ESC', () => this.scene.start('Menu'));
  }

  mover(paso) {
    this.elegir(Phaser.Math.Wrap(this.indice + paso, 0, IDS_PERSONAJE.length));
  }

  elegir(indice) {
    this.indice = indice;
    this.tarjetas.forEach((tarjeta, i) => {
      const elegida = i === indice;
      tarjeta.fondo.setFillStyle(elegida ? COLOR_ELEGIDA : COLOR_TARJETA, 0.92).setStrokeStyle(elegida ? 3 : 2, elegida ? 0xfff27a : 0x3a4470, 1);
      this.tweens.killTweensOf(tarjeta.sprite);
      tarjeta.sprite.setScale(1.7);
      if (elegida) this.tweens.add({ targets: tarjeta.sprite, scale: 1.95, duration: 380, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    });
    const datos = PERSONAJES[IDS_PERSONAJE[indice]];
    const ulti = datos.ulti;
    this.titulo.setText(datos.nombre + ' · ' + datos.rol);
    this.textoPasiva.setText('Pasiva de equipo: ' + enLinea(datos.pasiva.texto.replace('Equipo: ', '')));
    this.textoUlti.setText(
      'Ulti: ' + ulti.nombre + ' — ' + enLinea(ulti.texto) +
      '\nCuesta ' + ulti.costo + '/' + ENERGIA.maximo + ' de energía · Enfriamiento ' + Math.round(ulti.enfriamientoMs / 1000) + 's'
    );
  }

  jugar() {
    const id = IDS_PERSONAJE[this.indice];
    Storage.guardarPersonaje(id);
    this.scene.start('Game', { modo: this.modo, nivel: this.nivel, personaje: id });
  }
}
