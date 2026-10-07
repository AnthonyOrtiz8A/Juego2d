import { ALTO, ARMAS } from '../config.js';
import { crearTexto } from './Interfaz.js';

const PROFUNDIDAD = 31;

export default class HudArmas {
  constructor(scene) {
    this.scene = scene;
    this.previo = '';
    this.ranuras = [0, 1].map((i) => crearTexto(scene, 16, ALTO - 52 + i * 22, '', 15).setDepth(PROFUNDIDAD));
    this.iconoDedo = scene.add.image(26, 112, 'dedo').setScrollFactor(0).setDepth(PROFUNDIDAD);
    this.textoDedos = crearTexto(scene, 40, 104, '0', 16, '#e8f070').setDepth(PROFUNDIDAD);
    this.partes = [...this.ranuras, this.iconoDedo, this.textoDedos];
    this.mostrar(false);
  }

  mostrar(visible) {
    this.visible = visible;
    this.partes.forEach((parte) => parte.setVisible(visible));
  }

  actualizar(armas, actual, dedos) {
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
        texto.setText(marca + '[' + (i + 1) + '] ' + arma.nombre);
        texto.setColor(i === actual ? '#ffffff' : '#9aa4c7');
      });
      this.textoDedos.setText(String(dedos));
    }
  }
}
