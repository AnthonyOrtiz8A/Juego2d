import Phaser from 'phaser';
import { ANCHO, ALTO, MUNDO, JUGADOR, BALA, EFECTOS, TACTIL, HABILIDADES, RED, ARMAS, ENEMIGOS, PASIVAS } from '../config.js';
import Sonido from '../systems/Sonido.js';
import TouchControls from '../systems/TouchControls.js';
import BotonesHabilidad from '../systems/BotonesHabilidad.js';
import SelectorRecompensa from '../systems/SelectorRecompensa.js';
import { estadisticasArma, recompensaValida } from '../systems/Recompensas.js';
import { nivelHistoria } from '../systems/Mapas.js';
import VistaHistoria from '../systems/VistaHistoria.js';
import HudArmas from '../systems/HudArmas.js';
import Minimapa from '../systems/Minimapa.js';
import BotonesAccion from '../systems/BotonesAccion.js';
import { crearTexto, FUENTE } from '../systems/Interfaz.js';
import { TIPOS_ENEMIGO, IDS_HABILIDAD, TECLAS_HABILIDAD, IDS_ARMA, BANDERA_JUGADOR, BANDERA_ENEMIGO, EVENTO } from '../systems/Protocolo.js';

const PROFUNDIDAD_HUD = 30;
const SONIDOS_PERMITIDOS = ['explosion', 'danio', 'habilidad', 'oleada'];
const ANCHO_BARRA_JEFE = 360;
const RADIO_CHOQUE_BALA = 6;

class GestorRemoto {
  constructor() {
    this.ranuras = { E: null, Q: null, C: null };
    this.restantes = { E: 0, Q: 0, C: 0 };
    this.duraciones = { E: 1, Q: 1, C: 1 };
    this.base = 0;
  }

  actualizar(datos, ahora) {
    let cambio = false;
    TECLAS_HABILIDAD.forEach((tecla, i) => {
      const dato = datos[i];
      const id = dato ? IDS_HABILIDAD[dato[0]] || null : null;
      if (id !== this.ranuras[tecla]) cambio = true;
      this.ranuras[tecla] = id;
      this.restantes[tecla] = dato ? dato[1] : 0;
      this.duraciones[tecla] = dato && dato[2] > 0 ? dato[2] : 1;
    });
    this.base = ahora;
    return cambio;
  }

  usarLocal(tecla, ahora) {
    const id = this.ranuras[tecla];
    if (!id) return;
    const duracion = this.duraciones[tecla] > 1 ? this.duraciones[tecla] : HABILIDADES.tipos[id].enfriamientoMs;
    TECLAS_HABILIDAD.forEach((otra) => {
      this.restantes[otra] = this.restante(otra, ahora);
    });
    this.restantes[tecla] = duracion;
    this.duraciones[tecla] = duracion;
    this.base = ahora;
  }

  desbloqueada(tecla) {
    return this.ranuras[tecla] !== null;
  }

  teclasActivas() {
    return TECLAS_HABILIDAD.filter((tecla) => this.desbloqueada(tecla));
  }

  restante(tecla, ahora) {
    return Math.max(0, this.restantes[tecla] - (ahora - this.base));
  }

  progreso(tecla, ahora) {
    if (!this.ranuras[tecla]) return 0;
    return this.restante(tecla, ahora) / this.duraciones[tecla];
  }
}

export default class ClienteScene extends Phaser.Scene {
  constructor() {
    super('Cliente');
  }

  init(datos) {
    this.red = datos.red;
    this.modo = datos.modo || 'supervivencia';
    this.nivelIndice = Number.isInteger(datos.nivel) ? datos.nivel : 0;
    this.semilla = Number.isFinite(datos.semilla) ? datos.semilla : 0;
    this.sys.settings.data = {};
  }

  create() {
    this.nivelDatos = this.modo === 'historia' ? nivelHistoria(this.nivelIndice) : null;
    this.vista = null;
    if (this.nivelDatos) {
      this.vista = new VistaHistoria(this, this.semilla, this.nivelDatos);
      this.limitesMundo = { ancho: this.vista.anchoMundo, alto: this.vista.altoMundo };
      this.physics.world.setBounds(0, 0, this.limitesMundo.ancho, this.limitesMundo.alto);
    } else {
      this.add.image(0, 0, 'ciudad').setOrigin(0);
      this.limitesMundo = { ancho: MUNDO.ancho, alto: MUNDO.alto };
      this.physics.world.setBounds(MUNDO.borde, MUNDO.borde, MUNDO.ancho - MUNDO.borde * 2, MUNDO.alto - MUNDO.borde * 2);
    }
    this.cameras.main.setBounds(0, 0, this.limitesMundo.ancho, this.limitesMundo.alto);
    this.puntoMundo = new Phaser.Math.Vector2();

    this.ultimoSnapshot = 0;
    this.ultimaSecuencia = 0;
    this.secuenciaEntrada = 0;
    this.recibido = false;
    this.puntos = -1;
    this.textoOleadaPrevio = '';
    this.vidasMostradas = -1;
    this.textoEquipoPrevio = '';
    this.marca = 0;
    this.angulo = 0;
    this.proximaEntrada = 0;
    this.proximoDisparoLocal = 0;
    this.balasDatos = [];
    this.acidoDatos = [];
    this.balasVista = [];
    this.acidoVista = [];
    this.balasPropias = [];
    this.enemigosVista = [];
    this.datosYo = { arma: 'pistola', mejoras: {}, vm: JUGADOR.velocidad, armas: [{ id: 'pistola', balas: ARMAS.pistola.cargador }, null], aa: 0, rc: 0, dedos: 0 };
    this.municionLocal = ARMAS.pistola.cargador;
    this.prediccion = { x: MUNDO.ancho / 2, y: MUNDO.alto / 2, vx: 0, vy: 0, tp: -1, dashHasta: 0, dvx: 0, dvy: 0 };
    this.miIndice = Math.max(0, this.red.jugadores.findIndex((jugador) => jugador.id === this.red.miId));

    this.jugadoresVista = new Map();
    this.red.jugadores.forEach((datos) => this.crearJugadorVista(datos));
    this.yo = this.jugadoresVista.get(this.red.miId);
    if (this.vista) this.physics.add.collider(this.yo.sprite, this.vista.capa);
    this.seguido = null;
    this.seguir(this.yo);

    this.explosion = this.add.particles(0, 0, 'particula', {
      speed: { min: 60, max: 200 },
      lifespan: EFECTOS.vidaParticulaMs,
      scale: { start: 1, end: 0 },
      emitting: false,
      maxAliveParticles: EFECTOS.particulasMax
    }).setDepth(8);
    this.onda = this.add.image(0, 0, 'onda').setDepth(9).setVisible(false);
    this.crearHud();

    this.teclas = this.input.keyboard.addKeys('W,A,S,D,UP,LEFT,DOWN,RIGHT,SPACE');
    TECLAS_HABILIDAD.forEach((tecla) => this.input.keyboard.on('keydown-' + tecla, () => this.usarHabilidad(tecla)));
    this.input.keyboard.on('keydown-R', () => this.accion('recargar'));
    this.input.keyboard.on('keydown-X', () => this.accion('cambiar'));
    this.input.keyboard.on('keydown-F', () => this.accion('interactuar'));
    this.input.on('wheel', () => this.accion('cambiar'));

    this.controlesTactiles = new TouchControls(this);
    this.modoTactil = this.controlesTactiles.activo;
    this.gestor = new GestorRemoto();
    this.botonesHabilidad = new BotonesHabilidad(this, this.gestor, this.modoTactil);
    this.selectorRecompensa = new SelectorRecompensa(this);
    this.hudArmas = new HudArmas(this);
    this.hudArmas.mostrar(Boolean(this.vista));
    this.botonesAccion = new BotonesAccion(this, (nombre) => this.accion(nombre));
    this.botonesAccion.cambiarModo(this.modoTactil && Boolean(this.vista));
    this.minimapa = this.vista ? new Minimapa(this, this.vista.mazmorra) : null;
    if (this.minimapa) this.textoEquipo.setY(this.minimapa.abajo + 10);
    this.textoInteraccion = this.add.text(0, 0, '', { fontFamily: FUENTE, fontSize: '13px', fontStyle: 'bold', color: '#e8f070', stroke: '#000000', strokeThickness: 3 }).setOrigin(0.5).setDepth(20).setVisible(false);
    this.textoAviso = crearTexto(this, ANCHO / 2, ALTO - 140, '', 16, '#ff8fa3').setOrigin(0.5).setDepth(PROFUNDIDAD_HUD).setAlpha(0);
    if (this.nivelDatos) this.textoOleada.setText('M' + this.nivelDatos.mundo + '-' + this.nivelDatos.numero + ' · ' + this.nivelDatos.nombre);

    this.red.alSnapshot = (datos) => this.aplicarSnapshot(datos);
    this.red.on('mensaje', this.alMensajeRed, this);
    this.events.once('shutdown', () => {
      this.red.alSnapshot = null;
      this.red.off('mensaje', this.alMensajeRed, this);
    });
  }

  crearJugadorVista(datos) {
    const local = datos.id === this.red.miId;
    const sprite = local
      ? this.physics.add.image(this.limitesMundo.ancho / 2, this.limitesMundo.alto / 2, 'jugador')
      : this.add.image(this.limitesMundo.ancho / 2, this.limitesMundo.alto / 2, 'jugador');
    sprite.setDepth(10).setVisible(false);
    if (local) {
      sprite.body.setCircle(JUGADOR.radio, sprite.width / 2 - JUGADOR.radio, sprite.height / 2 - JUGADOR.radio);
      sprite.setCollideWorldBounds(true);
    }
    const vista = {
      id: datos.id,
      nombre: datos.nombre,
      local,
      sprite,
      escudo: this.add.image(0, 0, 'escudo').setDepth(11).setVisible(false),
      etiqueta: this.add.text(0, 0, datos.nombre, {
        fontFamily: FUENTE,
        fontSize: '13px',
        fontStyle: 'bold',
        color: local ? '#fff27a' : '#ffffff',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5).setDepth(12).setVisible(false),
      tx: null,
      ty: 0,
      vx: 0,
      vy: 0,
      rot: 0,
      vidas: JUGADOR.vidas,
      banderas: 0,
      frenesi: false
    };
    this.jugadoresVista.set(datos.id, vista);
  }

  crearHud() {
    this.textoPuntos = crearTexto(this, 16, 10, 'Puntos: 0', 22).setDepth(PROFUNDIDAD_HUD);
    this.textoOleada = crearTexto(this, ANCHO / 2, 10, '', 22).setOrigin(0.5, 0).setDepth(PROFUNDIDAD_HUD);
    this.textoEquipo = crearTexto(this, ANCHO - 16, 10, '', 14).setOrigin(1, 0).setDepth(PROFUNDIDAD_HUD).setAlign('right');
    this.iconosVida = [];
    const maximo = JUGADOR.vidas + PASIVAS.vitalidad.maximo;
    for (let i = 0; i < maximo; i++) {
      this.iconosVida.push(this.add.image(26 + i * 24, 76, 'corazon').setScrollFactor(0).setDepth(PROFUNDIDAD_HUD).setVisible(false));
    }
    this.barraJefeFondo = this.add.rectangle(ANCHO / 2, 64, ANCHO_BARRA_JEFE + 6, 16, 0x000000, 0.75).setScrollFactor(0).setDepth(PROFUNDIDAD_HUD).setVisible(false);
    this.barraJefe = this.add.rectangle(ANCHO / 2 - ANCHO_BARRA_JEFE / 2, 64, ANCHO_BARRA_JEFE, 10, 0xc0392b, 1).setOrigin(0, 0.5).setScrollFactor(0).setDepth(PROFUNDIDAD_HUD).setVisible(false);
    this.textoJefe = crearTexto(this, ANCHO / 2, 44, '', 14, '#ff8fa3').setOrigin(0.5).setDepth(PROFUNDIDAD_HUD).setVisible(false);
    this.anuncio = crearTexto(this, ANCHO / 2, ALTO / 2 - 80, '', 36).setOrigin(0.5).setDepth(20).setAlpha(0);
    this.esperando = crearTexto(this, ANCHO / 2, ALTO / 2, 'Conectando con el anfitrión…', 22, '#9aa4c7').setOrigin(0.5).setDepth(PROFUNDIDAD_HUD);
  }

  seguir(vista) {
    if (!vista || this.seguido === vista) return;
    this.seguido = vista;
    this.cameras.main.startFollow(vista.sprite, true, MUNDO.suavizadoCamara, MUNDO.suavizadoCamara);
  }

  alMensajeRed(id, datos) {
    if (!datos || datos.t !== 'cofre' || !recompensaValida(datos.r)) return;
    const actual = datos.actual || {};
    const ranuras = actual.ranuras || {};
    const seguro = {
      arma: ARMAS[actual.arma] ? actual.arma : 'pistola',
      ranuras: {
        E: HABILIDADES.tipos[ranuras.E] ? ranuras.E : null,
        Q: HABILIDADES.tipos[ranuras.Q] ? ranuras.Q : null,
        C: HABILIDADES.tipos[ranuras.C] ? ranuras.C : null
      }
    };
    this.selectorRecompensa.mostrar(datos.r, seguro, (decision) => {
      this.red.enviarAnfitrion({ t: 'eleccion', tomar: decision.tomar, ranura: decision.ranura });
    });
  }

  aplicarSnapshot(datos) {
    datos.ev.forEach((evento) => this.aplicarEvento(evento));
    if (datos.n <= this.ultimaSecuencia) return;
    this.ultimaSecuencia = datos.n;

    const ahora = this.time.now;
    this.ultimoSnapshot = ahora;
    if (!this.recibido) {
      this.recibido = true;
      this.esperando.setVisible(false);
    }

    datos.j.forEach(([id, x, y, rot, vx, vy, vidas, banderas]) => {
      const vista = this.jugadoresVista.get(id);
      if (!vista) return;
      if (vista.tx === null) vista.sprite.setPosition(x, y);
      vista.tx = x;
      vista.ty = y;
      vista.vx = vx;
      vista.vy = vy;
      vista.rot = rot / 100;
      vista.vidas = vidas;
      vista.banderas = banderas;
    });

    this.aplicarEnemigos(datos.e);
    this.balasDatos = datos.b;
    this.acidoDatos = datos.a;
    if (this.vista) this.vista.aplicar(datos);
    this.aplicarJefe(datos.jf);
    this.aplicarDatosPropios(datos.yo, ahora);

    if (datos.p !== this.puntos) {
      this.puntos = datos.p;
      this.textoPuntos.setText('Puntos: ' + this.puntos);
    }
    let textoOleada = 'Oleada ' + datos.o;
    if (this.nivelDatos) {
      const prefijo = 'M' + this.nivelDatos.mundo + '-' + this.nivelDatos.numero + ' · ';
      textoOleada = datos.sa >= 0 && datos.ot > 0 ? prefijo + 'Oleada ' + datos.o + '/' + datos.ot : prefijo + this.nivelDatos.nombre;
    }
    if (textoOleada !== this.textoOleadaPrevio) {
      this.textoOleadaPrevio = textoOleada;
      this.textoOleada.setText(textoOleada);
    }
    this.actualizarEquipo();
  }

  aplicarEnemigos(lista) {
    this.marca += 1;
    lista.forEach(([indice, tipo, x, y, rot, vx, vy, banderas]) => {
      let vista = this.enemigosVista[indice];
      if (!vista) {
        vista = { sprite: this.add.image(x, y, 'enemigo-normal').setDepth(5), tipo: -1, banderas: -1 };
        this.enemigosVista[indice] = vista;
      }
      if (vista.tipo !== tipo) {
        vista.tipo = tipo;
        vista.radio = (ENEMIGOS.tipos[TIPOS_ENEMIGO[tipo]] || ENEMIGOS.tipos.normal).radio;
        vista.sprite.setTexture('enemigo-' + TIPOS_ENEMIGO[tipo]).setDepth(ENEMIGOS.tipos[TIPOS_ENEMIGO[tipo]].jefe ? 6 : 5);
      }
      if (!vista.sprite.visible) vista.sprite.setVisible(true).setPosition(x, y);
      if (vista.banderas !== banderas) {
        vista.banderas = banderas;
        if (banderas & BANDERA_ENEMIGO.golpeado) vista.sprite.setTintFill(0xffffff);
        else if (banderas & BANDERA_ENEMIGO.congelado) vista.sprite.setTint(HABILIDADES.tipos.congelar.color);
        else vista.sprite.clearTint();
      }
      vista.tx = x;
      vista.ty = y;
      vista.vx = vx;
      vista.vy = vy;
      vista.sprite.rotation = rot / 100;
      vista.marca = this.marca;
    });
    this.enemigosVista.forEach((vista) => {
      if (vista && vista.marca !== this.marca && vista.sprite.visible) vista.sprite.setVisible(false);
    });
  }

  aplicarJefe(jefe) {
    const visible = Boolean(jefe);
    this.barraJefeFondo.setVisible(visible);
    this.barraJefe.setVisible(visible);
    this.textoJefe.setVisible(visible);
    if (!visible) return;
    const datos = ENEMIGOS.tipos[TIPOS_ENEMIGO[jefe[0]]];
    if (datos && datos.nombre) this.textoJefe.setText(datos.nombre);
    this.barraJefe.setSize(ANCHO_BARRA_JEFE * Phaser.Math.Clamp(jefe[1] / 1000, 0, 1), 10);
  }

  aplicarDatosPropios(yo, ahora) {
    if (!yo) return;
    if (this.gestor.actualizar(yo.h, ahora)) this.botonesHabilidad.refrescar();
    const arma = IDS_ARMA[yo.arma] || 'pistola';
    this.datosYo.arma = arma;
    this.datosYo.mejoras = yo.m || {};
    this.datosYo.vm = Number.isFinite(yo.vm) ? yo.vm : JUGADOR.velocidad;
    this.datosYo.dedos = yo.dedos || 0;
    this.datosYo.aa = yo.aa === 1 ? 1 : 0;
    this.datosYo.rc = (yo.rc || 0) / 1000;
    if (Array.isArray(yo.armas)) {
      this.datosYo.armas = yo.armas.map((ranura) => (ranura && IDS_ARMA[ranura[0]] ? { id: IDS_ARMA[ranura[0]], balas: ranura[1] } : null));
      const actual = this.datosYo.armas[this.datosYo.aa];
      this.municionLocal = actual ? actual.balas : 0;
    }
    if (yo.tp !== this.prediccion.tp) {
      this.prediccion.tp = yo.tp;
      this.prediccion.x = yo.x;
      this.prediccion.y = yo.y;
      this.prediccion.dashHasta = 0;
      this.yo.sprite.body.reset(yo.x, yo.y);
    }
  }

  actualizarEquipo() {
    const vivoYo = Boolean(this.yo.banderas & BANDERA_JUGADOR.vivo);
    const vidas = vivoYo ? this.yo.vidas : 0;
    if (vidas !== this.vidasMostradas) {
      this.vidasMostradas = vidas;
      this.iconosVida.forEach((icono, i) => icono.setVisible(i < vidas));
    }
    let texto = '';
    this.jugadoresVista.forEach((vista) => {
      const vivo = vista.banderas & BANDERA_JUGADOR.vivo;
      texto += (texto ? '\n' : '') + vista.nombre + (vivo ? ' x' + vista.vidas : ' (caído)');
    });
    if (texto === this.textoEquipoPrevio) return;
    this.textoEquipoPrevio = texto;
    this.textoEquipo.setText(texto);
  }

  aplicarEvento(evento) {
    switch (evento[0]) {
      case EVENTO.explosion:
        this.explosion.setParticleTint(evento[3]);
        this.explosion.explode(EFECTOS.particulasPorExplosion, evento[1], evento[2]);
        break;
      case EVENTO.anuncio:
        this.anunciar(String(evento[1]));
        break;
      case EVENTO.onda:
        this.mostrarOnda(evento[1], evento[2], evento[3], evento[4]);
        break;
      case EVENTO.destello:
        this.cameras.main.flash(200, 140, 210, 255);
        break;
      case EVENTO.sonido:
        if (SONIDOS_PERMITIDOS.includes(evento[1]) && (!evento[2] || evento[2] === this.red.miId)) Sonido[evento[1]]();
        break;
      case EVENTO.sacudida:
        if (evento[1] === this.red.miId) this.cameras.main.shake(EFECTOS.sacudidaMs, EFECTOS.sacudidaIntensidad);
        break;
      case EVENTO.aviso:
        if (evento[1] === this.red.miId) this.mostrarAviso(String(evento[2]));
        break;
      default:
        break;
    }
  }

  anunciar(texto) {
    this.tweens.killTweensOf(this.anuncio);
    this.anuncio.setText(texto).setAlpha(1).setScale(1.3);
    this.tweens.add({ targets: this.anuncio, scale: 1, duration: 250, ease: 'Back.Out' });
    this.tweens.add({ targets: this.anuncio, alpha: 0, delay: 1300, duration: 400 });
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
  }

  vivo() {
    return Boolean(this.yo.banderas & BANDERA_JUGADOR.vivo);
  }

  mostrarAviso(texto) {
    this.tweens.killTweensOf(this.textoAviso);
    this.textoAviso.setText(texto).setAlpha(1);
    this.tweens.add({ targets: this.textoAviso, alpha: 0, delay: 1200, duration: 400 });
  }

  accion(nombre) {
    if (!this.vista || !this.vivo()) return;
    this.red.enviarAnfitrion({ t: 'accion', a: nombre });
  }

  actualizarHistoria(time) {
    if (!this.vista) return;
    this.hudArmas.actualizar(this.datosYo.armas, this.datosYo.aa, this.datosYo.rc, this.datosYo.dedos);
    const p = this.prediccion;
    const objetivo = this.vivo() ? this.vista.interactuable(p.x, p.y) : null;
    this.botonesAccion.fijarInteraccion(Boolean(objetivo));
    if (objetivo) this.textoInteraccion.setText(objetivo.texto).setPosition(objetivo.x, objetivo.y - 40).setVisible(true);
    else this.textoInteraccion.setVisible(false);
    const posiciones = [];
    this.jugadoresVista.forEach((vista) => {
      if (vista.banderas & BANDERA_JUGADOR.vivo) posiciones.push(vista.local ? p : vista.sprite);
    });
    this.minimapa.actualizar(time, posiciones, p, this.vista.salaCerrada);
  }

  usarHabilidad(tecla) {
    if (!this.vivo() || !this.gestor.desbloqueada(tecla)) return;
    const ahora = this.time.now;
    if (this.gestor.restante(tecla, ahora) <= 0) {
      if (this.gestor.ranuras[tecla] === 'dash') this.iniciarDashLocal(ahora);
      this.gestor.usarLocal(tecla, ahora);
    }
    this.red.enviarAnfitrion({ t: 'h', teclas: [tecla] });
  }

  iniciarDashLocal(ahora) {
    const datos = HABILIDADES.tipos.dash;
    const p = this.prediccion;
    const angulo = Math.hypot(p.vx, p.vy) > 1 ? Math.atan2(p.vy, p.vx) : this.angulo;
    p.dashHasta = ahora + datos.duracionMs;
    p.dvx = Math.cos(angulo) * datos.velocidad;
    p.dvy = Math.sin(angulo) * datos.velocidad;
  }

  revisarModoTactil() {
    if (this.controlesTactiles.activo === this.modoTactil) return;
    this.modoTactil = this.controlesTactiles.activo;
    this.botonesHabilidad.cambiarModo(this.modoTactil);
    this.botonesAccion.cambiarModo(this.modoTactil && Boolean(this.vista));
  }

  enemigoMasCercano() {
    let mejor = null;
    let mejorDistancia = TACTIL.alcanceAutoApuntado * TACTIL.alcanceAutoApuntado;
    const p = this.prediccion;
    for (let i = 0; i < this.enemigosVista.length; i++) {
      const vista = this.enemigosVista[i];
      if (!vista || !vista.sprite.visible) continue;
      const dx = vista.sprite.x - p.x;
      const dy = vista.sprite.y - p.y;
      const distancia = dx * dx + dy * dy;
      if (distancia < mejorDistancia) {
        mejorDistancia = distancia;
        mejor = vista.sprite;
      }
    }
    return mejor;
  }

  predecirMovimiento(dx, dy, time) {
    const p = this.prediccion;
    if (time < p.dashHasta) {
      p.vx = p.dvx;
      p.vy = p.dvy;
    } else {
      const largo = Math.hypot(dx, dy);
      const nx = largo > 1 ? dx / largo : dx;
      const ny = largo > 1 ? dy / largo : dy;
      p.vx = nx * this.datosYo.vm;
      p.vy = ny * this.datosYo.vm;
    }
    this.yo.sprite.body.setVelocity(p.vx, p.vy);
  }

  dispararLocal(time) {
    const arma = estadisticasArma(this.datosYo.arma, this.datosYo.mejoras);
    const frenesi = this.yo.banderas & BANDERA_JUGADOR.frenesi ? HABILIDADES.tipos.frenesi.multiplicadorCadencia : 1;
    if (time < this.proximoDisparoLocal) return;
    if (this.vista && (this.municionLocal <= 0 || this.datosYo.rc > 0)) return;
    if (this.vista) this.municionLocal -= 1;
    this.proximoDisparoLocal = time + arma.cadenciaMs / frenesi;
    const p = this.prediccion;
    const x = p.x + Math.cos(this.angulo) * BALA.distanciaCanon;
    const y = p.y + Math.sin(this.angulo) * BALA.distanciaCanon;
    for (let i = 0; i < arma.balas; i++) {
      let desvio = 0;
      if (arma.balas > 1) desvio = (i / (arma.balas - 1) - 0.5) * arma.dispersion;
      else if (arma.dispersion > 0) desvio = (Math.random() - 0.5) * arma.dispersion;
      const angulo = this.angulo + desvio;
      let bala = this.balasPropias.find((otra) => !otra.imagen.visible);
      if (!bala) {
        bala = { imagen: this.add.image(0, 0, 'bala').setDepth(7) };
        this.balasPropias.push(bala);
      }
      bala.imagen.setVisible(true).setPosition(x, y);
      bala.vx = Math.cos(angulo) * arma.velocidad;
      bala.vy = Math.sin(angulo) * arma.velocidad;
      bala.hasta = time + arma.vidaMs;
      bala.perforacion = arma.perforacion;
      bala.ultimo = null;
    }
    Sonido.disparo();
  }

  moverBalasPropias(time, delta) {
    const segundos = delta / 1000;
    for (let i = 0; i < this.balasPropias.length; i++) {
      const bala = this.balasPropias[i];
      const imagen = bala.imagen;
      if (!imagen.visible) continue;
      imagen.x += bala.vx * segundos;
      imagen.y += bala.vy * segundos;
      if (time > bala.hasta || (this.vista && this.vista.esSolido(imagen.x, imagen.y))) {
        imagen.setVisible(false);
        continue;
      }
      for (let j = 0; j < this.enemigosVista.length; j++) {
        const vista = this.enemigosVista[j];
        if (!vista || !vista.sprite.visible) continue;
        const alcance = vista.radio + RADIO_CHOQUE_BALA;
        const dx = vista.sprite.x - imagen.x;
        const dy = vista.sprite.y - imagen.y;
        if (dx * dx + dy * dy > alcance * alcance) continue;
        if (bala.perforacion > 0 && bala.ultimo !== vista) {
          bala.perforacion -= 1;
          bala.ultimo = vista;
        } else if (bala.ultimo !== vista) {
          imagen.setVisible(false);
        }
        break;
      }
    }
  }

  leerEntrada(time, delta) {
    const t = this.teclas;
    const tactil = this.controlesTactiles;
    let dx = (t.D.isDown || t.RIGHT.isDown ? 1 : 0) - (t.A.isDown || t.LEFT.isDown ? 1 : 0);
    let dy = (t.S.isDown || t.DOWN.isDown ? 1 : 0) - (t.W.isDown || t.UP.isDown ? 1 : 0);
    if (dx === 0 && dy === 0) {
      dx = tactil.dx;
      dy = tactil.dy;
    }
    const puntero = this.input.mousePointer;
    let disparando = (puntero.leftButtonDown() && !this.selectorRecompensa.abierto) || t.SPACE.isDown;
    const p = this.prediccion;

    if (tactil.activo) {
      const objetivo = this.enemigoMasCercano();
      if (objetivo) this.angulo = Math.atan2(objetivo.y - p.y, objetivo.x - p.x);
      else if (dx !== 0 || dy !== 0) this.angulo = Math.atan2(dy, dx);
      disparando = disparando || tactil.disparando;
    } else {
      this.cameras.main.getWorldPoint(puntero.x, puntero.y, this.puntoMundo);
      this.angulo = Math.atan2(this.puntoMundo.y - p.y, this.puntoMundo.x - p.x);
    }

    const vivo = this.vivo();
    if (vivo) {
      this.predecirMovimiento(dx, dy, time);
      if (disparando) this.dispararLocal(time);
    } else {
      this.yo.sprite.body.setVelocity(0, 0);
    }
    p.x = this.yo.sprite.x;
    p.y = this.yo.sprite.y;

    if (time < this.proximaEntrada) return;
    this.proximaEntrada = time + RED.intervaloEntradaMs;
    this.secuenciaEntrada += 1;
    this.red.enviarAnfitrionRapido({
      t: 'i',
      n: this.secuenciaEntrada,
      dx: Math.round(dx * 100) / 100,
      dy: Math.round(dy * 100) / 100,
      a: Math.round(this.angulo * 1000) / 1000,
      f: disparando && vivo ? 1 : 0,
      x: Math.round(p.x),
      y: Math.round(p.y),
      tp: p.tp
    });
  }

  moverVistas(time, delta) {
    const transcurrido = Math.min(time - this.ultimoSnapshot, RED.extrapolacionMaxMs) / 1000;
    const factor = 1 - Math.pow(1 - RED.suavizado, delta / 16.67);

    this.jugadoresVista.forEach((vista) => {
      if (vista.tx === null) return;
      const vivo = Boolean(vista.banderas & BANDERA_JUGADOR.vivo);
      const sprite = vista.sprite;
      sprite.setVisible(vivo);
      vista.etiqueta.setVisible(vivo);
      vista.escudo.setVisible(vivo && Boolean(vista.banderas & BANDERA_JUGADOR.escudo));
      if (!vivo) return;
      if (vista.local) {
        sprite.rotation = this.angulo;
      } else {
        sprite.x += (vista.tx + vista.vx * transcurrido - sprite.x) * factor;
        sprite.y += (vista.ty + vista.vy * transcurrido - sprite.y) * factor;
        sprite.rotation = vista.rot;
      }
      const parpadeo = (vista.banderas & BANDERA_JUGADOR.invulnerable) && Math.floor(time / 80) % 2 === 0;
      sprite.setAlpha(parpadeo ? 0.3 : 1);
      const frenesi = Boolean(vista.banderas & BANDERA_JUGADOR.frenesi);
      if (frenesi !== vista.frenesi) {
        vista.frenesi = frenesi;
        if (frenesi) sprite.setTint(HABILIDADES.tipos.frenesi.color);
        else sprite.clearTint();
      }
      vista.escudo.setPosition(sprite.x, sprite.y);
      vista.etiqueta.setPosition(sprite.x, sprite.y - 30);
    });

    for (let i = 0; i < this.enemigosVista.length; i++) {
      const vista = this.enemigosVista[i];
      if (!vista || !vista.sprite.visible) continue;
      vista.sprite.x += (vista.tx + vista.vx * transcurrido - vista.sprite.x) * factor;
      vista.sprite.y += (vista.ty + vista.vy * transcurrido - vista.sprite.y) * factor;
    }

    this.dibujarBalas(this.balasVista, this.balasDatos, 'bala', transcurrido, 5);
    this.dibujarBalas(this.acidoVista, this.acidoDatos, 'bala-enemiga', transcurrido, 4);
  }

  dibujarBalas(lista, datos, textura, transcurrido, paso) {
    let usadas = 0;
    for (let base = 0; base < datos.length; base += paso) {
      if (paso === 5 && datos[base + 4] === this.miIndice) continue;
      if (usadas >= lista.length) lista.push(this.add.image(0, 0, textura).setDepth(7));
      lista[usadas].setVisible(true).setPosition(datos[base] + datos[base + 2] * transcurrido, datos[base + 1] + datos[base + 3] * transcurrido);
      usadas += 1;
    }
    for (let i = usadas; i < lista.length; i++) {
      if (lista[i].visible) lista[i].setVisible(false);
    }
  }

  revisarCamara() {
    if (this.vivo()) {
      this.seguir(this.yo);
      return;
    }
    for (const vista of this.jugadoresVista.values()) {
      if (vista.banderas & BANDERA_JUGADOR.vivo) {
        this.seguir(vista);
        return;
      }
    }
  }

  update(time, delta) {
    this.revisarModoTactil();
    if (!this.recibido) return;
    this.leerEntrada(time, delta);
    this.moverBalasPropias(time, delta);
    this.moverVistas(time, delta);
    this.revisarCamara();
    this.actualizarHistoria(time);
    this.botonesHabilidad.actualizar(time);
  }
}
