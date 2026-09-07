const Student = require('../models/Student');

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
    const { name, firstlastname } = req.body;

    if (!name || !firstlastname) {
      return res.status(400).json({ error: 'El nombre y primer apellido son obligatorios' });
    }

    const nuevoEstudiante = await Student.crear(req.body);
    res.status(201).json({ mensaje: 'Estudiante creado exitosamente', id: nuevoEstudiante.id });
  } catch (error) {
    console.error('Error al crear estudiante:', error);
    res.status(500).json({ error: 'No se pudo guardar el estudiante' });
  }
};