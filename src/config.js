export const ALTO = 600;

function relacionPantalla() {
  if (typeof window === 'undefined') return 16 / 9;
  const mayor = Math.max(window.innerWidth, window.innerHeight);
  const menor = Math.max(1, Math.min(window.innerWidth, window.innerHeight));
  return Math.min(Math.max(mayor / menor, 4 / 3), 2.2);
}

export const ANCHO = Math.round(ALTO * relacionPantalla());

export const MUNDO = {
  ancho: 1600,
  alto: 1200,
  borde: 70,
  suavizadoCamara: 0.12
};

export const COLORES = {
  fondo: 0x0b0e1a,
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
  poolMax: 160,
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
    normal: { vida: 2, velocidad: 85, radio: 13, puntos: 10, sangre: 0x8a1010 },
    rapido: { vida: 1, velocidad: 155, radio: 9, puntos: 15, sangre: 0xa31515 },
    tanque: { vida: 8, velocidad: 48, radio: 22, puntos: 40, sangre: 0x5e0b0b },
    tirador: {
      vida: 3,
      velocidad: 75,
      radio: 12,
      puntos: 25,
      sangre: 0x9be22d,
      distancia: 260,
      tolerancia: 40,
      alcanceExtra: 120,
      cadenciaMs: 1800
    },
    minijefe: {
      vida: 140,
      velocidad: 70,
      radio: 30,
      puntos: 500,
      sangre: 0x5e0b0b,
      jefe: true,
      nombre: 'El Bruto',
      embestidaVelocidad: 430,
      embestidaMs: 700,
      avisoMs: 650,
      pausaMs: 2600,
      acidoBalas: 0,
      invocar: 0
    },
    jefe: {
      vida: 700,
      velocidad: 62,
      radio: 46,
      puntos: 3000,
      sangre: 0x3d0a0a,
      jefe: true,
      nombre: 'La Abominación',
      embestidaVelocidad: 470,
      embestidaMs: 800,
      avisoMs: 700,
      pausaMs: 2200,
      acidoBalas: 18,
      invocar: 4
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
  desbloqueos: { Q: 4, C: 8 },
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

export const RED = {
  prefijo: 'shooter2d-zombies-',
  maxJugadores: 4,
  largoNombre: 12,
  largoCodigo: 4,
  intentosCodigo: 4,
  esperaConexionMs: 10000,
  intervaloSnapshotMs: 50,
  intervaloEntradaMs: 33,
  margenCulling: 260,
  suavizado: 0.45,
  extrapolacionMaxMs: 150,
  vidasAlRevivir: 1,
  reapuntadoEnemigoMs: 500,
  separacionAparicion: 60
};

export const ARMAS = {
  pistola: { nombre: 'Pistola', cadenciaMs: 150, danio: 1, balas: 1, dispersion: 0.04, velocidad: 640, vidaMs: 1100, perforacion: 0, cargador: 12, recargaMs: 900, precio: 6, color: 0x9a9a9a },
  revolver: { nombre: 'Revólver', cadenciaMs: 330, danio: 3, balas: 1, dispersion: 0, velocidad: 760, vidaMs: 1100, perforacion: 1, cargador: 6, recargaMs: 1300, precio: 12, color: 0xc9a227 },
  escopeta: { nombre: 'Escopeta', cadenciaMs: 520, danio: 1.2, balas: 6, dispersion: 0.55, velocidad: 580, vidaMs: 430, perforacion: 0, cargador: 6, recargaMs: 1400, precio: 14, color: 0x8a5a2b },
  subfusil: { nombre: 'Subfusil', cadenciaMs: 70, danio: 0.7, balas: 1, dispersion: 0.12, velocidad: 700, vidaMs: 900, perforacion: 0, cargador: 30, recargaMs: 1500, precio: 14, color: 0x4a6a8a },
  ametralladora: { nombre: 'Ametralladora', cadenciaMs: 55, danio: 0.8, balas: 1, dispersion: 0.18, velocidad: 680, vidaMs: 1000, perforacion: 0, cargador: 60, recargaMs: 2300, precio: 20, color: 0x3a3a3a },
  rifle: { nombre: 'Rifle', cadenciaMs: 420, danio: 4, balas: 1, dispersion: 0, velocidad: 980, vidaMs: 1300, perforacion: 3, cargador: 5, recargaMs: 1600, precio: 18, color: 0x4b5a33 },
  lanzagranadas: { nombre: 'Lanzagranadas', cadenciaMs: 700, danio: 5, balas: 1, dispersion: 0, velocidad: 430, vidaMs: 900, perforacion: 0, cargador: 4, recargaMs: 1900, precio: 22, color: 0x2f5d3a, explosivo: 95 }
};

export const MUNICION = {
  armaInicial: 'pistola',
  ranurasArma: 2
};

export const DEDOS = {
  probabilidad: { normal: 0.35, rapido: 0.3, tanque: 0.9, tirador: 0.6, minijefe: 1, jefe: 1 },
  cantidad: { normal: 1, rapido: 1, tanque: 2, tirador: 1, minijefe: 8, jefe: 15 },
  radioRecoger: 26,
  radioIman: 110,
  velocidadIman: 380,
  poolMax: 80,
  vidaMs: 30000
};

export const TIENDA = {
  articulos: 4,
  precio: { arma: 1, activa: 16, mejora: 9, pasiva: 11 },
  probabilidad: 0.7,
  radioInteraccion: 46
};

export const MAZMORRA = {
  tile: 32,
  celda: 34,
  columnas: 5,
  filas: 5,
  salaMin: { ancho: 20, alto: 15 },
  salaMax: { ancho: 28, alto: 23 },
  anchoPasillo: 4,
  combatesBase: 3,
  oleadasPorSala: [1, 2],
  decoracionPorTile: 0.034,
  decoracionExterior: 0.012,
  fuegosPorSala: 2,
  fuegosExterior: 22,
  tamanoMinimapa: 150,
  radioPortal: 56,
  margenAparicion: 90,
  distanciaAparicion: 170
};

export const PASIVAS = {
  vitalidad: { nombre: 'Vitalidad', texto: '+1 vida máxima\ny te cura 1 vida', maximo: 3 },
  agilidad: { nombre: 'Agilidad', texto: '+15 % velocidad\nde movimiento', maximo: 3, valor: 0.15 },
  regeneracion: { nombre: 'Regeneración', texto: 'Recuperas 1 vida\nal terminar cada nivel', maximo: 2 },
  vampiro: { nombre: 'Vampiro', texto: 'Cada 25 zombies\nque eliminas recuperas\n1 vida', maximo: 2, bajas: 25 },
  blindaje: { nombre: 'Blindaje', texto: '+50 % tiempo de\ninvulnerabilidad\ntras un golpe', maximo: 2, valor: 0.5 },
  recarga: { nombre: 'Recarga rápida', texto: '-20 % enfriamiento\nde habilidades', maximo: 3, valor: 0.8 }
};

export const MEJORAS = {
  danio: { nombre: 'Munición pesada', texto: '+25 % de daño\ncon tu arma', valor: 0.25 },
  cadencia: { nombre: 'Gatillo ligero', texto: '+20 % de cadencia\nde disparo', valor: 0.2 },
  calibre: { nombre: 'Calibre perforante', texto: 'Las balas atraviesan\n1 zombie más', valor: 1 },
  canon: { nombre: 'Doble cañón', texto: '+1 bala por disparo', valor: 1 },
  alcance: { nombre: 'Cañón largo', texto: '+30 % de alcance\nde las balas', valor: 0.3 }
};

export const COFRES = {
  tipos: {
    activa: { nombre: 'Habilidad activa', color: 0x3ea8ff, peso: 1 },
    arma: { nombre: 'Arma', color: 0xd9a03a, peso: 1 },
    pasiva: { nombre: 'Habilidad pasiva', color: 0x4cd97b, peso: 1.2 },
    mejora: { nombre: 'Mejora', color: 0xb36bff, peso: 1.2 }
  },
  extra: 1,
  radioApertura: 44,
  aperturaMs: 700,
  separacion: 90,
  esperaSiguienteMs: 4000
};

export const HISTORIA = {
  multVidaPorMundo: [1, 1.35, 1.8],
  multVidaPorJugador: 0.35,
  multCantidadPorJugador: 0.4,
  niveles: [
    { mundo: 1, numero: 1, nombre: 'Barrio residencial', tema: 'suburbio', inicio: 1, oleadas: 3 },
    { mundo: 1, numero: 2, nombre: 'Avenida principal', tema: 'avenida', inicio: 2, oleadas: 3 },
    { mundo: 1, numero: 3, nombre: 'Plaza del centro', tema: 'plaza', inicio: 4, oleadas: 4, jefe: 'minijefe' },
    { mundo: 2, numero: 1, nombre: 'Distrito financiero', tema: 'centro', inicio: 4, oleadas: 3 },
    { mundo: 2, numero: 2, nombre: 'Hospital general', tema: 'hospital', inicio: 5, oleadas: 4 },
    { mundo: 2, numero: 3, nombre: 'Zona industrial', tema: 'industrial', inicio: 7, oleadas: 4, jefe: 'minijefe' },
    { mundo: 3, numero: 1, nombre: 'Puerto', tema: 'puerto', inicio: 7, oleadas: 4 },
    { mundo: 3, numero: 2, nombre: 'Autopista', tema: 'autopista', inicio: 8, oleadas: 4 },
    { mundo: 3, numero: 3, nombre: 'Base militar', tema: 'militar', inicio: 9, oleadas: 5 },
    { mundo: 3, numero: 4, nombre: 'Puente de escape', tema: 'puente', inicio: 10, oleadas: 3, jefe: 'jefe' }
  ],
  mundos: ['Las afueras', 'El centro', 'La salida']
};
