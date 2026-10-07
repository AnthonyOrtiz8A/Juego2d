import Phaser from 'phaser';
import { ANCHO, ALTO, MUNDO, JUGADOR, EFECTOS, TACTIL, HABILIDADES, RED } from '../config.js';
import Sonido from '../systems/Sonido.js';
import TouchControls from '../systems/TouchControls.js';
import BotonesHabilidad from '../systems/BotonesHabilidad.js';
import { crearTexto, FUENTE } from '../systems/Interfaz.js';
import { TIPOS_ENEMIGO, IDS_HABILIDAD, TECLAS_HABILIDAD, BANDERA_JUGADOR, BANDERA_ENEMIGO, EVENTO } from '../systems/Protocolo.js';

const PROFUNDIDAD_HUD = 30;
const SONIDOS_PERMITIDOS = ['explosion', 'danio', 'habilidad', 'oleada'];

class GestorRemoto {
  constructor() {
    this.ranuras = { E: null, Q: null, R: null };
    this.restantes = { E: 0, Q: 0, R: 0 };
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
    });
    this.base = ahora;
    return cambio;
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
    const id = this.ranuras[tecla];
    if (!id) return 0;
    return this.restante(tecla, ahora) / HABILIDADES.tipos[id].enfriamientoMs;
  }
}

export default class ClienteScene extends Phaser.Scene {
  constructor() {
    super('Cliente');
  }

  init(datos) {
    this.red = datos.red;
    this.sys.settings.data = {};
  }

  create() {
    this.add.image(0, 0, 'ciudad').setOrigin(0);
    this.cameras.main.setBounds(0, 0, MUNDO.ancho, MUNDO.alto);
    this.puntoMundo = new Phaser.Math.Vector2();

    this.ultimoSnapshot = 0;
    this.recibido = false;
    this.puntos = -1;
    this.oleada = -1;
    this.vidasMostradas = -1;
    this.textoEquipoPrevio = '';
    this.marca = 0;
    this.angulo = 0;
    this.habilidadesPendientes = [];
    this.proximaEntrada = 0;
    this.proximoSonidoDisparo = 0;
    this.balasDatos = [];
    this.acidoDatos = [];
    this.balasVista = [];
    this.acidoVista = [];
    this.enemigosVista = [];

    this.jugadoresVista = new Map();
    this.red.jugadores.forEach((datos) => this.crearJugadorVista(datos));
    this.yo = this.jugadoresVista.get(this.red.miId);
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

    this.controlesTactiles = new TouchControls(this);
    this.modoTactil = this.controlesTactiles.activo;
    this.gestor = new GestorRemoto();
    this.botonesHabilidad = new BotonesHabilidad(this, this.gestor, this.modoTactil);

    this.red.alSnapshot = (datos) => this.aplicarSnapshot(datos);
    this.events.once('shutdown', () => {
      this.red.alSnapshot = null;
    });
  }

  crearJugadorVista(datos) {
    const local = datos.id === this.red.miId;
    const vista = {
      id: datos.id,
      nombre: datos.nombre,
      local,
      sprite: this.add.image(MUNDO.ancho / 2, MUNDO.alto / 2, 'jugador').setDepth(10).setVisible(false),
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
    this.textoOleada = crearTexto(this, ANCHO / 2, 10, 'Oleada 1', 22).setOrigin(0.5, 0).setDepth(PROFUNDIDAD_HUD);
    this.textoEquipo = crearTexto(this, ANCHO - 16, 10, '', 14).setOrigin(1, 0).setDepth(PROFUNDIDAD_HUD).setAlign('right');
    this.iconosVida = [];
    for (let i = 0; i < JUGADOR.vidas; i++) {
      this.iconosVida.push(this.add.image(26 + i * 24, 76, 'corazon').setScrollFactor(0).setDepth(PROFUNDIDAD_HUD));
    }
    this.anuncio = crearTexto(this, ANCHO / 2, ALTO / 2 - 80, '', 40).setOrigin(0.5).setDepth(20).setAlpha(0);
    this.esperando = crearTexto(this, ANCHO / 2, ALTO / 2, 'Conectando con el anfitrión…', 22, '#9aa4c7').setOrigin(0.5).setDepth(PROFUNDIDAD_HUD);
  }

  seguir(vista) {
    if (!vista || this.seguido === vista) return;
    this.seguido = vista;
    this.cameras.main.startFollow(vista.sprite, true, MUNDO.suavizadoCamara, MUNDO.suavizadoCamara);
  }

  aplicarSnapshot(datos) {
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

    this.marca += 1;
    datos.e.forEach(([indice, tipo, x, y, rot, vx, vy, banderas]) => {
      let vista = this.enemigosVista[indice];
      if (!vista) {
        vista = { sprite: this.add.image(x, y, 'enemigo-normal').setDepth(5), tipo: -1, banderas: -1 };
        this.enemigosVista[indice] = vista;
      }
      if (vista.tipo !== tipo) {
        vista.tipo = tipo;
        vista.sprite.setTexture('enemigo-' + TIPOS_ENEMIGO[tipo]);
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

    this.balasDatos = datos.b;
    this.acidoDatos = datos.a;

    if (datos.p !== this.puntos) {
      this.puntos = datos.p;
      this.textoPuntos.setText('Puntos: ' + this.puntos);
    }
    if (datos.o !== this.oleada) {
      this.oleada = datos.o;
      this.textoOleada.setText('Oleada ' + this.oleada);
    }
    if (datos.yo && this.gestor.actualizar(datos.yo.h, ahora)) this.botonesHabilidad.refrescar();
    this.actualizarEquipo();
    datos.ev.forEach((evento) => this.aplicarEvento(evento));
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

  usarHabilidad(tecla) {
    if (!(this.yo.banderas & BANDERA_JUGADOR.vivo) || !this.gestor.desbloqueada(tecla)) return;
    this.habilidadesPendientes.push(tecla);
    this.proximaEntrada = 0;
  }

  revisarModoTactil() {
    if (this.controlesTactiles.activo === this.modoTactil) return;
    this.modoTactil = this.controlesTactiles.activo;
    this.botonesHabilidad.cambiarModo(this.modoTactil);
  }

  enemigoMasCercano() {
    let mejor = null;
    let mejorDistancia = TACTIL.alcanceAutoApuntado * TACTIL.alcanceAutoApuntado;
    const origen = this.yo.sprite;
    for (let i = 0; i < this.enemigosVista.length; i++) {
      const vista = this.enemigosVista[i];
      if (!vista || !vista.sprite.visible) continue;
      const dx = vista.sprite.x - origen.x;
      const dy = vista.sprite.y - origen.y;
      const distancia = dx * dx + dy * dy;
      if (distancia < mejorDistancia) {
        mejorDistancia = distancia;
        mejor = vista.sprite;
      }
    }
    return mejor;
  }

  leerEntrada(time) {
    const t = this.teclas;
    const tactil = this.controlesTactiles;
    let dx = (t.D.isDown || t.RIGHT.isDown ? 1 : 0) - (t.A.isDown || t.LEFT.isDown ? 1 : 0);
    let dy = (t.S.isDown || t.DOWN.isDown ? 1 : 0) - (t.W.isDown || t.UP.isDown ? 1 : 0);
    if (dx === 0 && dy === 0) {
      dx = tactil.dx;
      dy = tactil.dy;
    }
    const puntero = this.input.mousePointer;
    let disparando = puntero.leftButtonDown() || t.SPACE.isDown;
    const origen = this.yo.sprite;

    if (tactil.activo) {
      const objetivo = this.enemigoMasCercano();
      if (objetivo) this.angulo = Math.atan2(objetivo.y - origen.y, objetivo.x - origen.x);
      else if (dx !== 0 || dy !== 0) this.angulo = Math.atan2(dy, dx);
      disparando = disparando || tactil.disparando;
    } else {
      this.cameras.main.getWorldPoint(puntero.x, puntero.y, this.puntoMundo);
      this.angulo = Math.atan2(this.puntoMundo.y - origen.y, this.puntoMundo.x - origen.x);
    }

    const vivo = this.yo.banderas & BANDERA_JUGADOR.vivo;
    if (vivo && disparando && time >= this.proximoSonidoDisparo) {
      this.proximoSonidoDisparo = time + JUGADOR.cadenciaMs;
      Sonido.disparo();
    }

    if (time < this.proximaEntrada) return;
    this.proximaEntrada = time + RED.intervaloEntradaMs;
    this.red.enviarAnfitrion({
      t: 'i',
      dx: Math.round(dx * 100) / 100,
      dy: Math.round(dy * 100) / 100,
      a: Math.round(this.angulo * 1000) / 1000,
      f: disparando ? 1 : 0,
      h: this.habilidadesPendientes.splice(0)
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
      sprite.x += (vista.tx + vista.vx * transcurrido - sprite.x) * factor;
      sprite.y += (vista.ty + vista.vy * transcurrido - sprite.y) * factor;
      sprite.rotation = vista.local ? this.angulo : vista.rot;
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

    this.dibujarBalas(this.balasVista, this.balasDatos, 'bala', transcurrido);
    this.dibujarBalas(this.acidoVista, this.acidoDatos, 'bala-enemiga', transcurrido);
  }

  dibujarBalas(lista, datos, textura, transcurrido) {
    const cantidad = datos.length / 4;
    while (lista.length < cantidad) lista.push(this.add.image(0, 0, textura).setDepth(7));
    for (let i = 0; i < lista.length; i++) {
      const imagen = lista[i];
      if (i >= cantidad) {
        if (imagen.visible) imagen.setVisible(false);
        continue;
      }
      const base = i * 4;
      imagen.setVisible(true).setPosition(datos[base] + datos[base + 2] * transcurrido, datos[base + 1] + datos[base + 3] * transcurrido);
    }
  }

  revisarCamara() {
    if (this.yo.banderas & BANDERA_JUGADOR.vivo) {
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
    this.leerEntrada(time);
    this.moverVistas(time, delta);
    this.revisarCamara();
    this.botonesHabilidad.actualizar(time);
  }
}
