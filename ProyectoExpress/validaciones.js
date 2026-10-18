//vamos a dejarles 2 de las 3 funciones para validar 

function validarCorreo(){
//tarea
if(typeof correo !== 'string') return false;
return correo.includes('@') && correo.includes('.');
}

function validarBoleta(){
//tarea
if(typeof boleta !== 'string') return false;
return boleta.length === 8 && !isNaN(boleta);
}

function validarContrasena(){
 if(typeof contrasena !== 'string') return false;
 return contrasena.length >= 8;
}

module.exports = {validarCorreo, validarBoleta, validarContrasena};