import Phaser from 'phaser';
import { JUGADOR, HABILIDADES, PASIVAS, MEJORAS, MUNICION, ENERGIA, ARMADURA, PERSONAJES } from '../config.js';
import { estadisticasArma, modificadoresPasivas, pasivasEquipadas, mejorasEquipadas } from '../systems/Recompensas.js';
import { personajeValido, sumarModificadores } from '../systems/Personajes.js';

const COLOR_SPRINT = 0xfff27a;
const DURACION_ADRENALINA_MS = 3000;

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, opciones = {}) {
    const personaje = personajeValido(opciones.personaje);
    super(scene, x, y, 'jugador-' + personaje);
    this.personaje = personaje;
    this.vidasBase = PERSONAJES[personaje].vidas;
    this.armaduraBase = PERSONAJES[personaje].armadura;
    this.armadura = 0;
    this.ultimoDanio = 0;
    this.ultimaRegen = 0;
    this.adrenalinaHasta = 0;
    this.reanimador = null;
    this.progresoReanimar = 0;
    this.marcaCaido = null;
    this.ultiActivaHasta = 0;
    this.ultiActivaTotal = 1;
    this.modsEquipo = {};
    this.energia = 0;
    this.ultiListaEn = 0;
    this.ultiDuracion = 1;
    this.sprintHasta = 0;
    this.multiplicadorSprint = 1;
    this.fuegoHasta = 0;
    this.radioFuego = 0;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setCircle(JUGADOR.radio, this.width / 2 - JUGADOR.radio, this.height / 2 - JUGADOR.radio);
    this.setCollideWorldBounds(true);
    this.setDepth(10);
    this.id = opciones.id || 'local';
    this.nombre = opciones.nombre || '';
    this.local = opciones.local !== false;
    this.indice = opciones.indice || 0;
    this.armas = [{ id: MUNICION.armaInicial }, null];
    this.armaActual = 0;
    this.dedos = 0;
    this.mejoras = {};
    this.pasivas = {};
    Object.keys(MEJORAS).forEach((id) => {
      this.mejoras[id] = 0;
    });
    Object.keys(PASIVAS).forEach((id) => {
      this.pasivas[id] = 0;
    });
    this.bajas = 0;
    this.teletransportes = 0;
    this.velocidadRed = { x: 0, y: 0 };
    this.ultimaEntrada = 0;
    this.entrada = { dx: 0, dy: 0, angulo: 0, disparando: false, habilidades: [] };
    this.habilidades = null;
    this.etiqueta = null;
    this.vivo = true;
    this.desconectado = false;
    this.vidas = this.vidasBase;
    this.invulnerableHasta = 0;
    this.proximoDisparo = 0;
    this.dashHasta = 0;
    this.dashVx = 0;
    this.dashVy = 0;
    this.escudoHasta = 0;
    this.frenesiHasta = 0;
    this.enFrenesi = false;
    this.efectoVisible = '';
  }

  mover(dx, dy, reloj) {
    if (reloj < this.dashHasta) {
      this.body.setVelocity(this.dashVx, this.dashVy);
      return;
    }
    const largo = Math.hypot(dx, dy);
    if (largo > 1) {
      dx /= largo;
      dy /= largo;
    }
    const velocidad = this.velocidadMovimiento();
    this.body.setVelocity(dx * velocidad, dy * velocidad);
  }

  modificadores() {
    return sumarModificadores(modificadoresPasivas(this.pasivas), this.modsEquipo);
  }

  sumarEnergia(cantidad) {
    const bateria = (this.mejoras.bateria || 0) * MEJORAS.bateria.valor;
    this.energia = Math.min(ENERGIA.maximo, this.energia + cantidad * (1 + this.modificador('energia') + bateria));
  }

  enSprint(reloj) {
    return reloj < this.sprintHasta;
  }

  enFuego(reloj) {
    return reloj < this.fuegoHasta;
  }

  modificador(clave) {
    return this.modificadores()[clave] || 0;
  }

  cantidadPasivas() {
    return pasivasEquipadas(this.pasivas).length;
  }

  cantidadMejoras() {
    return mejorasEquipadas(this.mejoras).length;
  }

  velocidadMovimiento() {
    const reloj = this.scene.reloj;
    const sprint = this.enSprint(reloj) ? this.multiplicadorSprint : 1;
    const adrenalina = reloj < this.adrenalinaHasta ? 1 + this.modificador('adrenalina') : 1;
    return JUGADOR.velocidad * Math.max(0.4, 1 + this.modificador('velocidad')) * sprint * adrenalina;
  }

  vidasMaximas() {
    return Math.max(1, this.vidasBase + this.modificador('vidas'));
  }

  armaduraMaxima() {
    return Math.max(0, this.armaduraBase + this.modificador('armadura') + (this.mejoras.placas || 0) * MEJORAS.placas.valor);
  }

  ajustarVidas() {
    this.vidas = Math.min(this.vidas, this.vidasMaximas());
    this.armadura = Math.min(this.armadura, this.armaduraMaxima());
  }

  regenerarArmadura(reloj) {
    if (!this.vivo) return;
    const maxima = this.armaduraMaxima();
    if (this.armadura >= maxima) {
      this.armadura = maxima;
      return;
    }
    const factor = 1 + this.modificador('regenArmadura');
    const desdeRegen = this.ultimaRegen > this.ultimoDanio;
    const espera = (desdeRegen ? ARMADURA.intervaloMs : ARMADURA.retrasoMs) / factor;
    if (reloj - Math.max(this.ultimoDanio, this.ultimaRegen) < espera) return;
    this.armadura += 1;
    this.ultimaRegen = reloj;
  }

  curar(cantidad) {
    this.vidas = Math.min(this.vidasMaximas(), this.vidas + cantidad);
  }

  multiplicadorEnfriamiento() {
    return Math.max(0.3, 1 + this.modificador('enfriamiento'));
  }

  get arma() {
    return this.armas[this.armaActual].id;
  }

  set arma(id) {
    this.armas[this.armaActual] = { id };
  }

  datosArma() {
    const mods = this.modificadores();
    const datos = estadisticasArma(this.arma, this.mejoras, mods);
    if (mods.furia && this.vidas === 1) datos.danio *= 1 + mods.furia;
    return datos;
  }

  ranuraActual() {
    return this.armas[this.armaActual];
  }

  cambiarArma() {
    const otra = 1 - this.armaActual;
    if (!this.armas[otra]) return false;
    this.armaActual = otra;
    return true;
  }

  equiparArma(id) {
    const otra = 1 - this.armaActual;
    if (!this.armas[otra]) {
      this.armas[otra] = { id };
      this.armaActual = otra;
      return null;
    }
    const soltada = this.arma;
    this.arma = id;
    return soltada;
  }

  tieneArma(id) {
    return this.armas.some((ranura) => ranura && ranura.id === id);
  }

  registrarBaja() {
    const necesarias = this.modificador('vampiro');
    if (!necesarias) return;
    this.bajas += 1;
    if (this.bajas >= necesarias) {
      this.bajas = 0;
      this.curar(1);
    }
  }

  iniciarDash(hasta, vx, vy) {
    this.dashHasta = hasta;
    this.dashVx = vx;
    this.dashVy = vy;
  }

  tieneEscudo(reloj) {
    return reloj < this.escudoHasta;
  }

  actualizarEfectos(reloj) {
    this.enFrenesi = reloj < this.frenesiHasta;
    this.regenerarArmadura(reloj);
    let efecto = '';
    if (this.enSprint(reloj)) efecto = 'sprint';
    else if (this.enFrenesi) efecto = 'frenesi';
    if (efecto === this.efectoVisible) return;
    this.efectoVisible = efecto;
    if (efecto === 'sprint') this.setTint(COLOR_SPRINT);
    else if (efecto === 'frenesi') this.setTint(HABILIDADES.tipos.frenesi.color);
    else this.clearTint();
  }

  puedeDisparar(tiempo, cadenciaMs) {
    if (tiempo < this.proximoDisparo) return false;
    const multiplicador = this.enFrenesi ? HABILIDADES.tipos.frenesi.multiplicadorCadencia : 1;
    this.proximoDisparo = tiempo + cadenciaMs / multiplicador;
    return true;
  }

  esInvulnerable(tiempo) {
    return tiempo < this.invulnerableHasta;
  }

  recibirDanio(tiempo) {
    if (!this.vivo || this.esInvulnerable(tiempo)) return false;
    if (this.armadura > 0) this.armadura -= 1;
    else this.vidas -= 1;
    const reloj = this.scene.reloj;
    this.ultimoDanio = reloj;
    if (this.modificador('adrenalina') > 0) this.adrenalinaHasta = reloj + DURACION_ADRENALINA_MS;
    this.invulnerableHasta = tiempo + JUGADOR.invulnerabilidadMs * Math.max(0.3, 1 + this.modificador('invulnerabilidad'));
    return true;
  }

  caer() {
    this.vivo = false;
    this.disableBody(true, true);
    if (this.etiqueta) this.etiqueta.setVisible(false);
  }

  revivir(x, y, vidas, tiempo) {
    if (this.desconectado) return;
    this.vivo = true;
    this.vidas = vidas;
    this.armadura = 0;
    this.ultimoDanio = this.scene.reloj;
    this.reanimador = null;
    this.progresoReanimar = 0;
    this.teletransportes += 1;
    this.invulnerableHasta = tiempo + JUGADOR.invulnerabilidadMs;
    this.enableBody(true, x, y, true, true);
    if (this.etiqueta) this.etiqueta.setVisible(true);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    this.alpha = this.esInvulnerable(time) && Math.floor(time / 80) % 2 === 0 ? 0.3 : 1;
    if (this.etiqueta && this.vivo) this.etiqueta.setPosition(this.x, this.y - 46);
  }

  apuntarA(x, y) {
    this.rotation = Math.atan2(y - this.y, x - this.x);
  }
}
