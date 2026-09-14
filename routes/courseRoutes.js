const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

router.get('/', courseController.listarMaterias);
router.get('/:id', courseController.obtenerMateria);
router.post('/', courseController.crearMateria);
router.put('/:id', courseController.actualizarMateria);
router.delete('/:id', courseController.eliminarMateria);

module.exports = router;