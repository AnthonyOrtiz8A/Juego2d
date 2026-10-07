import Phaser from 'phaser';
import { ENERGIA } from '../config.js';

function redondear(valor) {
  return Math.round(valor);
}

function crearOrbe(scene) {
  const orbe = scene.add.image(-100, -100, 'energia').setDepth(3).setBlendMode(Phaser.BlendModes.ADD).setActive(false).setVisible(false);
  scene.tweens.add({ targets: orbe, scale: 1.25, duration: 450, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
  return orbe;
}

export default class Energia {
  constructor(scene) {
    this.scene = scene;
    this.orbes = [];
    for (let i = 0; i < ENERGIA.poolMax; i++) this.orbes.push(crearOrbe(scene));
  }

  soltar(enemigo) {
    const jefe = Boolean(enemigo.datos.jefe);
    if (!jefe && Math.random() > ENERGIA.probabilidad) return;
    const cantidad = jefe ? 4 : 1;
    const valor = jefe ? ENERGIA.valorJefe / cantidad : ENERGIA.valor;
    for (let i = 0; i < cantidad; i++) {
      const orbe = this.orbes.find((otro) => !otro.active);
      if (!orbe) return;
      const angulo = Math.random() * Math.PI * 2;
      const distancia = cantidad > 1 ? 24 : Math.random() * 10;
      orbe.setPosition(enemigo.x + Math.cos(angulo) * distancia, enemigo.y + Math.sin(angulo) * distancia).setActive(true).setVisible(true);
      orbe.valor = valor;
      orbe.expira = this.scene.reloj + ENERGIA.vidaMs;
    }
  }

  actualizar(delta) {
    const segundos = delta / 1000;
    const reloj = this.scene.reloj;
    for (let i = 0; i < this.orbes.length; i++) {
      const orbe = this.orbes[i];
      if (!orbe.active) continue;
      if (reloj > orbe.expira) {
        orbe.setActive(false).setVisible(false);
        continue;
      }
      const jugador = this.scene.jugadorMasCercano(orbe.x, orbe.y);
      if (!jugador) continue;
      const dx = jugador.x - orbe.x;
      const dy = jugador.y - orbe.y;
      const distancia = Math.hypot(dx, dy);
      if (distancia <= ENERGIA.radioRecoger) {
        jugador.sumarEnergia(orbe.valor);
        orbe.setActive(false).setVisible(false);
        continue;
      }
      if (distancia <= ENERGIA.radioIman * (1 + jugador.modificador('iman'))) {
        const paso = Math.min(distancia, ENERGIA.velocidadIman * segundos);
        orbe.x += (dx / distancia) * paso;
        orbe.y += (dy / distancia) * paso;
      }
    }
  }

  datosRed(estaCerca) {
    const datos = [];
    for (let i = 0; i < this.orbes.length; i++) {
      const orbe = this.orbes[i];
      if (orbe.active && estaCerca(orbe.x, orbe.y)) datos.push(redondear(orbe.x), redondear(orbe.y));
    }
    return datos;
  }
}

export class VistaEnergia {
  constructor(scene) {
    this.scene = scene;
    this.orbes = [];
  }

  aplicar(lista) {
    const cantidad = lista.length / 2;
    while (this.orbes.length < cantidad) this.orbes.push(crearOrbe(this.scene));
    this.orbes.forEach((orbe, i) => {
      const visible = i < cantidad;
      orbe.setVisible(visible);
      if (visible) orbe.setPosition(lista[i * 2], lista[i * 2 + 1]);
    });
  }
}
