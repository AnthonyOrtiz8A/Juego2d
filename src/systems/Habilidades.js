import Phaser from 'phaser';
import { HABILIDADES, BALA } from '../config.js';

export const DESCRIPCIONES = {
  dash: { nombre: 'Impulso', corto: 'Impulso', texto: 'Te lanzas hacia donde\nte mueves y eres\ninvulnerable un instante' },
  escudo: { nombre: 'Escudo', corto: 'Escudo', texto: 'Una burbuja destruye\na los enemigos\nque te tocan' },
  onda: { nombre: 'Onda expansiva', corto: 'Onda', texto: 'Daña y empuja a\nlos enemigos\ncercanos' },
  rafaga: { nombre: 'Ráfaga', corto: 'Ráfaga', texto: 'Disparas balas\nen todas\nlas direcciones' },
  frenesi: { nombre: 'Frenesí', corto: 'Frenesí', texto: 'Triplica tu\ncadencia de\ndisparo' },
  congelar: { nombre: 'Congelación', corto: 'Hielo', texto: 'Ralentiza a\ntodos los\nenemigos' }
};

const EJECUTAR = {
  dash(scene, datos, jugador) {
    const velocidad = jugador.body.velocity;
    const angulo = velocidad.lengthSq() > 1 ? Math.atan2(velocidad.y, velocidad.x) : jugador.rotation;
    jugador.iniciarDash(scene.reloj + datos.duracionMs, Math.cos(angulo) * datos.velocidad, Math.sin(angulo) * datos.velocidad);
    jugador.invulnerableHasta = Math.max(jugador.invulnerableHasta, scene.time.now + datos.duracionMs + 120);
    scene.explotar(jugador.x, jugador.y, datos.color);
  },

  escudo(scene, datos, jugador) {
    jugador.escudoHasta = scene.reloj + datos.duracionMs;
  },

  onda(scene, datos, jugador) {
    const radio2 = datos.radio * datos.radio;
    const lista = scene.enemigos.getChildren();
    for (let i = 0; i < lista.length; i++) {
      const enemigo = lista[i];
      if (!enemigo.active) continue;
      const dx = enemigo.x - jugador.x;
      const dy = enemigo.y - jugador.y;
      const distancia2 = dx * dx + dy * dy;
      if (distancia2 > radio2) continue;
      if (enemigo.recibirDanio(datos.danio, scene.time.now)) {
        scene.sumarPuntos(enemigo.datos.puntos);
        scene.eliminarEnemigo(enemigo);
      } else {
        const distancia = Math.sqrt(distancia2) || 1;
        enemigo.x += (dx / distancia) * datos.empuje;
        enemigo.y += (dy / distancia) * datos.empuje;
      }
    }
    scene.mostrarOnda(jugador.x, jugador.y, datos.color, datos.radio);
  },

  rafaga(scene, datos, jugador) {
    const paso = (Math.PI * 2) / datos.balas;
    for (let i = 0; i < datos.balas; i++) {
      const bala = scene.balas.getFirstDead(false);
      if (!bala) return;
      const angulo = jugador.rotation + i * paso;
      bala.disparar(
        jugador.x + Math.cos(angulo) * BALA.distanciaCanon,
        jugador.y + Math.sin(angulo) * BALA.distanciaCanon,
        angulo,
        scene.time.now
      );
    }
  },

  frenesi(scene, datos, jugador) {
    jugador.frenesiHasta = scene.reloj + datos.duracionMs;
  },

  congelar(scene, datos) {
    scene.congeladoHasta = scene.reloj + datos.duracionMs;
    scene.destello();
  }
};

export default class GestorHabilidades {
  constructor(scene, jugador) {
    this.scene = scene;
    this.jugador = jugador;
    this.ranuras = { E: HABILIDADES.inicial, Q: null, R: null };
    this.listaEn = { E: 0, Q: 0, R: 0 };
  }

  desbloqueada(tecla) {
    return this.ranuras[tecla] !== null;
  }

  teclasActivas() {
    return Object.keys(this.ranuras).filter((tecla) => this.desbloqueada(tecla));
  }

  teclaPorDesbloquear(oleadaCompletada) {
    const desbloqueos = HABILIDADES.desbloqueos;
    return Object.keys(desbloqueos).find((tecla) => desbloqueos[tecla] === oleadaCompletada + 1 && !this.desbloqueada(tecla)) || null;
  }

  restante(tecla, reloj) {
    return Math.max(0, this.listaEn[tecla] - reloj);
  }

  progreso(tecla, reloj) {
    const id = this.ranuras[tecla];
    if (!id) return 0;
    return this.restante(tecla, reloj) / HABILIDADES.tipos[id].enfriamientoMs;
  }

  usar(tecla, reloj) {
    const id = this.ranuras[tecla];
    if (!id || reloj < this.listaEn[tecla]) return false;
    const datos = HABILIDADES.tipos[id];
    this.listaEn[tecla] = reloj + datos.enfriamientoMs;
    EJECUTAR[id](this.scene, datos, this.jugador);
    return true;
  }

  asignar(tecla, id) {
    this.ranuras[tecla] = id;
    this.listaEn[tecla] = 0;
  }

  opciones() {
    const equipadas = Object.values(this.ranuras).filter((id) => id !== null);
    const libres = Object.keys(HABILIDADES.tipos).filter((id) => !equipadas.includes(id));
    return Phaser.Utils.Array.Shuffle(libres).slice(0, HABILIDADES.opcionesPorEleccion);
  }
}
