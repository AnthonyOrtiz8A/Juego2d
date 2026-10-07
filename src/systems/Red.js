import Phaser from 'phaser';
import { Peer } from 'peerjs';
import { RED } from '../config.js';

const LETRAS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
export const ID_ANFITRION = 'anfitrion';

function generarCodigo() {
  let codigo = '';
  for (let i = 0; i < RED.largoCodigo; i++) codigo += LETRAS[Math.floor(Math.random() * LETRAS.length)];
  return codigo;
}

export function limpiarNombre(nombre) {
  const limpio = String(nombre || '').replace(/[^\p{L}\p{N} _-]/gu, '').trim().slice(0, RED.largoNombre);
  return limpio || 'Jugador';
}

function mensajeError(error) {
  switch (error && error.type) {
    case 'peer-unavailable':
      return 'No existe una partida con ese código';
    case 'browser-incompatible':
      return 'Tu navegador no permite jugar en red';
    case 'network':
    case 'server-error':
    case 'socket-error':
    case 'socket-closed':
      return 'Sin conexión con el servidor. Revisa tu internet';
    default:
      return 'Error de conexión';
  }
}

export default class Red extends Phaser.Events.EventEmitter {
  constructor(game) {
    super();
    this.game = game;
    this.peer = null;
    this.esAnfitrion = false;
    this.codigo = '';
    this.miId = null;
    this.nombre = '';
    this.jugadores = [];
    this.clientes = new Map();
    this.anfitrion = null;
    this.enPartida = false;
    this.cerrada = false;
    this.alSnapshot = null;
  }

  crear(nombre) {
    this.esAnfitrion = true;
    this.nombre = limpiarNombre(nombre);
    this.miId = ID_ANFITRION;
    this.jugadores = [{ id: ID_ANFITRION, nombre: this.nombre }];
    return this.abrirAnfitrion(RED.intentosCodigo);
  }

  abrirAnfitrion(intentos) {
    return new Promise((resolver, rechazar) => {
      const codigo = generarCodigo();
      const peer = new Peer(RED.prefijo + codigo, { debug: 0 });
      peer.on('open', () => {
        this.peer = peer;
        this.codigo = codigo;
        peer.on('connection', (conexion) => this.alConectar(conexion));
        peer.on('disconnected', () => {
          if (!this.cerrada) peer.reconnect();
        });
        resolver(codigo);
      });
      peer.on('error', (error) => {
        if (this.peer === peer) return;
        peer.destroy();
        if (error.type === 'unavailable-id' && intentos > 1) this.abrirAnfitrion(intentos - 1).then(resolver, rechazar);
        else rechazar(new Error(mensajeError(error)));
      });
    });
  }

  alConectar(conexion) {
    conexion.on('data', (datos) => {
      if (!this.clientes.has(conexion.peer)) {
        this.recibirSaludo(conexion, datos);
        return;
      }
      this.emit('mensaje', conexion.peer, datos);
    });
    conexion.on('close', () => this.quitarCliente(conexion.peer));
    conexion.on('error', () => this.quitarCliente(conexion.peer));
  }

  recibirSaludo(conexion, datos) {
    if (!datos || datos.t !== 'hola') return;
    if (this.enPartida) {
      this.rechazar(conexion, 'La partida ya empezó');
      return;
    }
    if (this.jugadores.length >= RED.maxJugadores) {
      this.rechazar(conexion, 'La sala está llena');
      return;
    }
    this.clientes.set(conexion.peer, conexion);
    this.jugadores.push({ id: conexion.peer, nombre: limpiarNombre(datos.nombre) });
    this.enviarLobby();
  }

  rechazar(conexion, motivo) {
    conexion.send({ t: 'rechazo', motivo });
    setTimeout(() => conexion.close(), 500);
  }

  quitarCliente(id) {
    if (!this.clientes.has(id)) return;
    this.clientes.delete(id);
    this.jugadores = this.jugadores.filter((jugador) => jugador.id !== id);
    this.emit('salio', id);
    if (!this.enPartida) this.enviarLobby();
  }

  enviarLobby() {
    this.enviarATodos({ t: 'lobby', jugadores: this.jugadores, codigo: this.codigo });
    this.emit('lobby', this.jugadores);
  }

  unirse(codigo, nombre) {
    this.esAnfitrion = false;
    this.nombre = limpiarNombre(nombre);
    this.codigo = String(codigo || '').toUpperCase().trim();
    return new Promise((resolver, rechazar) => {
      let resuelto = false;
      const fallar = (texto) => {
        if (resuelto) return;
        resuelto = true;
        clearTimeout(espera);
        this.cerrar();
        rechazar(new Error(texto));
      };
      const espera = setTimeout(() => fallar('No se encontró la partida'), RED.esperaConexionMs);
      const peer = new Peer({ debug: 0 });
      this.peer = peer;
      peer.on('open', (id) => {
        this.miId = id;
        const conexion = peer.connect(RED.prefijo + this.codigo, { reliable: true, serialization: 'json' });
        this.anfitrion = conexion;
        conexion.on('open', () => conexion.send({ t: 'hola', nombre: this.nombre }));
        conexion.on('data', (datos) => {
          if (datos.t === 'rechazo') {
            fallar(datos.motivo);
            return;
          }
          if (datos.t === 'lobby') {
            this.jugadores = datos.jugadores;
            if (!resuelto) {
              resuelto = true;
              clearTimeout(espera);
              resolver();
            }
            this.emit('lobby', datos.jugadores);
            return;
          }
          this.alMensajeAnfitrion(datos);
        });
        conexion.on('close', () => this.perderAnfitrion());
        conexion.on('error', () => this.perderAnfitrion());
      });
      peer.on('error', (error) => {
        if (!resuelto) fallar(mensajeError(error));
      });
    });
  }

  alMensajeAnfitrion(datos) {
    switch (datos.t) {
      case 's':
        if (this.alSnapshot) this.alSnapshot(datos);
        break;
      case 'iniciar':
        this.jugadores = datos.jugadores;
        this.irA('Cliente', { red: this });
        break;
      case 'fin':
        this.irA('GameOver', { puntos: datos.puntos, oleada: datos.oleada, red: this });
        break;
      case 'sala':
        this.irA('Lobby', { red: this });
        break;
      default:
        this.emit('mensaje', ID_ANFITRION, datos);
    }
  }

  perderAnfitrion() {
    if (this.cerrada) return;
    this.cerrar();
    this.irA('Menu', { aviso: 'Se perdió la conexión con el anfitrión' });
  }

  irA(clave, datos) {
    const activa = this.game.scene.getScenes(true)[0];
    if (activa) activa.scene.start(clave, datos);
    else this.game.scene.start(clave, datos);
  }

  iniciarPartida() {
    this.enPartida = true;
    this.enviarATodos({ t: 'iniciar', jugadores: this.jugadores });
  }

  terminarPartida(puntos, oleada) {
    this.enviarATodos({ t: 'fin', puntos, oleada });
  }

  volverASala() {
    this.enPartida = false;
    this.enviarATodos({ t: 'sala' });
    this.enviarLobby();
  }

  enviar(id, mensaje) {
    const conexion = this.clientes.get(id);
    if (conexion && conexion.open) conexion.send(mensaje);
  }

  enviarATodos(mensaje) {
    this.clientes.forEach((conexion) => {
      if (conexion.open) conexion.send(mensaje);
    });
  }

  enviarAnfitrion(mensaje) {
    if (this.anfitrion && this.anfitrion.open) this.anfitrion.send(mensaje);
  }

  cerrar() {
    if (this.cerrada) return;
    this.cerrada = true;
    this.alSnapshot = null;
    this.removeAllListeners();
    this.clientes.clear();
    if (this.peer) this.peer.destroy();
  }
}
