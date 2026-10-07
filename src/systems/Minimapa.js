import { ANCHO, MAZMORRA } from '../config.js';
import { salaEn } from './Mazmorra.js';

const PROFUNDIDAD = 32;
const COLORES_SALA = { inicio: 0x9aa4c7, combate: 0x6b7090, tesoro: 0x3ea8ff, tienda: 0xe8f070, salida: 0xb36bff, jefe: 0xff4d6d };
const INTERVALO_MS = 200;

export default class Minimapa {
  constructor(scene, mazmorra) {
    this.scene = scene;
    this.mazmorra = mazmorra;
    const t = MAZMORRA.tile;
    this.escala = MAZMORRA.tamanoMinimapa / (Math.max(mazmorra.ancho, mazmorra.alto) * t);
    this.ancho = mazmorra.ancho * t * this.escala;
    this.alto = mazmorra.alto * t * this.escala;
    this.x = ANCHO - this.ancho - 14;
    this.y = 14;
    this.grafico = scene.add.graphics().setScrollFactor(0).setDepth(PROFUNDIDAD);
    this.proximo = 0;
  }

  get abajo() {
    return this.y + this.alto;
  }

  actualizar(tiempo, posiciones, local, salaActivaId) {
    posiciones.forEach((posicion) => {
      const sala = salaEn(this.mazmorra, posicion.x, posicion.y);
      if (sala) sala.visitada = true;
    });
    if (tiempo < this.proximo) return;
    this.proximo = tiempo + INTERVALO_MS;
    const g = this.grafico;
    const t = MAZMORRA.tile * this.escala;
    g.clear();
    g.fillStyle(0x000000, 0.5);
    g.fillRect(this.x - 4, this.y - 4, this.ancho + 8, this.alto + 8);
    this.mazmorra.salas.forEach((sala) => {
      const vecinaVisitada = sala.conexiones.some((id) => this.mazmorra.salas[id].visitada);
      if (!sala.visitada && !vecinaVisitada) return;
      const x = this.x + sala.x * t;
      const y = this.y + sala.y * t;
      const color = sala.visitada ? COLORES_SALA[sala.tipo] : 0x2c3040;
      g.fillStyle(color, sala.id === salaActivaId ? 1 : 0.75);
      g.fillRect(x, y, sala.w * t, sala.h * t);
      if (sala.id === salaActivaId) {
        g.lineStyle(1.5, 0xff4d6d, 1);
        g.strokeRect(x, y, sala.w * t, sala.h * t);
      }
    });
    posiciones.forEach((posicion) => {
      g.fillStyle(posicion === local ? 0xfff27a : 0x3ee8ff, 1);
      g.fillCircle(this.x + (posicion.x / MAZMORRA.tile) * t, this.y + (posicion.y / MAZMORRA.tile) * t, 2.5);
    });
  }
}
