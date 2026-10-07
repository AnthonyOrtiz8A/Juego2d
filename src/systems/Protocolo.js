import { HABILIDADES, COFRES, ARMAS } from '../config.js';

export const TIPOS_ENEMIGO = ['normal', 'rapido', 'tanque', 'tirador', 'minijefe', 'jefe', 'perro', 'policia', 'chillona', 'hinchado', 'obrero', 'ahogado', 'soldado'];
export const IDS_HABILIDAD = Object.keys(HABILIDADES.tipos);
export const TECLAS_HABILIDAD = ['E', 'Q', 'C'];
export const TIPOS_COFRE = Object.keys(COFRES.tipos);
export const IDS_ARMA = Object.keys(ARMAS);
export const ESTADO_COFRE = { cerrado: 0, abierto: 1 };

export const BANDERA_JUGADOR = { vivo: 1, escudo: 2, frenesi: 4, invulnerable: 8, fuego: 16, sprint: 32, desconectado: 64 };
export const BANDERA_ENEMIGO = { golpeado: 1, congelado: 2, emergiendo: 4 };

export const EVENTO = {
  explosion: 'x',
  anuncio: 'a',
  onda: 'o',
  destello: 'f',
  sonido: 's',
  sacudida: 'k',
  aviso: 'v',
  aparicion: 'p',
  marca: 'm',
  senuelo: 'd'
};
