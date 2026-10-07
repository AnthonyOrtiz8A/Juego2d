import Phaser from 'phaser';
import { JUGADOR, HABILIDADES, PASIVAS, MEJORAS } from '../config.js';
import { estadisticasArma } from '../systems/Recompensas.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, opciones = {}) {
    super(scene, x, y, 'jugador');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setCircle(JUGADOR.radio, this.width / 2 - JUGADOR.radio, this.height / 2 - JUGADOR.radio);
    this.setCollideWorldBounds(true);
    this.setDepth(10);
    this.id = opciones.id || 'local';
    this.nombre = opciones.nombre || '';
    this.local = opciones.local !== false;
    this.indice = opciones.indice || 0;
    this.arma = 'pistola';
    this.mejoras = {};
    this.pasivas = {};
    Object.keys(MEJORAS).forEach((id) => {
      this.mejoras[id] = 0;
    });
    Object.keys(PASIVAS).forEach((id) => {
      this.pasivas[id] = 0;
    });
    this.bajas = 0;
    this.teletransportes = 0;
    this.velocidadRed = { x: 0, y: 0 };
    this.ultimaEntrada = 0;
    this.entrada = { dx: 0, dy: 0, angulo: 0, disparando: false, habilidades: [] };
    this.habilidades = null;
    this.etiqueta = null;
    this.vivo = true;
    this.desconectado = false;
    this.vidas = JUGADOR.vidas;
    this.invulnerableHasta = 0;
    this.proximoDisparo = 0;
    this.dashHasta = 0;
    this.dashVx = 0;
    this.dashVy = 0;
    this.escudoHasta = 0;
    this.frenesiHasta = 0;
    this.enFrenesi = false;
  }

  mover(dx, dy, reloj) {
    if (reloj < this.dashHasta) {
      this.body.setVelocity(this.dashVx, this.dashVy);
      return;
    }
    const largo = Math.hypot(dx, dy);
    if (largo > 1) {
      dx /= largo;
      dy /= largo;
    }
    const velocidad = this.velocidadMovimiento();
    this.body.setVelocity(dx * velocidad, dy * velocidad);
  }

  velocidadMovimiento() {
    return JUGADOR.velocidad * (1 + this.pasivas.agilidad * PASIVAS.agilidad.valor);
  }

  vidasMaximas() {
    return JUGADOR.vidas + this.pasivas.vitalidad;
  }

  curar(cantidad) {
    this.vidas = Math.min(this.vidasMaximas(), this.vidas + cantidad);
  }

  multiplicadorEnfriamiento() {
    return Math.pow(PASIVAS.recarga.valor, this.pasivas.recarga);
  }

  datosArma() {
    return estadisticasArma(this.arma, this.mejoras);
  }

  registrarBaja() {
    if (this.pasivas.vampiro === 0) return;
    this.bajas += 1;
    const necesarias = Math.round(PASIVAS.vampiro.bajas / this.pasivas.vampiro);
    if (this.bajas >= necesarias) {
      this.bajas = 0;
      this.curar(1);
    }
  }

  iniciarDash(hasta, vx, vy) {
    this.dashHasta = hasta;
    this.dashVx = vx;
    this.dashVy = vy;
  }

  tieneEscudo(reloj) {
    return reloj < this.escudoHasta;
  }

  actualizarEfectos(reloj) {
    const frenesi = reloj < this.frenesiHasta;
    if (frenesi === this.enFrenesi) return;
    this.enFrenesi = frenesi;
    if (frenesi) this.setTint(HABILIDADES.tipos.frenesi.color);
    else this.clearTint();
  }

  puedeDisparar(tiempo, cadenciaMs) {
    if (tiempo < this.proximoDisparo) return false;
    const multiplicador = this.enFrenesi ? HABILIDADES.tipos.frenesi.multiplicadorCadencia : 1;
    this.proximoDisparo = tiempo + cadenciaMs / multiplicador;
    return true;
  }

  esInvulnerable(tiempo) {
    return tiempo < this.invulnerableHasta;
  }

  recibirDanio(tiempo) {
    if (!this.vivo || this.esInvulnerable(tiempo)) return false;
    this.vidas -= 1;
    this.invulnerableHasta = tiempo + JUGADOR.invulnerabilidadMs * (1 + this.pasivas.blindaje * PASIVAS.blindaje.valor);
    return true;
  }

  caer() {
    this.vivo = false;
    this.disableBody(true, true);
    if (this.etiqueta) this.etiqueta.setVisible(false);
  }

  revivir(x, y, vidas, tiempo) {
    if (this.desconectado) return;
    this.vivo = true;
    this.vidas = vidas;
    this.teletransportes += 1;
    this.invulnerableHasta = tiempo + JUGADOR.invulnerabilidadMs;
    this.enableBody(true, x, y, true, true);
    if (this.etiqueta) this.etiqueta.setVisible(true);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    this.alpha = this.esInvulnerable(time) && Math.floor(time / 80) % 2 === 0 ? 0.3 : 1;
    if (this.etiqueta && this.vivo) this.etiqueta.setPosition(this.x, this.y - 30);
  }

  apuntarA(x, y) {
    this.rotation = Math.atan2(y - this.y, x - this.x);
  }
}
