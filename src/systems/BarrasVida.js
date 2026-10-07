import Phaser from 'phaser';
import { crearTexto } from './Interfaz.js';

const ANCHO_CABEZA = 40;
const ALTURA_CABEZA = 32;
const ANCHO_HUD = 150;
const PROFUNDIDAD_HUD = 30;
const COLOR_ARMADURA = 0x3ea8ff;

function colorVida(proporcion) {
  if (proporcion > 0.5) return 0x4cd97b;
  if (proporcion > 0.25) return 0xf2c12e;
  return 0xe63946;
}

export class BarraJugador {
  constructor(scene) {
    this.fondo = scene.add.rectangle(0, 0, ANCHO_CABEZA + 2, 10, 0x000000, 0.7).setDepth(12);
    this.armadura = scene.add.rectangle(0, 0, ANCHO_CABEZA, 3, COLOR_ARMADURA, 1).setOrigin(0, 0.5).setDepth(13);
    this.vida = scene.add.rectangle(0, 0, ANCHO_CABEZA, 4, 0x4cd97b, 1).setOrigin(0, 0.5).setDepth(13);
    this.partes = [this.fondo, this.armadura, this.vida];
    this.visible = true;
  }

  actualizar(x, y, vidas, vidasMax, armadura, armaduraMax, visible) {
    if (visible !== this.visible) {
      this.visible = visible;
      this.partes.forEach((parte) => parte.setVisible(visible));
    }
    if (!visible) return;
    const arriba = y - ALTURA_CABEZA;
    const izquierda = x - ANCHO_CABEZA / 2;
    const proporcion = Phaser.Math.Clamp(vidas / Math.max(1, vidasMax), 0, 1);
    this.fondo.setPosition(x, arriba);
    this.armadura.setPosition(izquierda, arriba - 2.5).setSize(ANCHO_CABEZA * Phaser.Math.Clamp(armadura / Math.max(1, armaduraMax), 0, 1), 3);
    this.armadura.setVisible(armaduraMax > 0);
    this.vida.setPosition(izquierda, arriba + 1.5).setSize(ANCHO_CABEZA * proporcion, 4).setFillStyle(colorVida(proporcion), 1);
  }

  destruir() {
    this.partes.forEach((parte) => parte.destroy());
  }
}

export class HudVida {
  constructor(scene) {
    this.firma = '';
    this.filas = [
      this.crearFila(scene, 72, 'corazon', 0xe63946),
      this.crearFila(scene, 94, 'icono-armadura', COLOR_ARMADURA)
    ];
  }

  crearFila(scene, y, icono, color) {
    const imagen = scene.add.image(26, y, icono).setScrollFactor(0).setDepth(PROFUNDIDAD_HUD);
    const fondo = scene.add.rectangle(42, y, ANCHO_HUD + 4, 16, 0x000000, 0.7).setOrigin(0, 0.5).setScrollFactor(0).setDepth(PROFUNDIDAD_HUD);
    const barra = scene.add.rectangle(44, y, ANCHO_HUD, 12, color, 1).setOrigin(0, 0.5).setScrollFactor(0).setDepth(PROFUNDIDAD_HUD);
    const texto = crearTexto(scene, 42 + ANCHO_HUD / 2 + 2, y, '', 12).setOrigin(0.5).setDepth(PROFUNDIDAD_HUD);
    return { imagen, fondo, barra, texto, color };
  }

  actualizar(vidas, vidasMax, armadura, armaduraMax, vivo) {
    const v = vivo ? Math.max(0, vidas) : 0;
    const a = vivo ? Math.max(0, armadura) : 0;
    const firma = v + '|' + vidasMax + '|' + a + '|' + armaduraMax;
    if (firma === this.firma) return;
    this.firma = firma;
    const [vida, escudo] = this.filas;
    const proporcion = Phaser.Math.Clamp(v / Math.max(1, vidasMax), 0, 1);
    vida.barra.setSize(ANCHO_HUD * proporcion, 12).setFillStyle(colorVida(proporcion), 1);
    vida.texto.setText(v + ' / ' + vidasMax);
    escudo.barra.setSize(ANCHO_HUD * Phaser.Math.Clamp(a / Math.max(1, armaduraMax), 0, 1), 12);
    escudo.texto.setText(a + ' / ' + armaduraMax);
  }
}
