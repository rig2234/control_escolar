const express = require('express');
const router = express.Router();
const careerEnrollmentController = require('../controllers/careerEnrollmentController');

// POST /api/enrollment/career
router.post('/career', careerEnrollmentController.inscribirAlumnoACarrera);

module.exports = router;