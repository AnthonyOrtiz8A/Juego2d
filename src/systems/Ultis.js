import { ARMAS, BALA } from '../config.js';
import { datosPersonaje } from './Personajes.js';

function redondear(valor) {
  return Math.round(valor);
}

export default class GestorUltis {
  constructor(scene) {
    this.scene = scene;
    this.tareas = [];
    this.torretas = [];
  }

  programar(retrasoMs, accion) {
    this.tareas.push({ en: this.scene.reloj + retrasoMs, accion });
  }

  ejecutar(jugador) {
    const ulti = datosPersonaje(jugador.personaje).ulti;
    this[ulti.id](jugador, ulti);
  }

  dispararBala(x, y, angulo, opciones) {
    const bala = this.scene.balas.getFirstDead(false);
    if (!bala) return null;
    bala.disparar(x, y, angulo, this.scene.time.now, opciones.velocidad || BALA.velocidad, opciones.vidaMs || BALA.vidaMs);
    bala.danio = opciones.danio;
    bala.perforacion = opciones.perforacion || 0;
    bala.explosivo = opciones.explosivo || 0;
    bala.duenio = opciones.duenio || null;
    return bala;
  }

  enemigosCercanos(x, y, alcance) {
    const alcance2 = alcance * alcance;
    return this.scene.enemigos.getChildren()
      .filter((enemigo) => enemigo.active && !enemigo.emergiendo())
      .map((enemigo) => ({ enemigo, distancia: (enemigo.x - x) ** 2 + (enemigo.y - y) ** 2 }))
      .filter((dato) => dato.distancia <= alcance2)
      .sort((a, b) => a.distancia - b.distancia)
      .map((dato) => dato.enemigo);
  }

  lluvia(jugador, datos) {
    for (let k = 0; k < datos.rafagas; k++) {
      this.programar(k * datos.intervaloMs, () => {
        if (!jugador.vivo) return;
        const arma = jugador.datosArma();
        const paso = (Math.PI * 2) / datos.balas;
        for (let i = 0; i < datos.balas; i++) {
          const angulo = i * paso + k * 0.22;
          this.dispararBala(jugador.x + Math.cos(angulo) * BALA.distanciaCanon, jugador.y + Math.sin(angulo) * BALA.distanciaCanon, angulo, {
            danio: arma.danio * datos.danio,
            perforacion: arma.perforacion,
            vidaMs: 750,
            duenio: jugador
          });
        }
      });
    }
  }

  botiquin(jugador, datos) {
    const scene = this.scene;
    scene.revivirCaidos();
    scene.jugadores.forEach((otro) => {
      if (!otro.vivo || otro.desconectado) return;
      otro.curar(datos.curacion);
      otro.armadura = otro.armaduraMaxima();
      otro.escudoHasta = Math.max(otro.escudoHasta, scene.reloj + datos.escudoMs);
      scene.mostrarOnda(otro.x, otro.y, 0x4cd97b, 120);
    });
    scene.explotar(jugador.x, jugador.y, 0x4cd97b);
    scene.actualizarVidas();
  }

  torreta(jugador, datos) {
    const sprite = this.scene.add.image(jugador.x, jugador.y, 'torreta').setDepth(4).setScale(0.2);
    this.scene.tweens.add({ targets: sprite, scale: 1, duration: 300, ease: 'Back.Out' });
    this.torretas.push({ sprite, duenio: jugador, datos, hasta: this.scene.reloj + datos.duracionMs, proximo: this.scene.reloj + 300 });
    this.scene.explotar(jugador.x, jugador.y, 0x3ea8ff);
  }

  fuego(jugador, datos) {
    jugador.fuegoHasta = this.scene.reloj + datos.duracionMs;
    jugador.radioFuego = datos.radio;
    for (let t = datos.intervaloMs; t <= datos.duracionMs; t += datos.intervaloMs) {
      this.programar(t, () => {
        if (jugador.vivo) this.scene.danioArea(jugador.x, jugador.y, datos.radio, datos.danio, jugador);
      });
    }
    this.scene.mostrarOnda(jugador.x, jugador.y, 0xff7a1a, datos.radio);
  }

  misiles(jugador, datos) {
    const objetivos = this.enemigosCercanos(jugador.x, jugador.y, 700);
    for (let i = 0; i < datos.misiles; i++) {
      this.programar(i * 70, () => {
        if (!jugador.vivo) return;
        const objetivo = objetivos.length > 0 ? objetivos[i % objetivos.length] : null;
        const angulo = objetivo && objetivo.active
          ? Math.atan2(objetivo.y - jugador.y, objetivo.x - jugador.x)
          : jugador.rotation + (i - datos.misiles / 2) * 0.25;
        this.dispararBala(jugador.x, jugador.y, angulo, {
          danio: datos.danio,
          explosivo: datos.radio,
          velocidad: datos.velocidad,
          vidaMs: 1400,
          duenio: jugador
        });
      });
    }
  }

  sprint(jugador, datos) {
    jugador.sprintHasta = this.scene.reloj + datos.duracionMs;
    jugador.multiplicadorSprint = datos.multiplicador;
    jugador.invulnerableHasta = Math.max(jugador.invulnerableHasta, this.scene.time.now + datos.duracionMs);
    this.scene.explotar(jugador.x, jugador.y, 0xfff27a);
  }

  crio(jugador, datos) {
    const scene = this.scene;
    scene.crioHasta = scene.reloj + datos.duracionMs;
    scene.crioExtra = datos.danioExtra;
    scene.destello();
    scene.mostrarOnda(jugador.x, jugador.y, 0x9fe8ff, 420);
  }

  bombardeo(jugador, datos) {
    const scene = this.scene;
    const puntos = this.enemigosCercanos(jugador.x, jugador.y, datos.alcance * 1.4)
      .slice(0, datos.bombas)
      .map((enemigo) => ({ x: enemigo.x, y: enemigo.y }));
    while (puntos.length < datos.bombas) {
      const angulo = Math.random() * Math.PI * 2;
      const distancia = 80 + Math.random() * (datos.alcance - 80);
      puntos.push({ x: jugador.x + Math.cos(angulo) * distancia, y: jugador.y + Math.sin(angulo) * distancia });
    }
    puntos.forEach((punto, i) => {
      const espera = datos.avisoMs + i * datos.separacionMs;
      scene.marcarZona(punto.x, punto.y, espera, datos.radio);
      this.programar(espera, () => {
        scene.mostrarOnda(punto.x, punto.y, 0xff7a1a, datos.radio);
        scene.explotar(punto.x, punto.y, 0xff7a1a);
        scene.explotar(punto.x, punto.y, 0x3a3a3a);
        scene.sonar('explosion');
        scene.danioArea(punto.x, punto.y, datos.radio, datos.danio, jugador);
        scene.jugadores.forEach((otro) => {
          if (otro.vivo) scene.sacudir(otro);
        });
      });
    });
  }

  actualizarTorretas() {
    const reloj = this.scene.reloj;
    this.torretas = this.torretas.filter((torreta) => {
      if (reloj >= torreta.hasta) {
        this.scene.explotar(torreta.sprite.x, torreta.sprite.y, 0x3ea8ff);
        torreta.sprite.destroy();
        return false;
      }
      const objetivo = this.enemigosCercanos(torreta.sprite.x, torreta.sprite.y, torreta.datos.alcance)[0];
      if (!objetivo) return true;
      const angulo = Math.atan2(objetivo.y - torreta.sprite.y, objetivo.x - torreta.sprite.x);
      torreta.sprite.rotation = angulo;
      if (reloj < torreta.proximo) return true;
      torreta.proximo = reloj + torreta.datos.cadenciaMs;
      this.dispararBala(torreta.sprite.x + Math.cos(angulo) * 20, torreta.sprite.y + Math.sin(angulo) * 20, angulo, {
        danio: ARMAS.pistola.danio * torreta.datos.danio,
        perforacion: torreta.duenio.modificador('perforacion'),
        duenio: torreta.duenio
      });
      return true;
    });
  }

  actualizar() {
    const reloj = this.scene.reloj;
    if (this.tareas.length > 0) {
      const pendientes = [];
      const listas = [];
      this.tareas.forEach((tarea) => (tarea.en <= reloj ? listas : pendientes).push(tarea));
      this.tareas = pendientes;
      listas.forEach((tarea) => {
        if (!this.scene.terminado) tarea.accion();
      });
    }
    this.actualizarTorretas();
  }

  datosRed(estaCerca) {
    const datos = [];
    this.torretas.forEach((torreta) => {
      const sprite = torreta.sprite;
      if (estaCerca(sprite.x, sprite.y)) datos.push(redondear(sprite.x), redondear(sprite.y), redondear(sprite.rotation * 100));
    });
    return datos;
  }
}

export class VistaTorretas {
  constructor(scene) {
    this.scene = scene;
    this.sprites = [];
  }

  aplicar(lista) {
    const cantidad = Math.floor((lista || []).length / 3);
    while (this.sprites.length < cantidad) this.sprites.push(this.scene.add.image(0, 0, 'torreta').setDepth(4));
    this.sprites.forEach((sprite, i) => {
      const visible = i < cantidad;
      sprite.setVisible(visible);
      if (visible) sprite.setPosition(lista[i * 3], lista[i * 3 + 1]).setRotation(lista[i * 3 + 2] / 100);
    });
  }
}
