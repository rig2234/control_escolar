const CycleCourse = require('../models/CycleCourse');
const CycleCourseDocumentType = require('../models/CycleCourseDocumentType');
const CycleCourseStudent = require('../models/CycleCourseStudent');
const DocumentType = require('../models/DocumentType');
const Student = require('../models/Student');

function getPositiveId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function validarCursoActivo(idcyclecourse, res) {
  const curso = await CycleCourse.obtenerPorId(idcyclecourse);
  if (!curso || Number(curso.status) !== 1) {
    res.status(404).json({ error: 'El curso no está vinculado a un ciclo activo' });
    return false;
  }
  return true;
}

const listarDocumentos = async (req, res) => {
  const idcyclecourse = getPositiveId(req.params.id);
  if (!idcyclecourse) {
    return res.status(400).json({ error: 'El ID del curso vinculado no es válido' });
  }

  try {
    if (!await validarCursoActivo(idcyclecourse, res)) return;
    const documentos = await CycleCourseDocumentType.listarPorCurso(idcyclecourse);
    res.json(documentos);
  } catch (error) {
    console.error('Error al listar documentos del curso:', error);
    res.status(500).json({ error: 'No se pudieron cargar los documentos del curso' });
  }
};

const actualizarDocumento = async (req, res) => {
  const idcyclecourse = getPositiveId(req.params.id);
  const iddocumenttype = getPositiveId(req.params.iddocumenttype);
  const body = req.body || {};
  const { related, obligatory, iduser } = body;

  if (!idcyclecourse || !iddocumenttype) {
    return res.status(400).json({ error: 'Los IDs del curso y documento deben ser válidos' });
  }
  if (typeof related !== 'boolean' || (obligatory !== undefined && typeof obligatory !== 'boolean')) {
    return res.status(400).json({ error: 'Debe indicar si el documento está vinculado y si es obligatorio' });
  }
  if (!related && obligatory) {
    return res.status(400).json({ error: 'Un documento no vinculado no puede ser obligatorio' });
  }
  if (iduser !== undefined && !getPositiveId(iduser)) {
    return res.status(400).json({ error: 'El ID del usuario no es válido' });
  }

  try {
    if (!await validarCursoActivo(idcyclecourse, res)) return;
    const documento = await DocumentType.obtenerPorId(iddocumenttype);
    if (!documento || Number(documento.status) !== 1) {
      return res.status(404).json({ error: 'El documento requerido no está activo' });
    }

    await CycleCourseDocumentType.actualizarRelacion(idcyclecourse, iddocumenttype, body);
    res.json({ mensaje: 'Relación de documento actualizada' });
  } catch (error) {
    console.error('Error al actualizar documento del curso:', error);
    res.status(500).json({ error: 'No se pudo actualizar el documento del curso' });
  }
};

const listarEstudiantes = async (req, res) => {
  const idcyclecourse = getPositiveId(req.params.id);
  if (!idcyclecourse) {
    return res.status(400).json({ error: 'El ID del curso vinculado no es válido' });
  }

  try {
    if (!await validarCursoActivo(idcyclecourse, res)) return;
    const estudiantes = await CycleCourseStudent.listarPorCurso(idcyclecourse);
    res.json(estudiantes);
  } catch (error) {
    console.error('Error al listar estudiantes del curso:', error);
    res.status(500).json({ error: 'No se pudieron cargar los estudiantes del curso' });
  }
};

const actualizarEstudiante = async (req, res) => {
  const idcyclecourse = getPositiveId(req.params.id);
  const idstudent = getPositiveId(req.params.idstudent);
  const body = req.body || {};
  const { related, iduser } = body;

  if (!idcyclecourse || !idstudent) {
    return res.status(400).json({ error: 'Los IDs del curso y estudiante deben ser válidos' });
  }
  if (typeof related !== 'boolean') {
    return res.status(400).json({ error: 'Debe indicar si el estudiante está vinculado' });
  }
  if (iduser !== undefined && !getPositiveId(iduser)) {
    return res.status(400).json({ error: 'El ID del usuario no es válido' });
  }

  try {
    if (!await validarCursoActivo(idcyclecourse, res)) return;
    const estudiante = await Student.obtenerPorId(idstudent);
    if (!estudiante || Number(estudiante.status) !== 1) {
      return res.status(404).json({ error: 'El estudiante no está activo' });
    }

    await CycleCourseStudent.actualizarRelacion(idcyclecourse, idstudent, body);
    res.json({ mensaje: 'Relación de estudiante actualizada' });
  } catch (error) {
    console.error('Error al actualizar estudiante del curso:', error);
    res.status(500).json({ error: 'No se pudo actualizar el estudiante del curso' });
  }
};

module.exports = {
  listarDocumentos,
  actualizarDocumento,
  listarEstudiantes,
  actualizarEstudiante
};
