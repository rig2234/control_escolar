const express = require('express');
const cycleController = require('../controllers/CycleController');

const router = express.Router();

router.get('/', cycleController.listarCiclos);
router.get('/activos', cycleController.obtenerCiclosActivos);
router.get('/actual', cycleController.obtenerCicloActual);
router.get('/:id', cycleController.obtenerCiclo);
router.post('/', cycleController.crearCiclo);
router.put('/:id', cycleController.actualizarCiclo);
router.delete('/:id', cycleController.eliminarCiclo);

module.exports = router;
