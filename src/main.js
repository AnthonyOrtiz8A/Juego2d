import Phaser from 'phaser';
import { ANCHO, ALTO, COLORES } from './config.js';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import PacmanScene from './scenes/PacmanScene.js';

const juego = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'juego',
  width: ANCHO,
  height: ALTO,
  backgroundColor: COLORES.fondo,
  banner: false,
  disableContextMenu: true,
  audio: { noAudio: true },
  input: { activePointers: 3 },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  scene: [BootScene, MenuScene, GameScene, GameOverScene, PacmanScene]
});

if (import.meta.env.DEV) window.juego = juego;
