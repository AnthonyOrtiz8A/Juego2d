import Phaser from 'phaser';
import { ARMAS, PASIVAS, MEJORAS, COFRES, HABILIDADES } from '../config.js';
import { DESCRIPCIONES } from './Habilidades.js';

export const TIPOS_COFRE = Object.keys(COFRES.tipos);

export function estadisticasArma(armaId, mejoras) {
  const arma = ARMAS[armaId] || ARMAS.pistola;
  const nivel = (id) => Number(mejoras && mejoras[id]) || 0;
  return {
    cadenciaMs: arma.cadenciaMs / (1 + nivel('cadencia') * MEJORAS.cadencia.valor),
    danio: arma.danio * (1 + nivel('danio') * MEJORAS.danio.valor),
    balas: arma.balas + nivel('canon') * MEJORAS.canon.valor,
    dispersion: arma.dispersion + (arma.dispersion === 0 && nivel('canon') > 0 ? 0.12 : 0),
    velocidad: arma.velocidad,
    vidaMs: arma.vidaMs * (1 + nivel('alcance') * MEJORAS.alcance.valor),
    perforacion: arma.perforacion + nivel('calibre') * MEJORAS.calibre.valor,
    cargador: arma.cargador,
    recargaMs: arma.recargaMs,
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
    const opciones = Object.keys(PASIVAS).filter((id) => (jugador.pasivas[id] || 0) < PASIVAS[id].maximo);
    if (opciones.length > 0) return { tipo, id: Phaser.Utils.Array.GetRandom(opciones) };
  }
  return { tipo: 'mejora', id: Phaser.Utils.Array.GetRandom(Object.keys(MEJORAS)) };
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
  if (recompensa.tipo === 'pasiva') return { ...base, nombre: PASIVAS[recompensa.id].nombre, texto: PASIVAS[recompensa.id].texto };
  return { ...base, nombre: MEJORAS[recompensa.id].nombre, texto: MEJORAS[recompensa.id].texto };
}

export function recompensaValida(recompensa) {
  if (!recompensa || typeof recompensa.id !== 'string') return false;
  const catalogo = { arma: ARMAS, activa: HABILIDADES.tipos, pasiva: PASIVAS, mejora: MEJORAS }[recompensa.tipo];
  return Boolean(catalogo && Object.prototype.hasOwnProperty.call(catalogo, recompensa.id));
}

export function aplicarRecompensa(jugador, recompensa, decision) {
  if (!decision || !decision.tomar) return;
  if (recompensa.tipo === 'arma') {
    jugador.arma = recompensa.id;
  } else if (recompensa.tipo === 'activa') {
    if (['E', 'Q', 'C'].includes(decision.ranura)) jugador.habilidades.asignar(decision.ranura, recompensa.id);
  } else if (recompensa.tipo === 'pasiva') {
    jugador.pasivas[recompensa.id] = (jugador.pasivas[recompensa.id] || 0) + 1;
    if (recompensa.id === 'vitalidad') jugador.curar(1);
  } else {
    jugador.mejoras[recompensa.id] = (jugador.mejoras[recompensa.id] || 0) + 1;
  }
}

export function exportarEstado(jugador) {
  return {
    armas: jugador.armas.map((ranura) => (ranura ? { ...ranura } : null)),
    armaActual: jugador.armaActual,
    dedos: jugador.dedos,
    mejoras: { ...jugador.mejoras },
    pasivas: { ...jugador.pasivas },
    ranuras: { ...jugador.habilidades.ranuras },
    vidas: Math.max(1, jugador.vidas)
  };
}

export function importarEstado(jugador, estado) {
  if (!estado) return;
  if (Array.isArray(estado.armas)) {
    jugador.armas = [0, 1].map((i) => {
      const ranura = estado.armas[i];
      if (!ranura || !ARMAS[ranura.id]) return null;
      return { id: ranura.id, balas: Math.min(ARMAS[ranura.id].cargador, Math.max(0, Number(ranura.balas) || 0)) };
    });
    if (!jugador.armas[0]) jugador.armas[0] = { id: 'pistola', balas: ARMAS.pistola.cargador };
    jugador.armaActual = estado.armaActual === 1 && jugador.armas[1] ? 1 : 0;
  }
  jugador.dedos = Math.max(0, Number(estado.dedos) || 0);
  Object.keys(MEJORAS).forEach((id) => {
    jugador.mejoras[id] = Number(estado.mejoras && estado.mejoras[id]) || 0;
  });
  Object.keys(PASIVAS).forEach((id) => {
    jugador.pasivas[id] = Number(estado.pasivas && estado.pasivas[id]) || 0;
  });
  if (estado.ranuras) {
    ['E', 'Q', 'C'].forEach((tecla) => {
      const id = estado.ranuras[tecla];
      jugador.habilidades.ranuras[tecla] = HABILIDADES.tipos[id] ? id : null;
    });
  }
  jugador.vidas = Math.min(jugador.vidasMaximas(), Math.max(1, Number(estado.vidas) || 1));
}
