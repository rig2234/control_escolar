const User = require('../models/User');

exports.crearUsuario = async (req, res) => {
  try {
    const { login, password, iduser } = req.body;

    if (!login || !password || iduser === undefined) {
      return res.status(400).json({ error: 'Faltan campos requeridos: login, password, iduser' });
    }

    // Validar que login no contenga espacios
    if (login.includes(' ')) {
      return res.status(400).json({ error: 'El usuario no puede contener espacios' });
    }

    // Validar longitud del login
    if (login.length < 3) {
      return res.status(400).json({ error: 'El usuario debe tener al menos 3 caracteres' });
    }

    const usuario = await User.crear({ login, password, iduser });
    res.status(201).json({ 
      mensaje: 'Usuario creado exitosamente',
      usuario 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.registroUsuario = async (req, res) => {
  try {
    console.log('Datos recibidos:', req.body);
    
    const { login, password, confirmPassword } = req.body;

    // Validaciones
    if (!login || !password || !confirmPassword) {
      console.log('Validación 1 falló:', { login, password, confirmPassword });
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    if (login.length < 3) {
      console.log('Validación 2 falló: login muy corto');
      return res.status(400).json({ error: 'El usuario debe tener al menos 3 caracteres' });
    }

    if (login.includes(' ')) {
      console.log('Validación 3 falló: login contiene espacios');
      return res.status(400).json({ error: 'El usuario no puede contener espacios' });
    }

    if (password.length < 6) {
      console.log('Validación 4 falló: contraseña muy corta');
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    if (password !== confirmPassword) {
      console.log('Validación 5 falló: contraseñas no coinciden');
      return res.status(400).json({ error: 'Las contraseñas no coinciden' });
    }

    console.log('Todas las validaciones pasaron, creando usuario...');

    const usuario = await User.crear({ 
      login, 
      password, 
      iduser: 0
    });
    
    console.log('Usuario creado:', usuario);
    
    res.status(201).json({ 
      mensaje: 'Registro exitoso. Por favor inicia sesión.',
      usuario 
    });
  } catch (error) {
    console.error('Error en registroUsuario:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.obtenerUsuario = async (req, res) => {
  try {
    const usuario = await User.obtenerPorId(req.params.id);
    
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.actualizarUsuario = async (req, res) => {
  try {
    const usuario = await User.actualizar(req.params.id, req.body);
    res.json({ 
      mensaje: 'Usuario actualizado',
      usuario 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.listarUsuarios = async (req, res) => {
  try {
    const usuarios = await User.listarTodos();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.desactivarUsuario = async (req, res) => {
  try {
    const resultado = await User.desactivar(req.params.id);
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.cambiarContraseña = async (req, res) => {
  try {
    const { passwordActual, passwordNueva, confirmPassword } = req.body;

    if (!passwordActual || !passwordNueva || !confirmPassword) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    if (passwordNueva !== confirmPassword) {
      return res.status(400).json({ error: 'Las contraseñas no coinciden' });
    }

    if (passwordNueva.length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    const resultado = await User.cambiarContraseña(
      req.params.id,
      passwordActual,
      passwordNueva
    );
    res.json(resultado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.autenticar = async (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({ error: 'Login y password requeridos' });
    }

    const usuario = await User.autenticar(login, password);
    res.json({ 
      mensaje: 'Autenticación exitosa',
      usuario 
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};