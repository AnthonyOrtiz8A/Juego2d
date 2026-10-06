import { ANCHO, ALTO, HABILIDADES } from '../config.js';
import { DESCRIPCIONES } from './Habilidades.js';
import { crearTexto, crearBoton } from './Interfaz.js';

const PROFUNDIDAD = 60;
const ANCHO_TARJETA = 220;
const ALTO_TARJETA = 220;

function colorTexto(id) {
  return '#' + HABILIDADES.tipos[id].color.toString(16).padStart(6, '0');
}

export default class SelectorHabilidades {
  constructor(scene, gestor, alTerminar) {
    this.scene = scene;
    this.gestor = gestor;
    this.alTerminar = alTerminar;
    this.elementos = [];
    this.opciones = [];
    this.desbloqueo = false;
  }

  agregar(elemento) {
    elemento.setDepth(PROFUNDIDAD + this.elementos.length);
    this.elementos.push(elemento);
    return elemento;
  }

  limpiar() {
    this.elementos.forEach((elemento) => elemento.destroy());
    this.elementos = [];
  }

  base(titulo, subtitulo) {
    this.limpiar();
    this.agregar(this.scene.add.rectangle(0, 0, ANCHO, ALTO, 0x000000, 0.78).setOrigin(0).setInteractive());
    this.agregar(crearTexto(this.scene, ANCHO / 2, 85, titulo, 38, '#3ee8ff').setOrigin(0.5));
    this.agregar(crearTexto(this.scene, ANCHO / 2, 132, subtitulo, 16, '#9aa4c7').setOrigin(0.5));
  }

  boton(x, y, texto, accion, ancho) {
    const { fondo, etiqueta } = crearBoton(this.scene, x, y, texto, accion, ancho);
    this.agregar(fondo);
    this.agregar(etiqueta);
  }

  textoEquipadas() {
    const { E, Q } = this.gestor.ranuras;
    let texto = 'E: ' + DESCRIPCIONES[E].nombre;
    if (Q) texto += '   ·   Q: ' + DESCRIPCIONES[Q].nombre;
    return texto;
  }

  mostrar(desbloqueo, mismasOpciones = false) {
    this.desbloqueo = desbloqueo;
    if (!mismasOpciones) this.opciones = this.gestor.opciones();
    if (desbloqueo) this.base('¡Ranura Q desbloqueada!', 'Elige tu segunda habilidad (tecla Q)');
    else this.base('Elige un poder', 'Equipadas  ' + this.textoEquipadas());

    const opciones = this.opciones;
    const separacion = 240;
    const inicioX = ANCHO / 2 - ((opciones.length - 1) * separacion) / 2;
    opciones.forEach((id, i) => this.tarjeta(inicioX + i * separacion, 300, id));

    if (!desbloqueo) this.boton(ANCHO / 2, 480, 'Mantener habilidades', () => this.cerrar(), 300);
  }

  tarjeta(x, y, id) {
    const scene = this.scene;
    const datos = HABILIDADES.tipos[id];
    const fondo = this.agregar(scene.add.rectangle(x, y, ANCHO_TARJETA, ALTO_TARJETA, 0x1d2442, 0.95)
      .setStrokeStyle(3, datos.color, 1)
      .setInteractive({ useHandCursor: true }));
    fondo.on('pointerover', () => fondo.setFillStyle(0x2c3766, 1));
    fondo.on('pointerout', () => fondo.setFillStyle(0x1d2442, 0.95));
    fondo.on('pointerup', () => this.elegir(id));

    this.agregar(crearTexto(scene, x, y - 78, DESCRIPCIONES[id].nombre, 22, colorTexto(id)).setOrigin(0.5));
    this.agregar(crearTexto(scene, x, y - 5, DESCRIPCIONES[id].texto, 15).setOrigin(0.5).setLineSpacing(4));
    this.agregar(crearTexto(scene, x, y + 80, 'Enfriamiento: ' + datos.enfriamientoMs / 1000 + ' s', 14, '#fff27a').setOrigin(0.5));
  }

  elegir(id) {
    if (this.desbloqueo) {
      this.gestor.asignar('Q', id);
      this.cerrar();
    } else if (!this.gestor.desbloqueada('Q')) {
      this.gestor.asignar('E', id);
      this.cerrar();
    } else {
      this.preguntarRanura(id);
    }
  }

  preguntarRanura(id) {
    this.base('¿Qué habilidad reemplazas?', 'Nueva: ' + DESCRIPCIONES[id].nombre);
    const { E, Q } = this.gestor.ranuras;
    this.boton(ANCHO / 2, 250, 'E: ' + DESCRIPCIONES[E].nombre, () => this.reemplazar('E', id), 320);
    this.boton(ANCHO / 2, 315, 'Q: ' + DESCRIPCIONES[Q].nombre, () => this.reemplazar('Q', id), 320);
    this.boton(ANCHO / 2, 420, 'Volver', () => this.mostrar(false, true), 320);
  }

  reemplazar(tecla, id) {
    this.gestor.asignar(tecla, id);
    this.cerrar();
  }

  cerrar() {
    this.limpiar();
    this.alTerminar();
  }
}
