const CLAVE_RECORD = 'shooter2d.record';
const CLAVE_SONIDO = 'shooter2d.sonido';
const CLAVE_RECORD_PACMAN = 'shooter2d.recordPacman';

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

  sonidoActivo() {
    return leer(CLAVE_SONIDO) === '1';
  },

  guardarSonido(activo) {
    escribir(CLAVE_SONIDO, activo ? '1' : '0');
  }
};

export default Storage;
