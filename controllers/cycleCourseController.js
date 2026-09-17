const CycleCourse = require('../models/CycleCourse');

const listarAsignaciones = async (req, res) => {
  try {
    const { idcycle } = req.query;
    const data = idcycle
      ? await CycleCourse.listarPorCiclo(parseInt(idcycle, 10))
      : await CycleCourse.listarTodos();
    res.json(data);
  } catch (error) {
    console.error('Error al listar asignaciones ciclo-materia:', error);
    res.status(500).json({ error: 'No se pudieron cargar las asignaciones' });
  }
};

const obtenerAsignacion = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'El ID proporcionado no es válido' });
    }

    const asignacion = await CycleCourse.obtenerPorId(parseInt(id, 10));
    if (!asignacion) {
      return res.status(404).json({ error: 'Asignación no encontrada' });
    }

    res.json(asignacion);
  } catch (error) {
    console.error('Error al obtener asignación:', error);
    res.status(500).json({ error: 'Error al obtener la asignación', detalle: error.message });
  }
};

const crearAsignacion = async (req, res) => {
  try {
    const { idcycle, idcourse } = req.body;
    if (!idcycle || !idcourse) {
      return res.status(400).json({ error: 'Debe seleccionar un ciclo y una materia' });
    }

    const nueva = await CycleCourse.crear(req.body);
    res.status(201).json({ mensaje: 'Materia asignada al ciclo exitosamente', id: nueva.id });
  } catch (error) {
    console.error('Error al crear asignación:', error);
    res.status(500).json({ error: error.message || 'No se pudo asignar la materia', detalle: error.message });
  }
};

const actualizarAsignacion = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'El ID proporcionado no es válido' });
    }

    await CycleCourse.actualizar(parseInt(id, 10), req.body);
    res.json({ mensaje: 'Asignación actualizada con éxito' });
  } catch (error) {
    console.error('Error al actualizar asignación:', error);
    res.status(500).json({ error: 'Error al actualizar la asignación', detalle: error.message });
  }
};

const eliminarAsignacion = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'El ID proporcionado no es válido' });
    }

    const eliminada = await CycleCourse.eliminar(parseInt(id, 10));
    res.json({ mensaje: eliminada.mensaje, id });
  } catch (error) {
    console.error('Error al eliminar asignación:', error);
    res.status(500).json({ error: 'No se pudo eliminar la asignación', detalle: error.message });
  }
};

module.exports = {
  listarAsignaciones,
  obtenerAsignacion,
  crearAsignacion,
  actualizarAsignacion,
  eliminarAsignacion
};