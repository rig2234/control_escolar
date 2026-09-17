const Grade = require('../models/Grade');

const listarGrados = async (req, res) => {
  try {
    const grados = await Grade.listarTodos();
    res.json(grados);
  } catch (error) {
    console.error('Error al listar grados:', error);
    res.status(500).json({ error: 'No se pudieron cargar los grados' });
  }
};

const obtenerGrado = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'El ID proporcionado no es válido' });
    }

    const grado = await Grade.obtenerPorId(parseInt(id, 10));
    if (!grado) {
      return res.status(404).json({ error: 'Grado no encontrado' });
    }

    res.json(grado);
  } catch (error) {
    console.error('Error al obtener grado:', error);
    res.status(500).json({ error: 'Error al obtener el grado', detalle: error.message });
  }
};

const crearGrado = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'El nombre del grado es requerido' });
    }

    const nuevoGrado = await Grade.crear(req.body);
    res.status(201).json({ mensaje: 'Grado creado exitosamente', id: nuevoGrado.id });
  } catch (error) {
    console.error('Error al crear grado:', error);
    res.status(500).json({ error: 'No se pudo guardar el grado', detalle: error.message });
  }
};

const actualizarGrado = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'El ID proporcionado no es válido' });
    }
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'El nombre del grado es requerido' });
    }

    await Grade.actualizar(parseInt(id, 10), req.body);
    res.json({ mensaje: 'Grado actualizado con éxito' });
  } catch (error) {
    console.error('Error al actualizar grado:', error);
    res.status(500).json({ error: 'Error al actualizar el grado', detalle: error.message });
  }
};

const eliminarGrado = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'El ID proporcionado no es válido' });
    }

    const gradoEliminado = await Grade.eliminar(parseInt(id, 10));
    res.json({ mensaje: gradoEliminado.mensaje, id });
  } catch (error) {
    console.error('Error al eliminar grado:', error);
    res.status(500).json({ error: 'No se pudo eliminar el grado', detalle: error.message });
  }
};

module.exports = {
  listarGrados,
  obtenerGrado,
  crearGrado,
  actualizarGrado,
  eliminarGrado
};