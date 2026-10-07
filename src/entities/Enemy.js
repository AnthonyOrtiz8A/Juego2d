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
    this.vidaMaxima = 1;
    this.estadoJefe = 'perseguir';
    this.finFase = 0;
    this.anguloEmbestida = 0;
    this.impulsoHasta = 0;
    this.proximoGrito = 0;
    this.rafagaRestante = 0;
    this.setDepth(5);
  }

  aparecer(tipo, x, y, multiplicadorVelocidad, objetivo, multiplicadorVida = 1) {
    const datos = ENEMIGOS.tipos[tipo];
    this.tipo = tipo;
    this.datos = datos;
    this.setTexture('enemigo-' + tipo);
    this.enableBody(true, x, y, true, true);
    this.body.setCircle(datos.radio, this.width / 2 - datos.radio, this.height / 2 - datos.radio);
    this.vida = datos.vida * multiplicadorVida;
    this.vidaMaxima = this.vida;
    this.estadoJefe = 'perseguir';
    this.finFase = this.scene.reloj + (datos.pausaMs || 0);
    this.setScale(1);
    this.setDepth(datos.jefe ? 6 : 5);
    this.velocidad = datos.velocidad * multiplicadorVelocidad;
    this.objetivo = objetivo;
    this.fase = Math.random() * Math.PI * 2;
    this.flashHasta = 0;
    this.congelado = false;
    this.sentido = Math.random() < 0.5 ? -1 : 1;
    if (datos.cadenciaMs) this.proximoDisparo = this.scene.reloj + Phaser.Math.Between(500, datos.cadenciaMs);
    this.impulsoHasta = 0;
    this.rafagaRestante = 0;
    this.proximoGrito = datos.grito ? this.scene.reloj + Phaser.Math.Between(1000, datos.grito.cadenciaMs) : 0;
    this.clearTint();
  }

  factorDanio(bala) {
    let factor = this.datos.armadura || 1;
    if (this.datos.escudoFrontal && bala && bala.body) {
      const velocidad = bala.body.velocity;
      const rapidez = velocidad.length() || 1;
      const frontal = (velocidad.x * Math.cos(this.rotation) + velocidad.y * Math.sin(this.rotation)) / rapidez < -0.5;
      if (frontal) factor *= this.datos.escudoFrontal;
    }
    return factor;
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

    let velocidad = lento ? this.velocidad * congelacion.factorVelocidad : this.velocidad;
    if (this.datos.grito) {
      if (this.scene.reloj < this.impulsoHasta) velocidad *= this.datos.grito.multiplicador;
      if (this.scene.reloj >= this.proximoGrito) {
        this.proximoGrito = this.scene.reloj + this.datos.grito.cadenciaMs;
        this.scene.gritar(this);
      }
    } else if (this.scene.reloj < this.impulsoHasta) {
      velocidad *= ENEMIGOS.tipos.chillona.grito.multiplicador;
    }
    const haciaJugador = Math.atan2(this.objetivo.y - this.y, this.objetivo.x - this.x);

    if (this.datos.jefe) this.comportamientoJefe(haciaJugador, velocidad, lento);
    else if (this.datos.distancia) this.comportamientoTirador(haciaJugador, velocidad, lento);
    else {
      const angulo = haciaJugador + Math.sin(time * 0.003 + this.fase) * (this.datos.zigzag || ENEMIGOS.zigzag);
      this.body.velocity.set(Math.cos(angulo) * velocidad, Math.sin(angulo) * velocidad);
      this.rotation = angulo;
    }
    this.impedirSalida();
  }

  impedirSalida() {
    const limites = this.scene.physics.world.bounds;
    const radio = this.datos.radio;
    const velocidad = this.body.velocity;
    if (this.x < limites.x + radio && velocidad.x < 0) velocidad.x = 0;
    if (this.x > limites.right - radio && velocidad.x > 0) velocidad.x = 0;
    if (this.y < limites.y + radio && velocidad.y < 0) velocidad.y = 0;
    if (this.y > limites.bottom - radio && velocidad.y > 0) velocidad.y = 0;
  }

  comportamientoJefe(haciaJugador, velocidad, lento) {
    const datos = this.datos;
    const escena = this.scene;
    const reloj = escena.reloj;
    const furia = this.vida < this.vidaMaxima / 2;
    const ritmo = furia ? 0.6 : 1;

    if (this.estadoJefe === 'aviso') {
      this.body.velocity.set(0, 0);
      this.setScale(1 + Math.sin(reloj / 40) * 0.06);
      if (reloj >= this.finFase) {
        this.estadoJefe = 'embestida';
        this.finFase = reloj + datos.embestidaMs;
        this.setScale(1);
      }
      return;
    }

    if (this.estadoJefe === 'embestida') {
      const rapidez = datos.embestidaVelocidad * (lento ? HABILIDADES.tipos.congelar.factorVelocidad : 1);
      this.body.velocity.set(Math.cos(this.anguloEmbestida) * rapidez, Math.sin(this.anguloEmbestida) * rapidez);
      this.rotation = this.anguloEmbestida;
      if (reloj >= this.finFase) {
        this.estadoJefe = 'perseguir';
        this.finFase = reloj + datos.pausaMs * ritmo;
      }
      return;
    }

    const rapidez = velocidad * (furia ? 1.35 : 1);
    this.body.velocity.set(Math.cos(haciaJugador) * rapidez, Math.sin(haciaJugador) * rapidez);
    this.rotation = haciaJugador;
    if (reloj < this.finFase) return;

    const acciones = ['embestida'];
    if (datos.acidoBalas > 0) acciones.push('acido');
    if (datos.invocar > 0) acciones.push('invocar');
    const accion = Phaser.Utils.Array.GetRandom(acciones);

    if (accion === 'embestida') {
      this.estadoJefe = 'aviso';
      this.anguloEmbestida = haciaJugador;
      this.finFase = reloj + datos.avisoMs * ritmo;
      return;
    }
    if (accion === 'acido') {
      const paso = (Math.PI * 2) / datos.acidoBalas;
      for (let i = 0; i < datos.acidoBalas; i++) escena.dispararEnemigo(this.x, this.y, haciaJugador + i * paso);
      for (let i = -1; i <= 1; i++) escena.dispararEnemigo(this.x, this.y, haciaJugador + i * 0.15);
    } else {
      escena.invocarEsbirros(this.x, this.y, datos.invocar + (furia ? 2 : 0));
    }
    this.finFase = reloj + datos.pausaMs * ritmo;
  }

  puedeRetroceder(angulo) {
    const limites = this.scene.physics.world.bounds;
    const margen = this.datos.radio + 40;
    const x = this.x + Math.cos(angulo) * margen;
    const y = this.y + Math.sin(angulo) * margen;
    return x > limites.x && x < limites.right && y > limites.y && y < limites.bottom;
  }

  comportamientoTirador(haciaJugador, velocidad, lento) {
    const datos = this.datos;
    const distancia = Phaser.Math.Distance.Between(this.x, this.y, this.objetivo.x, this.objetivo.y);
    let movimiento = haciaJugador + this.sentido * (Math.PI / 2);
    if (distancia > datos.distancia + datos.tolerancia) movimiento = haciaJugador;
    else if (distancia < datos.distancia - datos.tolerancia && this.puedeRetroceder(haciaJugador + Math.PI)) movimiento = haciaJugador + Math.PI;
    this.body.velocity.set(Math.cos(movimiento) * velocidad, Math.sin(movimiento) * velocidad);
    this.rotation = haciaJugador;

    const escena = this.scene;
    if (escena.reloj < this.proximoDisparo) return;
    if (this.rafagaRestante === 0) {
      if (distancia > datos.distancia + datos.alcanceExtra) return;
      if (!escena.enVistaDe(this.objetivo, this.x, this.y)) return;
      this.rafagaRestante = datos.rafaga || 1;
    }
    this.rafagaRestante -= 1;
    escena.dispararEnemigo(this.x, this.y, haciaJugador + (datos.rafaga ? (Math.random() - 0.5) * 0.12 : 0));
    this.proximoDisparo = escena.reloj + (this.rafagaRestante > 0 ? datos.separacionRafagaMs : datos.cadenciaMs * (lento ? 2 : 1));
  }
}
