import { ANCHO, ALTO } from '../config.js';
import { crearTexto } from './Interfaz.js';

const PROFUNDIDAD = 41;
const BOTONES = {
  cambiar: { x: ANCHO - 40, y: ALTO - 215, texto: 'ARMA', ancho: 60 },
  interactuar: { x: ANCHO - 115, y: ALTO - 310, texto: 'F', ancho: 68 },
  reanimar: { x: ANCHO - 330, y: ALTO - 240, texto: 'REVIVIR', ancho: 104 }
};

const COLORES = { cambiar: 0x3ee8ff, interactuar: 0xe8f070, reanimar: 0x4cd97b };

export default class BotonesAccion {
  constructor(scene, alPulsar) {
    this.scene = scene;
    this.activo = false;
    this.historia = false;
    this.disponible = false;
    this.reanimable = false;
    this.botones = {};
    Object.keys(BOTONES).forEach((nombre) => {
      const datos = BOTONES[nombre];
      const fondo = scene.add.rectangle(datos.x, datos.y, datos.ancho, 52, 0x1d2442, 0.85)
        .setStrokeStyle(2, COLORES[nombre], 1)
        .setScrollFactor(0)
        .setDepth(PROFUNDIDAD)
        .setInteractive();
      fondo.on('pointerdown', () => alPulsar(nombre));
      const etiqueta = crearTexto(scene, datos.x, datos.y, datos.texto, 16).setOrigin(0.5).setDepth(PROFUNDIDAD + 1);
      this.botones[nombre] = { fondo, etiqueta };
    });
    this.refrescar();
  }

  cambiarModo(activo, historia) {
    this.activo = activo;
    this.historia = historia;
    this.refrescar();
  }

  fijarReanimar(reanimable) {
    if (reanimable === this.reanimable) return;
    this.reanimable = reanimable;
    this.refrescar();
  }

  fijarInteraccion(disponible) {
    if (disponible === this.disponible) return;
    this.disponible = disponible;
    this.refrescar();
  }

  refrescar() {
    Object.keys(this.botones).forEach((nombre) => {
      let visible = this.activo && this.historia;
      if (nombre === 'interactuar') visible = visible && this.disponible;
      if (nombre === 'reanimar') visible = this.activo && this.reanimable;
      const { fondo, etiqueta } = this.botones[nombre];
      fondo.setVisible(visible);
      etiqueta.setVisible(visible);
      fondo.input.enabled = visible;
    });
  }
}
