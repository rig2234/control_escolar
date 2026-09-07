const Student = require('../models/Student');

// Regex para CURP (18 caracteres)
const REGEX_CURP = /^[A-Z]{4}\d{6}[HM][A-Z]{2}[B-DF-HJ-NP-TV-Z]{3}[A-Z0-9]\d$/i;

// Regex para RFC de Persona Física (14 caracteres o 13 según formato con homoclave: 4 letras, 6 dígitos, 3 homoclave)
const REGEX_RFC = /^[A-Z&Ñ]{4}\d{6}[A-Z0-9]{3}$/i;

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

    // Validación de campos obligatorios
    if (!name || !firstlastname) {
      return res.status(400).json({ error: 'El nombre y primer apellido son obligatorios.' });
    }

    // Validación de formato de CURP
    if (CURP && !REGEX_CURP.test(CURP.trim())) {
      return res.status(400).json({ error: 'El formato de la CURP es inválido.' });
    }

    // Validación de formato de RFC (solo si se proporciona)
    if (RFC && RFC.trim() !== '' && !REGEX_RFC.test(RFC.trim())) {
      return res.status(400).json({ error: 'El formato del RFC es inválido. Debe contener 13 caracteres (4 letras, 6 números, 3 alfanuméricos).' });
    }

    const nuevoEstudiante = await Student.crear(req.body);
    res.status(201).json({ mensaje: 'Estudiante creado exitosamente', id: nuevoEstudiante.id });

  } catch (error) {
    console.error('Error al crear estudiante:', error);
    res.status(500).json({ 
      error: 'No se pudo guardar el estudiante', 
      detalle: error.message 
    });
  }
};