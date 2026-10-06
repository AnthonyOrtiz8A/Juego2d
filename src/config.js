export const ANCHO = 800;
export const ALTO = 600;

export const MUNDO = {
  ancho: 1600,
  alto: 1200,
  suavizadoCamara: 0.12
};

export const COLORES = {
  fondo: 0x0b0e1a,
  rejilla: 0x161b2e,
  jugador: 0x3ee8ff,
  bala: 0xfff27a,
  borde: 0xffffff
};

export const JUGADOR = {
  velocidad: 230,
  radio: 13,
  vidas: 3,
  invulnerabilidadMs: 1500,
  cadenciaMs: 110
};

export const BALA = {
  velocidad: 640,
  danio: 1,
  vidaMs: 1100,
  poolMax: 90,
  distanciaCanon: 20
};

export const BALA_ENEMIGA = {
  velocidad: 280,
  danio: 1,
  vidaMs: 2600,
  poolMax: 40
};

export const ENEMIGOS = {
  poolMax: 120,
  margenAparicion: 30,
  flashMs: 70,
  zigzag: 0.35,
  tipos: {
    normal: { vida: 2, velocidad: 85, radio: 13, puntos: 10, color: 0xff4d6d },
    rapido: { vida: 1, velocidad: 155, radio: 9, puntos: 15, color: 0xffa62b },
    tanque: { vida: 8, velocidad: 48, radio: 22, puntos: 40, color: 0xa66bff },
    tirador: {
      vida: 3,
      velocidad: 75,
      radio: 12,
      puntos: 25,
      color: 0x5cff5c,
      distancia: 260,
      tolerancia: 40,
      alcanceExtra: 120,
      cadenciaMs: 1800
    }
  }
};

export const OLEADAS = {
  enemigosBase: 6,
  enemigosPorOleada: 4,
  incrementoVelocidad: 0.06,
  multiplicadorVelocidadMax: 1.9,
  intervaloBaseMs: 900,
  reduccionIntervaloMs: 70,
  intervaloMinMs: 200,
  oleadasPorGrupoExtra: 3,
  maximoSimultaneos: 110,
  pausaEntreOleadasMs: 2200,
  oleadaRapidos: 2,
  oleadaTanques: 3,
  oleadaTiradores: 3,
  probabilidadRapidoBase: 0.15,
  probabilidadRapidoMax: 0.4,
  probabilidadTanqueBase: 0.08,
  probabilidadTanqueMax: 0.22,
  probabilidadTiradorBase: 0.1,
  probabilidadTiradorMax: 0.2,
  incrementoProbabilidad: 0.03
};

export const TACTIL = {
  radioJoystick: 60,
  radioPerilla: 26,
  zonaMuerta: 8,
  joystickX: 130,
  joystickY: ALTO - 130,
  radioBoton: 52,
  botonX: ANCHO - 115,
  botonY: ALTO - 115,
  alcanceAutoApuntado: 460,
  opacidad: 0.45
};

export const EFECTOS = {
  particulasPorExplosion: 8,
  particulasMax: 120,
  vidaParticulaMs: 280,
  sacudidaMs: 160,
  sacudidaIntensidad: 0.008
};

export const HABILIDADES = {
  inicial: 'dash',
  cadaOleadas: 2,
  desbloqueos: { Q: 4, R: 8 },
  opcionesPorEleccion: 3,
  esperaSelectorMs: 700,
  tipos: {
    dash: { enfriamientoMs: 2500, duracionMs: 170, velocidad: 950, color: 0x3ee8ff },
    escudo: { enfriamientoMs: 12000, duracionMs: 3500, color: 0x7dffb0 },
    onda: { enfriamientoMs: 9000, radio: 180, danio: 4, empuje: 60, color: 0xfff27a },
    rafaga: { enfriamientoMs: 6000, balas: 16, color: 0xffa62b },
    frenesi: { enfriamientoMs: 14000, duracionMs: 4000, multiplicadorCadencia: 3, color: 0xff4d6d },
    congelar: { enfriamientoMs: 15000, duracionMs: 4000, factorVelocidad: 0.3, color: 0x8fd3ff }
  }
};

export const PACMAN = {
  celda: 24,
  vidas: 3,
  velocidad: 7.5,
  velocidadFantasma: 6.8,
  velocidadAsustado: 4.2,
  velocidadOjos: 14,
  aumentoPorNivel: 0.05,
  asustadoMs: 6000,
  parpadeoMs: 1800,
  dispersionMs: 7000,
  persecucionMs: 20000,
  salidaFantasmasMs: [0, 2500, 5000, 7500],
  esperaMuerteMs: 1400,
  esperaNivelMs: 1500,
  radioChoque: 0.6,
  umbralDeslizar: 18,
  puntos: { punto: 10, superPunto: 50, fantasma: 200 },
  colores: { pared: 0x2340d8, borde: 0x6f8bff, puerta: 0xffb8de, punto: 0xffd9b0, pacman: 0xffe14d },
  fantasmas: [
    { nombre: 'blinky', color: 0xff3b3b, esquina: { c: 17, f: 0 }, inicio: { c: 9, f: 7 } },
    { nombre: 'pinky', color: 0xffa6e1, esquina: { c: 1, f: 0 }, inicio: { c: 9, f: 9 } },
    { nombre: 'inky', color: 0x3ee8ff, esquina: { c: 17, f: 20 }, inicio: { c: 8, f: 9 } },
    { nombre: 'clyde', color: 0xffb347, esquina: { c: 1, f: 20 }, inicio: { c: 10, f: 9 } }
  ],
  salida: { c: 9, f: 7 },
  casa: { c: 9, f: 9 },
  mapa: [
    '###################',
    '#o.......#.......o#',
    '#.##.###.#.###.##.#',
    '#.................#',
    '#.##.#.#####.#.##.#',
    '#....#...#...#....#',
    '####.### # ###.####',
    '   #.#   G   #.#   ',
    '####.# ##-## #.####',
    '    .  #GGG#  .    ',
    '####.# ##### #.####',
    '   #.#       #.#   ',
    '####.# ##### #.####',
    '#........#........#',
    '#.##.###.#.###.##.#',
    '#o.#.....P.....#.o#',
    '##.#.#.#####.#.#.##',
    '#....#...#...#....#',
    '#.######.#.######.#',
    '#.................#',
    '###################'
  ]
};
