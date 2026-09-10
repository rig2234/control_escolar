const Cycle = require('../models/Cycle');

// 1. Listar todos los ciclos escolares
const listarCiclos = async (req, res) => {
  try {
    const ciclos = await Cycle.listarTodos();
    res.json(ciclos);
  } catch (error) {
    console.error('Error al listar ciclos:', error);
    res.status(500).json({ error: 'No se pudieron cargar los ciclos escolares' });
  }
};

// 2. Obtener un ciclo por ID
const obtenerCiclo = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'El ID proporcionado no es válido' });
    }

    const ciclo = await Cycle.obtenerPorId(parseInt(id, 10));

    if (!ciclo) {
      return res.status(404).json({ error: 'Ciclo escolar no encontrado' });
    }

    res.json(ciclo);
  } catch (error) {
    console.error('Error al obtener ciclo:', error);
    res.status(500).json({ error: 'Error al obtener el ciclo escolar', detalle: error.message });
  }
};

// 3. Crear un ciclo escolar
const crearCiclo = async (req, res) => {
  try {
    const { name, initialdate, finaldate } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'El nombre del ciclo es requerido' });
    }

    if (!initialdate || !finaldate) {
      return res.status(400).json({ error: 'Las fechas de inicio y fin son requeridas' });
    }

    // Validar formato de fechas
    const regexFecha = /^\d{4}-\d{2}-\d{2}$/;
    if (!regexFecha.test(initialdate) || !regexFecha.test(finaldate)) {
      return res.status(400).json({ error: 'Las fechas deben estar en formato YYYY-MM-DD' });
    }

    // Validar que la fecha final sea posterior a la inicial
    const fechaInicio = new Date(initialdate);
    const fechaFin = new Date(finaldate);

    if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
      return res.status(400).json({ error: 'Las fechas no son válidas' });
    }

    if (fechaFin <= fechaInicio) {
      return res.status(400).json({ error: 'La fecha final debe ser posterior a la fecha inicial' });
    }

    const nuevoCiclo = await Cycle.crear(req.body);
    res.status(201).json({
      mensaje: 'Ciclo escolar creado exitosamente',
      id: nuevoCiclo.id
    });
  } catch (error) {
    console.error('Error al crear ciclo:', error);
    res.status(500).json({ error: 'No se pudo guardar el ciclo escolar', detalle: error.message });
  }
};

// 4. Actualizar un ciclo escolar
const actualizarCiclo = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, initialdate, finaldate } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'El ID proporcionado no es válido' });
    }

    if (!name) {
      return res.status(400).json({ error: 'El nombre del ciclo es requerido' });
    }

    if (!initialdate || !finaldate) {
      return res.status(400).json({ error: 'Las fechas de inicio y fin son requeridas' });
    }

    // Validar formato de fechas
    const regexFecha = /^\d{4}-\d{2}-\d{2}$/;
    if (!regexFecha.test(initialdate) || !regexFecha.test(finaldate)) {
      return res.status(400).json({ error: 'Las fechas deben estar en formato YYYY-MM-DD' });
    }

    // Validar que la fecha final sea posterior a la inicial
    const fechaInicio = new Date(initialdate);
    const fechaFin = new Date(finaldate);

    if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
      return res.status(400).json({ error: 'Las fechas no son válidas' });
    }

    if (fechaFin <= fechaInicio) {
      return res.status(400).json({ error: 'La fecha final debe ser posterior a la fecha inicial' });
    }

    const actualizado = await Cycle.actualizar(parseInt(id, 10), req.body);

    if (!actualizado) {
      return res.status(404).json({ error: 'Ciclo escolar no encontrado para actualizar' });
    }

    res.json({ mensaje: 'Ciclo escolar actualizado con éxito' });
  } catch (error) {
    console.error('Error al actualizar ciclo:', error);
    res.status(500).json({ error: 'Error al actualizar el ciclo escolar', detalle: error.message });
  }
};

// 5. Eliminar un ciclo escolar
const eliminarCiclo = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'El ID proporcionado no es válido' });
    }

    const cicloEliminado = await Cycle.eliminar(parseInt(id, 10));

    if (!cicloEliminado) {
      return res.status(404).json({ error: 'Ciclo escolar no encontrado' });
    }

    res.json({
      mensaje: cicloEliminado.mensaje,
      id
    });
  } catch (error) {
    console.error('Error al eliminar ciclo:', error);
    res.status(500).json({ error: 'No se pudo eliminar el ciclo escolar', detalle: error.message });
  }
};

// 6. Obtener ciclos activos
const obtenerCiclosActivos = async (req, res) => {
  try {
    const ciclos = await Cycle.obtenerActivos();
    res.json(ciclos);
  } catch (error) {
    console.error('Error al obtener ciclos activos:', error);
    res.status(500).json({ error: 'No se pudieron cargar los ciclos activos' });
  }
};

// 7. Obtener ciclo actual
const obtenerCicloActual = async (req, res) => {
  try {
    const ciclo = await Cycle.obtenerActual();
    
    if (!ciclo) {
      return res.status(404).json({ error: 'No hay ciclo escolar activo en este momento' });
    }

    res.json(ciclo);
  } catch (error) {
    console.error('Error al obtener ciclo actual:', error);
    res.status(500).json({ error: 'Error al obtener el ciclo actual', detalle: error.message });
  }
};

// Exportación de todos los controladores
module.exports = {
  listarCiclos,
  obtenerCiclo,
  crearCiclo,
  actualizarCiclo,
  eliminarCiclo,
  obtenerCiclosActivos,
  obtenerCicloActual
};
