import Phaser from 'phaser';
import { ANCHO, ALTO, MUNDO, JUGADOR, BALA, BALA_ENEMIGA, ENEMIGOS, EFECTOS, TACTIL, HABILIDADES, RED } from '../config.js';
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
import { crearTexto, crearBoton, FUENTE } from '../systems/Interfaz.js';
import { ESTUDIANTE } from '../systems/Dibujos.js';
import { TIPOS_ENEMIGO, IDS_HABILIDAD, TECLAS_HABILIDAD, BANDERA_JUGADOR, BANDERA_ENEMIGO, EVENTO } from '../systems/Protocolo.js';

const PROFUNDIDAD_HUD = 30;
const PROFUNDIDAD_PAUSA = 50;
const ESPERA_FIN_MS = 900;
const ESPERA_AVISO_HABILIDAD_MS = 1500;

function redondear(valor) {
  return Math.round(valor);
}

function limitar(valor) {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return 0;
  return Math.max(-1, Math.min(1, numero));
}

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  init(datos) {
    this.red = datos && datos.red ? datos.red : null;
    this.sys.settings.data = {};
  }

  create() {
    this.multijugador = Boolean(this.red);
    this.add.image(0, 0, 'ciudad').setOrigin(0);
    this.physics.world.setBounds(MUNDO.borde, MUNDO.borde, MUNDO.ancho - MUNDO.borde * 2, MUNDO.alto - MUNDO.borde * 2);
    this.puntoMundo = new Phaser.Math.Vector2();
    this.vista = new Phaser.Geom.Rectangle(0, 0, ANCHO, ALTO);

    this.puntos = 0;
    this.record = Storage.obtenerRecord();
    this.pausado = false;
    this.terminado = false;
    this.eligiendo = false;
    this.reloj = 0;
    this.congeladoHasta = 0;
    this.eventosRed = [];
    this.proximoSnapshot = 0;
    this.textoEquipoPrevio = '';

    this.balas = this.crearPool(Bullet, BALA.poolMax);
    this.balasEnemigas = this.crearPool(Bullet, BALA_ENEMIGA.poolMax, 'bala-enemiga');
    this.enemigos = this.crearPool(Enemy, ENEMIGOS.poolMax);
    this.jugadores = this.crearJugadores();
    this.jugador = this.jugadores.find((jugador) => jugador.local);
    this.cameras.main.setBounds(0, 0, MUNDO.ancho, MUNDO.alto);
    this.seguir(this.jugador);

    this.explosion = this.add.particles(0, 0, 'particula', {
      speed: { min: 60, max: 200 },
      lifespan: EFECTOS.vidaParticulaMs,
      scale: { start: 1, end: 0 },
      emitting: false,
      maxAliveParticles: EFECTOS.particulasMax
    }).setDepth(8);
    this.onda = this.add.image(0, 0, 'onda').setDepth(9).setVisible(false);

    this.physics.add.overlap(this.balas, this.enemigos, this.alImpactar, null, this);
    this.jugadores.forEach((jugador) => {
      this.physics.add.overlap(jugador, this.enemigos, this.alChocar, null, this);
      this.physics.add.overlap(jugador, this.balasEnemigas, this.alRecibirDisparo, null, this);
    });

    this.teclas = this.input.keyboard.addKeys('W,A,S,D,UP,LEFT,DOWN,RIGHT,SPACE');
    this.input.keyboard.on('keydown-P', this.alternarPausa, this);
    this.input.keyboard.on('keydown-ESC', this.alternarPausa, this);
    this.input.keyboard.on('keydown-E', () => this.usarHabilidad('E'));
    this.input.keyboard.on('keydown-Q', () => this.usarHabilidad('Q'));
    this.input.keyboard.on('keydown-R', () => this.usarHabilidad('R'));

    this.crearHud();
    this.controlesTactiles = new TouchControls(this);
    this.habilidades = this.jugador.habilidades;
    this.modoTactil = this.controlesTactiles.activo;
    this.botonesHabilidad = new BotonesHabilidad(this, this.habilidades, this.modoTactil);
    this.mostrarBotonPausa(this.modoTactil);
    this.selector = new SelectorHabilidades(this, this.habilidades, () => this.terminarEleccion());
    this.crearAnuncio();
    this.crearMenuPausa();

    this.events.on('oleada', this.alIniciarOleada, this);
    this.events.on('oleadaCompletada', this.alCompletarOleada, this);
    this.game.events.on(Phaser.Core.Events.BLUR, this.pausarPorFoco, this);
    this.game.events.on(Phaser.Core.Events.HIDDEN, this.pausarPorFoco, this);
    if (this.multijugador) {
      this.red.on('mensaje', this.alMensajeRed, this);
      this.red.on('salio', this.alSalirJugador, this);
    }
    this.events.once('shutdown', this.limpiar, this);

    this.oleadas = new WaveManager(this);
    this.oleadas.iniciar();
  }

  limpiar() {
    this.events.off('oleada', this.alIniciarOleada, this);
    this.events.off('oleadaCompletada', this.alCompletarOleada, this);
    this.game.events.off(Phaser.Core.Events.BLUR, this.pausarPorFoco, this);
    this.game.events.off(Phaser.Core.Events.HIDDEN, this.pausarPorFoco, this);
    if (this.multijugador) {
      this.red.off('mensaje', this.alMensajeRed, this);
      this.red.off('salio', this.alSalirJugador, this);
    }
    this.oleadas.detener();
  }

  crearPool(clase, maximo, textura) {
    const grupo = this.physics.add.group({ classType: clase, maxSize: maximo, runChildUpdate: false });
    for (let i = 0; i < maximo; i++) {
      const objeto = grupo.create(-100, -100);
      if (textura) {
        objeto.setTexture(textura);
        objeto.body.setSize();
      }
      objeto.desactivar();
    }
    return grupo;
  }

  crearJugadores() {
    const lista = this.multijugador ? this.red.jugadores : [{ id: 'local', nombre: '' }];
    return lista.map((datos, i) => {
      const angulo = (i * Math.PI) / 2;
      const distancia = i === 0 ? 0 : RED.separacionAparicion;
      const x = MUNDO.ancho / 2 + Math.cos(angulo) * distancia;
      const y = MUNDO.alto / 2 + Math.sin(angulo) * distancia;
      const local = !this.multijugador || datos.id === this.red.miId;
      const jugador = new Player(this, x, y, { id: datos.id, nombre: datos.nombre, local });
      jugador.habilidades = new GestorHabilidades(this, jugador);
      jugador.escudoImagen = this.add.image(x, y, 'escudo').setDepth(11).setVisible(false);
      if (this.multijugador) {
        jugador.etiqueta = this.add.text(x, y - 30, datos.nombre, {
          fontFamily: FUENTE,
          fontSize: '13px',
          fontStyle: 'bold',
          color: local ? '#fff27a' : '#ffffff',
          stroke: '#000000',
          strokeThickness: 3
        }).setOrigin(0.5).setDepth(12);
      }
      return jugador;
    });
  }

  buscarJugador(id) {
    return this.jugadores.find((jugador) => jugador.id === id) || null;
  }

  seguir(jugador) {
    this.cameras.main.startFollow(jugador, true, MUNDO.suavizadoCamara, MUNDO.suavizadoCamara);
  }

  jugadorMasCercano(x, y) {
    let mejor = null;
    let mejorDistancia = Infinity;
    for (let i = 0; i < this.jugadores.length; i++) {
      const jugador = this.jugadores[i];
      if (!jugador.vivo) continue;
      const dx = jugador.x - x;
      const dy = jugador.y - y;
      const distancia = dx * dx + dy * dy;
      if (distancia < mejorDistancia) {
        mejorDistancia = distancia;
        mejor = jugador;
      }
    }
    return mejor;
  }

  vistaDe(jugador) {
    const x = Phaser.Math.Clamp(jugador.x - ANCHO / 2, 0, MUNDO.ancho - ANCHO);
    const y = Phaser.Math.Clamp(jugador.y - ALTO / 2, 0, MUNDO.alto - ALTO);
    return this.vista.setTo(x, y, ANCHO, ALTO);
  }

  enVistaDe(jugador, x, y) {
    if (!jugador) return false;
    return this.vistaDe(jugador).contains(x, y);
  }

  crearHud() {
    this.textoPuntos = crearTexto(this, 16, 10, 'Puntos: 0', 22).setDepth(PROFUNDIDAD_HUD);
    this.textoRecord = crearTexto(this, 16, 38, 'Récord: ' + this.record, 14, '#fff27a').setDepth(PROFUNDIDAD_HUD);
    this.textoOleada = crearTexto(this, ANCHO / 2, 10, 'Oleada 1', 22).setOrigin(0.5, 0).setDepth(PROFUNDIDAD_HUD);
    this.textoEquipo = crearTexto(this, ANCHO - 16, 10, '', 14).setOrigin(1, 0).setDepth(PROFUNDIDAD_HUD).setAlign('right');

    this.iconosVida = [];
    for (let i = 0; i < JUGADOR.vidas; i++) {
      const icono = this.add.image(26 + i * 24, 76, 'corazon').setScrollFactor(0).setDepth(PROFUNDIDAD_HUD);
      this.iconosVida.push(icono);
    }

    const pausa = crearBoton(this, ANCHO - 34, 32, 'II', () => this.alternarPausa(), 48, 44);
    pausa.fondo.setDepth(PROFUNDIDAD_HUD);
    pausa.etiqueta.setDepth(PROFUNDIDAD_HUD);
    this.botonPausa = pausa.fondo;
    this.etiquetaPausa = pausa.etiqueta;
  }

  actualizarEquipo() {
    if (!this.multijugador) return;
    const texto = this.jugadores
      .map((jugador) => {
        if (jugador.desconectado) return jugador.nombre + ' (salió)';
        return jugador.nombre + (jugador.vivo ? ' x' + jugador.vidas : ' (caído)');
      })
      .join('\n');
    if (texto === this.textoEquipoPrevio) return;
    this.textoEquipoPrevio = texto;
    this.textoEquipo.setText(texto);
  }

  mostrarBotonPausa(visible) {
    const mostrar = visible && !this.multijugador;
    this.botonPausa.setVisible(mostrar);
    this.etiquetaPausa.setVisible(mostrar);
    this.botonPausa.input.enabled = mostrar && !this.terminado;
  }

  revisarModoTactil() {
    if (this.controlesTactiles.activo === this.modoTactil) return;
    this.modoTactil = this.controlesTactiles.activo;
    this.botonesHabilidad.cambiarModo(this.modoTactil);
    this.mostrarBotonPausa(this.modoTactil);
  }

  crearAnuncio() {
    this.anuncio = crearTexto(this, ANCHO / 2, ALTO / 2 - 80, '', 40).setOrigin(0.5).setDepth(20).setAlpha(0);
  }

  crearMenuPausa() {
    const capa = this.add.rectangle(0, 0, ANCHO, ALTO, 0x000000, 0.6).setOrigin(0).setScrollFactor(0).setInteractive();
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
    if (this.eligiendo || this.multijugador) return;
    if (this.pausado) this.reanudar();
    else this.pausar();
  }

  pausarPorFoco() {
    if (!this.pausado && !this.eligiendo && !this.multijugador) this.pausar();
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

  iniciarEleccion(teclaNueva) {
    if (this.terminado) return;
    this.eligiendo = true;
    this.detenerMundo();
    this.selector.mostrar(teclaNueva);
  }

  terminarEleccion() {
    this.eligiendo = false;
    this.reanudarMundo();
  }

  usarHabilidad(tecla, jugador = this.jugador) {
    if (this.pausado || this.terminado || this.eligiendo || !jugador.vivo) return;
    if (jugador.habilidades.usar(tecla, this.reloj)) this.sonar('habilidad', jugador);
  }

  sonar(nombre, jugador = null) {
    if (!jugador || jugador.local) Sonido[nombre]();
    if (this.multijugador) this.eventosRed.push([EVENTO.sonido, nombre, jugador ? jugador.id : '']);
  }

  sacudir(jugador) {
    if (jugador.local) this.cameras.main.shake(EFECTOS.sacudidaMs, EFECTOS.sacudidaIntensidad);
    else if (this.multijugador) this.eventosRed.push([EVENTO.sacudida, jugador.id]);
  }

  destello() {
    this.cameras.main.flash(200, 140, 210, 255);
    if (this.multijugador) this.eventosRed.push([EVENTO.destello]);
  }

  mostrarOnda(x, y, color, radio) {
    this.tweens.killTweensOf(this.onda);
    this.onda.setPosition(x, y).setTint(color).setVisible(true).setAlpha(1).setScale(0.2);
    this.tweens.add({
      targets: this.onda,
      scale: radio / 64,
      alpha: 0,
      duration: 320,
      ease: 'Cubic.Out',
      onComplete: () => this.onda.setVisible(false)
    });
    if (this.multijugador) this.eventosRed.push([EVENTO.onda, redondear(x), redondear(y), color, radio]);
  }

  alIniciarOleada(numero) {
    this.textoOleada.setText('Oleada ' + numero);
    this.anunciar('Oleada ' + numero);
    this.sonar('oleada');
    if (this.multijugador && numero > 1) this.revivirCaidos();
  }

  revivirCaidos() {
    const companero = this.jugadores.find((jugador) => jugador.vivo);
    if (!companero) return;
    this.jugadores.forEach((jugador) => {
      if (jugador.vivo || jugador.desconectado) return;
      jugador.revivir(companero.x, companero.y, RED.vidasAlRevivir, this.time.now);
      if (jugador.local) {
        this.seguir(jugador);
        this.actualizarVidas();
      }
    });
  }

  alCompletarOleada(numero) {
    this.anunciar('¡Oleada superada!');
    if (this.multijugador) {
      this.asignarHabilidadesAutomaticas(numero);
      return;
    }
    const teclaNueva = this.habilidades.teclaPorDesbloquear(numero);
    if (teclaNueva || numero % HABILIDADES.cadaOleadas === 0) {
      this.time.delayedCall(HABILIDADES.esperaSelectorMs, () => this.iniciarEleccion(teclaNueva));
    }
  }

  asignarHabilidadesAutomaticas(numero) {
    let teclaNueva = null;
    this.jugadores.forEach((jugador) => {
      const tecla = jugador.habilidades.teclaPorDesbloquear(numero);
      if (!tecla) return;
      jugador.habilidades.asignar(tecla, jugador.habilidades.opciones()[0]);
      teclaNueva = tecla;
    });
    if (!teclaNueva) return;
    this.botonesHabilidad.refrescar();
    this.time.delayedCall(ESPERA_AVISO_HABILIDAD_MS, () => this.anunciar('¡Nueva habilidad en ' + teclaNueva + '!'));
  }

  anunciar(texto) {
    this.tweens.killTweensOf(this.anuncio);
    this.anuncio.setText(texto).setAlpha(1).setScale(1.3);
    this.tweens.add({ targets: this.anuncio, scale: 1, duration: 250, ease: 'Back.Out' });
    this.tweens.add({ targets: this.anuncio, alpha: 0, delay: 1300, duration: 400 });
    if (this.multijugador) this.eventosRed.push([EVENTO.anuncio, texto]);
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
    this.iconosVida.forEach((icono, i) => icono.setVisible(this.jugador.vivo && i < this.jugador.vidas));
  }

  generarEnemigo(tipo, multiplicadorVelocidad) {
    const enemigo = this.enemigos.getFirstDead(false);
    if (!enemigo) return false;
    const vivos = this.jugadores.filter((jugador) => jugador.vivo);
    const objetivo = vivos.length > 0 ? Phaser.Utils.Array.GetRandom(vivos) : this.jugador;
    const vista = this.vistaDe(objetivo);
    const m = ENEMIGOS.margenAparicion;
    const lado = Phaser.Math.Between(0, 3);
    let x;
    let y;
    if (lado === 0) {
      x = Phaser.Math.Between(vista.x, vista.right);
      y = vista.y - m;
    } else if (lado === 1) {
      x = vista.right + m;
      y = Phaser.Math.Between(vista.y, vista.bottom);
    } else if (lado === 2) {
      x = Phaser.Math.Between(vista.x, vista.right);
      y = vista.bottom + m;
    } else {
      x = vista.x - m;
      y = Phaser.Math.Between(vista.y, vista.bottom);
    }
    enemigo.aparecer(tipo, x, y, multiplicadorVelocidad, objetivo);
    return true;
  }

  dispararEnemigo(x, y, angulo) {
    const bala = this.balasEnemigas.getFirstDead(false);
    if (!bala) return;
    bala.danio = BALA_ENEMIGA.danio;
    bala.disparar(x, y, angulo, this.time.now, BALA_ENEMIGA.velocidad, BALA_ENEMIGA.vidaMs);
  }

  explotar(x, y, color) {
    this.explosion.setParticleTint(color);
    this.explosion.explode(EFECTOS.particulasPorExplosion, x, y);
    if (this.multijugador) this.eventosRed.push([EVENTO.explosion, redondear(x), redondear(y), color]);
  }

  alImpactar(bala, enemigo) {
    if (!bala.active || !enemigo.active) return;
    bala.desactivar();
    if (!enemigo.recibirDanio(bala.danio, this.time.now)) return;
    this.sumarPuntos(enemigo.datos.puntos);
    this.sonar('explosion');
    this.eliminarEnemigo(enemigo);
  }

  alChocar(jugador, enemigo) {
    if (this.terminado || !enemigo.active || !jugador.vivo) return;
    if (jugador.tieneEscudo(this.reloj)) {
      this.sumarPuntos(enemigo.datos.puntos);
      this.eliminarEnemigo(enemigo);
      return;
    }
    if (!this.herirJugador(jugador)) return;
    this.eliminarEnemigo(enemigo);
  }

  alRecibirDisparo(jugador, bala) {
    if (this.terminado || !bala.active || !jugador.vivo) return;
    bala.desactivar();
    if (jugador.tieneEscudo(this.reloj)) return;
    this.herirJugador(jugador);
  }

  herirJugador(jugador) {
    if (!jugador.recibirDanio(this.time.now)) return false;
    if (jugador === this.jugador) this.actualizarVidas();
    this.sacudir(jugador);
    this.sonar('danio', jugador);
    if (jugador.vidas <= 0) this.caerJugador(jugador);
    return true;
  }

  caerJugador(jugador) {
    this.explotar(jugador.x, jugador.y, ESTUDIANTE.sudadera);
    this.explotar(jugador.x, jugador.y, 0x8a1010);
    jugador.caer();
    jugador.escudoImagen.setVisible(false);
    if (jugador === this.jugador) this.actualizarVidas();
    if (this.multijugador && this.jugadores.some((otro) => otro.vivo)) {
      this.anunciar(jugador.nombre + ' cayó');
      if (jugador === this.jugador) this.seguir(this.jugadores.find((otro) => otro.vivo));
      return;
    }
    this.terminarPartida();
  }

  eliminarEnemigo(enemigo) {
    this.explotar(enemigo.x, enemigo.y, enemigo.datos.sangre);
    enemigo.desactivar();
    if (!this.terminado) this.oleadas.verificarFin();
  }

  terminarPartida() {
    if (this.terminado) return;
    this.terminado = true;
    this.oleadas.detener();
    this.physics.pause();
    this.botonesHabilidad.mostrar(false);
    this.botonPausa.input.enabled = false;
    const nuevoRecord = Storage.guardarRecord(this.puntos);
    if (this.multijugador) {
      this.enviarSnapshot();
      this.red.terminarPartida(this.puntos, this.oleadas.oleada);
    }
    this.time.delayedCall(ESPERA_FIN_MS, () => {
      this.scene.start('GameOver', {
        puntos: this.puntos,
        record: Storage.obtenerRecord(),
        nuevoRecord,
        oleada: this.oleadas.oleada,
        red: this.red
      });
    });
  }

  alMensajeRed(id, datos) {
    if (!datos || datos.t !== 'i') return;
    const jugador = this.buscarJugador(id);
    if (!jugador) return;
    const entrada = jugador.entrada;
    entrada.dx = limitar(datos.dx);
    entrada.dy = limitar(datos.dy);
    entrada.angulo = Number.isFinite(datos.a) ? datos.a : entrada.angulo;
    entrada.disparando = Boolean(datos.f);
    if (Array.isArray(datos.h)) {
      datos.h.forEach((tecla) => {
        if (TECLAS_HABILIDAD.includes(tecla) && entrada.habilidades.length < 6) entrada.habilidades.push(tecla);
      });
    }
  }

  alSalirJugador(id) {
    const jugador = this.buscarJugador(id);
    if (!jugador || jugador.desconectado) return;
    jugador.desconectado = true;
    jugador.escudoImagen.setVisible(false);
    if (jugador.vivo) jugador.caer();
    this.anunciar(jugador.nombre + ' salió');
    if (!this.jugadores.some((otro) => otro.vivo)) this.terminarPartida();
  }

  enviarSnapshot() {
    const ahora = this.time.now;
    const jugadores = this.jugadores.map((jugador) => {
      let banderas = 0;
      if (jugador.vivo) banderas |= BANDERA_JUGADOR.vivo;
      if (jugador.tieneEscudo(this.reloj)) banderas |= BANDERA_JUGADOR.escudo;
      if (jugador.enFrenesi) banderas |= BANDERA_JUGADOR.frenesi;
      if (jugador.esInvulnerable(ahora)) banderas |= BANDERA_JUGADOR.invulnerable;
      const velocidad = jugador.body.velocity;
      return [jugador.id, redondear(jugador.x), redondear(jugador.y), redondear(jugador.rotation * 100), redondear(velocidad.x), redondear(velocidad.y), jugador.vidas, banderas];
    });

    const enemigos = [];
    const listaEnemigos = this.enemigos.getChildren();
    for (let i = 0; i < listaEnemigos.length; i++) {
      const enemigo = listaEnemigos[i];
      if (!enemigo.active) continue;
      let banderas = 0;
      if (enemigo.flashHasta) banderas |= BANDERA_ENEMIGO.golpeado;
      if (enemigo.congelado) banderas |= BANDERA_ENEMIGO.congelado;
      const velocidad = enemigo.body.velocity;
      enemigos.push([i, TIPOS_ENEMIGO.indexOf(enemigo.tipo), redondear(enemigo.x), redondear(enemigo.y), redondear(enemigo.rotation * 100), redondear(velocidad.x), redondear(velocidad.y), banderas]);
    }

    const base = {
      t: 's',
      j: jugadores,
      e: enemigos,
      b: this.empaquetarBalas(this.balas),
      a: this.empaquetarBalas(this.balasEnemigas),
      p: this.puntos,
      o: this.oleadas.oleada,
      ev: this.eventosRed
    };
    this.eventosRed = [];

    this.jugadores.forEach((jugador) => {
      if (jugador.local || jugador.desconectado) return;
      const habilidades = TECLAS_HABILIDAD.map((tecla) => {
        const id = jugador.habilidades.ranuras[tecla];
        if (!id) return null;
        return [IDS_HABILIDAD.indexOf(id), redondear(jugador.habilidades.restante(tecla, this.reloj))];
      });
      this.red.enviar(jugador.id, { ...base, yo: { h: habilidades } });
    });
  }

  empaquetarBalas(grupo) {
    const datos = [];
    const lista = grupo.getChildren();
    for (let i = 0; i < lista.length; i++) {
      const bala = lista[i];
      if (!bala.active) continue;
      datos.push(redondear(bala.x), redondear(bala.y), redondear(bala.body.velocity.x), redondear(bala.body.velocity.y));
    }
    return datos;
  }

  disparar(jugador, tiempo) {
    if (!jugador.puedeDisparar(tiempo)) return;
    const bala = this.balas.getFirstDead(false);
    if (!bala) return;
    const angulo = jugador.rotation;
    const x = jugador.x + Math.cos(angulo) * BALA.distanciaCanon;
    const y = jugador.y + Math.sin(angulo) * BALA.distanciaCanon;
    bala.disparar(x, y, angulo, tiempo);
    if (jugador.local) Sonido.disparo();
  }

  enemigoMasCercano(jugador) {
    const lista = this.enemigos.getChildren();
    let mejor = null;
    let mejorDistancia = TACTIL.alcanceAutoApuntado * TACTIL.alcanceAutoApuntado;
    for (let i = 0; i < lista.length; i++) {
      const enemigo = lista[i];
      if (!enemigo.active) continue;
      const dx = enemigo.x - jugador.x;
      const dy = enemigo.y - jugador.y;
      const distancia = dx * dx + dy * dy;
      if (distancia < mejorDistancia) {
        mejorDistancia = distancia;
        mejor = enemigo;
      }
    }
    return mejor;
  }

  controlarLocal(jugador, time) {
    const t = this.teclas;
    const tactil = this.controlesTactiles;
    let dx = (t.D.isDown || t.RIGHT.isDown ? 1 : 0) - (t.A.isDown || t.LEFT.isDown ? 1 : 0);
    let dy = (t.S.isDown || t.DOWN.isDown ? 1 : 0) - (t.W.isDown || t.UP.isDown ? 1 : 0);
    if (dx === 0 && dy === 0) {
      dx = tactil.dx;
      dy = tactil.dy;
    }
    jugador.mover(dx, dy, this.reloj);

    const puntero = this.input.mousePointer;
    let disparando = puntero.leftButtonDown() || t.SPACE.isDown;

    if (tactil.activo) {
      const objetivo = this.enemigoMasCercano(jugador);
      if (objetivo) jugador.apuntarA(objetivo.x, objetivo.y);
      else if (dx !== 0 || dy !== 0) jugador.rotation = Math.atan2(dy, dx);
      disparando = disparando || tactil.disparando;
    } else {
      this.cameras.main.getWorldPoint(puntero.x, puntero.y, this.puntoMundo);
      jugador.apuntarA(this.puntoMundo.x, this.puntoMundo.y);
    }

    if (disparando) this.disparar(jugador, time);
  }

  controlarRemoto(jugador, time) {
    const entrada = jugador.entrada;
    jugador.mover(entrada.dx, entrada.dy, this.reloj);
    jugador.rotation = entrada.angulo;
    if (entrada.disparando) this.disparar(jugador, time);
    while (entrada.habilidades.length > 0) this.usarHabilidad(entrada.habilidades.shift(), jugador);
  }

  update(time, delta) {
    if (this.pausado || this.terminado || this.eligiendo) return;
    this.reloj += delta;
    this.revisarModoTactil();

    for (let i = 0; i < this.jugadores.length; i++) {
      const jugador = this.jugadores[i];
      if (jugador.vivo) {
        if (jugador.local) this.controlarLocal(jugador, time);
        else this.controlarRemoto(jugador, time);
      }
      jugador.actualizarEfectos(this.reloj);
      jugador.escudoImagen.setVisible(jugador.vivo && jugador.tieneEscudo(this.reloj)).setPosition(jugador.x, jugador.y);
    }

    this.botonesHabilidad.actualizar(this.reloj);
    this.actualizarEquipo();

    if (this.multijugador && time >= this.proximoSnapshot) {
      this.proximoSnapshot = time + RED.intervaloSnapshotMs;
      this.enviarSnapshot();
    }
  }
}
