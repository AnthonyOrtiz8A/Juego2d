import { ANCHO, ALTO, ENERGIA } from '../config.js';
import { datosPersonaje } from './Personajes.js';
import { crearTexto } from './Interfaz.js';

const PROFUNDIDAD = 41;
const ANCHO_BARRA = 240;
const RADIO_BOTON = 38;
const COLOR_ENERGIA = 0x3ea8ff;
const COLOR_LISTA = 0xfff27a;
const COLOR_ACTIVA = 0xff7a1a;

export default class HudUlti {
  constructor(scene, personajeId, modoTactil, alPulsar) {
    this.scene = scene;
    this.ulti = datosPersonaje(personajeId).ulti;
    this.modoTactil = modoTactil;
    this.visible = true;
    this.firma = '';
    const y = ALTO - 18;
    this.fondo = scene.add.rectangle(ANCHO / 2, y, ANCHO_BARRA + 6, 16, 0x000000, 0.7).setScrollFactor(0).setDepth(PROFUNDIDAD);
    this.barra = scene.add.rectangle(ANCHO / 2 - ANCHO_BARRA / 2, y, 0, 10, COLOR_ENERGIA, 1).setOrigin(0, 0.5).setScrollFactor(0).setDepth(PROFUNDIDAD + 1);
    this.recarga = scene.add.rectangle(ANCHO / 2 - ANCHO_BARRA / 2, y + 7, 0, 3, 0xffffff, 0.8).setOrigin(0, 0.5).setScrollFactor(0).setDepth(PROFUNDIDAD + 2);
    this.texto = crearTexto(scene, ANCHO / 2, y - 22, '', 14, '#bfe9ff').setOrigin(0.5).setDepth(PROFUNDIDAD + 1);

    const bx = ANCHO - 330;
    const by = ALTO - 140;
    this.boton = scene.add.circle(bx, by, RADIO_BOTON, 0x1d2442, 0.9).setStrokeStyle(3, COLOR_ENERGIA, 1).setScrollFactor(0).setDepth(PROFUNDIDAD).setInteractive();
    this.boton.on('pointerdown', () => alPulsar());
    this.etiquetaBoton = crearTexto(scene, bx, by - 8, 'ULTI', 16, '#fff27a').setOrigin(0.5).setDepth(PROFUNDIDAD + 1);
    this.detalleBoton = crearTexto(scene, bx, by + 12, '', 13).setOrigin(0.5).setDepth(PROFUNDIDAD + 1);
    this.pulso = scene.tweens.add({ targets: this.boton, scale: 1.1, duration: 400, yoyo: true, repeat: -1, paused: true });
    this.refrescar();
  }

  cambiarModo(modoTactil) {
    this.modoTactil = modoTactil;
    this.firma = '';
    this.refrescar();
  }

  mostrar(visible) {
    this.visible = visible;
    this.refrescar();
  }

  refrescar() {
    [this.fondo, this.barra, this.recarga, this.texto].forEach((parte) => parte.setVisible(this.visible));
    const boton = this.visible && this.modoTactil;
    [this.boton, this.etiquetaBoton, this.detalleBoton].forEach((parte) => parte.setVisible(boton));
    this.boton.input.enabled = boton;
  }

  actualizar(energia, restanteMs, activaMs = 0, activaTotal = 1, enfriamientoTotal = 1) {
    if (!this.visible) return;
    const cantidad = Math.floor(Math.min(energia, ENERGIA.maximo));
    const segundos = Math.ceil(Math.max(0, restanteMs) / 1000);
    const activa = activaMs > 0;
    const lista = cantidad >= this.ulti.costo && segundos === 0;
    this.recarga.setSize(segundos > 0 ? ANCHO_BARRA * Math.min(1, restanteMs / Math.max(1, enfriamientoTotal)) : 0, 3);
    if (activa) {
      this.barra.setSize(ANCHO_BARRA * Math.min(1, activaMs / Math.max(1, activaTotal)), 10).setFillStyle(COLOR_ACTIVA, 1);
    }
    const firma = cantidad + '|' + segundos + '|' + (activa ? Math.ceil(activaMs / 100) : -1);
    if (firma === this.firma) return;
    this.firma = firma;
    if (!activa) this.barra.setSize(ANCHO_BARRA * (cantidad / ENERGIA.maximo), 10).setFillStyle(lista ? COLOR_LISTA : COLOR_ENERGIA, 1);
    const tecla = this.modoTactil ? '' : '[R] ';
    let estado = cantidad + '/' + ENERGIA.maximo;
    if (segundos > 0) estado += ' · recarga ' + segundos + 's';
    if (lista) estado = '¡LISTA!';
    if (activa) estado = 'ACTIVA ' + (activaMs / 1000).toFixed(1) + 's';
    this.texto.setText(tecla + this.ulti.nombre + ' · ' + estado).setColor(activa ? '#ffb070' : lista ? '#fff27a' : '#bfe9ff');
    this.detalleBoton.setText(segundos > 0 ? segundos + 's' : Math.floor((cantidad / this.ulti.costo) * 100) + '%');
    this.boton.setStrokeStyle(3, lista ? COLOR_LISTA : COLOR_ENERGIA, 1).setFillStyle(lista ? 0x3a3a1d : 0x1d2442, 0.9);
    if (lista && this.pulso.isPaused()) this.pulso.resume();
    if (!lista && !this.pulso.isPaused()) {
      this.pulso.pause();
      this.boton.setScale(1);
    }
  }
}
