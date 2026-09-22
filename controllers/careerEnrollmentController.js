const CareerEnrollment = require('../models/CareerEnrollment');

const inscribirAlumnoACarrera = async (req, res) => {
  try {
    const { idstudent, idcycle, idgrade } = req.body;
    console.log('Datos recibidos en req.body:', req.body);

    if (!idstudent || isNaN(idstudent)) {
      return res.status(400).json({ error: 'El ID del estudiante es requerido y debe ser numérico' });
    }

    if (!idcycle || isNaN(idcycle)) {
      return res.status(400).json({ error: 'El ID del ciclo escolar es requerido y debe ser numérico' });
    }

    if (!idgrade || isNaN(idgrade)) {
      return res.status(400).json({ error: 'El ID de la carrera/grado es requerido y debe ser numérico' });
    }

    const resultado = await CareerEnrollment.inscribirCarrera(req.body);

    res.status(201).json({
      mensaje: 'Estudiante inscrito a la carrera exitosamente',
      data: resultado
    });
  } catch (error) {
    console.error('Error al inscribir estudiante a la carrera:', error);
    res.status(500).json({
      error: error.message || 'No se pudo completar la inscripción a la carrera',
      detalle: error.message
    });
  }
};

module.exports = {
  inscribirAlumnoACarrera
};