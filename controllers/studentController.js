const Student = require('../models/Student');

// Regex para validación de campos opcionales
const REGEX_CURP = /^[A-Z]{4}\d{6}[HM][A-Z]{2}[B-DF-HJ-NP-TV-Z]{3}[A-Z0-9]\d$/i;
const REGEX_RFC = /^[A-Z&Ñ]{4}\d{6}[A-Z0-9]{3}$/i; // Persona física (13 caracteres)

// 1. Listar todos los estudiantes
const listarEstudiantes = async (req, res) => {
  try {
    const estudiantes = await Student.listarTodos();
    res.json(estudiantes);
  } catch (error) {
    console.error('Error al listar estudiantes:', error);
    res.status(500).json({ error: 'No se pudieron cargar los estudiantes' });
  }
};

// 2. Obtener un estudiante por ID
const obtenerEstudiante = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'El ID proporcionado no es válido' });
    }

    const estudiante = await Student.obtenerPorId(parseInt(id, 10));

    if (!estudiante) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    res.json(estudiante);
  } catch (error) {
    console.error('Error al obtener estudiante:', error);
    res.status(500).json({ error: 'Error al obtener el estudiante', detalle: error.message });
  }
};

// 3. Crear un estudiante
const crearEstudiante = async (req, res) => {
  try {
    const { name, firstlastname, CURP, RFC } = req.body;

    if (!name || !firstlastname) {
      return res.status(400).json({ error: 'El nombre y el primer apellido son requeridos' });
    }

    if (CURP && CURP.trim() !== '' && !REGEX_CURP.test(CURP.trim())) {
      return res.status(400).json({ error: 'El formato de la CURP es inválido' });
    }

    if (RFC && RFC.trim() !== '' && !REGEX_RFC.test(RFC.trim())) {
      return res.status(400).json({ error: 'El formato del RFC es inválido (debe tener 13 caracteres)' });
    }

    const nuevoEstudiante = await Student.crear(req.body);
    res.status(201).json({
      mensaje: 'Estudiante creado exitosamente',
      id: nuevoEstudiante.id
    });
  } catch (error) {
    console.error('Error al crear estudiante:', error);
    res.status(500).json({ error: 'No se pudo guardar el estudiante', detalle: error.message });
  }
};

// 4. Actualizar un estudiante
const actualizarEstudiante = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, firstlastname, CURP, RFC } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'El ID proporcionado no es válido' });
    }

    if (!name || !firstlastname) {
      return res.status(400).json({ error: 'El nombre y el primer apellido son requeridos' });
    }

    if (CURP && CURP.trim() !== '' && !REGEX_CURP.test(CURP.trim())) {
      return res.status(400).json({ error: 'El formato de la CURP es inválido' });
    }

    if (RFC && RFC.trim() !== '' && !REGEX_RFC.test(RFC.trim())) {
      return res.status(400).json({ error: 'El formato del RFC es inválido (debe tener 13 caracteres)' });
    }

    const actualizado = await Student.actualizar(parseInt(id, 10), req.body);

    if (!actualizado) {
      return res.status(404).json({ error: 'Estudiante no encontrado para actualizar' });
    }

    res.json({ mensaje: 'Estudiante actualizado con éxito' });
  } catch (error) {
    console.error('Error al actualizar estudiante:', error);
    res.status(500).json({ error: 'Error al actualizar el estudiante', detalle: error.message });
  }
};

// 5. Eliminar un estudiante
const eliminarEstudiante = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'El ID proporcionado no es válido' });
    }

    const estudianteEliminado = await Student.eliminar(parseInt(id, 10));

    if (!estudianteEliminado) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    const nombreCompleto = `${estudianteEliminado.name} ${estudianteEliminado.firstlastname}`;

    res.json({
      mensaje: `El estudiante "${nombreCompleto}" ha sido eliminado exitosamente.`,
      id
    });
  } catch (error) {
    console.error('Error al eliminar estudiante:', error);
    res.status(500).json({ error: 'No se pudo eliminar el estudiante', detalle: error.message });
  }
};

// Exportación única de todos los controladores
module.exports = {
  listarEstudiantes,
  obtenerEstudiante,
  crearEstudiante,
  actualizarEstudiante,
  eliminarEstudiante
};