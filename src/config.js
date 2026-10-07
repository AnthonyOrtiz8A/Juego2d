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
  poolMax: 220,
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
    },
    perro: { vida: 1, velocidad: 180, radio: 10, puntos: 15, sangre: 0x8a1010, zigzag: 0.75 },
    policia: { vida: 6, velocidad: 72, radio: 14, puntos: 30, sangre: 0x8a1010, escudoFrontal: 0.25 },
    chillona: { vida: 4, velocidad: 82, radio: 12, puntos: 35, sangre: 0x8a1010, grito: { cadenciaMs: 5000, radio: 280, duracionMs: 3000, multiplicador: 1.5 } },
    hinchado: { vida: 5, velocidad: 55, radio: 16, puntos: 30, sangre: 0x9be22d, explosion: { radio: 85 } },
    obrero: { vida: 5, velocidad: 75, radio: 14, puntos: 25, sangre: 0x8a1010, armadura: 0.6 },
    ahogado: { vida: 4, velocidad: 60, radio: 14, puntos: 25, sangre: 0x3a6a8a, dividir: { tipo: 'rapido', cantidad: 2 } },
    soldado: { vida: 4, velocidad: 70, radio: 13, puntos: 40, sangre: 0x8a1010, distancia: 230, tolerancia: 40, alcanceExtra: 120, cadenciaMs: 2400, rafaga: 3, separacionRafagaMs: 130 }
  }
};

export const ZONAS_ENEMIGOS = {
  probabilidad: 0.35,
  tipos: {
    suburbio: ['perro'],
    avenida: ['policia', 'perro'],
    plaza: ['chillona', 'perro'],
    centro: ['policia', 'chillona'],
    hospital: ['hinchado', 'chillona'],
    industrial: ['obrero', 'hinchado'],
    puerto: ['ahogado', 'obrero'],
    autopista: ['perro', 'policia', 'hinchado'],
    militar: ['soldado', 'obrero'],
    puente: ['ahogado', 'soldado', 'hinchado']
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
  pistola: { nombre: 'Pistola', cadenciaMs: 120, danio: 1, balas: 1, dispersion: 0.04, velocidad: 640, vidaMs: 1100, perforacion: 0, precio: 6, color: 0x9a9a9a },
  revolver: { nombre: 'Revólver', cadenciaMs: 330, danio: 3, balas: 1, dispersion: 0, velocidad: 760, vidaMs: 1100, perforacion: 1, precio: 12, color: 0xc9a227 },
  escopeta: { nombre: 'Escopeta', cadenciaMs: 520, danio: 1.2, balas: 6, dispersion: 0.55, velocidad: 580, vidaMs: 430, perforacion: 0, precio: 14, color: 0x8a5a2b },
  subfusil: { nombre: 'Subfusil', cadenciaMs: 70, danio: 0.7, balas: 1, dispersion: 0.12, velocidad: 700, vidaMs: 900, perforacion: 0, precio: 14, color: 0x4a6a8a },
  ametralladora: { nombre: 'Ametralladora', cadenciaMs: 55, danio: 0.8, balas: 1, dispersion: 0.18, velocidad: 680, vidaMs: 1000, perforacion: 0, precio: 20, color: 0x3a3a3a },
  rifle: { nombre: 'Rifle', cadenciaMs: 420, danio: 4, balas: 1, dispersion: 0, velocidad: 980, vidaMs: 1300, perforacion: 3, precio: 18, color: 0x4b5a33 },
  lanzagranadas: { nombre: 'Lanzagranadas', cadenciaMs: 700, danio: 5, balas: 1, dispersion: 0, velocidad: 430, vidaMs: 900, perforacion: 0, precio: 22, color: 0x2f5d3a, explosivo: 95 }
};

export const MUNICION = {
  armaInicial: 'pistola',
  ranurasArma: 2
};

export const DEDOS = {
  probabilidad: { normal: 0.35, rapido: 0.3, tanque: 0.9, tirador: 0.6, minijefe: 1, jefe: 1, perro: 0.3, policia: 0.8, chillona: 0.7, hinchado: 0.6, obrero: 0.6, ahogado: 0.4, soldado: 0.8 },
  cantidad: { normal: 1, rapido: 1, tanque: 2, tirador: 1, minijefe: 8, jefe: 15, perro: 1, policia: 2, chillona: 2, hinchado: 1, obrero: 1, ahogado: 1, soldado: 2 },
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

export const LIMITES = {
  pasivas: 3,
  mejoras: 3,
  nivelMejora: 5
};

export const PASIVAS = {
  vitalidad: { nombre: 'Vitalidad', bueno: '+2 vidas máximas', malo: '-15 % velocidad', mods: { vidas: 2, velocidad: -0.15 } },
  agilidad: { nombre: 'Agilidad', bueno: '+25 % velocidad', malo: '-1 vida máxima', mods: { velocidad: 0.25, vidas: -1 } },
  vampiro: { nombre: 'Vampiro', bueno: 'Cada 15 bajas recuperas 1 vida', malo: '-20 % de daño', mods: { vampiro: 15, danio: -0.2 } },
  blindaje: { nombre: 'Blindaje', bueno: '+80 % invulnerabilidad tras un golpe', malo: '-15 % cadencia', mods: { invulnerabilidad: 0.8, cadencia: -0.15 } },
  recarga: { nombre: 'Recarga rápida', bueno: '-35 % enfriamiento de habilidades', malo: 'Los zombies son 10 % más rápidos', mods: { enfriamiento: -0.35, velocidadEnemigos: 0.1 } },
  regeneracion: { nombre: 'Regeneración', bueno: 'Recuperas 1 vida al despejar cada sala', malo: '-15 % de daño', mods: { regeneracion: 1, danio: -0.15 } },
  furia: { nombre: 'Furia', bueno: '+70 % de daño cuando te queda 1 vida', malo: '-1 vida máxima', mods: { furia: 0.7, vidas: -1 } },
  codicia: { nombre: 'Codicia', bueno: 'Los zombies sueltan el doble de dedos', malo: 'Los zombies tienen 20 % más vida', mods: { dedos: 1, vidaEnemigos: 0.2 } },
  cristal: { nombre: 'Cañón de cristal', bueno: '+50 % de daño', malo: '-50 % invulnerabilidad tras un golpe', mods: { danio: 0.5, invulnerabilidad: -0.5 } },
  gatillo: { nombre: 'Gatillo loco', bueno: '+40 % cadencia', malo: 'Disparas con mucha menos precisión', mods: { cadencia: 0.4, dispersion: 0.25 } },
  iman: { nombre: 'Imán', bueno: 'Atraes los dedos desde muy lejos', malo: '-10 % velocidad', mods: { iman: 2.5, velocidad: -0.1 } }
};

export const MEJORAS = {
  danio: { nombre: 'Munición pesada', texto: '+20 % de daño por nivel', valor: 0.2 },
  cadencia: { nombre: 'Gatillo ligero', texto: '+15 % de cadencia por nivel', valor: 0.15 },
  calibre: { nombre: 'Calibre perforante', texto: 'Las balas atraviesan\n1 zombie más por nivel', valor: 1 },
  canon: { nombre: 'Cañón múltiple', texto: '+1 bala por disparo\npor nivel', valor: 1 },
  alcance: { nombre: 'Cañón largo', texto: '+25 % de alcance por nivel', valor: 0.25 },
  critico: { nombre: 'Punto débil', texto: '+8 % de probabilidad de\ngolpe crítico (x3) por nivel', valor: 0.08 }
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

export const ENERGIA = {
  maximo: 100,
  probabilidad: 0.5,
  valor: 6,
  valorJefe: 40,
  radioRecoger: 26,
  radioIman: 140,
  velocidadIman: 420,
  poolMax: 60,
  vidaMs: 25000
};

export const APARICION = {
  duracionMs: 650,
  duracionJefeMs: 1400,
  escalaInicial: 0.25,
  distanciaJugador: 240,
  margenVista: 50,
  intentos: 14
};

export const PERSONAJES = {
  estudiante: {
    nombre: 'Leo', rol: 'Estudiante', accesorio: 'mochila',
    colores: { ropa: 0x2f6fd6, ropaSombra: 0x245bb3, pelo: 0x3b2416, piel: 0xf1c27d, extra: 0xc0392b },
    pasiva: { texto: 'Equipo: +10 % velocidad', mods: { velocidad: 0.1 } },
    ulti: { id: 'lluvia', nombre: 'Lluvia de balas', texto: 'Disparas en todas direcciones\ndurante 3 segundos', costo: 100, enfriamientoMs: 40000, rafagas: 20, balas: 10, intervaloMs: 150, danio: 1.5 }
  },
  enfermera: {
    nombre: 'Sofía', rol: 'Enfermera', accesorio: 'cofia',
    colores: { ropa: 0xe8f0f2, ropaSombra: 0xbfd0d6, pelo: 0x6b3a1f, piel: 0xd9a27a, extra: 0xc0392b },
    pasiva: { texto: 'Equipo: +1 vida máxima', mods: { vidas: 1 } },
    ulti: { id: 'botiquin', nombre: 'Botiquín', texto: 'Cura 2 vidas a todo el equipo,\nrevive a los caídos y da\nescudo 2 segundos', costo: 100, enfriamientoMs: 55000, curacion: 2, escudoMs: 2000 }
  },
  policia: {
    nombre: 'Marco', rol: 'Policía', accesorio: 'gorraPolicia',
    colores: { ropa: 0x1f2f5a, ropaSombra: 0x14203d, pelo: 0x1b1b1b, piel: 0xc68e5e, extra: 0xf0c94a },
    pasiva: { texto: 'Equipo: +10 % de daño', mods: { danio: 0.1 } },
    ulti: { id: 'torreta', nombre: 'Torreta', texto: 'Despliega una torreta que\ndispara sola durante\n10 segundos', costo: 100, enfriamientoMs: 45000, duracionMs: 10000, cadenciaMs: 160, alcance: 480, danio: 1.2 }
  },
  bombero: {
    nombre: 'Raúl', rol: 'Bombero', accesorio: 'cascoBombero',
    colores: { ropa: 0xc9a227, ropaSombra: 0x8a6e1a, pelo: 0x2a1a10, piel: 0xe0b48a, extra: 0xc0392b },
    pasiva: { texto: 'Equipo: +25 % invulnerabilidad\ntras un golpe', mods: { invulnerabilidad: 0.25 } },
    ulti: { id: 'fuego', nombre: 'Anillo de fuego', texto: 'Un anillo de fuego te rodea\n6 segundos y quema a los\nzombies cercanos', costo: 100, enfriamientoMs: 45000, duracionMs: 6000, radio: 130, intervaloMs: 250, danio: 1.5 }
  },
  mecanica: {
    nombre: 'Valeria', rol: 'Mecánica', accesorio: 'gafas',
    colores: { ropa: 0x4a6a8a, ropaSombra: 0x34506b, pelo: 0xb5651d, piel: 0xf1c27d, extra: 0x5a5a5a },
    pasiva: { texto: 'Equipo: -15 % enfriamiento\nde habilidades', mods: { enfriamiento: -0.15 } },
    ulti: { id: 'misiles', nombre: 'Enjambre de misiles', texto: 'Lanza 8 misiles explosivos\na los zombies más cercanos', costo: 100, enfriamientoMs: 40000, misiles: 8, danio: 4, radio: 75, velocidad: 520 }
  },
  deportista: {
    nombre: 'Diego', rol: 'Deportista', accesorio: 'banda',
    colores: { ropa: 0x2fa34a, ropaSombra: 0x217a36, pelo: 0x101010, piel: 0x8d5a3b, extra: 0xe63946 },
    pasiva: { texto: 'Equipo: +12 % cadencia', mods: { cadencia: 0.12 } },
    ulti: { id: 'sprint', nombre: 'Sprint imparable', texto: '5 segundos de velocidad\nextrema, invulnerable y\narrollando zombies', costo: 100, enfriamientoMs: 40000, duracionMs: 5000, multiplicador: 1.8 }
  },
  cientifica: {
    nombre: 'Ana', rol: 'Científica', accesorio: 'bata',
    colores: { ropa: 0xf2f2f2, ropaSombra: 0xc8c8c8, pelo: 0x1b1b1b, piel: 0xf3d2b3, extra: 0x3ea8ff },
    pasiva: { texto: 'Equipo: +30 % de energía\nobtenida', mods: { energia: 0.3 } },
    ulti: { id: 'crio', nombre: 'Bomba criogénica', texto: 'Congela por completo a los\nzombies 4 segundos y reciben\n+50 % de daño', costo: 100, enfriamientoMs: 50000, duracionMs: 4000, danioExtra: 0.5 }
  },
  militar: {
    nombre: 'Kenji', rol: 'Militar', accesorio: 'cascoMilitar',
    colores: { ropa: 0x4b5a33, ropaSombra: 0x3a4627, pelo: 0x1b1b1b, piel: 0xe8c39e, extra: 0x6b5a3a },
    pasiva: { texto: 'Equipo: las balas atraviesan\n1 zombie más', mods: { perforacion: 1 } },
    ulti: { id: 'bombardeo', nombre: 'Ataque aéreo', texto: 'Bombardea 6 zonas marcadas\nalrededor tuyo', costo: 100, enfriamientoMs: 50000, bombas: 6, radio: 110, danio: 8, alcance: 260, avisoMs: 700, separacionMs: 250 }
  }
};
