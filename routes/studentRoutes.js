const express = require('express');
const studentController = require('../controllers/studentController');

const router = express.Router();

router.get('/', studentController.listarEstudiantes);
router.get('/:id', studentController.obtenerEstudiante); // Para traer los datos al form
router.post('/', studentController.crearEstudiante);
router.put('/:id', studentController.actualizarEstudiante); // Para guardar cambios
router.delete('/:id', studentController.eliminarEstudiante);

module.exports = router;