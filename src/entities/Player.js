import Phaser from 'phaser';
import { JUGADOR, HABILIDADES } from '../config.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'jugador');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setCircle(JUGADOR.radio, this.width / 2 - JUGADOR.radio, this.height / 2 - JUGADOR.radio);
    this.setCollideWorldBounds(true);
    this.setDepth(10);
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
    this.body.setVelocity(dx * JUGADOR.velocidad, dy * JUGADOR.velocidad);
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

  puedeDisparar(tiempo) {
    if (tiempo < this.proximoDisparo) return false;
    const multiplicador = this.enFrenesi ? HABILIDADES.tipos.frenesi.multiplicadorCadencia : 1;
    this.proximoDisparo = tiempo + JUGADOR.cadenciaMs / multiplicador;
    return true;
  }

  esInvulnerable(tiempo) {
    return tiempo < this.invulnerableHasta;
  }

  recibirDanio(tiempo) {
    if (this.esInvulnerable(tiempo)) return false;
    this.vidas -= 1;
    this.invulnerableHasta = tiempo + JUGADOR.invulnerabilidadMs;
    return true;
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    this.alpha = this.esInvulnerable(time) && Math.floor(time / 80) % 2 === 0 ? 0.3 : 1;
  }

  apuntarA(x, y) {
    this.rotation = Math.atan2(y - this.y, x - this.x);
  }
}
