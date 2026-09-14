const Course = require('../models/Course');

const listarMaterias = async (req, res) => {
  try {
    const materias = await Course.listarTodos();
    res.json(materias);
  } catch (error) {
    console.error('Error al listar materias:', error);
    res.status(500).json({ error: 'No se pudieron cargar las materias' });
  }
};

const obtenerMateria = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'El ID proporcionado no es válido' });
    }

    const materia = await Course.obtenerPorId(parseInt(id, 10));
    if (!materia) {
      return res.status(404).json({ error: 'Materia no encontrada' });
    }

    res.json(materia);
  } catch (error) {
    console.error('Error al obtener materia:', error);
    res.status(500).json({ error: 'Error al obtener la materia', detalle: error.message });
  }
};

const crearMateria = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'El nombre de la materia es requerido' });
    }

    const nuevaMateria = await Course.crear(req.body);
    res.status(201).json({
      mensaje: 'Materia creada exitosamente',
      id: nuevaMateria.id
    });
  } catch (error) {
    console.error('Error al crear materia:', error);
    res.status(500).json({ error: 'No se pudo guardar la materia', detalle: error.message });
  }
};

const actualizarMateria = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'El ID proporcionado no es válido' });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'El nombre de la materia es requerido' });
    }

    const actualizada = await Course.actualizar(parseInt(id, 10), req.body);
    if (!actualizada) {
      return res.status(404).json({ error: 'Materia no encontrada para actualizar' });
    }

    res.json({ mensaje: 'Materia actualizada con éxito' });
  } catch (error) {
    console.error('Error al actualizar materia:', error);
    res.status(500).json({ error: 'Error al actualizar la materia', detalle: error.message });
  }
};

const eliminarMateria = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'El ID proporcionado no es válido' });
    }

    const materiaEliminada = await Course.eliminar(parseInt(id, 10));
    if (!materiaEliminada) {
      return res.status(404).json({ error: 'Materia no encontrada' });
    }

    res.json({
      mensaje: materiaEliminada.mensaje,
      id
    });
  } catch (error) {
    console.error('Error al eliminar materia:', error);
    res.status(500).json({ error: 'No se pudo eliminar la materia', detalle: error.message });
  }
};

module.exports = {
  listarMaterias,
  obtenerMateria,
  crearMateria,
  actualizarMateria,
  eliminarMateria
};