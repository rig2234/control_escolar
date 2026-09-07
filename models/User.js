const sql = require('mssql');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');

class User {
  // Crear un nuevo usuario
  static async crear(datos) {
    try {
      const { login, password, iduser, status = 1 } = datos;

      // Validar que no esté vacío
      if (!login || !password) {
        throw new Error('Faltan campos requeridos');
      }

      // Verificar si el usuario ya existe
      const usuarioExistente = await this.obtenerPorLogin(login);
      if (usuarioExistente) {
        throw new Error('El usuario ya existe');
      }

      // Verificar si el iduser ya tiene un login (solo si iduser es diferente de 0)
      if (iduser !== 0) {
        const usuarioConIduser = await this.obtenerPorIduser(iduser);
        if (usuarioConIduser) {
          throw new Error('Este ID de usuario ya tiene un login asignado');
        }
      }

      // Validar la contraseña
      if (password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      // Hashear la contraseña
      const salt = await bcrypt.genSalt(10);
      const passwordHasheada = await bcrypt.hash(password, salt);

      // Insertar en la base de datos
      const request = new sql.Request(pool);
      request.input('login', sql.NVarChar, login.trim());
      request.input('password', sql.NVarChar, passwordHasheada);
      request.input('iduser', sql.Int, iduser); // ← CAMBIO AQUÍ
      request.input('status', sql.Int, status);

      const resultado = await request.query(`
        INSERT INTO users (login, password, iduser, date, status)
        VALUES (@login, @password, @iduser, GETDATE(), @status);
        SELECT SCOPE_IDENTITY() AS id;
      `);

      return {
        id: resultado.recordset[0].id,
        login,
        iduser,
        status,
        mensaje: 'Usuario registrado exitosamente'
      };
    } catch (error) {
      throw error;
    }
  }

  // Obtener usuario por ID
  static async obtenerPorId(id) {
    try {
      const request = new sql.Request(pool);
      request.input('id', sql.Int, id);

      const resultado = await request.query(
        'SELECT id, login, iduser, date, status FROM users WHERE id = @id'
      );

      return resultado.recordset[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Obtener usuario por login
  static async obtenerPorLogin(login) {
    try {
      const request = new sql.Request(pool);
      request.input('login', sql.NVarChar, login);

      const resultado = await request.query(
        'SELECT * FROM users WHERE login = @login'
      );

      return resultado.recordset[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Obtener usuario por iduser
  static async obtenerPorIduser(iduser) {
    try {
      const request = new sql.Request(pool);
      request.input('iduser', sql.Int, iduser);

      const resultado = await request.query(
        'SELECT * FROM users WHERE iduser = @iduser'
      );

      return resultado.recordset[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Listar todos los usuarios
  static async listarTodos() {
    try {
      const request = new sql.Request(pool);
      const resultado = await request.query(
        'SELECT id, login, iduser, date, status FROM users WHERE status = 1 ORDER BY date DESC'
      );

      return resultado.recordset;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar usuario
  static async actualizar(id, datos) {
    try {
      const usuarioExistente = await this.obtenerPorId(id);
      if (!usuarioExistente) {
        throw new Error('Usuario no encontrado');
      }

      const { login, iduser, status } = datos;

      const request = new sql.Request(pool);
      request.input('id', sql.Int, id);
      request.input('login', sql.NVarChar, login || usuarioExistente.login);
      request.input('iduser', sql.Int, iduser || usuarioExistente.iduser);
      request.input('status', sql.Int, status !== undefined ? status : usuarioExistente.status);

      await request.query(`
        UPDATE users
        SET login = @login, iduser = @iduser, status = @status
        WHERE id = @id
      `);

      return {
        id,
        login: login || usuarioExistente.login,
        iduser: iduser || usuarioExistente.iduser,
        status: status !== undefined ? status : usuarioExistente.status
      };
    } catch (error) {
      throw error;
    }
  }

  // Cambiar contraseña
  static async cambiarContraseña(id, passwordActual, passwordNueva) {
    try {
      const usuario = await this.obtenerPorId(id);
      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      // Obtener la contraseña hasheada
      const request = new sql.Request(pool);
      request.input('id', sql.Int, id);
      const resultado = await request.query('SELECT password FROM users WHERE id = @id');
      
      if (resultado.recordset.length === 0) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar contraseña actual
      const esValida = await bcrypt.compare(passwordActual, resultado.recordset[0].password);
      if (!esValida) {
        throw new Error('Contraseña actual incorrecta');
      }

      // Hashear nueva contraseña
      const salt = await bcrypt.genSalt(10);
      const passwordHasheada = await bcrypt.hash(passwordNueva, salt);

      // Actualizar contraseña
      const updateRequest = new sql.Request(pool);
      updateRequest.input('id', sql.Int, id);
      updateRequest.input('password', sql.NVarChar, passwordHasheada);

      await updateRequest.query('UPDATE users SET password = @password WHERE id = @id');

      return { mensaje: 'Contraseña actualizada correctamente' };
    } catch (error) {
      throw error;
    }
  }

  // Desactivar usuario (soft delete)
  static async desactivar(id) {
    try {
      const request = new sql.Request(pool);
      request.input('id', sql.Int, id);

      await request.query('UPDATE users SET status = 0 WHERE id = @id');
      return { mensaje: 'Usuario desactivado' };
    } catch (error) {
      throw error;
    }
  }

  // Autenticar usuario
  static async autenticar(login, password) {
    try {
      const usuario = await this.obtenerPorLogin(login);
      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      if (usuario.status !== 1) {
        throw new Error('El usuario está inactivo');
      }

      const esValida = await bcrypt.compare(password, usuario.password);
      if (!esValida) {
        throw new Error('Contraseña incorrecta');
      }

      // Actualizar última fecha de acceso
      const updateRequest = new sql.Request(pool);
      updateRequest.input('id', sql.Int, usuario.id);
      await updateRequest.query('UPDATE users SET date = GETDATE() WHERE id = @id');

      return {
        id: usuario.id,
        login: usuario.login,
        iduser: usuario.iduser,
        status: usuario.status
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;