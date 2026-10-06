import Phaser from 'phaser';
import { ANCHO, ALTO, COLORES, JUGADOR, BALA, ENEMIGOS, EFECTOS, TACTIL, HABILIDADES } from '../config.js';
import Player from '../entities/Player.js';
import Bullet from '../entities/Bullet.js';
import Enemy from '../entities/Enemy.js';
import WaveManager from '../systems/WaveManager.js';
import Storage from '../systems/Storage.js';
import Sonido from '../systems/Sonido.js';
import TouchControls from '../systems/TouchControls.js';
import GestorHabilidades from '../systems/Habilidades.js';
import BotonesHabilidad from '../systems/BotonesHabilidad.js';
import SelectorHabilidades from '../systems/SelectorHabilidades.js';
import { crearTexto, crearBoton } from '../systems/Interfaz.js';

const PROFUNDIDAD_HUD = 30;
const PROFUNDIDAD_PAUSA = 50;
const ESPERA_FIN_MS = 900;

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    this.add.image(0, 0, 'fondo').setOrigin(0);

    this.puntos = 0;
    this.record = Storage.obtenerRecord();
    this.pausado = false;
    this.terminado = false;
    this.eligiendo = false;
    this.reloj = 0;
    this.congeladoHasta = 0;

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
    this.escudo = this.add.image(0, 0, 'escudo').setDepth(11).setVisible(false);
    this.onda = this.add.image(0, 0, 'onda').setDepth(9).setVisible(false);

    this.physics.add.overlap(this.balas, this.enemigos, this.alImpactar, null, this);
    this.physics.add.overlap(this.jugador, this.enemigos, this.alChocar, null, this);

    this.teclas = this.input.keyboard.addKeys('W,A,S,D,UP,LEFT,DOWN,RIGHT,SPACE');
    this.input.keyboard.on('keydown-P', this.alternarPausa, this);
    this.input.keyboard.on('keydown-ESC', this.alternarPausa, this);
    this.input.keyboard.on('keydown-E', () => this.usarHabilidad('E'));
    this.input.keyboard.on('keydown-Q', () => this.usarHabilidad('Q'));

    this.crearHud();
    this.controlesTactiles = new TouchControls(this);
    this.habilidades = new GestorHabilidades(this);
    this.botonesHabilidad = new BotonesHabilidad(this, this.habilidades);
    this.selector = new SelectorHabilidades(this, this.habilidades, () => this.terminarEleccion());
    this.crearAnuncio();
    this.crearMenuPausa();

    this.events.on('oleada', this.alIniciarOleada, this);
    this.events.on('oleadaCompletada', this.alCompletarOleada, this);
    this.game.events.on(Phaser.Core.Events.BLUR, this.pausarPorFoco, this);
    this.game.events.on(Phaser.Core.Events.HIDDEN, this.pausarPorFoco, this);
    this.events.once('shutdown', this.limpiar, this);

    this.oleadas = new WaveManager(this);
    this.oleadas.iniciar();
  }

  limpiar() {
    this.events.off('oleada', this.alIniciarOleada, this);
    this.events.off('oleadaCompletada', this.alCompletarOleada, this);
    this.game.events.off(Phaser.Core.Events.BLUR, this.pausarPorFoco, this);
    this.game.events.off(Phaser.Core.Events.HIDDEN, this.pausarPorFoco, this);
    this.oleadas.detener();
  }

  crearPool(clase, maximo) {
    const grupo = this.physics.add.group({ classType: clase, maxSize: maximo, runChildUpdate: false });
    for (let i = 0; i < maximo; i++) grupo.create(-100, -100).desactivar();
    return grupo;
  }

  crearHud() {
    this.textoPuntos = crearTexto(this, 16, 10, 'Puntos: 0', 22).setDepth(PROFUNDIDAD_HUD);
    this.textoRecord = crearTexto(this, 16, 38, 'Récord: ' + this.record, 14, '#fff27a').setDepth(PROFUNDIDAD_HUD);
    this.textoOleada = crearTexto(this, ANCHO / 2, 10, 'Oleada 1', 22).setOrigin(0.5, 0).setDepth(PROFUNDIDAD_HUD);

    this.iconosVida = [];
    for (let i = 0; i < JUGADOR.vidas; i++) {
      const icono = this.add.image(28 + i * 26, 76, 'jugador').setScale(0.55).setRotation(-Math.PI / 2).setDepth(PROFUNDIDAD_HUD);
      this.iconosVida.push(icono);
    }

    const pausa = crearBoton(this, ANCHO - 34, 32, 'II', () => this.alternarPausa(), 48, 44);
    pausa.fondo.setDepth(PROFUNDIDAD_HUD);
    pausa.etiqueta.setDepth(PROFUNDIDAD_HUD);
    this.botonPausa = pausa.fondo;
  }

  crearAnuncio() {
    this.anuncio = crearTexto(this, ANCHO / 2, ALTO / 2 - 80, '', 40).setOrigin(0.5).setDepth(20).setAlpha(0);
  }

  crearMenuPausa() {
    const capa = this.add.rectangle(0, 0, ANCHO, ALTO, 0x000000, 0.6).setOrigin(0).setInteractive();
    const titulo = crearTexto(this, ANCHO / 2, 200, 'PAUSA', 56, '#3ee8ff').setOrigin(0.5);
    const continuar = crearBoton(this, ANCHO / 2, 300, 'Continuar', () => this.reanudar());
    const menu = crearBoton(this, ANCHO / 2, 365, 'Menú principal', () => this.scene.start('Menu'));

    this.elementosPausa = [capa, titulo, continuar.fondo, continuar.etiqueta, menu.fondo, menu.etiqueta];
    this.elementosPausa.forEach((elemento) => elemento.setDepth(PROFUNDIDAD_PAUSA));
    this.mostrarMenuPausa(false);
  }

  mostrarMenuPausa(visible) {
    this.elementosPausa.forEach((elemento) => {
      elemento.setVisible(visible);
      if (elemento.input) elemento.input.enabled = visible;
    });
  }

  alternarPausa() {
    if (this.eligiendo) return;
    if (this.pausado) this.reanudar();
    else this.pausar();
  }

  pausarPorFoco() {
    if (!this.pausado && !this.eligiendo) this.pausar();
  }

  detenerMundo() {
    this.physics.pause();
    this.time.paused = true;
    this.tweens.pauseAll();
    this.explosion.pause();
    this.anuncio.setVisible(false);
    this.controlesTactiles.reiniciar();
    this.controlesTactiles.mostrar(false);
    this.botonesHabilidad.mostrar(false);
  }

  reanudarMundo() {
    this.physics.resume();
    this.time.paused = false;
    this.tweens.resumeAll();
    this.explosion.resume();
    this.anuncio.setVisible(true);
    this.controlesTactiles.mostrar(true);
    this.botonesHabilidad.mostrar(true);
  }

  pausar() {
    if (this.terminado || this.pausado || this.eligiendo) return;
    this.pausado = true;
    this.detenerMundo();
    this.mostrarMenuPausa(true);
  }

  reanudar() {
    if (!this.pausado) return;
    this.pausado = false;
    this.reanudarMundo();
    this.mostrarMenuPausa(false);
  }

  iniciarEleccion(desbloqueo) {
    if (this.terminado) return;
    this.eligiendo = true;
    this.detenerMundo();
    this.selector.mostrar(desbloqueo);
  }

  terminarEleccion() {
    this.eligiendo = false;
    this.reanudarMundo();
  }

  usarHabilidad(tecla) {
    if (this.pausado || this.terminado || this.eligiendo) return;
    if (this.habilidades.usar(tecla, this.reloj)) Sonido.habilidad();
  }

  mostrarOnda(color, radio) {
    this.tweens.killTweensOf(this.onda);
    const escalaFinal = radio / 64;
    this.onda.setPosition(this.jugador.x, this.jugador.y).setTint(color).setVisible(true).setAlpha(1).setScale(0.2);
    this.tweens.add({
      targets: this.onda,
      scale: escalaFinal,
      alpha: 0,
      duration: 320,
      ease: 'Cubic.Out',
      onComplete: () => this.onda.setVisible(false)
    });
  }

  alIniciarOleada(numero) {
    this.textoOleada.setText('Oleada ' + numero);
    this.anunciar('Oleada ' + numero);
    Sonido.oleada();
  }

  alCompletarOleada(numero) {
    this.anunciar('¡Oleada superada!');
    const desbloqueo = numero === HABILIDADES.oleadaSegundaRanura - 1 && !this.habilidades.desbloqueada('Q');
    if (desbloqueo || numero % HABILIDADES.cadaOleadas === 0) {
      this.time.delayedCall(HABILIDADES.esperaSelectorMs, () => this.iniciarEleccion(desbloqueo));
    }
  }

  anunciar(texto) {
    this.tweens.killTweensOf(this.anuncio);
    this.anuncio.setText(texto).setAlpha(1).setScale(1.3);
    this.tweens.add({ targets: this.anuncio, scale: 1, duration: 250, ease: 'Back.Out' });
    this.tweens.add({ targets: this.anuncio, alpha: 0, delay: 1300, duration: 400 });
  }

  sumarPuntos(cantidad) {
    this.puntos += cantidad;
    this.textoPuntos.setText('Puntos: ' + this.puntos);
    if (this.puntos > this.record) {
      this.record = this.puntos;
      this.textoRecord.setText('Récord: ' + this.record);
    }
  }

  actualizarVidas() {
    this.iconosVida.forEach((icono, i) => icono.setVisible(i < this.jugador.vidas));
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
    if (!enemigo.recibirDanio(bala.danio, this.time.now)) return;
    this.sumarPuntos(enemigo.datos.puntos);
    Sonido.explosion();
    this.eliminarEnemigo(enemigo);
  }

  alChocar(jugador, enemigo) {
    if (this.terminado || !enemigo.active) return;
    if (jugador.tieneEscudo(this.reloj)) {
      this.sumarPuntos(enemigo.datos.puntos);
      this.eliminarEnemigo(enemigo);
      return;
    }
    if (!jugador.recibirDanio(this.time.now)) return;
    this.eliminarEnemigo(enemigo);
    this.actualizarVidas();
    this.cameras.main.shake(EFECTOS.sacudidaMs, EFECTOS.sacudidaIntensidad);
    Sonido.danio();
    if (jugador.vidas <= 0) this.terminarPartida();
  }

  eliminarEnemigo(enemigo) {
    this.explotar(enemigo.x, enemigo.y, enemigo.datos.color);
    enemigo.desactivar();
    if (!this.terminado) this.oleadas.verificarFin();
  }

  terminarPartida() {
    this.terminado = true;
    this.oleadas.detener();
    this.physics.pause();
    this.explotar(this.jugador.x, this.jugador.y, COLORES.jugador);
    this.explotar(this.jugador.x, this.jugador.y, COLORES.borde);
    this.jugador.setVisible(false);
    this.escudo.setVisible(false);
    this.botonesHabilidad.mostrar(false);
    this.botonPausa.input.enabled = false;
    const nuevoRecord = Storage.guardarRecord(this.puntos);
    this.time.delayedCall(ESPERA_FIN_MS, () => {
      this.scene.start('GameOver', {
        puntos: this.puntos,
        record: Storage.obtenerRecord(),
        nuevoRecord,
        oleada: this.oleadas.oleada
      });
    });
  }

  disparar(tiempo) {
    if (!this.jugador.puedeDisparar(tiempo)) return;
    const bala = this.balas.getFirstDead(false);
    if (!bala) return;
    const angulo = this.jugador.rotation;
    const x = this.jugador.x + Math.cos(angulo) * BALA.distanciaCanon;
    const y = this.jugador.y + Math.sin(angulo) * BALA.distanciaCanon;
    bala.disparar(x, y, angulo, tiempo);
    Sonido.disparo();
  }

  enemigoMasCercano() {
    const lista = this.enemigos.getChildren();
    let mejor = null;
    let mejorDistancia = TACTIL.alcanceAutoApuntado * TACTIL.alcanceAutoApuntado;
    for (let i = 0; i < lista.length; i++) {
      const enemigo = lista[i];
      if (!enemigo.active) continue;
      const dx = enemigo.x - this.jugador.x;
      const dy = enemigo.y - this.jugador.y;
      const distancia = dx * dx + dy * dy;
      if (distancia < mejorDistancia) {
        mejorDistancia = distancia;
        mejor = enemigo;
      }
    }
    return mejor;
  }

  update(time, delta) {
    if (this.pausado || this.terminado || this.eligiendo) return;
    this.reloj += delta;

    const t = this.teclas;
    const tactil = this.controlesTactiles;
    let dx = (t.D.isDown || t.RIGHT.isDown ? 1 : 0) - (t.A.isDown || t.LEFT.isDown ? 1 : 0);
    let dy = (t.S.isDown || t.DOWN.isDown ? 1 : 0) - (t.W.isDown || t.UP.isDown ? 1 : 0);
    if (dx === 0 && dy === 0) {
      dx = tactil.dx;
      dy = tactil.dy;
    }
    this.jugador.mover(dx, dy, this.reloj);
    this.jugador.actualizarEfectos(this.reloj);
    this.escudo.setVisible(this.jugador.tieneEscudo(this.reloj)).setPosition(this.jugador.x, this.jugador.y);
    this.botonesHabilidad.actualizar(this.reloj);

    const puntero = this.input.mousePointer;
    let disparando = puntero.leftButtonDown() || t.SPACE.isDown;

    if (tactil.activo) {
      const objetivo = this.enemigoMasCercano();
      if (objetivo) this.jugador.apuntarA(objetivo.x, objetivo.y);
      else if (dx !== 0 || dy !== 0) this.jugador.rotation = Math.atan2(dy, dx);
      disparando = disparando || tactil.disparando;
    } else {
      this.jugador.apuntarA(puntero.x, puntero.y);
    }

    if (disparando) this.disparar(time);
  }
}
