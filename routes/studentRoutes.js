const express = require('express');
const studentController = require('../controllers/studentController');

const router = express.Router();

router.get('/', studentController.listarEstudiantes);
router.post('/', studentController.crearEstudiante);
router.delete('/:id', studentController.eliminarEstudiante);

module.exports = router;