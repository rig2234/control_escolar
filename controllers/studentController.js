const Student = require('../models/Student');

// Expresión regular oficial para validar la CURP mexicana
const REGEX_CURP = /^[A-Z]{4}\d{6}[HM][A-Z]{2}[B-DF-HJ-NP-TV-Z]{3}[A-Z0-9]\d$/;

exports.listarEstudiantes = async (req, res) => {
  try {
    const estudiantes = await Student.listarTodos();
    res.json(estudiantes);
  } catch (error) {
    console.error('Error al listar estudiantes:', error);
    res.status(500).json({ error: 'No se pudieron cargar los estudiantes' });
  }
};

exports.crearEstudiante = async (req, res) => {
  try {
    const { name, firstlastname, CURP } = req.body;

    // 1. Validar campos obligatorios
    if (!name || !firstlastname) {
      return res.status(400).json({ error: 'El nombre y primer apellido son obligatorios.' });
    }

    // 2. Validar formato de CURP si se envió
    if (CURP && !REGEX_CURP.test(CURP.toUpperCase())) {
      return res.status(400).json({ error: 'El formato de la CURP es inválido.' });
    }

    // 3. Crear el estudiante en la base de datos
    const nuevoEstudiante = await Student.crear(req.body);
    res.status(201).json({ mensaje: 'Estudiante creado exitosamente', id: nuevoEstudiante.id });

  } catch (error) {
    console.error('Error al crear estudiante:', error);
    res.status(500).json({ error: 'No se pudo guardar el estudiante' });
  }
};