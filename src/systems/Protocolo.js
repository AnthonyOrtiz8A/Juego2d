import { HABILIDADES, COFRES, ARMAS } from '../config.js';

export const TIPOS_ENEMIGO = ['normal', 'rapido', 'tanque', 'tirador', 'minijefe', 'jefe'];
export const IDS_HABILIDAD = Object.keys(HABILIDADES.tipos);
export const TECLAS_HABILIDAD = ['E', 'Q', 'R'];
export const TIPOS_COFRE = Object.keys(COFRES.tipos);
export const IDS_ARMA = Object.keys(ARMAS);
export const ESTADO_COFRE = { cerrado: 0, abierto: 1 };

export const BANDERA_JUGADOR = { vivo: 1, escudo: 2, frenesi: 4, invulnerable: 8 };
export const BANDERA_ENEMIGO = { golpeado: 1, congelado: 2 };

export const EVENTO = {
  explosion: 'x',
  anuncio: 'a',
  onda: 'o',
  destello: 'f',
  sonido: 's',
  sacudida: 'k'
};
