import { ALTO, ARMAS } from '../config.js';
import { crearTexto } from './Interfaz.js';

const PROFUNDIDAD = 31;
const ANCHO_BARRA = 150;

export default class HudArmas {
  constructor(scene) {
    this.scene = scene;
    this.previo = '';
    this.ranuras = [0, 1].map((i) => crearTexto(scene, 16, ALTO - 62 + i * 22, '', 15).setDepth(PROFUNDIDAD));
    this.barraFondo = scene.add.rectangle(16, ALTO - 16, ANCHO_BARRA, 6, 0x000000, 0.7).setOrigin(0, 0.5).setScrollFactor(0).setDepth(PROFUNDIDAD);
    this.barra = scene.add.rectangle(16, ALTO - 16, ANCHO_BARRA, 6, 0xfff27a, 1).setOrigin(0, 0.5).setScrollFactor(0).setDepth(PROFUNDIDAD);
    this.iconoDedo = scene.add.image(26, 112, 'dedo').setScrollFactor(0).setDepth(PROFUNDIDAD);
    this.textoDedos = crearTexto(scene, 40, 104, '0', 16, '#e8f070').setDepth(PROFUNDIDAD);
    this.partes = [...this.ranuras, this.barraFondo, this.barra, this.iconoDedo, this.textoDedos];
    this.mostrar(false);
  }

  mostrar(visible) {
    this.visible = visible;
    this.partes.forEach((parte) => parte.setVisible(visible));
    if (visible) this.barraFondo.setVisible(false);
    if (visible) this.barra.setVisible(false);
  }

  actualizar(armas, actual, recarga, dedos) {
    if (!this.visible) return;
    const firma = JSON.stringify([armas, actual, dedos]);
    if (firma !== this.previo) {
      this.previo = firma;
      armas.forEach((ranura, i) => {
        const texto = this.ranuras[i];
        if (!ranura) {
          texto.setText('[' + (i + 1) + '] vacía').setColor('#5a6080');
          return;
        }
        const arma = ARMAS[ranura.id];
        const marca = i === actual ? '▶ ' : '  ';
        texto.setText(marca + '[' + (i + 1) + '] ' + arma.nombre + '  ' + ranura.balas + '/' + arma.cargador);
        texto.setColor(i === actual ? '#ffffff' : '#9aa4c7');
      });
      this.textoDedos.setText(String(dedos));
    }
    const recargando = recarga > 0;
    this.barraFondo.setVisible(recargando);
    this.barra.setVisible(recargando);
    if (recargando) this.barra.setSize(ANCHO_BARRA * (1 - recarga), 6);
  }
}
