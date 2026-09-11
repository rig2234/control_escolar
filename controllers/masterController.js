const Master = require('../models/Master');

// 1. Listar todas las maestrías
const listarMaestrias = async (req, res) => {
  try {
    const maestrias = await Master.listarTodos();
    res.json(maestrias);
  } catch (error) {
    console.error('Error al listar maestrías:', error);
    res.status(500).json({ error: 'No se pudieron cargar las maestrías' });
  }
};

// 2. Obtener una maestría por ID
const obtenerMaestria = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'El ID proporcionado no es válido' });
    }

    const maestria = await Master.obtenerPorId(parseInt(id, 10));

    if (!maestria) {
      return res.status(404).json({ error: 'Maestría no encontrada' });
    }

    res.json(maestria);
  } catch (error) {
    console.error('Error al obtener maestría:', error);
    res.status(500).json({ error: 'Error al obtener la maestría', detalle: error.message });
  }
};

// 3. Crear una maestría
const crearMaestria = async (req, res) => {
  try {
    const { name, duration } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'El nombre de la maestría es requerido' });
    }

    if (duration === undefined || duration === null || duration === '') {
      return res.status(400).json({ error: 'La duración en semestres es requerida' });
    }

    const duracionNum = parseInt(duration, 10);
    if (isNaN(duracionNum) || duracionNum < 1) {
      return res.status(400).json({ error: 'La duración debe ser un número de semestres válido' });
    }

    const nuevaMaestria = await Master.crear(req.body);
    res.status(201).json({
      mensaje: 'Maestría creada exitosamente',
      id: nuevaMaestria.id
    });
  } catch (error) {
    console.error('Error al crear maestría:', error);
    res.status(500).json({ error: 'No se pudo guardar la maestría', detalle: error.message });
  }
};

// 4. Actualizar una maestría
const actualizarMaestria = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, duration } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'El ID proporcionado no es válido' });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'El nombre de la maestría es requerido' });
    }

    if (duration === undefined || duration === null || duration === '') {
      return res.status(400).json({ error: 'La duración en semestres es requerida' });
    }

    const duracionNum = parseInt(duration, 10);
    if (isNaN(duracionNum) || duracionNum < 1) {
      return res.status(400).json({ error: 'La duración debe ser un número de semestres válido' });
    }

    const actualizada = await Master.actualizar(parseInt(id, 10), req.body);

    if (!actualizada) {
      return res.status(404).json({ error: 'Maestría no encontrada para actualizar' });
    }

    res.json({ mensaje: 'Maestría actualizada con éxito' });
  } catch (error) {
    console.error('Error al actualizar maestría:', error);
    res.status(500).json({ error: 'Error al actualizar la maestría', detalle: error.message });
  }
};

// 5. Eliminar una maestría
const eliminarMaestria = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'El ID proporcionado no es válido' });
    }

    const maestriaEliminada = await Master.eliminar(parseInt(id, 10));

    if (!maestriaEliminada) {
      return res.status(404).json({ error: 'Maestría no encontrada' });
    }

    res.json({
      mensaje: maestriaEliminada.mensaje,
      id
    });
  } catch (error) {
    console.error('Error al eliminar maestría:', error);
    res.status(500).json({ error: 'No se pudo eliminar la maestría', detalle: error.message });
  }
};

module.exports = {
  listarMaestrias,
  obtenerMaestria,
  crearMaestria,
  actualizarMaestria,
  eliminarMaestria
};
