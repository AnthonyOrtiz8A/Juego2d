import { ANCHO, ALTO } from '../config.js';
import { crearTexto } from './Interfaz.js';

const PROFUNDIDAD = 41;
const BOTONES = {
  cambiar: { x: ANCHO - 40, y: ALTO - 215, texto: 'ARMA', ancho: 60 },
  recargar: { x: ANCHO - 40, y: ALTO - 290, texto: 'R', ancho: 60 },
  interactuar: { x: ANCHO - 115, y: ALTO - 310, texto: 'F', ancho: 68 }
};

export default class BotonesAccion {
  constructor(scene, alPulsar) {
    this.scene = scene;
    this.activo = false;
    this.disponible = false;
    this.botones = {};
    Object.keys(BOTONES).forEach((nombre) => {
      const datos = BOTONES[nombre];
      const fondo = scene.add.rectangle(datos.x, datos.y, datos.ancho, 52, 0x1d2442, 0.85)
        .setStrokeStyle(2, nombre === 'interactuar' ? 0xe8f070 : 0x3ee8ff, 1)
        .setScrollFactor(0)
        .setDepth(PROFUNDIDAD)
        .setInteractive();
      fondo.on('pointerdown', () => alPulsar(nombre));
      const etiqueta = crearTexto(scene, datos.x, datos.y, datos.texto, 16).setOrigin(0.5).setDepth(PROFUNDIDAD + 1);
      this.botones[nombre] = { fondo, etiqueta };
    });
    this.refrescar();
  }

  cambiarModo(activo) {
    this.activo = activo;
    this.refrescar();
  }

  fijarInteraccion(disponible) {
    if (disponible === this.disponible) return;
    this.disponible = disponible;
    this.refrescar();
  }

  refrescar() {
    Object.keys(this.botones).forEach((nombre) => {
      const visible = this.activo && (nombre !== 'interactuar' || this.disponible);
      const { fondo, etiqueta } = this.botones[nombre];
      fondo.setVisible(visible);
      etiqueta.setVisible(visible);
      fondo.input.enabled = visible;
    });
  }
}
