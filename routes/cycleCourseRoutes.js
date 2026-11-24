const express = require('express');
const router = express.Router();
const cycleCourseController = require('../controllers/cycleCourseController');
const cycleCourseManagementController = require('../controllers/cycleCourseManagementController');

router.get('/:id/documentos', cycleCourseManagementController.listarDocumentos);
router.put('/:id/documentos/:iddocumenttype', cycleCourseManagementController.actualizarDocumento);
router.get('/:id/estudiantes', cycleCourseManagementController.listarEstudiantes);
router.put('/:id/estudiantes/:idstudent', cycleCourseManagementController.actualizarEstudiante);
router.get('/', cycleCourseController.listarAsignaciones);
router.get('/:id', cycleCourseController.obtenerAsignacion);
router.post('/', cycleCourseController.crearAsignacion);
router.put('/:id', cycleCourseController.actualizarAsignacion);
router.delete('/:id', cycleCourseController.eliminarAsignacion);

module.exports = router;