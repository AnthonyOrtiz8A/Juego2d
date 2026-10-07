import Phaser from 'phaser';
import { ANCHO, ALTO, MUNDO, JUGADOR, BALA, BALA_ENEMIGA, ENEMIGOS, EFECTOS, TACTIL, HABILIDADES, RED, HISTORIA, ARMAS } from '../config.js';
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
import SelectorRecompensa from '../systems/SelectorRecompensa.js';
import { exportarEstado, importarEstado, pasivasEquipadas } from '../systems/Recompensas.js';
import { nivelHistoria, tituloNivel } from '../systems/Mapas.js';
import Historia, { nombreArticulo, textoObjeto } from '../systems/Historia.js';
import HudArmas from '../systems/HudArmas.js';
import Minimapa from '../systems/Minimapa.js';
import BotonesAccion from '../systems/BotonesAccion.js';
import { crearTexto, crearBoton, FUENTE } from '../systems/Interfaz.js';
import { ESTUDIANTE } from '../systems/Dibujos.js';
import { TIPOS_ENEMIGO, IDS_HABILIDAD, TECLAS_HABILIDAD, IDS_ARMA, BANDERA_JUGADOR, BANDERA_ENEMIGO, EVENTO } from '../systems/Protocolo.js';

const PROFUNDIDAD_HUD = 30;
const PROFUNDIDAD_PAUSA = 50;
const ESPERA_FIN_MS = 900;
const ESPERA_AVISO_HABILIDAD_MS = 1500;
const ESPERA_VICTORIA_MS = 2500;
const ANCHO_BARRA_JEFE = 360;
const MITAD_VISTA_X = (ALTO * 2.2) / 2 + RED.margenCulling;
const MITAD_VISTA_Y = ALTO / 2 + RED.margenCulling;

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
    const entrada = datos || {};
    this.red = entrada.red || null;
    this.modo = entrada.modo || 'supervivencia';
    this.nivelIndice = Number.isInteger(entrada.nivel) ? entrada.nivel : 0;
    this.estadoInicial = entrada.estado || null;
    this.puntosIniciales = entrada.puntos || 0;
    this.semilla = Number.isFinite(entrada.semilla) ? entrada.semilla : Math.floor(Math.random() * 1e9);
    this.sys.settings.data = {};
  }

  create() {
    this.multijugador = Boolean(this.red);
    this.historia = this.modo === 'historia';
    this.nivelDatos = this.historia ? nivelHistoria(this.nivelIndice) : null;
    if (this.historia && !this.nivelDatos) {
      this.historia = false;
      this.modo = 'supervivencia';
    }

    this.historiaCtrl = null;
    if (this.historia) {
      this.historiaCtrl = new Historia(this, this.semilla, this.nivelDatos);
      this.limitesMundo = this.historiaCtrl.limites();
      this.physics.world.setBounds(0, 0, this.limitesMundo.ancho, this.limitesMundo.alto);
    } else {
      this.add.image(0, 0, 'ciudad').setOrigin(0);
      this.limitesMundo = { ancho: MUNDO.ancho, alto: MUNDO.alto };
      this.physics.world.setBounds(MUNDO.borde, MUNDO.borde, MUNDO.ancho - MUNDO.borde * 2, MUNDO.alto - MUNDO.borde * 2);
    }
    this.puntoMundo = new Phaser.Math.Vector2();
    this.vista = new Phaser.Geom.Rectangle(0, 0, ANCHO, ALTO);

    this.puntos = this.puntosIniciales;
    this.record = Storage.obtenerRecord();
    this.pausado = false;
    this.terminado = false;
    this.eligiendo = false;
    this.reloj = 0;
    this.congeladoHasta = 0;
    this.eventosRed = [];
    this.proximoSnapshot = 0;
    this.secuencia = 0;
    this.textoEquipoPrevio = '';
    this.jefe = null;
    this.oleadas = null;

    this.balas = this.crearPool(Bullet, BALA.poolMax);
    this.balasEnemigas = this.crearPool(Bullet, BALA_ENEMIGA.poolMax, 'bala-enemiga');
    this.enemigos = this.crearPool(Enemy, ENEMIGOS.poolMax);
    this.jugadores = this.crearJugadores();
    this.jugador = this.jugadores.find((jugador) => jugador.local);
    this.cameras.main.setBounds(0, 0, this.limitesMundo.ancho, this.limitesMundo.alto);
    this.seguir(this.jugador);

    const cantidad = this.jugadores.length;
    const multiplicadorMundo = this.historia ? HISTORIA.multVidaPorMundo[this.nivelDatos.mundo - 1] : 1;
    this.multiplicadorVida = multiplicadorMundo * (1 + (cantidad - 1) * HISTORIA.multVidaPorJugador);
    this.multiplicadorCantidad = 1 + (cantidad - 1) * HISTORIA.multCantidadPorJugador;

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
    if (this.historiaCtrl) {
      this.historiaCtrl.prepararJugadores(this.jugadores);
      this.historiaCtrl.agregarColisiones(this.jugadores);
    }

    this.teclas = this.input.keyboard.addKeys('W,A,S,D,UP,LEFT,DOWN,RIGHT,SPACE');
    this.input.keyboard.on('keydown-P', this.alternarPausa, this);
    this.input.keyboard.on('keydown-ESC', this.alternarPausa, this);
    TECLAS_HABILIDAD.forEach((tecla) => this.input.keyboard.on('keydown-' + tecla, () => this.usarHabilidad(tecla)));
    this.input.keyboard.on('keydown-X', () => this.accion('cambiar'));
    this.input.keyboard.on('keydown-F', () => this.accion('interactuar'));
    this.input.on('wheel', () => this.accion('cambiar'));

    this.crearHud();
    this.controlesTactiles = new TouchControls(this);
    this.habilidades = this.jugador.habilidades;
    this.modoTactil = this.controlesTactiles.activo;
    this.botonesHabilidad = new BotonesHabilidad(this, this.habilidades, this.modoTactil);
    this.mostrarBotonPausa(this.modoTactil);
    this.selector = new SelectorHabilidades(this, this.habilidades, () => this.terminarEleccion());
    this.selectorRecompensa = new SelectorRecompensa(this);
    this.hudArmas = new HudArmas(this);
    this.hudArmas.mostrar(this.historia);
    this.botonesAccion = new BotonesAccion(this, (nombre) => this.accion(nombre));
    this.botonesAccion.cambiarModo(this.modoTactil && this.historia);
    this.minimapa = this.historiaCtrl ? new Minimapa(this, this.historiaCtrl.mazmorra) : null;
    if (this.minimapa) this.textoEquipo.setY(this.minimapa.abajo + 10);
    this.textoInteraccion = this.add.text(0, 0, '', { fontFamily: FUENTE, fontSize: '13px', fontStyle: 'bold', color: '#e8f070', stroke: '#000000', strokeThickness: 3 }).setOrigin(0.5).setDepth(20).setVisible(false);
    this.textoAviso = crearTexto(this, ANCHO / 2, ALTO - 140, '', 16, '#ff8fa3').setOrigin(0.5).setDepth(PROFUNDIDAD_HUD).setAlpha(0);
    this.crearAnuncio();
    this.crearMenuPausa();
    this.actualizarVidas();
    this.actualizarArma();

    this.events.on('oleada', this.alIniciarOleada, this);
    this.events.on('oleadaCompletada', this.alCompletarOleada, this);
    this.events.on('nivelCompletado', this.alCompletarNivel, this);
    this.game.events.on(Phaser.Core.Events.BLUR, this.pausarPorFoco, this);
    this.game.events.on(Phaser.Core.Events.HIDDEN, this.pausarPorFoco, this);
    if (this.multijugador) {
      this.red.on('mensaje', this.alMensajeRed, this);
      this.red.on('salio', this.alSalirJugador, this);
    }
    this.events.once('shutdown', this.limpiar, this);

    if (this.historia) {
      this.textoOleada.setText('M' + this.nivelDatos.mundo + '-' + this.nivelDatos.numero + ' · ' + this.nivelDatos.nombre);
      this.anunciar(tituloNivel(this.nivelDatos));
      return;
    }
    this.oleadas = new WaveManager(this, { multiplicadorCantidad: this.multiplicadorCantidad });
    this.oleadas.iniciar();
  }

  limpiar() {
    this.events.off('oleada', this.alIniciarOleada, this);
    this.events.off('oleadaCompletada', this.alCompletarOleada, this);
    this.events.off('nivelCompletado', this.alCompletarNivel, this);
    this.game.events.off(Phaser.Core.Events.BLUR, this.pausarPorFoco, this);
    this.game.events.off(Phaser.Core.Events.HIDDEN, this.pausarPorFoco, this);
    if (this.multijugador) {
      this.red.off('mensaje', this.alMensajeRed, this);
      this.red.off('salio', this.alSalirJugador, this);
    }
    if (this.oleadas) this.oleadas.detener();
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
      const jugador = new Player(this, x, y, { id: datos.id, nombre: datos.nombre, local, indice: i });
      jugador.habilidades = new GestorHabilidades(this, jugador);
      jugador.entrada.x = null;
      jugador.entrada.y = null;
      if (this.historia && this.estadoInicial) importarEstado(jugador, this.estadoInicial[datos.id]);
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
    this.textoPuntos = crearTexto(this, 16, 10, 'Puntos: ' + this.puntos, 22).setDepth(PROFUNDIDAD_HUD);
    this.textoRecord = crearTexto(this, 16, 38, 'Récord: ' + this.record, 14, '#fff27a').setDepth(PROFUNDIDAD_HUD);
    this.textoOleada = crearTexto(this, ANCHO / 2, 10, '', 22).setOrigin(0.5, 0).setDepth(PROFUNDIDAD_HUD);
    this.textoEquipo = crearTexto(this, ANCHO - 16, 10, '', 14).setOrigin(1, 0).setDepth(PROFUNDIDAD_HUD).setAlign('right');

    this.iconosVida = [];
    const maximo = JUGADOR.vidas + 3;
    for (let i = 0; i < maximo; i++) {
      const icono = this.add.image(26 + i * 24, 76, 'corazon').setScrollFactor(0).setDepth(PROFUNDIDAD_HUD);
      this.iconosVida.push(icono);
    }

    this.barraJefeFondo = this.add.rectangle(ANCHO / 2, 64, ANCHO_BARRA_JEFE + 6, 16, 0x000000, 0.75).setScrollFactor(0).setDepth(PROFUNDIDAD_HUD).setVisible(false);
    this.barraJefe = this.add.rectangle(ANCHO / 2 - ANCHO_BARRA_JEFE / 2, 64, ANCHO_BARRA_JEFE, 10, 0xc0392b, 1).setOrigin(0, 0.5).setScrollFactor(0).setDepth(PROFUNDIDAD_HUD).setVisible(false);
    this.textoJefe = crearTexto(this, ANCHO / 2, 44, '', 14, '#ff8fa3').setOrigin(0.5).setDepth(PROFUNDIDAD_HUD).setVisible(false);

    const pausa = crearBoton(this, ANCHO - 34, 32, 'II', () => this.alternarPausa(), 48, 44);
    pausa.fondo.setDepth(PROFUNDIDAD_HUD);
    pausa.etiqueta.setDepth(PROFUNDIDAD_HUD);
    this.botonPausa = pausa.fondo;
    this.etiquetaPausa = pausa.etiqueta;
  }

  actualizarArma() {
    this.actualizarHudArmas();
  }

  actualizarBarraJefe() {
    const visible = Boolean(this.jefe && this.jefe.active);
    this.barraJefeFondo.setVisible(visible);
    this.barraJefe.setVisible(visible);
    this.textoJefe.setVisible(visible);
    if (!visible) return;
    this.barraJefe.setSize(ANCHO_BARRA_JEFE * Phaser.Math.Clamp(this.jefe.vida / this.jefe.vidaMaxima, 0, 1), 10);
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
    this.botonesAccion.cambiarModo(this.modoTactil && this.historia);
    this.mostrarBotonPausa(this.modoTactil);
  }

  crearAnuncio() {
    this.anuncio = crearTexto(this, ANCHO / 2, ALTO / 2 - 80, '', 36).setOrigin(0.5).setDepth(20).setAlpha(0);
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

  textoOleadaActual(numero, total) {
    if (!this.historia) return 'Oleada ' + numero;
    return 'M' + this.nivelDatos.mundo + '-' + this.nivelDatos.numero + ' · Oleada ' + numero + '/' + total;
  }

  actualizarHudArmas() {
    if (!this.historia) return;
    this.hudArmas.actualizar(this.jugador.armas, this.jugador.armaActual, this.jugador.dedos, this.jugador.pasivas, this.jugador.mejoras);
  }

  actualizarInteraccion() {
    const objetivo = this.jugador.vivo ? this.historiaCtrl.interactuable(this.jugador) : null;
    this.botonesAccion.fijarInteraccion(Boolean(objetivo));
    if (!objetivo) {
      this.textoInteraccion.setVisible(false);
      return;
    }
    const objeto = objetivo.objeto;
    const texto = objetivo.tipo === 'suelo'
      ? textoObjeto(objeto.tipo, objeto.item, objeto.nivel)
      : 'F: Comprar ' + nombreArticulo(objeto.tipo, objeto.item) + ' (' + objeto.precio + ' dedos)';
    this.textoInteraccion.setText(texto).setPosition(objeto.x, objeto.y - 40).setVisible(true);
  }

  alIniciarOleada(numero, total) {
    this.textoOleada.setText(this.textoOleadaActual(numero, total));
    this.anunciar(this.historia ? '¡Zombies! Oleada ' + numero + ' de ' + total : 'Oleada ' + numero);
    this.sonar('oleada');
    if (this.multijugador && numero > 1) this.revivirCaidos();
  }

  revivirCaidos() {
    const companero = this.jugadores.find((jugador) => jugador.vivo);
    if (!companero) return;
    this.jugadores.forEach((jugador) => {
      if (jugador.vivo || jugador.desconectado) return;
      jugador.revivir(companero.x, companero.y, RED.vidasAlRevivir, this.time.now);
      jugador.entrada.x = null;
      jugador.entrada.y = null;
      if (jugador.local) {
        this.seguir(jugador);
        this.actualizarVidas();
      }
    });
  }

  alCompletarOleada(numero) {
    this.anunciar('¡Oleada superada!');
    if (this.historia) return;
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

  alCompletarNivel() {
    if (this.terminado || !this.historiaCtrl) return;
    const sala = this.historiaCtrl.salaActiva;
    if (sala && sala.tipo === 'jefe' && this.nivelIndice >= HISTORIA.niveles.length - 1) {
      this.historiaCtrl.salaActiva = null;
      this.oleadas.detener();
      this.oleadas = null;
      this.anunciar('¡La ciudad quedó atrás!');
      this.time.delayedCall(ESPERA_VICTORIA_MS, () => this.terminarPartida(true));
      return;
    }
    this.historiaCtrl.limpiarSala();
    this.textoOleada.setText(this.etiquetaNivel());
  }

  etiquetaNivel() {
    return 'M' + this.nivelDatos.mundo + '-' + this.nivelDatos.numero + ' · ' + this.nivelDatos.nombre;
  }

  accion(nombre, jugador = this.jugador) {
    if (this.pausado || this.terminado || this.eligiendo || !jugador.vivo || !this.historia) return;
    if (nombre === 'cambiar') jugador.cambiarArma();
    else if (nombre === 'interactuar') this.historiaCtrl.interactuar(jugador);
    else return;
    this.alCambiarEquipo(jugador);
  }

  alCambiarEquipo(jugador) {
    if (!jugador.local) return;
    this.botonesHabilidad.refrescar();
    this.actualizarVidas();
    this.actualizarArma();
  }

  avisar(jugador, texto) {
    if (jugador.local) {
      this.mostrarAviso(texto);
      return;
    }
    if (this.multijugador) this.eventosRed.push([EVENTO.aviso, jugador.id, texto]);
  }

  mostrarAviso(texto) {
    this.tweens.killTweensOf(this.textoAviso);
    this.textoAviso.setText(texto).setAlpha(1);
    this.tweens.add({ targets: this.textoAviso, alpha: 0, delay: 1200, duration: 400 });
  }

  teletransportar(jugador, x, y) {
    jugador.setPosition(x, y);
    jugador.body.reset(x, y);
    jugador.teletransportes += 1;
    jugador.entrada.x = null;
    jugador.entrada.y = null;
  }

  avanzarNivel() {
    if (this.terminado) return;
    const siguiente = this.nivelIndice + 1;
    const estado = {};
    this.jugadores.forEach((jugador) => {
      if (!jugador.desconectado) estado[jugador.id] = exportarEstado(jugador);
    });
    const semilla = Math.floor(Math.random() * 1e9);
    if (this.multijugador) this.red.cambiarNivel(siguiente, semilla);
    this.scene.restart({ red: this.red, modo: 'historia', nivel: siguiente, estado, puntos: this.puntos, semilla });
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

  posicionBorde(jugador) {
    const vista = this.vistaDe(jugador);
    const limites = this.physics.world.bounds;
    const m = ENEMIGOS.margenAparicion;
    const candidatos = [
      { x: Phaser.Math.Between(vista.x, vista.right), y: vista.y - m },
      { x: vista.right + m, y: Phaser.Math.Between(vista.y, vista.bottom) },
      { x: Phaser.Math.Between(vista.x, vista.right), y: vista.bottom + m },
      { x: vista.x - m, y: Phaser.Math.Between(vista.y, vista.bottom) }
    ];
    const dentro = candidatos.filter((punto) => limites.contains(punto.x, punto.y));
    const elegido = Phaser.Utils.Array.GetRandom(dentro.length > 0 ? dentro : candidatos);
    return {
      x: Phaser.Math.Clamp(elegido.x, limites.x + m, limites.right - m),
      y: Phaser.Math.Clamp(elegido.y, limites.y + m, limites.bottom - m)
    };
  }

  modificadorEquipo(clave) {
    return this.jugadores.reduce((suma, jugador) => (jugador.desconectado ? suma : suma + jugador.modificador(clave)), 0);
  }

  multiplicadorVidaActual() {
    return this.multiplicadorVida * (1 + this.modificadorEquipo('vidaEnemigos'));
  }

  multiplicadorVelocidadEquipo() {
    return 1 + this.modificadorEquipo('velocidadEnemigos');
  }

  gritar(chillona) {
    const grito = chillona.datos.grito;
    const radio2 = grito.radio * grito.radio;
    this.enemigos.getChildren().forEach((enemigo) => {
      if (!enemigo.active || enemigo === chillona) return;
      const dx = enemigo.x - chillona.x;
      const dy = enemigo.y - chillona.y;
      if (dx * dx + dy * dy <= radio2) enemigo.impulsoHasta = this.reloj + grito.duracionMs;
    });
    this.mostrarOnda(chillona.x, chillona.y, 0xff6bd6, grito.radio);
  }

  explotarZombie(enemigo) {
    const radio = enemigo.datos.explosion.radio;
    this.mostrarOnda(enemigo.x, enemigo.y, 0x9be22d, radio);
    this.explotar(enemigo.x, enemigo.y, 0x9be22d);
    this.sonar('explosion');
    this.jugadores.forEach((jugador) => {
      if (!jugador.vivo || jugador.tieneEscudo(this.reloj)) return;
      if (Phaser.Math.Distance.Between(jugador.x, jugador.y, enemigo.x, enemigo.y) <= radio + JUGADOR.radio) this.herirJugador(jugador);
    });
  }

  dividirZombie(enemigo) {
    const division = enemigo.datos.dividir;
    for (let i = 0; i < division.cantidad; i++) {
      const nuevo = this.enemigos.getFirstDead(false);
      if (!nuevo) return;
      const angulo = (i / division.cantidad) * Math.PI * 2;
      const objetivo = this.jugadorMasCercano(enemigo.x, enemigo.y) || this.jugador;
      const multiplicador = (this.oleadas ? this.oleadas.multiplicadorVelocidad : 1) * this.multiplicadorVelocidadEquipo();
      nuevo.aparecer(division.tipo, enemigo.x + Math.cos(angulo) * 20, enemigo.y + Math.sin(angulo) * 20, multiplicador, objetivo, this.multiplicadorVidaActual());
    }
  }

  objetivoAleatorio() {
    const vivos = this.jugadores.filter((jugador) => jugador.vivo);
    return vivos.length > 0 ? Phaser.Utils.Array.GetRandom(vivos) : this.jugador;
  }

  generarEnemigo(tipo, multiplicadorVelocidad) {
    const enemigo = this.enemigos.getFirstDead(false);
    if (!enemigo) return false;
    const objetivo = this.objetivoAleatorio();
    const posicion = this.historiaCtrl ? this.historiaCtrl.posicionAparicion() : this.posicionBorde(objetivo);
    if (!posicion) return false;
    enemigo.aparecer(tipo, posicion.x, posicion.y, multiplicadorVelocidad * this.multiplicadorVelocidadEquipo(), objetivo, this.multiplicadorVidaActual());
    return true;
  }

  generarJefe(tipo) {
    const enemigo = this.enemigos.getFirstDead(false);
    if (!enemigo) return;
    const objetivo = this.objetivoAleatorio();
    let x;
    let y;
    if (this.historiaCtrl && this.historiaCtrl.salaActiva) {
      const area = this.historiaCtrl.rectanguloActivo();
      x = area.centerX;
      y = area.y + 70;
    } else {
      const vista = this.vistaDe(objetivo);
      x = vista.centerX;
      y = vista.y - ENEMIGOS.margenAparicion;
    }
    enemigo.aparecer(tipo, x, y, 1, objetivo, this.multiplicadorVidaActual());
    this.jefe = enemigo;
    this.textoJefe.setText(ENEMIGOS.tipos[tipo].nombre);
    this.anunciar('¡' + ENEMIGOS.tipos[tipo].nombre + '!');
    this.sonar('oleada');
    this.cameras.main.shake(400, 0.006);
  }

  invocarEsbirros(x, y, cantidad) {
    for (let i = 0; i < cantidad; i++) {
      const enemigo = this.enemigos.getFirstDead(false);
      if (!enemigo) return;
      const angulo = (i / cantidad) * Math.PI * 2;
      const objetivo = this.jugadorMasCercano(x, y) || this.jugador;
      let px = x + Math.cos(angulo) * 90;
      let py = y + Math.sin(angulo) * 90;
      if (this.historiaCtrl && this.historiaCtrl.salaActiva) {
        const area = this.historiaCtrl.rectanguloActivo();
        px = Phaser.Math.Clamp(px, area.x, area.right);
        py = Phaser.Math.Clamp(py, area.y, area.bottom);
      }
      const multiplicador = this.oleadas ? this.oleadas.multiplicadorVelocidad : 1;
      enemigo.aparecer(Math.random() < 0.5 ? 'normal' : 'rapido', px, py, multiplicador * this.multiplicadorVelocidadEquipo(), objetivo, this.multiplicadorVidaActual());
    }
  }

  dispararEnemigo(x, y, angulo) {
    const bala = this.balasEnemigas.getFirstDead(false);
    if (!bala) return;
    bala.disparar(x, y, angulo, this.time.now, BALA_ENEMIGA.velocidad, BALA_ENEMIGA.vidaMs);
    bala.danio = BALA_ENEMIGA.danio;
  }

  explotar(x, y, color) {
    this.explosion.setParticleTint(color);
    this.explosion.explode(EFECTOS.particulasPorExplosion, x, y);
    if (this.multijugador) this.eventosRed.push([EVENTO.explosion, redondear(x), redondear(y), color]);
  }

  impactarPared(bala) {
    if (!bala.active) return;
    if (bala.explosivo) this.detonar(bala);
    else bala.desactivar();
  }

  detonar(bala) {
    const { x, y, explosivo: radio, danio, duenio } = bala;
    bala.desactivar();
    this.mostrarOnda(x, y, 0xff7a1a, radio);
    this.explotar(x, y, 0xff7a1a);
    this.sonar('explosion');
    const radio2 = radio * radio;
    this.enemigos.getChildren().forEach((enemigo) => {
      if (!enemigo.active) return;
      const dx = enemigo.x - x;
      const dy = enemigo.y - y;
      if (dx * dx + dy * dy > radio2) return;
      if (!enemigo.recibirDanio(danio, this.time.now)) return;
      this.sumarPuntos(enemigo.datos.puntos);
      if (duenio) duenio.registrarBaja();
      this.eliminarEnemigo(enemigo);
    });
  }

  alImpactar(bala, enemigo) {
    if (!bala.active || !enemigo.active || bala.ultimoGolpe === enemigo) return;
    if (bala.explosivo) {
      this.detonar(bala);
      return;
    }
    bala.ultimoGolpe = enemigo;
    const danio = bala.danio * enemigo.factorDanio(bala);
    if (bala.perforacion > 0) bala.perforacion -= 1;
    else bala.desactivar();
    if (!enemigo.recibirDanio(danio, this.time.now)) return;
    this.sumarPuntos(enemigo.datos.puntos);
    this.sonar('explosion');
    if (bala.duenio) {
      const vidasAntes = bala.duenio.vidas;
      bala.duenio.registrarBaja();
      if (bala.duenio === this.jugador && bala.duenio.vidas !== vidasAntes) this.actualizarVidas();
    }
    this.eliminarEnemigo(enemigo);
  }

  alChocar(jugador, enemigo) {
    if (this.terminado || !enemigo.active || !jugador.vivo) return;
    if (jugador.tieneEscudo(this.reloj)) {
      if (enemigo.datos.jefe) return;
      this.sumarPuntos(enemigo.datos.puntos);
      this.eliminarEnemigo(enemigo);
      return;
    }
    if (!this.herirJugador(jugador)) return;
    if (!enemigo.datos.jefe) this.eliminarEnemigo(enemigo);
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
    if (this.historiaCtrl) this.historiaCtrl.cancelarOferta(jugador);
    if (this.multijugador && this.jugadores.some((otro) => otro.vivo)) {
      this.anunciar(jugador.nombre + ' cayó');
      if (jugador === this.jugador) this.seguir(this.jugadores.find((otro) => otro.vivo));
      return;
    }
    this.terminarPartida(false);
  }

  eliminarEnemigo(enemigo) {
    this.explotar(enemigo.x, enemigo.y, enemigo.datos.sangre);
    if (enemigo.datos.jefe) {
      this.explotar(enemigo.x + 30, enemigo.y, enemigo.datos.sangre);
      this.explotar(enemigo.x - 30, enemigo.y, enemigo.datos.sangre);
      this.cameras.main.shake(500, 0.01);
    }
    if (enemigo === this.jefe) this.jefe = null;
    if (this.historiaCtrl) this.historiaCtrl.soltarDedos(enemigo);
    enemigo.desactivar();
    if (enemigo.datos.explosion) this.explotarZombie(enemigo);
    if (enemigo.datos.dividir && !this.terminado) this.dividirZombie(enemigo);
    if (this.terminado || !this.oleadas) return;
    this.oleadas.registrarBaja();
    this.oleadas.verificarFin();
  }

  reubicarEnemigos() {
    const sala = this.historiaCtrl && this.historiaCtrl.salaActiva ? this.historiaCtrl.rectanguloActivo() : null;
    this.enemigos.getChildren().forEach((enemigo) => {
      if (!enemigo.active || enemigo.datos.jefe) return;
      const alcanzable = sala
        ? sala.contains(enemigo.x, enemigo.y)
        : this.jugadores.some((jugador) => jugador.vivo && this.enVistaDe(jugador, enemigo.x, enemigo.y));
      if (alcanzable) return;
      const posicion = this.historiaCtrl ? this.historiaCtrl.posicionAparicion() : this.posicionBorde(this.objetivoAleatorio());
      if (!posicion) return;
      enemigo.setPosition(posicion.x, posicion.y);
      enemigo.body.reset(posicion.x, posicion.y);
    });
  }

  terminarPartida(victoria) {
    if (this.terminado) return;
    this.terminado = true;
    if (this.oleadas) this.oleadas.detener();
    this.physics.pause();
    this.selectorRecompensa.cerrar();
    this.botonesHabilidad.mostrar(false);
    this.botonPausa.input.enabled = false;
    const nuevoRecord = Storage.guardarRecord(this.puntos);
    const resultado = {
      puntos: this.puntos,
      oleada: this.oleadas ? this.oleadas.oleada : 0,
      modo: this.modo,
      nivel: this.nivelIndice,
      victoria: Boolean(victoria)
    };
    if (this.multijugador) {
      this.enviarSnapshots();
      this.red.terminarPartida(resultado);
    }
    this.time.delayedCall(ESPERA_FIN_MS, () => {
      this.scene.start('GameOver', {
        ...resultado,
        record: Storage.obtenerRecord(),
        nuevoRecord,
        red: this.red
      });
    });
  }

  alMensajeRed(id, datos) {
    if (!datos) return;
    const jugador = this.buscarJugador(id);
    if (!jugador) return;
    if (datos.t === 'h') {
      if (!Array.isArray(datos.teclas)) return;
      datos.teclas.forEach((tecla) => {
        if (TECLAS_HABILIDAD.includes(tecla) && jugador.entrada.habilidades.length < 6) jugador.entrada.habilidades.push(tecla);
      });
      return;
    }
    if (datos.t === 'eleccion') {
      if (this.historiaCtrl) this.historiaCtrl.resolverOferta(jugador, { tomar: Boolean(datos.tomar), ranura: datos.ranura });
      return;
    }
    if (datos.t === 'accion') {
      if (['cambiar', 'interactuar'].includes(datos.a)) this.accion(datos.a, jugador);
      return;
    }
    if (datos.t !== 'i' || !Number.isFinite(datos.n) || datos.n <= jugador.ultimaEntrada) return;
    jugador.ultimaEntrada = datos.n;
    const entrada = jugador.entrada;
    entrada.dx = limitar(datos.dx);
    entrada.dy = limitar(datos.dy);
    entrada.angulo = Number.isFinite(datos.a) ? datos.a : entrada.angulo;
    entrada.disparando = Boolean(datos.f);
    if (datos.tp === jugador.teletransportes && Number.isFinite(datos.x) && Number.isFinite(datos.y)) {
      const limites = this.physics.world.bounds;
      entrada.x = Phaser.Math.Clamp(datos.x, limites.x + JUGADOR.radio, limites.right - JUGADOR.radio);
      entrada.y = Phaser.Math.Clamp(datos.y, limites.y + JUGADOR.radio, limites.bottom - JUGADOR.radio);
    }
  }

  alSalirJugador(id) {
    const jugador = this.buscarJugador(id);
    if (!jugador || jugador.desconectado) return;
    jugador.desconectado = true;
    jugador.escudoImagen.setVisible(false);
    if (jugador.vivo) jugador.caer();
    if (this.historiaCtrl) this.historiaCtrl.cancelarOferta(jugador);
    this.anunciar(jugador.nombre + ' salió');
    if (!this.jugadores.some((otro) => otro.vivo)) this.terminarPartida(false);
  }

  estadoJugadorRed(jugador, ahora) {
    let banderas = 0;
    if (jugador.vivo) banderas |= BANDERA_JUGADOR.vivo;
    if (jugador.tieneEscudo(this.reloj)) banderas |= BANDERA_JUGADOR.escudo;
    if (jugador.enFrenesi) banderas |= BANDERA_JUGADOR.frenesi;
    if (jugador.esInvulnerable(ahora)) banderas |= BANDERA_JUGADOR.invulnerable;
    const velocidad = jugador.local ? jugador.body.velocity : jugador.velocidadRed;
    return [jugador.id, redondear(jugador.x), redondear(jugador.y), redondear(jugador.rotation * 100), redondear(velocidad.x), redondear(velocidad.y), jugador.vidas, banderas];
  }

  datosPersonales(jugador) {
    return {
      h: TECLAS_HABILIDAD.map((tecla) => {
        const id = jugador.habilidades.ranuras[tecla];
        if (!id) return null;
        return [IDS_HABILIDAD.indexOf(id), redondear(jugador.habilidades.restante(tecla, this.reloj)), redondear(jugador.habilidades.duraciones[tecla])];
      }),
      arma: IDS_ARMA.indexOf(jugador.arma),
      m: jugador.mejoras,
      vm: jugador.velocidadMovimiento(),
      tp: jugador.teletransportes,
      dedos: jugador.dedos,
      pv: pasivasEquipadas(jugador.pasivas),
      armas: jugador.armas.map((ranura) => (ranura ? IDS_ARMA.indexOf(ranura.id) : -1)),
      aa: jugador.armaActual,
      x: redondear(jugador.x),
      y: redondear(jugador.y)
    };
  }

  enviarSnapshots() {
    const ahora = this.time.now;
    this.secuencia += 1;
    const jugadores = this.jugadores.map((jugador) => this.estadoJugadorRed(jugador, ahora));
    const jefe = this.jefe && this.jefe.active ? [TIPOS_ENEMIGO.indexOf(this.jefe.tipo), redondear((this.jefe.vida / this.jefe.vidaMaxima) * 1000)] : null;
    const eventos = this.eventosRed;
    this.eventosRed = [];

    this.jugadores.forEach((jugador) => {
      if (jugador.local || jugador.desconectado) return;
      const centro = jugador.vivo ? jugador : this.jugadores.find((otro) => otro.vivo) || jugador;
      const historia = this.historiaCtrl ? this.historiaCtrl.datosRed((x, y) => this.cerca(centro, x, y)) : {};
      this.red.enviarRapido(jugador.id, {
        ...historia,
        t: 's',
        n: this.secuencia,
        j: jugadores,
        e: this.empaquetarEnemigos(centro),
        b: this.empaquetarBalas(this.balas, centro, true),
        a: this.empaquetarBalas(this.balasEnemigas, centro, false),
        jf: jefe,
        p: this.puntos,
        o: this.oleadas ? this.oleadas.numeroEnNivel : 0,
        ot: this.oleadas && Number.isFinite(this.oleadas.total) ? this.oleadas.total : 0,
        ev: eventos,
        yo: this.datosPersonales(jugador)
      });
    });
  }

  cerca(centro, x, y) {
    return Math.abs(x - centro.x) <= MITAD_VISTA_X && Math.abs(y - centro.y) <= MITAD_VISTA_Y;
  }

  empaquetarEnemigos(centro) {
    const enemigos = [];
    const lista = this.enemigos.getChildren();
    for (let i = 0; i < lista.length; i++) {
      const enemigo = lista[i];
      if (!enemigo.active || (!enemigo.datos.jefe && !this.cerca(centro, enemigo.x, enemigo.y))) continue;
      let banderas = 0;
      if (enemigo.flashHasta) banderas |= BANDERA_ENEMIGO.golpeado;
      if (enemigo.congelado) banderas |= BANDERA_ENEMIGO.congelado;
      const velocidad = enemigo.body.velocity;
      enemigos.push([i, TIPOS_ENEMIGO.indexOf(enemigo.tipo), redondear(enemigo.x), redondear(enemigo.y), redondear(enemigo.rotation * 100), redondear(velocidad.x), redondear(velocidad.y), banderas]);
    }
    return enemigos;
  }

  empaquetarBalas(grupo, centro, conDuenio) {
    const datos = [];
    const lista = grupo.getChildren();
    for (let i = 0; i < lista.length; i++) {
      const bala = lista[i];
      if (!bala.active || !this.cerca(centro, bala.x, bala.y)) continue;
      datos.push(redondear(bala.x), redondear(bala.y), redondear(bala.body.velocity.x), redondear(bala.body.velocity.y));
      if (conDuenio) datos.push(bala.duenio ? bala.duenio.indice : -1);
    }
    return datos;
  }

  disparar(jugador, tiempo) {
    const arma = jugador.datosArma();
    if (!jugador.puedeDisparar(tiempo, arma.cadenciaMs)) return;
    const x = jugador.x + Math.cos(jugador.rotation) * BALA.distanciaCanon;
    const y = jugador.y + Math.sin(jugador.rotation) * BALA.distanciaCanon;
    for (let i = 0; i < arma.balas; i++) {
      const bala = this.balas.getFirstDead(false);
      if (!bala) break;
      let desvio = 0;
      if (arma.balas > 1) desvio = (i / (arma.balas - 1) - 0.5) * arma.dispersion;
      else if (arma.dispersion > 0) desvio = (Math.random() - 0.5) * arma.dispersion;
      bala.disparar(x, y, jugador.rotation + desvio, tiempo, arma.velocidad, arma.vidaMs);
      bala.danio = arma.critico > 0 && Math.random() < arma.critico ? arma.danio * 3 : arma.danio;
      bala.perforacion = arma.perforacion;
      bala.explosivo = arma.explosivo;
      bala.duenio = jugador;
    }
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
    let disparando = (puntero.leftButtonDown() && !this.selectorRecompensa.abierto) || t.SPACE.isDown;

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

  controlarRemoto(jugador, time, delta) {
    const entrada = jugador.entrada;
    if (entrada.x !== null) {
      const factor = 1000 / Math.max(delta, 1);
      jugador.velocidadRed.x = jugador.velocidadRed.x * 0.5 + (entrada.x - jugador.x) * factor * 0.5;
      jugador.velocidadRed.y = jugador.velocidadRed.y * 0.5 + (entrada.y - jugador.y) * factor * 0.5;
      jugador.body.reset(entrada.x, entrada.y);
    } else {
      jugador.body.setVelocity(0, 0);
    }
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
        else this.controlarRemoto(jugador, time, delta);
      }
      jugador.actualizarEfectos(this.reloj);
      jugador.escudoImagen.setVisible(jugador.vivo && jugador.tieneEscudo(this.reloj)).setPosition(jugador.x, jugador.y);
    }

    if (this.historiaCtrl) {
      this.historiaCtrl.actualizar(delta);
      this.actualizarInteraccion();
      const vivos = this.jugadores.filter((jugador) => jugador.vivo);
      this.minimapa.actualizar(time, vivos, this.jugador, this.historiaCtrl.salaActiva ? this.historiaCtrl.salaActiva.id : -1);
    }
    if (this.oleadas) this.oleadas.vigilar();
    this.actualizarHudArmas();
    this.actualizarBarraJefe();
    this.botonesHabilidad.actualizar(this.reloj);
    this.actualizarEquipo();

    if (this.multijugador && time >= this.proximoSnapshot) {
      this.proximoSnapshot = time + RED.intervaloSnapshotMs;
      this.enviarSnapshots();
    }
  }
}
