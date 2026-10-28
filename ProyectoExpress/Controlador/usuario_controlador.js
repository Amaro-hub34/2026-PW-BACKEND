const bcrypt = require('bcrypt');
const usuariosModel = require('../modelo/usuarios_modelo');
const { validarNombre } = require('../validaciones');

const ERROR_NOMBRE = "El nombre solo puede tener letras y espacios, máximo 100 caracteres";

function esDuplicado(error){
    return error.code === 'ER_DUP_ENTRY' || error.code === '23505' || error.errno === 1062;
}
async function listarUsuarios(req, res){
    try{
        const usuarios = await usuariosModel.listar();
        res.json(usuarios);
    } catch(error){
        res.status(500).json({error: error.message});
    }
}

async function obtenerUsuario(req, res){
    try{
        const usuario = await usuariosModel.obtenerPorId(req.params.id);
        if(!usuario) return res.status(404).json({error: 'Usuario no encontrado'});
        res.json(usuario);
    } catch(error){
        res.status(500).json({error: error.message});
    }
}

async function crearUsuario(req, res) {
    try {
        const { nombre, correo, password, contrasena, boleta, rol } = req.body;
        const pass = password || contrasena;
        if (!nombre || !correo || !pass || !boleta) {
            return res.status(400).json({ error: "nombre, correo, contrasena y boleta son obligatorios" });
        }
        if (!validarNombre(nombre)) {
            return res.status(400).json({ error: ERROR_NOMBRE });
        }
        const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexCorreo.test(correo)) {
            return res.status(400).json({ error: "El correo no tiene un formato válido" });
        }
        if (String(boleta).length !== 10) {
            return res.status(400).json({ error: "La boleta debe tener 10 dígitos" });
        }
        if (pass.length < 8) {
            return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres" });
        }

        const contrasenaHash = await bcrypt.hash(pass, 10);

        const nuevoUsuario = await usuariosModel.crear({
            nombre: nombre.trim(),
            correo,
            contrasenaHash,
            boleta,
            rol: rol || 'alumno'
        });

        res.status(201).json({
            mensaje: "Usuario creado exitosamente",
            datos: nuevoUsuario
        });
    } catch (error) {
        if (esDuplicado(error)) {
            return res.status(409).json({ error: "Ya existe un usuario con ese correo o boleta" });
        }
        res.status(500).json({ error: error.message });
    }
}

async function actualizarUsuario(req, res) {
    try {
        const { nombre, correo, rol } = req.body;
        const idUsuarioActual = req.params.id;

        const nombreValido = nombre !== undefined && nombre.trim() !== '';
        const correoValido = correo !== undefined && correo.trim() !== '';
        const rolValido = rol !== undefined && rol.trim() !== '';

        if (!nombreValido && !correoValido && !rolValido) {
            return res.status(400).json({ error: "Envía al menos uno de: nombre, correo, rol" });
        }

        if (nombreValido && !validarNombre(nombre)) {
            return res.status(400).json({ error: ERROR_NOMBRE });
        }

        if (correoValido) {
            const usuarioExistente = await usuariosModel.obtenerPorCorreo(correo);

            if (usuarioExistente && String(usuarioExistente.id) !== String(idUsuarioActual)) {
                return res.status(409).json({ error: "El correo ya está registrado por otro usuario" });
            }
        }

        const usuarioActualizado = await usuariosModel.actualizar(idUsuarioActual, {
            nombre: nombreValido ? nombre.trim() : nombre,
            correo,
            rol
        });

        if (!usuarioActualizado) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json({
            mensaje: "Usuario actualizado exitosamente",
            datos: usuarioActualizado
        });
    } catch (error) {
        if (esDuplicado(error)) {
            return res.status(409).json({ error: "Ya existe un usuario con ese correo" });
        }
        res.status(500).json({ error: error.message });
    }
}

async function eliminarUsuario(req, res) {
    try {
        const eliminado = await usuariosModel.eliminar(req.params.id);
        if (!eliminado) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    listarUsuarios,
    obtenerUsuario,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario
};