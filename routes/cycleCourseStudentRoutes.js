const express = require('express');
const router = express.Router();
const cycleCourseStudentController = require('../controllers/cycleCourseStudentController');

router.get('/', cycleCourseStudentController.listarInscripciones);
router.get('/:id', cycleCourseStudentController.obtenerInscripcion);
router.post('/', cycleCourseStudentController.crearInscripcion);
router.put('/:id', cycleCourseStudentController.actualizarInscripcion);
router.delete('/:id', cycleCourseStudentController.eliminarInscripcion);

module.exports = router;