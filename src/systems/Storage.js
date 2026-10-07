const CLAVE_RECORD = 'shooter2d.record';
const CLAVE_SONIDO = 'shooter2d.sonido';
const CLAVE_RECORD_PACMAN = 'shooter2d.recordPacman';
const CLAVE_NOMBRE = 'shooter2d.nombre';
const CLAVE_HISTORIA = 'shooter2d.historia';

function leer(clave) {
  try {
    return window.localStorage.getItem(clave);
  } catch {
    return null;
  }
}

function escribir(clave, valor) {
  try {
    window.localStorage.setItem(clave, String(valor));
    return true;
  } catch {
    return false;
  }
}

const Storage = {
  obtenerRecord() {
    return parseInt(leer(CLAVE_RECORD), 10) || 0;
  },

  guardarRecord(puntos) {
    if (puntos <= this.obtenerRecord()) return false;
    escribir(CLAVE_RECORD, puntos);
    return true;
  },

  obtenerRecordPacman() {
    return parseInt(leer(CLAVE_RECORD_PACMAN), 10) || 0;
  },

  guardarRecordPacman(puntos) {
    if (puntos <= this.obtenerRecordPacman()) return false;
    escribir(CLAVE_RECORD_PACMAN, puntos);
    return true;
  },

  obtenerNombre() {
    return leer(CLAVE_NOMBRE) || '';
  },

  guardarNombre(nombre) {
    escribir(CLAVE_NOMBRE, nombre);
  },

  obtenerHistoria() {
    try {
      const datos = JSON.parse(leer(CLAVE_HISTORIA));
      return datos && Number.isInteger(datos.nivel) ? datos : null;
    } catch {
      return null;
    }
  },

  guardarHistoria(datos) {
    escribir(CLAVE_HISTORIA, JSON.stringify(datos));
  },

  borrarHistoria() {
    try {
      window.localStorage.removeItem(CLAVE_HISTORIA);
    } catch {
      return;
    }
  },

  sonidoActivo() {
    return leer(CLAVE_SONIDO) === '1';
  },

  guardarSonido(activo) {
    escribir(CLAVE_SONIDO, activo ? '1' : '0');
  }
};

export default Storage;
