const express = require('express');
const masterController = require('../controllers/masterController');

const router = express.Router();

router.get('/', masterController.listarMaestrias);
router.get('/:id', masterController.obtenerMaestria);
router.post('/', masterController.crearMaestria);
router.put('/:id', masterController.actualizarMaestria);
router.delete('/:id', masterController.eliminarMaestria);

module.exports = router;
