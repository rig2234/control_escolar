const express = require('express');
const cycleController = require('../controllers/CycleController');

const router = express.Router();

// Rutas específicas PRIMERO
router.get('/activos', cycleController.obtenerCiclosActivos);
router.get('/actual', cycleController.obtenerCicloActual);

// Rutas genéricas DESPUÉS
router.get('/', cycleController.listarCiclos);
router.get('/:id', cycleController.obtenerCiclo);
router.post('/', cycleController.crearCiclo);
router.put('/:id', cycleController.actualizarCiclo);
router.delete('/:id', cycleController.eliminarCiclo);

module.exports = router;
