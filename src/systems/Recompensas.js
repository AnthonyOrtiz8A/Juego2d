import Phaser from 'phaser';
import { ARMAS, PASIVAS, MEJORAS, COFRES, HABILIDADES, LIMITES, ENERGIA } from '../config.js';
import { DESCRIPCIONES } from './Habilidades.js';

export const TIPOS_COFRE = Object.keys(COFRES.tipos);
const NUMEROS_ROMANOS = ['', 'I', 'II', 'III', 'IV', 'V', 'VI'];

export function nivelRomano(nivel) {
  return NUMEROS_ROMANOS[nivel] || String(nivel);
}

export function modificadoresPasivas(pasivas) {
  const total = {};
  Object.keys(PASIVAS).forEach((id) => {
    if (!pasivas || !pasivas[id]) return;
    const mods = PASIVAS[id].mods;
    Object.keys(mods).forEach((clave) => {
      total[clave] = (total[clave] || 0) + mods[clave];
    });
  });
  return total;
}

export function pasivasEquipadas(pasivas) {
  return Object.keys(PASIVAS).filter((id) => pasivas && pasivas[id]);
}

export function mejorasEquipadas(mejoras) {
  return Object.keys(MEJORAS).filter((id) => mejoras && mejoras[id] > 0);
}

export function estadisticasArma(armaId, mejoras, mods = {}) {
  const arma = ARMAS[armaId] || ARMAS.pistola;
  const nivel = (id) => Number(mejoras && mejoras[id]) || 0;
  const multiplicadorCadencia = Math.max(0.3, 1 + nivel('cadencia') * MEJORAS.cadencia.valor + (mods.cadencia || 0));
  return {
    cadenciaMs: arma.cadenciaMs / multiplicadorCadencia,
    danio: arma.danio * Math.max(0.2, 1 + nivel('danio') * MEJORAS.danio.valor + (mods.danio || 0)),
    balas: arma.balas + nivel('canon') * MEJORAS.canon.valor,
    dispersion: arma.dispersion + (arma.dispersion === 0 && nivel('canon') > 0 ? 0.12 : 0) + (mods.dispersion || 0),
    velocidad: arma.velocidad,
    vidaMs: arma.vidaMs * (1 + nivel('alcance') * MEJORAS.alcance.valor),
    perforacion: arma.perforacion + nivel('calibre') * MEJORAS.calibre.valor + (mods.perforacion || 0),
    critico: nivel('critico') * MEJORAS.critico.valor,
    explosivo: arma.explosivo || 0
  };
}

export function elegirTipoCofre() {
  const total = TIPOS_COFRE.reduce((suma, tipo) => suma + COFRES.tipos[tipo].peso, 0);
  let azar = Math.random() * total;
  for (const tipo of TIPOS_COFRE) {
    azar -= COFRES.tipos[tipo].peso;
    if (azar <= 0) return tipo;
  }
  return TIPOS_COFRE[0];
}

export function generarRecompensa(tipo, jugador) {
  if (tipo === 'arma') {
    return { tipo, id: Phaser.Utils.Array.GetRandom(Object.keys(ARMAS).filter((id) => !jugador.tieneArma(id))) };
  }
  if (tipo === 'activa') {
    const equipadas = Object.values(jugador.habilidades.ranuras).filter((id) => id !== null);
    const libres = Object.keys(HABILIDADES.tipos).filter((id) => !equipadas.includes(id));
    if (libres.length > 0) return { tipo, id: Phaser.Utils.Array.GetRandom(libres) };
  }
  if (tipo === 'pasiva') {
    const opciones = Object.keys(PASIVAS).filter((id) => !jugador.pasivas[id]);
    if (opciones.length > 0) return { tipo, id: Phaser.Utils.Array.GetRandom(opciones), nivel: 1 };
  }
  return { tipo: 'mejora', id: Phaser.Utils.Array.GetRandom(Object.keys(MEJORAS)), nivel: 1 };
}

export function describirRecompensa(recompensa) {
  const cofre = COFRES.tipos[recompensa.tipo];
  const base = { titulo: cofre.nombre, color: cofre.color };
  if (recompensa.tipo === 'arma') {
    const arma = ARMAS[recompensa.id];
    const balas = arma.balas > 1 ? arma.balas + ' balas por disparo' : '1 bala por disparo';
    const perfora = arma.perforacion > 0 ? '\nAtraviesa ' + arma.perforacion + ' zombies' : '';
    return { ...base, nombre: arma.nombre, texto: 'Daño ' + arma.danio + ' · ' + balas + '\n' + Math.round(1000 / arma.cadenciaMs) + ' disparos por segundo' + perfora };
  }
  if (recompensa.tipo === 'activa') {
    const descripcion = DESCRIPCIONES[recompensa.id];
    return { ...base, nombre: descripcion.nombre, texto: descripcion.texto + '\nEnfriamiento: ' + HABILIDADES.tipos[recompensa.id].enfriamientoMs / 1000 + ' s' };
  }
  if (recompensa.tipo === 'pasiva') {
    const pasiva = PASIVAS[recompensa.id];
    return { ...base, nombre: pasiva.nombre, texto: '✔ ' + pasiva.bueno + '\n✘ ' + pasiva.malo };
  }
  const mejora = MEJORAS[recompensa.id];
  return { ...base, nombre: mejora.nombre + ' ' + nivelRomano(recompensa.nivel || 1), texto: mejora.texto };
}

export function recompensaValida(recompensa) {
  if (!recompensa || typeof recompensa.id !== 'string') return false;
  const catalogo = { arma: ARMAS, activa: HABILIDADES.tipos, pasiva: PASIVAS, mejora: MEJORAS }[recompensa.tipo];
  if (!catalogo || !Object.prototype.hasOwnProperty.call(catalogo, recompensa.id)) return false;
  if (recompensa.nivel !== undefined && !(Number.isInteger(recompensa.nivel) && recompensa.nivel >= 1 && recompensa.nivel <= LIMITES.nivelMejora)) return false;
  return true;
}

export function aplicarRecompensa(jugador, recompensa, decision) {
  if (!decision || !decision.tomar) return;
  if (recompensa.tipo === 'arma') jugador.arma = recompensa.id;
  else if (recompensa.tipo === 'activa' && ['E', 'Q', 'C'].includes(decision.ranura)) jugador.habilidades.asignar(decision.ranura, recompensa.id);
}

export function exportarEstado(jugador) {
  return {
    armas: jugador.armas.map((ranura) => (ranura ? { ...ranura } : null)),
    armaActual: jugador.armaActual,
    dedos: jugador.dedos,
    mejoras: { ...jugador.mejoras },
    pasivas: { ...jugador.pasivas },
    ranuras: { ...jugador.habilidades.ranuras },
    vidas: Math.max(1, jugador.vidas),
    energia: jugador.energia
  };
}

export function importarEstado(jugador, estado) {
  if (!estado) return;
  if (Array.isArray(estado.armas)) {
    jugador.armas = [0, 1].map((i) => {
      const ranura = estado.armas[i];
      if (!ranura || !ARMAS[ranura.id]) return null;
      return { id: ranura.id };
    });
    if (!jugador.armas[0]) jugador.armas[0] = { id: 'pistola' };
    jugador.armaActual = estado.armaActual === 1 && jugador.armas[1] ? 1 : 0;
  }
  jugador.dedos = Math.max(0, Number(estado.dedos) || 0);
  let mejoras = 0;
  Object.keys(MEJORAS).forEach((id) => {
    const nivel = Math.min(LIMITES.nivelMejora, Math.max(0, Math.floor(Number(estado.mejoras && estado.mejoras[id]) || 0)));
    jugador.mejoras[id] = nivel > 0 && mejoras < LIMITES.mejoras ? nivel : 0;
    if (jugador.mejoras[id] > 0) mejoras += 1;
  });
  let pasivas = 0;
  Object.keys(PASIVAS).forEach((id) => {
    const tiene = Boolean(estado.pasivas && estado.pasivas[id]) && pasivas < LIMITES.pasivas;
    jugador.pasivas[id] = tiene ? 1 : 0;
    if (tiene) pasivas += 1;
  });
  if (estado.ranuras) {
    ['E', 'Q', 'C'].forEach((tecla) => {
      const id = estado.ranuras[tecla];
      jugador.habilidades.ranuras[tecla] = HABILIDADES.tipos[id] ? id : null;
    });
  }
  jugador.vidas = Math.min(jugador.vidasMaximas(), Math.max(1, Number(estado.vidas) || 1));
  jugador.energia = Math.min(ENERGIA.maximo, Math.max(0, Number(estado.energia) || 0));
}
