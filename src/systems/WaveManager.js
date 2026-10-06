import { OLEADAS } from '../config.js';

export default class WaveManager {
  constructor(scene) {
    this.scene = scene;
    this.oleada = 0;
    this.pendientes = 0;
    this.porTanda = 1;
    this.multiplicadorVelocidad = 1;
    this.evento = null;
    this.esperando = false;
  }

  iniciar() {
    this.siguienteOleada();
  }

  siguienteOleada() {
    this.oleada += 1;
    const n = this.oleada - 1;
    this.pendientes = OLEADAS.enemigosBase + n * OLEADAS.enemigosPorOleada;
    this.multiplicadorVelocidad = Math.min(1 + n * OLEADAS.incrementoVelocidad, OLEADAS.multiplicadorVelocidadMax);
    this.porTanda = 1 + Math.floor(n / OLEADAS.oleadasPorGrupoExtra);
    const intervalo = Math.max(OLEADAS.intervaloMinMs, OLEADAS.intervaloBaseMs - n * OLEADAS.reduccionIntervaloMs);
    this.esperando = false;
    this.detener();
    this.evento = this.scene.time.addEvent({ delay: intervalo, loop: true, callback: this.generar, callbackScope: this });
    this.scene.events.emit('oleada', this.oleada);
  }

  elegirTipo() {
    const extra = (this.oleada - 1) * OLEADAS.incrementoProbabilidad;
    const azar = Math.random();
    if (this.oleada >= OLEADAS.oleadaTanques) {
      const pTanque = Math.min(OLEADAS.probabilidadTanqueBase + extra, OLEADAS.probabilidadTanqueMax);
      if (azar < pTanque) return 'tanque';
    }
    if (this.oleada >= OLEADAS.oleadaTiradores) {
      const pTirador = Math.min(OLEADAS.probabilidadTiradorBase + extra, OLEADAS.probabilidadTiradorMax);
      if (Math.random() < pTirador) return 'tirador';
    }
    if (this.oleada >= OLEADAS.oleadaRapidos) {
      const pRapido = Math.min(OLEADAS.probabilidadRapidoBase + extra, OLEADAS.probabilidadRapidoMax);
      if (Math.random() < pRapido) return 'rapido';
    }
    return 'normal';
  }

  generar() {
    let activos = this.scene.enemigos.countActive(true);
    for (let i = 0; i < this.porTanda && this.pendientes > 0; i++) {
      if (activos >= OLEADAS.maximoSimultaneos) return;
      if (!this.scene.generarEnemigo(this.elegirTipo(), this.multiplicadorVelocidad)) return;
      this.pendientes -= 1;
      activos += 1;
    }
    if (this.pendientes === 0) this.detener();
  }

  verificarFin() {
    if (this.esperando || this.pendientes > 0 || this.scene.enemigos.countActive(true) > 0) return;
    this.esperando = true;
    this.scene.events.emit('oleadaCompletada', this.oleada);
    this.scene.time.delayedCall(OLEADAS.pausaEntreOleadasMs, () => this.siguienteOleada());
  }

  detener() {
    if (this.evento) {
      this.evento.remove();
      this.evento = null;
    }
  }
}
