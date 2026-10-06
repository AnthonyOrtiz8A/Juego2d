import Storage from './Storage.js';

class Sonido {
  constructor() {
    this.contexto = null;
    this.activo = Storage.sonidoActivo();
  }

  obtenerContexto() {
    if (!this.contexto) {
      const Contexto = window.AudioContext || window.webkitAudioContext;
      if (!Contexto) return null;
      this.contexto = new Contexto();
    }
    if (this.contexto.state === 'suspended') this.contexto.resume();
    return this.contexto;
  }

  alternar() {
    this.activo = !this.activo;
    Storage.guardarSonido(this.activo);
    if (this.activo) this.obtenerContexto();
    return this.activo;
  }

  tono(frecuencia, duracion, forma, volumen, frecuenciaFinal) {
    if (!this.activo) return;
    const ctx = this.obtenerContexto();
    if (!ctx) return;
    const inicio = ctx.currentTime;
    const oscilador = ctx.createOscillator();
    const ganancia = ctx.createGain();
    oscilador.type = forma;
    oscilador.frequency.setValueAtTime(frecuencia, inicio);
    oscilador.frequency.exponentialRampToValueAtTime(frecuenciaFinal, inicio + duracion);
    ganancia.gain.setValueAtTime(volumen, inicio);
    ganancia.gain.exponentialRampToValueAtTime(0.0001, inicio + duracion);
    oscilador.connect(ganancia).connect(ctx.destination);
    oscilador.start(inicio);
    oscilador.stop(inicio + duracion);
  }

  disparo() {
    this.tono(900, 0.05, 'square', 0.025, 450);
  }

  explosion() {
    this.tono(220, 0.16, 'sawtooth', 0.05, 40);
  }

  danio() {
    this.tono(160, 0.35, 'triangle', 0.15, 45);
  }

  habilidad() {
    this.tono(300, 0.22, 'sine', 0.09, 900);
  }

  comer() {
    this.tono(520, 0.06, 'triangle', 0.04, 260);
  }

  comerFantasma() {
    this.tono(200, 0.25, 'square', 0.05, 1200);
  }

  oleada() {
    this.tono(440, 0.3, 'sine', 0.08, 1100);
  }
}

export default new Sonido();
