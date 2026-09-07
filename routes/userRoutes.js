const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Autenticación y Registro
router.post('/autenticar', userController.autenticar);
router.post('/registro', userController.registroUsuario);

// CRUD
router.post('/', userController.crearUsuario);
router.get('/:id', userController.obtenerUsuario);
router.put('/:id', userController.actualizarUsuario);
router.get('/', userController.listarUsuarios);
router.delete('/:id', userController.desactivarUsuario);

// Cambiar contraseña
router.put('/:id/cambiar-contraseña', userController.cambiarContraseña);

module.exports = router;