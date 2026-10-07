import { ALTO, ARMAS, PASIVAS, MEJORAS, LIMITES } from '../config.js';
import { pasivasEquipadas, mejorasEquipadas, nivelRomano } from './Recompensas.js';
import { crearTexto } from './Interfaz.js';

const PROFUNDIDAD = 31;

export default class HudArmas {
  constructor(scene) {
    this.scene = scene;
    this.previo = '';
    this.ranuras = [0, 1].map((i) => crearTexto(scene, 16, ALTO - 52 + i * 22, '', 15).setDepth(PROFUNDIDAD));
    this.textoPasivas = crearTexto(scene, 16, ALTO - 100, '', 13, '#4cd97b').setDepth(PROFUNDIDAD);
    this.textoMejoras = crearTexto(scene, 16, ALTO - 80, '', 13, '#b36bff').setDepth(PROFUNDIDAD);
    this.iconoDedo = scene.add.image(26, 112, 'dedo').setScrollFactor(0).setDepth(PROFUNDIDAD);
    this.textoDedos = crearTexto(scene, 40, 104, '0', 16, '#e8f070').setDepth(PROFUNDIDAD);
    this.partes = [...this.ranuras, this.textoPasivas, this.textoMejoras, this.iconoDedo, this.textoDedos];
    this.mostrar(false);
  }

  mostrar(visible) {
    this.visible = visible;
    this.partes.forEach((parte) => parte.setVisible(visible));
  }

  actualizar(armas, actual, dedos, pasivas, mejoras) {
    if (!this.visible) return;
    const firma = JSON.stringify([armas, actual, dedos, pasivas, mejoras]);
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
      const listaPasivas = pasivasEquipadas(pasivas).map((id) => PASIVAS[id].nombre);
      const listaMejoras = mejorasEquipadas(mejoras).map((id) => MEJORAS[id].nombre + ' ' + nivelRomano(mejoras[id]));
      this.textoPasivas.setText('Pasivas ' + listaPasivas.length + '/' + LIMITES.pasivas + ': ' + (listaPasivas.join(', ') || '—'));
      this.textoMejoras.setText('Mejoras ' + listaMejoras.length + '/' + LIMITES.mejoras + ': ' + (listaMejoras.join(', ') || '—'));
    }
  }
}
