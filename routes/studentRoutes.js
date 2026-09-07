const express = require('express');
const studentController = require('../controllers/studentController');

const router = express.Router();

router.get('/', studentController.listarEstudiantes);
router.post('/', studentController.crearEstudiante);

module.exports = router;