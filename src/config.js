export const ANCHO = 800;
export const ALTO = 600;

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
  poolMax: 60,
  distanciaCanon: 20
};

export const ENEMIGOS = {
  poolMax: 120,
  margenAparicion: 30,
  flashMs: 70,
  zigzag: 0.35,
  tipos: {
    normal: { vida: 2, velocidad: 85, radio: 13, puntos: 10, color: 0xff4d6d },
    rapido: { vida: 1, velocidad: 155, radio: 9, puntos: 15, color: 0xffa62b },
    tanque: { vida: 8, velocidad: 48, radio: 22, puntos: 40, color: 0xa66bff }
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
  probabilidadRapidoBase: 0.15,
  probabilidadRapidoMax: 0.4,
  probabilidadTanqueBase: 0.08,
  probabilidadTanqueMax: 0.22,
  incrementoProbabilidad: 0.03
};

export const EFECTOS = {
  particulasPorExplosion: 8,
  particulasMax: 120,
  vidaParticulaMs: 280,
  sacudidaMs: 160,
  sacudidaIntensidad: 0.008
};
