const CycleCourseStudent = require('../models/CycleCourseStudent');

const listarInscripciones = async (req, res) => {
  try {
    const { idstudent } = req.query;
    const data = idstudent
      ? await CycleCourseStudent.listarPorEstudiante(parseInt(idstudent, 10))
      : await CycleCourseStudent.listarTodos();
    res.json(data);
  } catch (error) {
    console.error('Error al listar inscripciones:', error);
    res.status(500).json({ error: 'No se pudieron cargar las inscripciones' });
  }
};

const obtenerInscripcion = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'El ID proporcionado no es válido' });
    }

    const inscripcion = await CycleCourseStudent.obtenerPorId(parseInt(id, 10));
    if (!inscripcion) {
      return res.status(404).json({ error: 'Inscripción no encontrada' });
    }

    res.json(inscripcion);
  } catch (error) {
    console.error('Error al obtener inscripción:', error);
    res.status(500).json({ error: 'Error al obtener la inscripción', detalle: error.message });
  }
};

const crearInscripcion = async (req, res) => {
  try {
    const { idcyclecourse, idstudent } = req.body;
    if (!idcyclecourse || !idstudent) {
      return res.status(400).json({ error: 'Debe seleccionar una materia del ciclo y un estudiante' });
    }

    const nueva = await CycleCourseStudent.crear(req.body);
    res.status(201).json({ mensaje: 'Estudiante inscrito exitosamente', id: nueva.id });
  } catch (error) {
    console.error('Error al crear inscripción:', error);
    res.status(500).json({ error: error.message || 'No se pudo inscribir al estudiante', detalle: error.message });
  }
};

const actualizarInscripcion = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'El ID proporcionado no es válido' });
    }

    await CycleCourseStudent.actualizar(parseInt(id, 10), req.body);
    res.json({ mensaje: 'Inscripción actualizada con éxito' });
  } catch (error) {
    console.error('Error al actualizar inscripción:', error);
    res.status(500).json({ error: 'Error al actualizar la inscripción', detalle: error.message });
  }
};

const eliminarInscripcion = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'El ID proporcionado no es válido' });
    }

    const eliminada = await CycleCourseStudent.eliminar(parseInt(id, 10));
    res.json({ mensaje: eliminada.mensaje, id });
  } catch (error) {
    console.error('Error al eliminar inscripción:', error);
    res.status(500).json({ error: 'No se pudo eliminar la inscripción', detalle: error.message });
  }
};

module.exports = {
  listarInscripciones,
  obtenerInscripcion,
  crearInscripcion,
  actualizarInscripcion,
  eliminarInscripcion
};