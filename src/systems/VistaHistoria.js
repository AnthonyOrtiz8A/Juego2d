import Phaser from 'phaser';
import { MAZMORRA, COFRES, TIENDA, ARMAS } from '../config.js';
import { generarMazmorra, crearMapaMazmorra, fijarPuertas, SOLIDOS } from './Mazmorra.js';
import { TIPOS_COFRE, IDS_ARMA } from './Protocolo.js';
import { TIPOS_ARTICULO, catalogoArticulo, nombreArticulo } from './Historia.js';

const RADIO_ARMA_SUELO = 40;

export default class VistaHistoria {
  constructor(scene, semilla, nivel) {
    this.scene = scene;
    this.mazmorra = generarMazmorra(semilla, nivel);
    this.capa = crearMapaMazmorra(scene, this.mazmorra, nivel.tema).capa;
    this.anchoMundo = this.mazmorra.ancho * MAZMORRA.tile;
    this.altoMundo = this.mazmorra.alto * MAZMORRA.tile;
    this.salaCerrada = -1;
    this.cofres = new Map();
    this.armasSuelo = new Map();
    this.articulos = new Map();
    this.portal = null;
    this.dedos = [];
    this.graficoCofres = scene.add.graphics().setDepth(5);
    const tienda = this.mazmorra.salas.find((sala) => sala.tipo === 'tienda');
    if (tienda) {
      scene.add.image((tienda.x + tienda.w / 2) * MAZMORRA.tile, (tienda.y + 2.5) * MAZMORRA.tile, 'vendedor').setDepth(6).setAngle(90);
    }
  }

  esSolido(x, y) {
    const tile = this.capa.getTileAtWorldXY(x, y, true);
    return !tile || SOLIDOS.includes(tile.index);
  }

  aplicar(datos) {
    this.aplicarPuertas(datos.sa);
    this.aplicarCofres(datos.c || []);
    this.aplicarPortal(datos.pt);
    this.aplicarDedos(datos.dd || []);
    this.aplicarArmas(datos.ws || []);
    this.aplicarArticulos(datos.tn || []);
  }

  aplicarPuertas(salaActiva) {
    const activa = Number.isInteger(salaActiva) ? salaActiva : -1;
    if (activa === this.salaCerrada) return;
    if (this.salaCerrada >= 0) fijarPuertas(this.capa, this.mazmorra.salas[this.salaCerrada], false);
    if (activa >= 0 && this.mazmorra.salas[activa]) fijarPuertas(this.capa, this.mazmorra.salas[activa], true);
    this.salaCerrada = this.mazmorra.salas[activa] ? activa : -1;
  }

  aplicarCofres(lista) {
    const g = this.graficoCofres;
    g.clear();
    lista.forEach(([id, tipoIndice, x, y, abierto, progreso]) => {
      const tipo = TIPOS_COFRE[tipoIndice];
      if (!tipo) return;
      let vista = this.cofres.get(id);
      if (!vista) {
        vista = { sprite: this.scene.add.image(x, y, 'cofre-' + tipo).setDepth(4), abierto: false };
        this.scene.tweens.add({ targets: vista.sprite, y: y - 5, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
        this.cofres.set(id, vista);
      }
      if (abierto && !vista.abierto) {
        vista.abierto = true;
        this.scene.tweens.killTweensOf(vista.sprite);
        vista.sprite.setTexture('cofre-' + tipo + '-abierto').setY(y);
      }
      if (!abierto && progreso > 0) {
        g.lineStyle(4, COFRES.tipos[tipo].color, 1);
        g.beginPath();
        g.arc(x, y, 32, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * progreso) / 100, false);
        g.strokePath();
      }
    });
  }

  aplicarPortal(datos) {
    if (!datos) {
      if (this.portal) this.portal.setVisible(false);
      return;
    }
    if (!this.portal) {
      this.portal = this.scene.add.image(datos[0], datos[1], 'portal').setDepth(2);
      this.scene.tweens.add({ targets: this.portal, angle: 360, duration: 3000, repeat: -1 });
    }
    this.portal.setVisible(true).setPosition(datos[0], datos[1]);
  }

  aplicarDedos(datos) {
    const cantidad = datos.length / 2;
    while (this.dedos.length < cantidad) this.dedos.push(this.scene.add.image(0, 0, 'dedo').setDepth(3));
    this.dedos.forEach((dedo, i) => {
      if (i >= cantidad) {
        dedo.setVisible(false);
        return;
      }
      dedo.setVisible(true).setPosition(datos[i * 2], datos[i * 2 + 1]);
    });
  }

  sincronizar(mapa, lista, crear) {
    const vistos = new Set();
    lista.forEach((dato) => {
      vistos.add(dato[0]);
      if (!mapa.has(dato[0])) mapa.set(dato[0], crear(dato));
    });
    mapa.forEach((vista, id) => {
      if (vistos.has(id)) return;
      vista.partes.forEach((parte) => parte.destroy());
      mapa.delete(id);
    });
  }

  aplicarArmas(lista) {
    this.sincronizar(this.armasSuelo, lista, ([, armaIndice, x, y]) => {
      const arma = IDS_ARMA[armaIndice] || 'pistola';
      const sprite = this.scene.add.image(x, y, 'arma-' + arma).setDepth(3);
      this.scene.tweens.add({ targets: sprite, y: y - 4, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
      return { arma, x, y, partes: [sprite] };
    });
  }

  aplicarArticulos(lista) {
    this.sincronizar(this.articulos, lista, ([, tipoIndice, itemIndice, x, y, precio]) => {
      const tipo = TIPOS_ARTICULO[tipoIndice] || 'mejora';
      const item = catalogoArticulo(tipo)[itemIndice] || catalogoArticulo(tipo)[0];
      const pedestal = this.scene.add.image(x, y, 'pedestal').setDepth(3);
      const icono = tipo === 'arma'
        ? this.scene.add.image(x, y - 8, 'arma-' + item).setDepth(5)
        : this.scene.add.image(x, y - 8, 'cofre-' + tipo).setDepth(5).setScale(0.6).setTint(COFRES.tipos[tipo].color);
      const etiqueta = this.scene.add.text(x, y + 28, precio + ' dedos', { fontFamily: 'monospace', fontSize: '12px', fontStyle: 'bold', color: '#e8f070', stroke: '#000000', strokeThickness: 3 }).setOrigin(0.5).setDepth(6);
      return { tipo, item, precio, x, y, partes: [pedestal, icono, etiqueta] };
    });
  }

  interactuable(x, y) {
    let mejor = null;
    let mejorDistancia = TIENDA.radioInteraccion;
    this.armasSuelo.forEach((arma) => {
      const distancia = Phaser.Math.Distance.Between(x, y, arma.x, arma.y);
      if (distancia <= Math.min(mejorDistancia, RADIO_ARMA_SUELO)) {
        mejorDistancia = distancia;
        mejor = { texto: 'F: Tomar ' + ARMAS[arma.arma].nombre, x: arma.x, y: arma.y };
      }
    });
    this.articulos.forEach((articulo) => {
      const distancia = Phaser.Math.Distance.Between(x, y, articulo.x, articulo.y);
      if (distancia <= mejorDistancia) {
        mejorDistancia = distancia;
        mejor = { texto: 'F: Comprar ' + nombreArticulo(articulo.tipo, articulo.item) + ' (' + articulo.precio + ' dedos)', x: articulo.x, y: articulo.y };
      }
    });
    return mejor;
  }
}
