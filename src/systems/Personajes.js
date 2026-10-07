import { PERSONAJES } from '../config.js';

export const IDS_PERSONAJE = Object.keys(PERSONAJES);
export const PERSONAJE_INICIAL = IDS_PERSONAJE[0];

export function personajeValido(id) {
  return PERSONAJES[id] ? id : PERSONAJE_INICIAL;
}

export function datosPersonaje(id) {
  return PERSONAJES[personajeValido(id)];
}

export function personajesUnicos(ids) {
  return [...new Set(ids.map(personajeValido))];
}

export function modificadoresEquipo(ids) {
  const total = {};
  personajesUnicos(ids).forEach((id) => {
    const mods = PERSONAJES[id].pasiva.mods;
    Object.keys(mods).forEach((clave) => {
      total[clave] = (total[clave] || 0) + mods[clave];
    });
  });
  return total;
}

export function sumarModificadores(a, b) {
  const total = { ...a };
  Object.keys(b).forEach((clave) => {
    total[clave] = (total[clave] || 0) + b[clave];
  });
  return total;
}

export function textoPasivasEquipo(ids) {
  return personajesUnicos(ids).map((id) => PERSONAJES[id].pasiva.texto.replace('Equipo: ', '').split('\n').join(' ')).join(' · ');
}
