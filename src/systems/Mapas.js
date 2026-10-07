import { HISTORIA } from '../config.js';

export function nivelHistoria(indice) {
  return HISTORIA.niveles[indice] || null;
}

export function tituloNivel(nivel) {
  return 'Mundo ' + nivel.mundo + '-' + nivel.numero + ': ' + nivel.nombre;
}
