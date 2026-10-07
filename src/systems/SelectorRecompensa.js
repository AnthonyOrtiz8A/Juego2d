import { ANCHO, ALTO } from '../config.js';
import { DESCRIPCIONES } from './Habilidades.js';
import { describirRecompensa } from './Recompensas.js';
import { crearTexto, crearBoton } from './Interfaz.js';

const PROFUNDIDAD = 70;
const ANCHO_PANEL = 520;
const ALTO_PANEL = 330;

function colorTexto(color) {
  return '#' + color.toString(16).padStart(6, '0');
}

export default class SelectorRecompensa {
  constructor(scene) {
    this.scene = scene;
    this.elementos = [];
    this.abierto = false;
  }

  agregar(elemento) {
    elemento.setScrollFactor(0).setDepth(PROFUNDIDAD + this.elementos.length);
    this.elementos.push(elemento);
    return elemento;
  }

  boton(x, y, texto, accion, ancho) {
    const { fondo, etiqueta } = crearBoton(this.scene, x, y, texto, accion, ancho, 44);
    this.agregar(fondo);
    this.agregar(etiqueta);
  }

  mostrar(recompensa, actual, alDecidir) {
    this.cerrar();
    this.abierto = true;
    const scene = this.scene;
    const info = describirRecompensa(recompensa);
    const cx = ANCHO / 2;
    const cy = ALTO / 2;
    const arriba = cy - ALTO_PANEL / 2;
    const decidir = (decision) => {
      this.cerrar();
      alDecidir(decision);
    };

    this.agregar(scene.add.rectangle(cx, cy, ANCHO_PANEL, ALTO_PANEL, 0x0d1121, 0.95).setStrokeStyle(3, info.color, 1));
    this.agregar(crearTexto(scene, cx, arriba + 26, 'Cofre: ' + info.titulo, 18, colorTexto(info.color)).setOrigin(0.5));
    this.agregar(crearTexto(scene, cx, arriba + 60, info.nombre, 28).setOrigin(0.5));
    this.agregar(crearTexto(scene, cx, arriba + 116, info.texto, 15, '#c9d1f0').setOrigin(0.5).setLineSpacing(4));

    const filaBotones = arriba + ALTO_PANEL - 90;
    if (recompensa.tipo === 'activa') {
      const teclas = ['E', 'Q', 'C'];
      teclas.forEach((tecla, i) => {
        const id = actual.ranuras[tecla];
        const texto = tecla + ': ' + (id ? DESCRIPCIONES[id].corto : 'vacía');
        this.boton(cx - 170 + i * 170, filaBotones, texto, () => decidir({ tomar: true, ranura: tecla }), 160);
      });
      this.boton(cx, filaBotones + 52, 'No la quiero', () => decidir({ tomar: false }), 220);
      return;
    }
    this.boton(cx - 125, filaBotones + 22, 'Tomar', () => decidir({ tomar: true }), 230);
    this.boton(cx + 125, filaBotones + 22, 'Dejar', () => decidir({ tomar: false }), 230);
  }

  cerrar() {
    this.elementos.forEach((elemento) => elemento.destroy());
    this.elementos = [];
    this.abierto = false;
  }
}
