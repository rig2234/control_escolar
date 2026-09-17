const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/gradeController');

router.get('/', gradeController.listarGrados);
router.get('/:id', gradeController.obtenerGrado);
router.post('/', gradeController.crearGrado);
router.put('/:id', gradeController.actualizarGrado);
router.delete('/:id', gradeController.eliminarGrado);

module.exports = router;