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