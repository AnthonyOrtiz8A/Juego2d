import Phaser from 'phaser';
import { ENEMIGOS, HABILIDADES, RED } from '../config.js';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'enemigo-normal');
    this.tipo = 'normal';
    this.datos = ENEMIGOS.tipos.normal;
    this.vida = 0;
    this.velocidad = 0;
    this.objetivo = null;
    this.flashHasta = 0;
    this.fase = 0;
    this.congelado = false;
    this.proximoDisparo = 0;
    this.sentido = 1;
    this.proximoObjetivo = 0;
    this.setDepth(5);
  }

  aparecer(tipo, x, y, multiplicadorVelocidad, objetivo) {
    const datos = ENEMIGOS.tipos[tipo];
    this.tipo = tipo;
    this.datos = datos;
    this.setTexture('enemigo-' + tipo);
    this.enableBody(true, x, y, true, true);
    this.body.setCircle(datos.radio, this.width / 2 - datos.radio, this.height / 2 - datos.radio);
    this.vida = datos.vida;
    this.velocidad = datos.velocidad * multiplicadorVelocidad;
    this.objetivo = objetivo;
    this.fase = Math.random() * Math.PI * 2;
    this.flashHasta = 0;
    this.congelado = false;
    this.sentido = Math.random() < 0.5 ? -1 : 1;
    if (datos.cadenciaMs) this.proximoDisparo = this.scene.reloj + Phaser.Math.Between(500, datos.cadenciaMs);
    this.clearTint();
  }

  recibirDanio(cantidad, tiempo) {
    this.vida -= cantidad;
    this.flashHasta = tiempo + ENEMIGOS.flashMs;
    this.setTintFill(0xffffff);
    return this.vida <= 0;
  }

  desactivar() {
    this.disableBody(true, true);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (!this.active) return;

    if (this.flashHasta && time > this.flashHasta) {
      this.flashHasta = 0;
      this.congelado = false;
      this.clearTint();
    }

    if (time >= this.proximoObjetivo) {
      this.proximoObjetivo = time + RED.reapuntadoEnemigoMs;
      const cercano = this.scene.jugadorMasCercano(this.x, this.y);
      if (cercano) this.objetivo = cercano;
    }

    const congelacion = HABILIDADES.tipos.congelar;
    const lento = this.scene.reloj < this.scene.congeladoHasta;
    if (!this.flashHasta && lento !== this.congelado) {
      this.congelado = lento;
      if (lento) this.setTint(congelacion.color);
      else this.clearTint();
    }

    const velocidad = lento ? this.velocidad * congelacion.factorVelocidad : this.velocidad;
    const haciaJugador = Math.atan2(this.objetivo.y - this.y, this.objetivo.x - this.x);

    if (this.datos.distancia) {
      this.comportamientoTirador(haciaJugador, velocidad, lento);
      return;
    }

    const angulo = haciaJugador + Math.sin(time * 0.003 + this.fase) * ENEMIGOS.zigzag;
    this.body.velocity.set(Math.cos(angulo) * velocidad, Math.sin(angulo) * velocidad);
    this.rotation = angulo;
  }

  comportamientoTirador(haciaJugador, velocidad, lento) {
    const datos = this.datos;
    const distancia = Phaser.Math.Distance.Between(this.x, this.y, this.objetivo.x, this.objetivo.y);
    let movimiento = haciaJugador + this.sentido * (Math.PI / 2);
    if (distancia > datos.distancia + datos.tolerancia) movimiento = haciaJugador;
    else if (distancia < datos.distancia - datos.tolerancia) movimiento = haciaJugador + Math.PI;
    this.body.velocity.set(Math.cos(movimiento) * velocidad, Math.sin(movimiento) * velocidad);
    this.rotation = haciaJugador;

    const escena = this.scene;
    if (escena.reloj < this.proximoDisparo) return;
    if (distancia > datos.distancia + datos.alcanceExtra) return;
    if (!escena.enVistaDe(this.objetivo, this.x, this.y)) return;
    this.proximoDisparo = escena.reloj + datos.cadenciaMs * (lento ? 2 : 1);
    escena.dispararEnemigo(this.x, this.y, haciaJugador);
  }
}
