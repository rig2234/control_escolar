const Student = require('../models/Student');

// Regex para validación de campos opcionales
const REGEX_CURP = /^[A-Z]{4}\d{6}[HM][A-Z]{2}[B-DF-HJ-NP-TV-Z]{3}[A-Z0-9]\d$/i;
const REGEX_RFC = /^[A-Z&Ñ]{4}\d{6}[A-Z0-9]{3}$/i; // Persona física (13 caracteres)

exports.listarEstudiantes = async (req, res) => {
  try {
    const estudiantes = await Student.listarTodos();
    res.json(estudiantes);
  } catch (error) {
    console.error('Error al listar estudiantes:', error);
    res.status(500).json({ error: 'No se pudieron cargar los estudiantes' });
  }
};

exports.crearEstudiante = async (req, res) => {
  try {
    const { name, firstlastname, CURP, RFC } = req.body;

    if (!name || !firstlastname) {
      return res.status(400).json({ error: 'El nombre y el primer apellido son requeridos' });
    }

    // Validación opcional de CURP
    if (CURP && !REGEX_CURP.test(CURP.trim())) {
      return res.status(400).json({ error: 'El formato de la CURP es inválido' });
    }

    // Validación opcional de RFC
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

exports.eliminarEstudiante = async (req, res) => {
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