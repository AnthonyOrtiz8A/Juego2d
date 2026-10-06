import { ANCHO, TACTIL } from '../config.js';

const PROFUNDIDAD = 40;

export function esDispositivoTactil(game) {
  const tactil = game.device.input.touch;
  const punteroGrueso = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
  return tactil && (punteroGrueso || !game.device.os.desktop);
}

export default class TouchControls {
  constructor(scene) {
    this.scene = scene;
    this.activo = false;
    this.dx = 0;
    this.dy = 0;
    this.disparando = false;
    this.idJoystick = null;
    this.idDisparo = null;
    this.baseX = TACTIL.joystickX;
    this.baseY = TACTIL.joystickY;

    scene.input.addPointer(2);

    this.base = scene.add.image(this.baseX, this.baseY, 'joy-base');
    this.perilla = scene.add.image(this.baseX, this.baseY, 'joy-perilla');
    this.boton = scene.add.image(TACTIL.botonX, TACTIL.botonY, 'boton-disparo');
    [this.base, this.perilla, this.boton].forEach((imagen) => {
      imagen.setDepth(PROFUNDIDAD).setAlpha(TACTIL.opacidad).setVisible(false);
    });

    scene.input.on('pointerdown', this.alPresionar, this);
    scene.input.on('pointermove', this.alMover, this);
    scene.input.on('pointerup', this.alSoltar, this);
    scene.input.on('pointerupoutside', this.alSoltar, this);

    if (esDispositivoTactil(scene.game)) this.activar();
  }

  activar() {
    this.activo = true;
    this.mostrar(true);
  }

  mostrar(visible) {
    if (!this.activo) return;
    this.base.setVisible(visible);
    this.perilla.setVisible(visible);
    this.boton.setVisible(visible);
  }

  alPresionar(puntero, objetosDebajo) {
    if (!puntero.wasTouch) return;
    if (!this.activo) this.activar();
    if (objetosDebajo.length > 0) return;

    if (puntero.x < ANCHO / 2) {
      if (this.idJoystick !== null) return;
      this.idJoystick = puntero.id;
      this.baseX = puntero.x;
      this.baseY = puntero.y;
      this.base.setPosition(this.baseX, this.baseY).setAlpha(TACTIL.opacidad + 0.2);
      this.moverPerilla(puntero);
    } else if (this.idDisparo === null) {
      this.idDisparo = puntero.id;
      this.disparando = true;
      this.boton.setAlpha(TACTIL.opacidad + 0.4).setScale(0.92);
    }
  }

  alMover(puntero) {
    if (puntero.id === this.idJoystick) this.moverPerilla(puntero);
  }

  alSoltar(puntero) {
    if (puntero.id === this.idJoystick) this.soltarJoystick();
    if (puntero.id === this.idDisparo) this.soltarDisparo();
  }

  moverPerilla(puntero) {
    const dx = puntero.x - this.baseX;
    const dy = puntero.y - this.baseY;
    const distancia = Math.hypot(dx, dy);
    const limite = TACTIL.radioJoystick;
    const factor = distancia > limite ? limite / distancia : 1;
    this.perilla.setPosition(this.baseX + dx * factor, this.baseY + dy * factor);

    if (distancia < TACTIL.zonaMuerta) {
      this.dx = 0;
      this.dy = 0;
      return;
    }
    const intensidad = Math.min(distancia, limite) / limite;
    this.dx = (dx / distancia) * intensidad;
    this.dy = (dy / distancia) * intensidad;
  }

  soltarJoystick() {
    this.idJoystick = null;
    this.dx = 0;
    this.dy = 0;
    this.baseX = TACTIL.joystickX;
    this.baseY = TACTIL.joystickY;
    this.base.setPosition(this.baseX, this.baseY).setAlpha(TACTIL.opacidad);
    this.perilla.setPosition(this.baseX, this.baseY);
  }

  soltarDisparo() {
    this.idDisparo = null;
    this.disparando = false;
    this.boton.setAlpha(TACTIL.opacidad).setScale(1);
  }

  reiniciar() {
    this.soltarJoystick();
    this.soltarDisparo();
  }
}
