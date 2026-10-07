import Phaser from 'phaser';
import { ANCHO, ALTO, RED } from '../config.js';
import Red, { ID_ANFITRION } from '../systems/Red.js';
import Storage from '../systems/Storage.js';

const PLANTILLA = `
  <div class="lobby-caja">
    <h2>Multijugador</h2>
    <div data-vista="inicio">
      <label class="lobby-etiqueta">Tu nombre
        <input data-campo="nombre" maxlength="${RED.largoNombre}" autocomplete="off" />
      </label>
      <button data-accion="crear">Crear partida</button>
      <div class="lobby-fila">
        <input data-campo="codigo" maxlength="${RED.largoCodigo}" placeholder="CÓDIGO" autocomplete="off" autocapitalize="characters" />
        <button data-accion="unirse">Unirse</button>
      </div>
      <button data-accion="volver" class="lobby-secundario">Volver</button>
    </div>
    <div data-vista="sala" hidden>
      <p class="lobby-codigo">Código: <b data-campo="codigo-sala"></b></p>
      <p class="lobby-ayuda">Compártelo con quienes estén en tu misma WiFi (máx. ${RED.maxJugadores} jugadores)</p>
      <ul data-campo="lista"></ul>
      <div class="lobby-fila" data-campo="modos">
        <button data-accion="modo-supervivencia" class="lobby-modo">Supervivencia</button>
        <button data-accion="modo-historia" class="lobby-modo">Historia</button>
      </div>
      <p class="lobby-ayuda" data-campo="modo"></p>
      <button data-accion="empezar">Empezar partida</button>
      <p class="lobby-ayuda" data-campo="espera">Esperando a que el anfitrión empiece…</p>
      <button data-accion="salir" class="lobby-secundario">Salir</button>
    </div>
    <p class="lobby-estado" data-campo="estado"></p>
  </div>
`;

export default class LobbyScene extends Phaser.Scene {
  constructor() {
    super('Lobby');
  }

  init(datos) {
    this.red = datos && datos.red ? datos.red : null;
    this.sys.settings.data = {};
  }

  create() {
    this.add.image(ANCHO / 2, ALTO / 2, 'ciudad');
    this.add.rectangle(0, 0, ANCHO, ALTO, 0x000000, 0.65).setOrigin(0);

    this.panel = document.createElement('div');
    this.panel.className = 'lobby';
    this.panel.innerHTML = PLANTILLA;
    document.getElementById('juego').appendChild(this.panel);
    this.panel.addEventListener('keydown', (evento) => evento.stopPropagation());
    this.panel.addEventListener('keyup', (evento) => evento.stopPropagation());
    this.panel.addEventListener('click', (evento) => {
      const boton = evento.target.closest('button');
      if (boton && !boton.disabled) this.alAccion(boton.dataset.accion);
    });

    this.campo('nombre').value = Storage.obtenerNombre();
    this.events.once('shutdown', () => this.limpiar());

    if (this.red) {
      this.escucharRed();
      this.mostrarSala();
    }
  }

  campo(nombre) {
    return this.panel.querySelector(`[data-campo="${nombre}"]`);
  }

  boton(accion) {
    return this.panel.querySelector(`[data-accion="${accion}"]`);
  }

  estado(texto) {
    this.campo('estado').textContent = texto;
  }

  ocupado(valor) {
    this.panel.querySelectorAll('button').forEach((boton) => {
      boton.disabled = valor;
    });
  }

  alAccion(accion) {
    switch (accion) {
      case 'crear':
        this.crear();
        break;
      case 'unirse':
        this.unirse();
        break;
      case 'empezar':
        this.empezar();
        break;
      case 'salir':
        this.red.cerrar();
        this.red = null;
        this.scene.start('Menu');
        break;
      case 'volver':
        this.scene.start('Menu');
        break;
      case 'modo-supervivencia':
        this.red.cambiarModo('supervivencia');
        break;
      case 'modo-historia':
        this.red.cambiarModo('historia');
        break;
      default:
        break;
    }
  }

  nombreElegido() {
    const nombre = this.campo('nombre').value;
    Storage.guardarNombre(nombre);
    return nombre;
  }

  async crear() {
    this.ocupado(true);
    this.estado('Creando partida…');
    const red = new Red(this.game);
    try {
      await red.crear(this.nombreElegido());
      this.red = red;
      this.escucharRed();
      this.mostrarSala();
    } catch (error) {
      red.cerrar();
      this.estado(error.message);
      this.ocupado(false);
    }
  }

  async unirse() {
    const codigo = this.campo('codigo').value.trim().toUpperCase();
    if (codigo.length !== RED.largoCodigo) {
      this.estado('Escribe el código de ' + RED.largoCodigo + ' letras');
      return;
    }
    this.ocupado(true);
    this.estado('Conectando…');
    const red = new Red(this.game);
    try {
      await red.unirse(codigo, this.nombreElegido());
      this.red = red;
      this.escucharRed();
      this.mostrarSala();
    } catch (error) {
      this.estado(error.message);
      this.ocupado(false);
    }
  }

  escucharRed() {
    this.red.on('lobby', this.dibujarLista, this);
  }

  mostrarSala() {
    this.panel.querySelector('[data-vista="inicio"]').hidden = true;
    this.panel.querySelector('[data-vista="sala"]').hidden = false;
    this.campo('codigo-sala').textContent = this.red.codigo;
    this.boton('empezar').hidden = !this.red.esAnfitrion;
    this.campo('modos').hidden = !this.red.esAnfitrion;
    this.campo('espera').hidden = this.red.esAnfitrion;
    this.estado('');
    this.ocupado(false);
    this.dibujarLista(this.red.jugadores);
  }

  dibujarLista(jugadores) {
    const historia = this.red.modo === 'historia';
    this.campo('modo').textContent = 'Modo: ' + (historia ? 'Historia (3 mundos)' : 'Supervivencia (oleadas infinitas)');
    this.boton('modo-supervivencia').classList.toggle('lobby-activo', !historia);
    this.boton('modo-historia').classList.toggle('lobby-activo', historia);
    const lista = this.campo('lista');
    lista.replaceChildren();
    jugadores.forEach((jugador) => {
      const elemento = document.createElement('li');
      let texto = jugador.nombre;
      if (jugador.id === ID_ANFITRION) texto += ' (anfitrión)';
      if (jugador.id === this.red.miId) texto += ' (tú)';
      elemento.textContent = texto;
      lista.appendChild(elemento);
    });
  }

  empezar() {
    const semilla = Math.floor(Math.random() * 1e9);
    this.red.iniciarPartida(0, semilla);
    this.scene.start('Game', { red: this.red, modo: this.red.modo, nivel: 0, semilla });
  }

  limpiar() {
    if (this.red) this.red.off('lobby', this.dibujarLista, this);
    this.panel.remove();
  }
}
