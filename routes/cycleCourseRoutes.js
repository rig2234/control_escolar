const express = require('express');
const router = express.Router();
const cycleCourseController = require('../controllers/cycleCourseController');

router.get('/', cycleCourseController.listarAsignaciones);
router.get('/:id', cycleCourseController.obtenerAsignacion);
router.post('/', cycleCourseController.crearAsignacion);
router.put('/:id', cycleCourseController.actualizarAsignacion);
router.delete('/:id', cycleCourseController.eliminarAsignacion);

module.exports = router;