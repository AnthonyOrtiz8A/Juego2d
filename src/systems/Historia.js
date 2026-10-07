import Phaser from 'phaser';
import { MAZMORRA, COFRES, DEDOS, TIENDA, ARMAS, MEJORAS, PASIVAS, RED, ZONAS_ENEMIGOS, LIMITES } from '../config.js';
import WaveManager from './WaveManager.js';
import { generarMazmorra, crearMapaMazmorra, fijarPuertas, rectanguloSala, centroSala, salaEn, SOLIDOS } from './Mazmorra.js';
import { elegirTipoCofre, generarRecompensa, aplicarRecompensa, describirRecompensa, pasivasEquipadas, mejorasEquipadas, nivelRomano } from './Recompensas.js';
import { TIPOS_COFRE, IDS_HABILIDAD } from './Protocolo.js';

export const TIPOS_ARTICULO = ['arma', 'activa', 'mejora', 'pasiva'];
export const TIPOS_OBJETO = ['arma', 'pasiva', 'mejora'];
const RADIO_OBJETO_SUELO = 40;
const PROBABILIDAD_COFRE_SALA = 0.3;

function redondear(valor) {
  return Math.round(valor);
}

export function nombreArticulo(tipo, id, nivel = 1) {
  if (tipo === 'arma') return ARMAS[id].nombre;
  if (tipo === 'activa') return describirRecompensa({ tipo, id }).nombre;
  if (tipo === 'mejora') return MEJORAS[id].nombre + ' ' + nivelRomano(nivel);
  return PASIVAS[id].nombre + ' ' + nivelRomano(nivel);
}

export function catalogoArticulo(tipo) {
  if (tipo === 'arma') return Object.keys(ARMAS);
  if (tipo === 'activa') return IDS_HABILIDAD;
  if (tipo === 'mejora') return Object.keys(MEJORAS);
  return Object.keys(PASIVAS);
}

export function texturaObjeto(tipo, item) {
  return tipo === 'arma' ? 'arma-' + item : 'objeto-' + tipo;
}

export function textoObjeto(tipo, item, nivel) {
  const etiqueta = tipo === 'pasiva' ? ' (pasiva)' : tipo === 'mejora' ? ' (mejora)' : '';
  return 'F: Tomar ' + nombreArticulo(tipo, item, nivel) + etiqueta;
}

export default class Historia {
  constructor(scene, semilla, nivel) {
    this.scene = scene;
    this.nivel = nivel;
    this.mazmorra = generarMazmorra(semilla, nivel);
    const { capa } = crearMapaMazmorra(scene, this.mazmorra, nivel.tema);
    this.capa = capa;
    const t = MAZMORRA.tile;
    this.anchoMundo = this.mazmorra.ancho * t;
    this.altoMundo = this.mazmorra.alto * t;
    this.salaActiva = null;
    this.salasLimpias = 0;
    this.cofres = [];
    this.objetosSuelo = [];
    this.articulos = [];
    this.portal = null;
    this.ofertas = new Map();
    this.siguienteId = 0;
    this.avanzando = false;
    this.graficoCofres = scene.add.graphics().setDepth(5);
    this.dedos = scene.add.group({ classType: Phaser.GameObjects.Image, maxSize: DEDOS.poolMax });
    for (let i = 0; i < DEDOS.poolMax; i++) {
      const dedo = scene.add.image(-100, -100, 'dedo').setDepth(3).setActive(false).setVisible(false);
      this.dedos.add(dedo);
    }
  }

  prepararJugadores(jugadores) {
    const inicio = centroSala(this.mazmorra.salas[this.mazmorra.inicio]);
    jugadores.forEach((jugador, i) => {
      const angulo = (i * Math.PI) / 2;
      const distancia = i === 0 ? 0 : RED.separacionAparicion;
      const x = inicio.x + Math.cos(angulo) * distancia;
      const y = inicio.y + Math.sin(angulo) * distancia;
      jugador.setPosition(x, y);
      jugador.body.reset(x, y);
      jugador.escudoImagen.setPosition(x, y);
    });
    this.mazmorra.salas.forEach((sala) => {
      if (sala.tipo === 'tesoro') this.crearCofresEn(sala, jugadores.length + COFRES.extra);
      if (sala.tipo === 'tienda') this.crearTienda(sala);
      if (sala.tipo === 'salida') this.crearPortal(sala);
    });
    this.mazmorra.salas[this.mazmorra.inicio].visitada = true;
  }

  agregarColisiones(jugadores) {
    const scene = this.scene;
    jugadores.forEach((jugador) => scene.physics.add.collider(jugador, this.capa));
    scene.physics.add.collider(scene.enemigos, this.capa);
    scene.physics.add.collider(scene.balas, this.capa, (bala) => scene.impactarPared(bala));
    scene.physics.add.collider(scene.balasEnemigas, this.capa, (bala) => bala.desactivar());
  }

  crearCofresEn(sala, cantidad) {
    const centro = centroSala(sala);
    const separacion = COFRES.separacion;
    for (let i = 0; i < cantidad; i++) {
      const x = centro.x + (i - (cantidad - 1) / 2) * separacion;
      const tipo = elegirTipoCofre();
      const sprite = this.scene.add.image(x, centro.y, 'cofre-' + tipo).setDepth(4);
      this.scene.tweens.add({ targets: sprite, y: centro.y - 5, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
      this.cofres.push({ id: this.siguienteId++, tipo, x, y: centro.y, sprite, abierto: false, resuelto: false, progreso: 0, recompensa: null });
    }
  }

  crearTienda(sala) {
    const centro = centroSala(sala);
    const t = MAZMORRA.tile;
    this.vendedor = this.scene.add.image(centro.x, (sala.y + 2.5) * t, 'vendedor').setDepth(6).setAngle(90);
    const tipos = Phaser.Utils.Array.Shuffle(TIPOS_ARTICULO.slice());
    for (let i = 0; i < TIENDA.articulos; i++) {
      const tipo = tipos[i % tipos.length];
      const id = Phaser.Utils.Array.GetRandom(catalogoArticulo(tipo));
      const x = centro.x + (i - (TIENDA.articulos - 1) / 2) * 90;
      const y = centro.y + 10;
      const precio = tipo === 'arma' ? ARMAS[id].precio : TIENDA.precio[tipo];
      const pedestal = this.scene.add.image(x, y, 'pedestal').setDepth(3);
      const icono = this.crearIconoArticulo(tipo, id, x, y - 8);
      const etiqueta = this.scene.add.text(x, y + 28, precio + ' dedos', { fontFamily: 'monospace', fontSize: '12px', fontStyle: 'bold', color: '#e8f070', stroke: '#000000', strokeThickness: 3 }).setOrigin(0.5).setDepth(6);
      this.articulos.push({ id: this.siguienteId++, tipo, item: id, precio, x, y, partes: [pedestal, icono, etiqueta], vendido: false });
    }
  }

  crearIconoArticulo(tipo, id, x, y) {
    if (tipo === 'activa') return this.scene.add.image(x, y, 'cofre-activa').setDepth(5).setScale(0.6);
    return this.scene.add.image(x, y, texturaObjeto(tipo, id)).setDepth(5);
  }

  crearPortal(sala) {
    const centro = centroSala(sala);
    const sprite = this.scene.add.image(centro.x, centro.y, 'portal').setDepth(2);
    this.scene.tweens.add({ targets: sprite, angle: 360, duration: 3000, repeat: -1 });
    this.portal = { x: centro.x, y: centro.y, sprite };
  }

  soltarObjeto(tipo, item, nivel, x, y) {
    const sprite = this.scene.add.image(x, y, texturaObjeto(tipo, item)).setDepth(3);
    this.scene.tweens.add({ targets: sprite, y: y - 4, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.objetosSuelo.push({ id: this.siguienteId++, tipo, item, nivel: nivel || 1, x, y, sprite });
  }

  esSolido(x, y) {
    const tile = this.capa.getTileAtWorldXY(x, y, true);
    return !tile || tile.collides || SOLIDOS.includes(tile.index);
  }

  quitarObjeto(objeto) {
    this.objetosSuelo = this.objetosSuelo.filter((otro) => otro !== objeto);
    objeto.sprite.destroy();
  }

  soltarDedos(enemigo) {
    const tipo = enemigo.tipo;
    if (Math.random() >= (DEDOS.probabilidad[tipo] || 0)) return;
    const cantidad = Math.round((DEDOS.cantidad[tipo] || 1) * (1 + this.scene.modificadorEquipo('dedos')));
    for (let i = 0; i < cantidad; i++) {
      const dedo = this.dedos.getFirstDead(false);
      if (!dedo) return;
      const angulo = Math.random() * Math.PI * 2;
      const distancia = cantidad > 1 ? Math.random() * 30 : 0;
      dedo.setPosition(enemigo.x + Math.cos(angulo) * distancia, enemigo.y + Math.sin(angulo) * distancia).setActive(true).setVisible(true).setAngle(Math.random() * 360);
      dedo.expira = this.scene.reloj + DEDOS.vidaMs;
    }
  }

  revisarSalas() {
    const scene = this.scene;
    scene.jugadores.forEach((jugador) => {
      if (!jugador.vivo) return;
      const sala = salaEn(this.mazmorra, jugador.x, jugador.y);
      if (sala) sala.visitada = true;
      if (this.salaActiva || !sala || sala.limpia) return;
      if ((sala.tipo === 'combate' || sala.tipo === 'jefe') && rectanguloSala(sala, 2).contains(jugador.x, jugador.y)) this.activarSala(sala);
    });
  }

  activarSala(sala) {
    const scene = this.scene;
    this.salaActiva = sala;
    fijarPuertas(this.capa, sala, true);
    const interior = rectanguloSala(sala, 2);
    scene.jugadores.forEach((jugador) => {
      if (!jugador.vivo || interior.contains(jugador.x, jugador.y)) return;
      const x = Phaser.Math.Clamp(jugador.x, interior.x, interior.right);
      const y = Phaser.Math.Clamp(jugador.y, interior.y, interior.bottom);
      scene.teletransportar(jugador, x, y);
    });
    const jefe = sala.tipo === 'jefe' ? this.nivel.jefe : null;
    const [minimo, maximo] = MAZMORRA.oleadasPorSala;
    const total = jefe ? 1 : Phaser.Math.Between(minimo, maximo + (this.nivel.mundo >= 3 ? 1 : 0));
    scene.oleadas = new WaveManager(scene, {
      inicio: this.nivel.inicio + this.salasLimpias,
      total,
      jefe,
      multiplicadorCantidad: scene.multiplicadorCantidad * 0.6,
      especiales: ZONAS_ENEMIGOS.tipos[this.nivel.tema] || [],
      probabilidadEspecial: ZONAS_ENEMIGOS.probabilidad
    });
    scene.oleadas.iniciar();
  }

  limpiarSala() {
    const scene = this.scene;
    const sala = this.salaActiva;
    if (!sala) return;
    sala.limpia = true;
    this.salaActiva = null;
    this.salasLimpias += 1;
    fijarPuertas(this.capa, sala, false);
    scene.oleadas.detener();
    scene.oleadas = null;
    scene.revivirCaidos();
    scene.jugadores.forEach((jugador) => {
      const regeneracion = jugador.modificador('regeneracion');
      if (jugador.vivo && regeneracion > 0) {
        jugador.curar(regeneracion);
        scene.alCambiarEquipo(jugador);
      }
    });
    if (sala.tipo === 'jefe') {
      this.crearCofresEn(sala, scene.jugadores.filter((jugador) => !jugador.desconectado).length + COFRES.extra);
      this.crearPortal(sala);
      this.portal.y += 110;
      this.portal.sprite.setY(this.portal.y);
      scene.anunciar('¡Jefe derrotado! Busca el portal');
      return;
    }
    scene.anunciar('¡Sala despejada!');
    if (Math.random() < PROBABILIDAD_COFRE_SALA) this.crearCofresEn(sala, 1);
  }

  rectanguloActivo() {
    return rectanguloSala(this.salaActiva, 2);
  }

  posicionAparicion() {
    const sala = this.salaActiva;
    if (!sala) return null;
    const area = rectanguloSala(sala, 2);
    for (let intento = 0; intento < 12; intento++) {
      const x = Phaser.Math.Between(area.x, area.right);
      const y = Phaser.Math.Between(area.y, area.bottom);
      const cerca = this.scene.jugadores.some((jugador) => jugador.vivo && Phaser.Math.Distance.Between(jugador.x, jugador.y, x, y) < MAZMORRA.distanciaAparicion);
      if (!cerca) return { x, y };
    }
    return { x: area.x, y: area.y };
  }

  actualizar(delta) {
    this.revisarSalas();
    this.actualizarCofres(delta);
    this.actualizarDedos(delta);
    this.revisarPortal();
  }

  actualizarCofres(delta) {
    const g = this.graficoCofres;
    g.clear();
    const radio2 = COFRES.radioApertura * COFRES.radioApertura;
    this.cofres.forEach((cofre) => {
      if (cofre.abierto) return;
      const abridor = this.scene.jugadores.find((jugador) => {
        if (!jugador.vivo || this.ofertas.has(jugador.id)) return false;
        const dx = jugador.x - cofre.x;
        const dy = jugador.y - cofre.y;
        return dx * dx + dy * dy <= radio2;
      });
      cofre.progreso = abridor ? cofre.progreso + delta : Math.max(0, cofre.progreso - delta);
      if (cofre.progreso > 0) {
        g.lineStyle(4, COFRES.tipos[cofre.tipo].color, 1);
        g.beginPath();
        g.arc(cofre.x, cofre.y, 32, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * cofre.progreso) / COFRES.aperturaMs, false);
        g.strokePath();
      }
      if (abridor && cofre.progreso >= COFRES.aperturaMs) this.abrirCofre(cofre, abridor);
    });
  }

  abrirCofre(cofre, jugador) {
    const scene = this.scene;
    cofre.abierto = true;
    cofre.progreso = 0;
    scene.tweens.killTweensOf(cofre.sprite);
    cofre.sprite.setTexture('cofre-' + cofre.tipo + '-abierto').setY(cofre.y);
    scene.explotar(cofre.x, cofre.y, COFRES.tipos[cofre.tipo].color);
    scene.sonar('habilidad', jugador);
    cofre.recompensa = generarRecompensa(cofre.tipo, jugador);
    if (TIPOS_OBJETO.includes(cofre.recompensa.tipo)) {
      this.soltarObjeto(cofre.recompensa.tipo, cofre.recompensa.id, cofre.recompensa.nivel, cofre.x, cofre.y + 36);
      cofre.resuelto = true;
      return;
    }
    this.ofrecer(jugador, cofre.recompensa, (decision) => {
      aplicarRecompensa(jugador, cofre.recompensa, decision);
      cofre.resuelto = true;
      return true;
    });
  }

  ofrecer(jugador, recompensa, alDecidir) {
    const scene = this.scene;
    this.ofertas.set(jugador.id, { recompensa, alDecidir });
    const actual = {
      arma: jugador.arma,
      ranuras: { ...jugador.habilidades.ranuras },
      pasivas: pasivasEquipadas(jugador.pasivas).map((id) => [id, jugador.pasivas[id]]),
      mejoras: mejorasEquipadas(jugador.mejoras).map((id) => [id, jugador.mejoras[id]])
    };
    if (jugador.local) scene.selectorRecompensa.mostrar(recompensa, actual, (decision) => this.resolverOferta(jugador, decision));
    else scene.red.enviar(jugador.id, { t: 'cofre', r: recompensa, actual });
  }

  resolverOferta(jugador, decision) {
    const oferta = this.ofertas.get(jugador.id);
    if (!oferta) return;
    this.ofertas.delete(jugador.id);
    const aplicada = oferta.alDecidir(decision || { tomar: false });
    this.scene.alCambiarEquipo(jugador);
    if (aplicada && decision && decision.tomar && this.scene.multijugador) {
      this.scene.anunciar(jugador.nombre + ': ' + describirRecompensa(oferta.recompensa).nombre);
    }
  }

  cancelarOferta(jugador) {
    if (!this.ofertas.has(jugador.id)) return;
    this.resolverOferta(jugador, { tomar: false });
  }

  actualizarDedos(delta) {
    const segundos = delta / 1000;
    const reloj = this.scene.reloj;
    this.dedos.getChildren().forEach((dedo) => {
      if (!dedo.active) return;
      if (reloj > dedo.expira) {
        dedo.setActive(false).setVisible(false);
        return;
      }
      const jugador = this.scene.jugadorMasCercano(dedo.x, dedo.y);
      if (!jugador) return;
      const dx = jugador.x - dedo.x;
      const dy = jugador.y - dedo.y;
      const distancia = Math.hypot(dx, dy);
      if (distancia <= DEDOS.radioRecoger) {
        jugador.dedos += 1;
        dedo.setActive(false).setVisible(false);
        this.scene.alCambiarEquipo(jugador);
        return;
      }
      if (distancia <= DEDOS.radioIman * (1 + jugador.modificador('iman'))) {
        const paso = Math.min(distancia, DEDOS.velocidadIman * segundos);
        dedo.x += (dx / distancia) * paso;
        dedo.y += (dy / distancia) * paso;
      }
    });
  }

  revisarPortal() {
    if (!this.portal || this.salaActiva || this.avanzando) return;
    const activos = this.scene.jugadores.filter((jugador) => jugador.vivo && !jugador.desconectado);
    if (activos.length === 0) return;
    const dentro = activos.filter((jugador) => Phaser.Math.Distance.Between(jugador.x, jugador.y, this.portal.x, this.portal.y) <= MAZMORRA.radioPortal);
    if (dentro.length === 0) {
      this.esperaPortal = 0;
      return;
    }
    if (dentro.length < activos.length) {
      if (this.esperaPortal !== dentro.length) {
        this.esperaPortal = dentro.length;
        this.scene.anunciar('Esperando al equipo (' + dentro.length + '/' + activos.length + ')');
      }
      return;
    }
    this.avanzando = true;
    this.scene.avanzarNivel();
  }

  interactuable(jugador) {
    let mejor = null;
    let mejorDistancia = TIENDA.radioInteraccion;
    this.objetosSuelo.forEach((objeto) => {
      const distancia = Phaser.Math.Distance.Between(jugador.x, jugador.y, objeto.x, objeto.y);
      if (distancia <= Math.min(mejorDistancia, RADIO_OBJETO_SUELO)) {
        mejorDistancia = distancia;
        mejor = { tipo: 'suelo', objeto };
      }
    });
    this.articulos.forEach((articulo) => {
      if (articulo.vendido) return;
      const distancia = Phaser.Math.Distance.Between(jugador.x, jugador.y, articulo.x, articulo.y);
      if (distancia <= mejorDistancia) {
        mejorDistancia = distancia;
        mejor = { tipo: 'tienda', objeto: articulo };
      }
    });
    return mejor;
  }

  interactuar(jugador) {
    if (!jugador.vivo || this.ofertas.has(jugador.id)) return;
    const objetivo = this.interactuable(jugador);
    if (!objetivo) return;
    if (objetivo.tipo === 'suelo') this.recoger(jugador, objetivo.objeto);
    else this.comprar(jugador, objetivo.objeto);
  }

  recoger(jugador, objeto) {
    const scene = this.scene;
    if (objeto.tipo === 'arma') {
      this.quitarObjeto(objeto);
      const soltada = jugador.equiparArma(objeto.item);
      if (soltada) this.soltarObjeto('arma', soltada, 1, jugador.x, jugador.y + 24);
    } else if (objeto.tipo === 'mejora') {
      const actual = jugador.mejoras[objeto.item] || 0;
      if (actual >= LIMITES.nivelMejora) {
        scene.avisar(jugador, 'Esa mejora ya está al nivel máximo');
        return;
      }
      if (actual === 0 && jugador.cantidadMejoras() >= LIMITES.mejoras) {
        this.ofrecerReemplazo(jugador, objeto);
        return;
      }
      jugador.mejoras[objeto.item] = Math.min(LIMITES.nivelMejora, actual + objeto.nivel);
      this.quitarObjeto(objeto);
      if (actual > 0) scene.avisar(jugador, MEJORAS[objeto.item].nombre + ' sube a nivel ' + nivelRomano(jugador.mejoras[objeto.item]));
    } else {
      const actual = jugador.pasivas[objeto.item] || 0;
      if (actual >= LIMITES.nivelPasiva) {
        scene.avisar(jugador, 'Esa pasiva ya está al nivel máximo');
        return;
      }
      if (actual === 0 && jugador.cantidadPasivas() >= LIMITES.pasivas) {
        this.ofrecerReemplazo(jugador, objeto);
        return;
      }
      jugador.pasivas[objeto.item] = Math.min(LIMITES.nivelPasiva, actual + objeto.nivel);
      jugador.ajustarVidas();
      this.quitarObjeto(objeto);
      if (actual > 0) scene.avisar(jugador, PASIVAS[objeto.item].nombre + ' sube a nivel ' + nivelRomano(jugador.pasivas[objeto.item]));
    }
    scene.alCambiarEquipo(jugador);
    scene.sonar('habilidad', jugador);
  }

  ofrecerReemplazo(jugador, objeto) {
    const recompensa = { tipo: objeto.tipo, id: objeto.item, nivel: objeto.nivel };
    this.ofrecer(jugador, recompensa, (decision) => {
      if (!decision.tomar || !this.objetosSuelo.includes(objeto)) return false;
      const lista = objeto.tipo === 'pasiva' ? pasivasEquipadas(jugador.pasivas) : mejorasEquipadas(jugador.mejoras);
      if (!lista.includes(decision.ranura)) return false;
      this.quitarObjeto(objeto);
      if (objeto.tipo === 'pasiva') {
        const nivelSoltado = jugador.pasivas[decision.ranura];
        jugador.pasivas[decision.ranura] = 0;
        jugador.pasivas[objeto.item] = Math.min(LIMITES.nivelPasiva, objeto.nivel);
        this.soltarObjeto('pasiva', decision.ranura, nivelSoltado, jugador.x, jugador.y + 24);
        jugador.ajustarVidas();
      } else {
        const nivelSoltado = jugador.mejoras[decision.ranura];
        jugador.mejoras[decision.ranura] = 0;
        jugador.mejoras[objeto.item] = objeto.nivel;
        this.soltarObjeto('mejora', decision.ranura, nivelSoltado, jugador.x, jugador.y + 24);
      }
      this.scene.sonar('habilidad', jugador);
      return true;
    });
  }

  comprar(jugador, articulo) {
    const scene = this.scene;
    if (jugador.dedos < articulo.precio) {
      scene.avisar(jugador, 'Te faltan ' + (articulo.precio - jugador.dedos) + ' dedos');
      return;
    }
    if (articulo.tipo === 'arma' && jugador.tieneArma(articulo.item)) {
      scene.avisar(jugador, 'Ya tienes esa arma');
      return;
    }
    if (articulo.tipo === 'pasiva' && jugador.pasivas[articulo.item] >= LIMITES.nivelPasiva) {
      scene.avisar(jugador, 'Esa pasiva ya está al nivel máximo');
      return;
    }
    if (articulo.tipo === 'mejora' && jugador.mejoras[articulo.item] >= LIMITES.nivelMejora) {
      scene.avisar(jugador, 'Esa mejora ya está al nivel máximo');
      return;
    }
    if (articulo.tipo === 'activa' && Object.values(jugador.habilidades.ranuras).includes(articulo.item)) {
      scene.avisar(jugador, 'Ya tienes esa habilidad');
      return;
    }
    const vender = () => {
      jugador.dedos -= articulo.precio;
      articulo.vendido = true;
      articulo.partes.forEach((parte) => parte.destroy());
      scene.sonar('habilidad', jugador);
    };
    if (articulo.tipo === 'activa') {
      this.ofrecer(jugador, { tipo: 'activa', id: articulo.item }, (decision) => {
        if (!decision.tomar || articulo.vendido || jugador.dedos < articulo.precio) return false;
        vender();
        aplicarRecompensa(jugador, { tipo: 'activa', id: articulo.item }, decision);
        return true;
      });
      return;
    }
    vender();
    if (articulo.tipo === 'arma') {
      const soltada = jugador.equiparArma(articulo.item);
      if (soltada) this.soltarObjeto('arma', soltada, 1, jugador.x, jugador.y + 24);
    } else {
      this.soltarObjeto(articulo.tipo, articulo.item, 1, articulo.x, articulo.y);
      scene.avisar(jugador, 'Recógelo con F');
    }
    scene.alCambiarEquipo(jugador);
  }

  datosRed(estaCerca) {
    const dedos = [];
    this.dedos.getChildren().forEach((dedo) => {
      if (dedo.active && estaCerca(dedo.x, dedo.y)) dedos.push(redondear(dedo.x), redondear(dedo.y));
    });
    return {
      sa: this.salaActiva ? this.salaActiva.id : -1,
      c: this.cofres.map((cofre) => [cofre.id, TIPOS_COFRE.indexOf(cofre.tipo), redondear(cofre.x), redondear(cofre.y), cofre.abierto ? 1 : 0, Math.min(100, redondear((cofre.progreso / COFRES.aperturaMs) * 100))]),
      pt: this.portal ? [redondear(this.portal.x), redondear(this.portal.y)] : null,
      dd: dedos,
      ws: this.objetosSuelo.map((objeto) => [objeto.id, TIPOS_OBJETO.indexOf(objeto.tipo), catalogoArticulo(objeto.tipo).indexOf(objeto.item), objeto.nivel, redondear(objeto.x), redondear(objeto.y)]),
      tn: this.articulos.filter((articulo) => !articulo.vendido).map((articulo) => [articulo.id, TIPOS_ARTICULO.indexOf(articulo.tipo), catalogoArticulo(articulo.tipo).indexOf(articulo.item), redondear(articulo.x), redondear(articulo.y), articulo.precio])
    };
  }

  limites() {
    return { ancho: this.anchoMundo, alto: this.altoMundo };
  }
}
