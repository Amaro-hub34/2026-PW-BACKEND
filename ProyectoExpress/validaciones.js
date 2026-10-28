//vamos a dejarles 2 de las 3 funciones para validar 

function validarCorreo(correo) { 
  if (typeof correo !== 'string') return false;
  return correo.includes('@') && correo.includes('.');
}

function validarBoleta(boleta) { 
  if (typeof boleta !== 'string') return false;
  return boleta.length === 8 && /^\d+$/.test(boleta);
}

function validarNombre(nombre) {
  if (typeof nombre !== 'string') return false;
  const limpio = nombre.trim();
  return limpio.length > 0 && limpio.length <= 100 && /^[\p{L}\s]+$/u.test(limpio);
}

function validarContrasena(contrasena) {
  if (typeof contrasena !== 'string') return false;
  return contrasena.length >= 8;
}

module.exports = {validarCorreo, validarBoleta, validarContrasena, validarNombre};