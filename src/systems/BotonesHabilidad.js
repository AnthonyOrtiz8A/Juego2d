import { ANCHO, ALTO, HABILIDADES } from '../config.js';
import { DESCRIPCIONES } from './Habilidades.js';
import { crearTexto } from './Interfaz.js';

const PROFUNDIDAD = 41;
const TAMANO = 68;
const POSICIONES = {
  E: { x: ANCHO - 115, y: ALTO - 225 },
  Q: { x: ANCHO - 225, y: ALTO - 95 },
  C: { x: ANCHO - 220, y: ALTO - 210 }
};

export default class BotonesHabilidad {
  constructor(scene, gestor, modoTactil) {
    this.scene = scene;
    this.gestor = gestor;
    this.visible = true;
    this.modoTactil = modoTactil;
    this.widgets = {};
    this.segundos = {};
    Object.keys(POSICIONES).forEach((tecla) => this.crear(tecla, POSICIONES[tecla].x, POSICIONES[tecla].y));
    this.textoPc = crearTexto(scene, 16, 108, '', 14, '#9aa4c7').setDepth(PROFUNDIDAD);
    this.refrescar();
  }

  crear(tecla, x, y) {
    const scene = this.scene;
    const mitad = TAMANO / 2;
    const fondo = scene.add.rectangle(x, y, TAMANO, TAMANO, 0x1d2442, 0.9).setScrollFactor(0).setInteractive().setDepth(PROFUNDIDAD);
    fondo.on('pointerdown', () => scene.usarHabilidad(tecla));
    const etiqueta = crearTexto(scene, x - mitad + 5, y - mitad + 2, tecla, 16, '#fff27a').setDepth(PROFUNDIDAD + 1);
    const nombre = crearTexto(scene, x, y + 16, '', 12).setOrigin(0.5).setDepth(PROFUNDIDAD + 1);
    const sombra = scene.add.rectangle(x, y + mitad, TAMANO, TAMANO, 0x000000, 0.65)
      .setOrigin(0.5, 1)
      .setScale(1, 0)
      .setScrollFactor(0)
      .setDepth(PROFUNDIDAD + 2);
    const segundos = crearTexto(scene, x, y - 6, '', 26).setOrigin(0.5).setDepth(PROFUNDIDAD + 3);
    this.widgets[tecla] = { fondo, nombre, sombra, segundos, partes: [fondo, etiqueta, nombre, sombra, segundos] };
  }

  mostrar(visible) {
    this.visible = visible;
    this.refrescar();
  }

  cambiarModo(modoTactil) {
    this.modoTactil = modoTactil;
    this.refrescar();
  }

  refrescar() {
    Object.keys(this.widgets).forEach((tecla) => {
      const widget = this.widgets[tecla];
      const id = this.gestor.ranuras[tecla];
      const visible = this.visible && this.modoTactil && id !== null;
      widget.partes.forEach((parte) => parte.setVisible(visible));
      widget.fondo.input.enabled = visible;
      this.segundos[tecla] = -1;
      if (!id) return;
      widget.nombre.setText(DESCRIPCIONES[id].corto);
      widget.fondo.setStrokeStyle(3, HABILIDADES.tipos[id].color, 1);
    });
    this.textoPc.setVisible(this.visible && !this.modoTactil);
  }

  actualizar(reloj) {
    let cambio = false;
    this.gestor.teclasActivas().forEach((tecla) => {
      const widget = this.widgets[tecla];
      if (this.modoTactil) widget.sombra.scaleY = this.gestor.progreso(tecla, reloj);
      const segundos = Math.ceil(this.gestor.restante(tecla, reloj) / 1000);
      if (segundos === this.segundos[tecla]) return;
      this.segundos[tecla] = segundos;
      cambio = true;
      widget.segundos.setText(segundos > 0 ? String(segundos) : '');
      widget.fondo.setFillStyle(segundos > 0 ? 0x1d2442 : 0x2c3766, 0.9);
    });
    if (cambio && !this.modoTactil) this.actualizarTextoPc();
  }

  actualizarTextoPc() {
    const partes = this.gestor.teclasActivas().map((tecla) => {
      const nombre = DESCRIPCIONES[this.gestor.ranuras[tecla]].corto;
      const segundos = this.segundos[tecla];
      return '[' + tecla + '] ' + nombre + ' ' + (segundos > 0 ? segundos + 's' : 'listo');
    });
    this.textoPc.setText(partes.join('   '));
  }
}
