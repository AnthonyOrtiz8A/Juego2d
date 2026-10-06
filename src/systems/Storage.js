const CLAVE_RECORD = 'shooter2d.record';
const CLAVE_SONIDO = 'shooter2d.sonido';

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

  sonidoActivo() {
    return leer(CLAVE_SONIDO) === '1';
  },

  guardarSonido(activo) {
    escribir(CLAVE_SONIDO, activo ? '1' : '0');
  }
};

export default Storage;
