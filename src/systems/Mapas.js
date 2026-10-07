import { MUNDO, HISTORIA } from '../config.js';
import { dibujarCiudad } from './Dibujos.js';

const PREFIJO = 'mapa-';

export function nivelHistoria(indice) {
  return HISTORIA.niveles[indice] || null;
}

export function tituloNivel(nivel) {
  return 'Mundo ' + nivel.mundo + '-' + nivel.numero + ': ' + nivel.nombre;
}

export function asegurarMapa(scene, tema) {
  if (!tema) return 'ciudad';
  const clave = PREFIJO + tema;
  if (scene.textures.exists(clave)) return clave;
  scene.textures.getTextureKeys()
    .filter((otra) => otra.startsWith(PREFIJO))
    .forEach((otra) => scene.textures.remove(otra));
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  dibujarCiudad(g, MUNDO.ancho, MUNDO.alto, MUNDO.borde, tema);
  g.generateTexture(clave, MUNDO.ancho, MUNDO.alto);
  g.destroy();
  return clave;
}
