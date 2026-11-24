const express = require('express');
const router = express.Router();
const documentTypeController = require('../controllers/documentTypeController');

router.get('/', documentTypeController.listarDocumentos);
router.get('/:id', documentTypeController.obtenerDocumento);
router.post('/', documentTypeController.crearDocumento);
router.put('/:id', documentTypeController.actualizarDocumento);
router.delete('/:id', documentTypeController.eliminarDocumento);

module.exports = router;
