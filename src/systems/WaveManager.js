import { OLEADAS } from '../config.js';

const ESPERA_SIN_BAJAS_MS = 20000;

export default class WaveManager {
  constructor(scene, opciones = {}) {
    this.scene = scene;
    this.inicio = opciones.inicio || 1;
    this.total = opciones.total || Infinity;
    this.jefe = opciones.jefe || null;
    this.multiplicadorCantidad = opciones.multiplicadorCantidad || 1;
    this.oleada = this.inicio - 1;
    this.pendientes = 0;
    this.porTanda = 1;
    this.multiplicadorVelocidad = 1;
    this.evento = null;
    this.esperando = false;
    this.jefeGenerado = false;
    this.terminado = false;
    this.ultimaBaja = 0;
  }

  registrarBaja() {
    this.ultimaBaja = this.scene.reloj;
  }

  vigilar() {
    if (this.terminado || this.esperando || this.pendientes > 0) {
      this.ultimaBaja = this.scene.reloj;
      return;
    }
    if (this.scene.reloj - this.ultimaBaja < ESPERA_SIN_BAJAS_MS) return;
    this.ultimaBaja = this.scene.reloj;
    this.scene.reubicarEnemigos();
  }

  get numeroEnNivel() {
    return this.oleada - this.inicio + 1;
  }

  iniciar() {
    this.siguienteOleada();
  }

  siguienteOleada() {
    this.oleada += 1;
    const n = this.oleada - 1;
    this.pendientes = Math.round((OLEADAS.enemigosBase + n * OLEADAS.enemigosPorOleada) * this.multiplicadorCantidad);
    this.multiplicadorVelocidad = Math.min(1 + n * OLEADAS.incrementoVelocidad, OLEADAS.multiplicadorVelocidadMax);
    this.porTanda = 1 + Math.floor(n / OLEADAS.oleadasPorGrupoExtra);
    const intervalo = Math.max(OLEADAS.intervaloMinMs, OLEADAS.intervaloBaseMs - n * OLEADAS.reduccionIntervaloMs);
    this.esperando = false;
    this.detener();
    this.evento = this.scene.time.addEvent({ delay: intervalo, loop: true, callback: this.generar, callbackScope: this });
    this.scene.events.emit('oleada', this.numeroEnNivel, this.total);
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
    if (this.terminado || this.esperando || this.pendientes > 0 || this.scene.enemigos.countActive(true) > 0) return;
    this.esperando = true;

    if (this.numeroEnNivel >= this.total) {
      if (this.jefe && !this.jefeGenerado) {
        this.jefeGenerado = true;
        this.scene.events.emit('oleadaCompletada', this.oleada);
        this.scene.time.delayedCall(OLEADAS.pausaEntreOleadasMs, () => {
          this.esperando = false;
          this.scene.generarJefe(this.jefe);
        });
        return;
      }
      this.terminado = true;
      this.scene.events.emit('nivelCompletado');
      return;
    }

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
