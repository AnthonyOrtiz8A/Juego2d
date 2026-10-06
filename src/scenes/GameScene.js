import Phaser from 'phaser';
import { ANCHO, ALTO, COLORES, BALA, ENEMIGOS, EFECTOS } from '../config.js';
import Player from '../entities/Player.js';
import Bullet from '../entities/Bullet.js';
import Enemy from '../entities/Enemy.js';

const TIPOS = Object.keys(ENEMIGOS.tipos);

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    this.dibujarFondo();
    this.jugador = new Player(this, ANCHO / 2, ALTO / 2);
    this.balas = this.crearPool(Bullet, BALA.poolMax);
    this.enemigos = this.crearPool(Enemy, ENEMIGOS.poolMax);
    this.explosion = this.add.particles(0, 0, 'particula', {
      speed: { min: 60, max: 200 },
      lifespan: EFECTOS.vidaParticulaMs,
      scale: { start: 1, end: 0 },
      emitting: false,
      maxAliveParticles: EFECTOS.particulasMax
    }).setDepth(8);

    this.physics.add.overlap(this.balas, this.enemigos, this.alImpactar, null, this);
    this.physics.add.overlap(this.jugador, this.enemigos, this.alChocar, null, this);

    this.teclas = this.input.keyboard.addKeys('W,A,S,D,UP,LEFT,DOWN,RIGHT,SPACE');

    this.time.addEvent({
      delay: 700,
      loop: true,
      callback: () => this.generarEnemigo(Phaser.Utils.Array.GetRandom(TIPOS), 1)
    });
  }

  crearPool(clase, maximo) {
    const grupo = this.physics.add.group({ classType: clase, maxSize: maximo, runChildUpdate: false });
    for (let i = 0; i < maximo; i++) grupo.create(-100, -100).desactivar();
    return grupo;
  }

  dibujarFondo() {
    const rejilla = this.add.graphics();
    rejilla.lineStyle(1, COLORES.rejilla, 1);
    for (let x = 0; x <= ANCHO; x += 40) rejilla.lineBetween(x, 0, x, ALTO);
    for (let y = 0; y <= ALTO; y += 40) rejilla.lineBetween(0, y, ANCHO, y);
  }

  generarEnemigo(tipo, multiplicadorVelocidad) {
    const enemigo = this.enemigos.getFirstDead(false);
    if (!enemigo) return false;
    const m = ENEMIGOS.margenAparicion;
    const lado = Phaser.Math.Between(0, 3);
    let x;
    let y;
    if (lado === 0) {
      x = Phaser.Math.Between(0, ANCHO);
      y = -m;
    } else if (lado === 1) {
      x = ANCHO + m;
      y = Phaser.Math.Between(0, ALTO);
    } else if (lado === 2) {
      x = Phaser.Math.Between(0, ANCHO);
      y = ALTO + m;
    } else {
      x = -m;
      y = Phaser.Math.Between(0, ALTO);
    }
    enemigo.aparecer(tipo, x, y, multiplicadorVelocidad, this.jugador);
    return true;
  }

  explotar(x, y, color) {
    this.explosion.setParticleTint(color);
    this.explosion.explode(EFECTOS.particulasPorExplosion, x, y);
  }

  alImpactar(bala, enemigo) {
    if (!bala.active || !enemigo.active) return;
    bala.desactivar();
    if (enemigo.recibirDanio(bala.danio, this.time.now)) this.eliminarEnemigo(enemigo);
  }

  alChocar(jugador, enemigo) {
    if (!enemigo.active || !jugador.recibirDanio(this.time.now)) return;
    this.eliminarEnemigo(enemigo);
    this.cameras.main.shake(EFECTOS.sacudidaMs, EFECTOS.sacudidaIntensidad);
    if (jugador.vidas <= 0) this.scene.restart();
  }

  eliminarEnemigo(enemigo) {
    this.explotar(enemigo.x, enemigo.y, enemigo.datos.color);
    enemigo.desactivar();
  }

  disparar(tiempo) {
    if (!this.jugador.puedeDisparar(tiempo)) return;
    const bala = this.balas.getFirstDead(false);
    if (!bala) return;
    const angulo = this.jugador.rotation;
    const x = this.jugador.x + Math.cos(angulo) * BALA.distanciaCanon;
    const y = this.jugador.y + Math.sin(angulo) * BALA.distanciaCanon;
    bala.disparar(x, y, angulo, tiempo);
  }

  update(time) {
    const t = this.teclas;
    const dx = (t.D.isDown || t.RIGHT.isDown ? 1 : 0) - (t.A.isDown || t.LEFT.isDown ? 1 : 0);
    const dy = (t.S.isDown || t.DOWN.isDown ? 1 : 0) - (t.W.isDown || t.UP.isDown ? 1 : 0);
    this.jugador.mover(dx, dy);

    const puntero = this.input.mousePointer;
    this.jugador.apuntarA(puntero.x, puntero.y);

    if (puntero.leftButtonDown() || t.SPACE.isDown) this.disparar(time);
  }
}
