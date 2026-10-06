import Phaser from 'phaser';
import { ANCHO, PACMAN } from '../config.js';
import Storage from '../systems/Storage.js';
import Sonido from '../systems/Sonido.js';
import { crearTexto, crearBoton } from '../systems/Interfaz.js';
import { esDispositivoTactil } from '../systems/TouchControls.js';

const T = PACMAN.celda;
const MAPA = PACMAN.mapa;
const COLUMNAS = MAPA[0].length;
const FILAS = MAPA.length;
const OX = Math.round((ANCHO - COLUMNAS * T) / 2);
const OY = 58;
const ARRIBA = { x: 0, y: -1 };
const IZQUIERDA = { x: -1, y: 0 };
const ABAJO = { x: 0, y: 1 };
const DERECHA = { x: 1, y: 0 };
const ORDEN = [ARRIBA, IZQUIERDA, ABAJO, DERECHA];
const TECLAS = {
  ArrowUp: ARRIBA,
  KeyW: ARRIBA,
  ArrowLeft: IZQUIERDA,
  KeyA: IZQUIERDA,
  ArrowDown: ABAJO,
  KeyS: ABAJO,
  ArrowRight: DERECHA,
  KeyD: DERECHA
};
const PROFUNDIDAD_UI = 30;

function centroX(c) {
  return OX + c * T + T / 2;
}

function centroY(f) {
  return OY + f * T + T / 2;
}

function opuesta(a, b) {
  return a.x === -b.x && a.y === -b.y;
}

export default class PacmanScene extends Phaser.Scene {
  constructor() {
    super('Pacman');
  }

  create() {
    this.puntaje = 0;
    this.record = Storage.obtenerRecordPacman();
    this.vidas = PACMAN.vidas;
    this.nivel = 1;
    this.reloj = 0;
    this.estado = 'listo';
    this.estadoPrevio = 'listo';
    this.deseada = IZQUIERDA;
    this.tactil = esDispositivoTactil(this.game);

    this.laberinto = this.add.image(OX, OY, 'laberinto').setOrigin(0);
    this.crearPuntos();
    this.crearPersonajes();
    this.crearHud();
    this.crearControles();

    this.game.events.on(Phaser.Core.Events.BLUR, this.pausarPorFoco, this);
    this.game.events.on(Phaser.Core.Events.HIDDEN, this.pausarPorFoco, this);
    this.events.once('shutdown', () => {
      this.game.events.off(Phaser.Core.Events.BLUR, this.pausarPorFoco, this);
      this.game.events.off(Phaser.Core.Events.HIDDEN, this.pausarPorFoco, this);
    });

    this.iniciarRonda();
  }

  crearPuntos() {
    this.puntos = new Map();
    this.superPuntos = [];
    for (let f = 0; f < FILAS; f++) {
      for (let c = 0; c < COLUMNAS; c++) {
        const ch = MAPA[f][c];
        if (ch !== '.' && ch !== 'o') continue;
        const imagen = this.add.image(centroX(c), centroY(f), ch === 'o' ? 'super-punto' : 'punto');
        imagen.esSuper = ch === 'o';
        if (imagen.esSuper) this.superPuntos.push(imagen);
        this.puntos.set(f * COLUMNAS + c, imagen);
      }
    }
    this.totalPuntos = this.puntos.size;
    this.restantes = this.totalPuntos;
    this.tweens.add({ targets: this.superPuntos, alpha: 0.25, duration: 220, yoyo: true, repeat: -1 });
  }

  crearPersonajes() {
    let inicio = null;
    MAPA.forEach((fila, f) => {
      const c = fila.indexOf('P');
      if (c >= 0) inicio = { c, f };
    });
    this.inicioPacman = inicio;
    this.pacman = { sprite: this.add.image(0, 0, 'pacman-1').setDepth(10), c: 0, f: 0, x: 0, y: 0, dir: IZQUIERDA, destino: null };
    this.animacion = 0;

    this.fantasmas = PACMAN.fantasmas.map((datos, i) => ({
      datos,
      indice: i,
      sprite: this.add.image(0, 0, 'fantasma-' + datos.nombre).setDepth(11),
      textura: 'fantasma-' + datos.nombre,
      c: 0,
      f: 0,
      x: 0,
      y: 0,
      dir: IZQUIERDA,
      destino: null,
      modo: 'casa',
      asustado: false,
      liberarEn: 0
    }));
  }

  crearHud() {
    this.textoPuntaje = crearTexto(this, OX, 14, 'Puntos: 0', 20).setDepth(PROFUNDIDAD_UI);
    this.textoRecord = crearTexto(this, ANCHO / 2, 14, 'Récord: ' + this.record, 20, '#fff27a').setOrigin(0.5, 0).setDepth(PROFUNDIDAD_UI);
    this.textoNivel = crearTexto(this, OX + COLUMNAS * T, 14, 'Nivel 1', 20).setOrigin(1, 0).setDepth(PROFUNDIDAD_UI);

    this.iconosVida = [];
    for (let i = 0; i < PACMAN.vidas; i++) {
      this.iconosVida.push(this.add.image(OX + 12 + i * 26, OY + FILAS * T + 14, 'pacman-1').setDepth(PROFUNDIDAD_UI));
    }

    const ayuda = this.tactil ? 'Desliza el dedo para moverte' : 'Flechas o WASD · P pausa · Esc menú';
    crearTexto(this, OX + COLUMNAS * T, OY + FILAS * T + 6, ayuda, 13, '#9aa4c7').setOrigin(1, 0).setDepth(PROFUNDIDAD_UI);

    this.mensaje = crearTexto(this, centroX(9), centroY(11), '', 22, '#ffe14d').setOrigin(0.5).setDepth(PROFUNDIDAD_UI);
    this.textoBonus = crearTexto(this, 0, 0, '', 16, '#3ee8ff').setOrigin(0.5).setDepth(PROFUNDIDAD_UI).setVisible(false);

    if (this.tactil) {
      const pausa = crearBoton(this, ANCHO - 34, 32, 'II', () => this.alternarPausa(), 48, 44);
      pausa.fondo.setDepth(PROFUNDIDAD_UI);
      pausa.etiqueta.setDepth(PROFUNDIDAD_UI);
    }

    this.capa = [];
  }

  crearControles() {
    this.input.keyboard.on('keydown', (evento) => {
      const direccion = TECLAS[evento.code];
      if (direccion) this.deseada = direccion;
      if (evento.code === 'KeyP') this.alternarPausa();
      if (evento.code === 'Escape') this.scene.start('Menu');
    });

    this.inicioToque = null;
    this.input.on('pointerdown', (puntero, objetos) => {
      this.inicioToque = objetos.length > 0 ? null : { x: puntero.x, y: puntero.y };
    });
    this.input.on('pointermove', (puntero) => {
      if (!puntero.isDown || !this.inicioToque) return;
      const dx = puntero.x - this.inicioToque.x;
      const dy = puntero.y - this.inicioToque.y;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < PACMAN.umbralDeslizar) return;
      if (Math.abs(dx) > Math.abs(dy)) this.deseada = dx > 0 ? DERECHA : IZQUIERDA;
      else this.deseada = dy > 0 ? ABAJO : ARRIBA;
      this.inicioToque.x = puntero.x;
      this.inicioToque.y = puntero.y;
    });
    this.input.on('pointerup', () => {
      this.inicioToque = null;
    });
  }

  libre(c, f, puedePuerta) {
    if (f < 0 || f >= FILAS) return false;
    const ch = MAPA[f][(c + COLUMNAS) % COLUMNAS];
    if (ch === '#') return false;
    if (ch === '-') return puedePuerta;
    return true;
  }

  colocar(entidad, c, f, dir) {
    entidad.c = c;
    entidad.f = f;
    entidad.x = centroX(c);
    entidad.y = centroY(f);
    entidad.dir = dir;
    entidad.destino = null;
    entidad.sprite.setPosition(entidad.x, entidad.y).setVisible(true).setScale(1).setAngle(0);
  }

  iniciarRonda() {
    this.colocar(this.pacman, this.inicioPacman.c, this.inicioPacman.f, IZQUIERDA);
    this.pacman.sprite.setTexture('pacman-1').setRotation(Math.PI);
    this.deseada = IZQUIERDA;

    this.fantasmas.forEach((fantasma, i) => {
      const inicio = fantasma.datos.inicio;
      const fuera = inicio.c === PACMAN.salida.c && inicio.f === PACMAN.salida.f;
      this.colocar(fantasma, inicio.c, inicio.f, i === 2 ? DERECHA : IZQUIERDA);
      fantasma.modo = fuera ? 'normal' : 'casa';
      fantasma.asustado = false;
      fantasma.liberarEn = this.reloj + PACMAN.salidaFantasmasMs[i];
      this.cambiarTextura(fantasma, 'fantasma-' + fantasma.datos.nombre);
    });

    this.asustadoRestante = 0;
    this.combo = 0;
    this.dispersion = true;
    this.tiempoModo = 0;
    this.estado = 'listo';
    this.mensaje.setText('¡Listo!').setVisible(true);
    this.time.delayedCall(1500, () => {
      if (this.estado !== 'listo') return;
      this.mensaje.setVisible(false);
      this.estado = 'jugando';
    });
  }

  multiplicador() {
    return 1 + (this.nivel - 1) * PACMAN.aumentoPorNivel;
  }

  moverEntidad(entidad, velocidadCeldas, dt, alLlegar) {
    let paso = velocidadCeldas * T * dt;
    let vueltas = 0;
    while (paso > 0 && entidad.destino && vueltas < 4) {
      vueltas += 1;
      const dx = centroX(entidad.destino.c) - entidad.x;
      const dy = centroY(entidad.destino.f) - entidad.y;
      const distancia = Math.abs(dx) + Math.abs(dy);
      if (distancia > paso) {
        entidad.x += entidad.dir.x * paso;
        entidad.y += entidad.dir.y * paso;
        paso = 0;
      } else {
        paso -= distancia;
        entidad.c = entidad.destino.c;
        entidad.f = entidad.destino.f;
        if (entidad.c < 0) entidad.c = COLUMNAS - 1;
        else if (entidad.c >= COLUMNAS) entidad.c = 0;
        entidad.x = centroX(entidad.c);
        entidad.y = centroY(entidad.f);
        entidad.destino = null;
        alLlegar(entidad);
      }
    }
    entidad.sprite.setPosition(entidad.x, entidad.y);
  }

  fijarDestino(entidad, dir) {
    entidad.dir = dir;
    entidad.destino = { c: entidad.c + dir.x, f: entidad.f + dir.y };
  }

  llegarPacman(pacman) {
    this.comer(pacman.c, pacman.f);
    if (this.libre(pacman.c + this.deseada.x, pacman.f + this.deseada.y, false)) pacman.dir = this.deseada;
    if (this.libre(pacman.c + pacman.dir.x, pacman.f + pacman.dir.y, false)) this.fijarDestino(pacman, pacman.dir);
  }

  actualizarPacman(dt, delta) {
    const pacman = this.pacman;
    if (!pacman.destino) {
      this.llegarPacman(pacman);
    } else if (opuesta(this.deseada, pacman.dir)) {
      pacman.dir = this.deseada;
      pacman.destino = { c: pacman.c, f: pacman.f };
    }

    this.moverEntidad(pacman, PACMAN.velocidad * this.multiplicador(), dt, (p) => this.llegarPacman(p));

    if (pacman.destino) {
      pacman.sprite.setRotation(Math.atan2(pacman.dir.y, pacman.dir.x));
      this.animacion += delta;
      const cuadro = [0, 1, 2, 1][Math.floor(this.animacion / 60) % 4];
      pacman.sprite.setTexture('pacman-' + cuadro);
    }
  }

  comer(c, f) {
    const clave = f * COLUMNAS + ((c + COLUMNAS) % COLUMNAS);
    const punto = this.puntos.get(clave);
    if (!punto || !punto.visible) return;
    punto.setVisible(false);
    this.restantes -= 1;
    if (punto.esSuper) {
      this.sumar(PACMAN.puntos.superPunto);
      this.asustar();
    } else {
      this.sumar(PACMAN.puntos.punto);
    }
    Sonido.comer();
    if (this.restantes === 0) this.completarNivel();
  }

  sumar(cantidad) {
    this.puntaje += cantidad;
    this.textoPuntaje.setText('Puntos: ' + this.puntaje);
    if (this.puntaje > this.record) {
      this.record = this.puntaje;
      this.textoRecord.setText('Récord: ' + this.record);
    }
  }

  asustar() {
    this.asustadoRestante = PACMAN.asustadoMs;
    this.combo = 0;
    this.fantasmas.forEach((fantasma) => {
      if (fantasma.modo === 'ojos') return;
      fantasma.asustado = true;
      if (fantasma.modo === 'normal' && fantasma.destino) this.invertir(fantasma);
    });
  }

  invertir(fantasma) {
    fantasma.dir = { x: -fantasma.dir.x, y: -fantasma.dir.y };
    fantasma.destino = { c: fantasma.c, f: fantasma.f };
  }

  objetivo(fantasma) {
    if (fantasma.modo === 'saliendo') return PACMAN.salida;
    if (fantasma.modo === 'ojos') return PACMAN.casa;
    if (this.dispersion) return fantasma.datos.esquina;
    const p = this.pacman;
    switch (fantasma.datos.nombre) {
      case 'pinky':
        return { c: p.c + p.dir.x * 4, f: p.f + p.dir.y * 4 };
      case 'inky': {
        const blinky = this.fantasmas[0];
        const ax = p.c + p.dir.x * 2;
        const ay = p.f + p.dir.y * 2;
        return { c: ax * 2 - blinky.c, f: ay * 2 - blinky.f };
      }
      case 'clyde': {
        const dc = p.c - fantasma.c;
        const df = p.f - fantasma.f;
        return dc * dc + df * df > 64 ? { c: p.c, f: p.f } : fantasma.datos.esquina;
      }
      default:
        return { c: p.c, f: p.f };
    }
  }

  llegarFantasma(fantasma) {
    if (fantasma.modo === 'saliendo' && fantasma.c === PACMAN.salida.c && fantasma.f === PACMAN.salida.f) {
      fantasma.modo = 'normal';
    } else if (fantasma.modo === 'ojos' && fantasma.c === PACMAN.casa.c && fantasma.f === PACMAN.casa.f) {
      fantasma.modo = 'saliendo';
      fantasma.asustado = false;
    }

    const puedePuerta = fantasma.modo === 'saliendo' || fantasma.modo === 'ojos';
    const abiertas = ORDEN.filter((d) => this.libre(fantasma.c + d.x, fantasma.f + d.y, puedePuerta));
    const sinRetroceso = abiertas.filter((d) => !opuesta(d, fantasma.dir));
    const opciones = sinRetroceso.length > 0 ? sinRetroceso : abiertas;
    if (opciones.length === 0) return;

    if (fantasma.asustado && fantasma.modo === 'normal') {
      this.fijarDestino(fantasma, Phaser.Utils.Array.GetRandom(opciones));
      return;
    }

    const meta = this.objetivo(fantasma);
    let mejor = opciones[0];
    let mejorDistancia = Infinity;
    opciones.forEach((d) => {
      const dc = fantasma.c + d.x - meta.c;
      const df = fantasma.f + d.y - meta.f;
      const distancia = dc * dc + df * df;
      if (distancia < mejorDistancia) {
        mejorDistancia = distancia;
        mejor = d;
      }
    });
    this.fijarDestino(fantasma, mejor);
  }

  velocidadFantasma(fantasma) {
    if (fantasma.modo === 'ojos') return PACMAN.velocidadOjos;
    if (fantasma.asustado) return PACMAN.velocidadAsustado;
    if (fantasma.modo === 'saliendo') return PACMAN.velocidadFantasma * 0.6;
    return PACMAN.velocidadFantasma * this.multiplicador();
  }

  cambiarTextura(fantasma, textura) {
    if (fantasma.textura === textura) return;
    fantasma.textura = textura;
    fantasma.sprite.setTexture(textura);
  }

  texturaFantasma(fantasma) {
    if (fantasma.modo === 'ojos') return 'ojos';
    if (!fantasma.asustado) return 'fantasma-' + fantasma.datos.nombre;
    const parpadea = this.asustadoRestante < PACMAN.parpadeoMs && Math.floor(this.reloj / 200) % 2 === 0;
    return parpadea ? 'fantasma-blanco' : 'fantasma-asustado';
  }

  actualizarFantasmas(dt) {
    this.fantasmas.forEach((fantasma) => {
      if (fantasma.modo === 'casa') {
        if (this.reloj >= fantasma.liberarEn) {
          fantasma.modo = 'saliendo';
          this.colocar(fantasma, fantasma.c, fantasma.f, fantasma.dir);
          this.llegarFantasma(fantasma);
        } else {
          fantasma.sprite.y = centroY(fantasma.f) + Math.sin(this.reloj / 150 + fantasma.indice) * 3;
        }
      } else {
        if (!fantasma.destino) this.llegarFantasma(fantasma);
        this.moverEntidad(fantasma, this.velocidadFantasma(fantasma), dt, (g) => this.llegarFantasma(g));
      }
      this.cambiarTextura(fantasma, this.texturaFantasma(fantasma));
    });
  }

  actualizarModos(delta) {
    if (this.asustadoRestante > 0) {
      this.asustadoRestante -= delta;
      if (this.asustadoRestante <= 0) this.fantasmas.forEach((fantasma) => { fantasma.asustado = false; });
      return;
    }
    this.tiempoModo += delta;
    const limite = this.dispersion ? PACMAN.dispersionMs : PACMAN.persecucionMs;
    if (this.tiempoModo < limite) return;
    this.tiempoModo = 0;
    this.dispersion = !this.dispersion;
    this.fantasmas.forEach((fantasma) => {
      if (fantasma.modo === 'normal' && fantasma.destino) this.invertir(fantasma);
    });
  }

  revisarChoques() {
    const radio = PACMAN.radioChoque * T;
    for (let i = 0; i < this.fantasmas.length; i++) {
      const fantasma = this.fantasmas[i];
      if (fantasma.modo === 'casa' || fantasma.modo === 'ojos') continue;
      if (Math.abs(fantasma.x - this.pacman.x) + Math.abs(fantasma.y - this.pacman.y) > radio * 1.4) continue;
      if (fantasma.asustado) {
        this.comerFantasma(fantasma);
      } else {
        this.morir();
        return;
      }
    }
  }

  comerFantasma(fantasma) {
    this.combo += 1;
    const puntos = PACMAN.puntos.fantasma * Math.pow(2, this.combo - 1);
    this.sumar(puntos);
    fantasma.asustado = false;
    fantasma.modo = 'ojos';
    Sonido.comerFantasma();
    this.tweens.killTweensOf(this.textoBonus);
    this.textoBonus.setText(String(puntos)).setPosition(fantasma.x, fantasma.y).setAlpha(1).setVisible(true);
    this.tweens.add({ targets: this.textoBonus, y: fantasma.y - 24, alpha: 0, duration: 800 });
  }

  morir() {
    this.estado = 'muerte';
    Sonido.danio();
    this.fantasmas.forEach((fantasma) => fantasma.sprite.setVisible(false));
    this.tweens.add({ targets: this.pacman.sprite, scale: 0, angle: 540, duration: 900 });
    this.time.delayedCall(PACMAN.esperaMuerteMs, () => {
      this.vidas -= 1;
      this.iconosVida.forEach((icono, i) => icono.setVisible(i < this.vidas));
      if (this.vidas <= 0) this.terminar();
      else this.iniciarRonda();
    });
  }

  completarNivel() {
    this.estado = 'nivel';
    this.fantasmas.forEach((fantasma) => fantasma.sprite.setVisible(false));
    this.tweens.add({ targets: this.laberinto, alpha: 0.3, duration: 180, yoyo: true, repeat: 3 });
    this.time.delayedCall(PACMAN.esperaNivelMs, () => {
      this.nivel += 1;
      this.textoNivel.setText('Nivel ' + this.nivel);
      this.puntos.forEach((punto) => punto.setVisible(true));
      this.restantes = this.totalPuntos;
      this.iniciarRonda();
    });
  }

  terminar() {
    this.estado = 'fin';
    const nuevoRecord = Storage.guardarRecordPacman(this.puntaje);
    this.mostrarCapa('FIN DEL JUEGO', nuevoRecord ? '¡Nuevo récord: ' + this.puntaje + '!' : 'Puntos: ' + this.puntaje, [
      { texto: 'Reintentar', accion: () => this.scene.restart() },
      { texto: 'Menú principal', accion: () => this.scene.start('Menu') }
    ]);
  }

  mostrarCapa(titulo, subtitulo, botones) {
    this.ocultarCapa();
    const cx = centroX(9);
    this.capa.push(this.add.rectangle(OX, OY, COLUMNAS * T, FILAS * T, 0x000000, 0.7).setOrigin(0).setInteractive());
    this.capa.push(crearTexto(this, cx, 200, titulo, 40, '#ffe14d').setOrigin(0.5));
    this.capa.push(crearTexto(this, cx, 250, subtitulo, 20).setOrigin(0.5));
    botones.forEach((boton, i) => {
      const creado = crearBoton(this, cx, 320 + i * 64, boton.texto, boton.accion);
      this.capa.push(creado.fondo, creado.etiqueta);
    });
    this.capa.forEach((elemento) => elemento.setDepth(PROFUNDIDAD_UI + 10));
  }

  ocultarCapa() {
    this.capa.forEach((elemento) => elemento.destroy());
    this.capa = [];
  }

  alternarPausa() {
    if (this.estado === 'pausa') {
      this.estado = this.estadoPrevio;
      this.time.paused = false;
      this.tweens.resumeAll();
      this.ocultarCapa();
      return;
    }
    if (this.estado === 'fin') return;
    this.estadoPrevio = this.estado;
    this.estado = 'pausa';
    this.time.paused = true;
    this.tweens.pauseAll();
    this.mostrarCapa('PAUSA', 'Pac-Man', [
      { texto: 'Continuar', accion: () => this.alternarPausa() },
      { texto: 'Menú principal', accion: () => this.scene.start('Menu') }
    ]);
  }

  pausarPorFoco() {
    if (this.estado !== 'pausa' && this.estado !== 'fin') this.alternarPausa();
  }

  update(time, delta) {
    if (this.estado !== 'jugando') return;
    const paso = Math.min(delta, 50);
    const dt = paso / 1000;
    this.reloj += paso;
    this.actualizarModos(paso);
    this.actualizarPacman(dt, paso);
    if (this.estado !== 'jugando') return;
    this.actualizarFantasmas(dt);
    this.revisarChoques();
  }
}
