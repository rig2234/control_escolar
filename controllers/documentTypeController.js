const DocumentType = require('../models/DocumentType');

const listarDocumentos = async (req, res) => {
  try {
    const documentos = await DocumentType.listarTodos();
    res.json(documentos);
  } catch (error) {
    console.error('Error al listar documentos requeridos:', error);
    res.status(500).json({ error: 'No se pudieron cargar los documentos requeridos' });
  }
};

const obtenerDocumento = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: 'El ID proporcionado no es válido' });
    }

    const documento = await DocumentType.obtenerPorId(id);
    if (!documento) {
      return res.status(404).json({ error: 'Documento requerido no encontrado' });
    }

    res.json(documento);
  } catch (error) {
    console.error('Error al obtener documento requerido:', error);
    res.status(500).json({ error: 'Error al obtener el documento requerido' });
  }
};

const crearDocumento = async (req, res) => {
  try {
    if (typeof req.body.name !== 'string' || !req.body.name.trim()) {
      return res.status(400).json({ error: 'El nombre del documento es requerido' });
    }
    if (req.body.abbreviation !== undefined && typeof req.body.abbreviation !== 'string') {
      return res.status(400).json({ error: 'La abreviatura debe ser texto' });
    }
    if (req.body.name.trim().length > 250) {
      return res.status(400).json({ error: 'El nombre no puede exceder 250 caracteres' });
    }
    if (req.body.abbreviation && req.body.abbreviation.trim().length > 20) {
      return res.status(400).json({ error: 'La abreviatura no puede exceder 20 caracteres' });
    }

    const documento = await DocumentType.crear(req.body);
    res.status(201).json({
      mensaje: 'Documento requerido creado exitosamente',
      id: documento.id
    });
  } catch (error) {
    console.error('Error al crear documento requerido:', error);
    res.status(500).json({ error: 'No se pudo guardar el documento requerido', detalle: error.message });
  }
};

const actualizarDocumento = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: 'El ID proporcionado no es válido' });
    }
    if (typeof req.body.name !== 'string' || !req.body.name.trim()) {
      return res.status(400).json({ error: 'El nombre del documento es requerido' });
    }
    if (req.body.abbreviation !== undefined && typeof req.body.abbreviation !== 'string') {
      return res.status(400).json({ error: 'La abreviatura debe ser texto' });
    }
    if (req.body.name.trim().length > 250) {
      return res.status(400).json({ error: 'El nombre no puede exceder 250 caracteres' });
    }
    if (req.body.abbreviation && req.body.abbreviation.trim().length > 20) {
      return res.status(400).json({ error: 'La abreviatura no puede exceder 20 caracteres' });
    }

    await DocumentType.actualizar(id, req.body);
    res.json({ mensaje: 'Documento requerido actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar documento requerido:', error);
    const status = error.message === 'Documento requerido no encontrado' ? 404 : 500;
    res.status(status).json({ error: error.message || 'No se pudo actualizar el documento requerido' });
  }
};

const eliminarDocumento = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: 'El ID proporcionado no es válido' });
    }

    const documento = await DocumentType.eliminar(id);
    res.json({ mensaje: documento.mensaje, id });
  } catch (error) {
    console.error('Error al desactivar documento requerido:', error);
    const status = error.message === 'Documento requerido no encontrado' ? 404 : 500;
    res.status(status).json({ error: error.message || 'No se pudo desactivar el documento requerido' });
  }
};

module.exports = {
  listarDocumentos,
  obtenerDocumento,
  crearDocumento,
  actualizarDocumento,
  eliminarDocumento
};
