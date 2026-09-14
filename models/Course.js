const sql = require('mssql');
const pool = require('../config/database');

let tablaVerificada = false;

class Course {
  // Asegura la creación de la tabla "courses" si no existe
  static async asegurarTabla() {
    if (tablaVerificada) return;
    try {
      const request = new sql.Request(pool);
      await request.query(`
        IF NOT EXISTS (
          SELECT * FROM sysobjects WHERE name = 'courses' AND xtype = 'U'
        )
        CREATE TABLE courses (
          id INT IDENTITY(1,1) PRIMARY KEY,
          name NVARCHAR(150) NOT NULL,
          iduser INT NOT NULL DEFAULT 1,
          date DATETIME NOT NULL DEFAULT GETDATE(),
          status INT NOT NULL DEFAULT 1
        );
      `);
      tablaVerificada = true;
    } catch (error) {
      throw error;
    }
  }

  // Listar todas las materias activas
  static async listarTodos() {
    try {
      await this.asegurarTabla();
      const request = new sql.Request(pool);
      const resultado = await request.query(`
        SELECT id, name, iduser, date, status
        FROM courses
        WHERE status = 1
        ORDER BY name ASC
      `);
      return resultado.recordset;
    } catch (error) {
      throw error;
    }
  }

  // Obtener una materia por su ID
  static async obtenerPorId(id) {
    try {
      await this.asegurarTabla();
      const request = new sql.Request(pool);
      request.input('id', sql.Int, id);

      const resultado = await request.query(`
        SELECT id, name, iduser, date, status
        FROM courses
        WHERE id = @id
      `);
      return resultado.recordset[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Crear una materia
  static async crear(datos) {
    try {
      await this.asegurarTabla();
      const { name, iduser = 1, status = 1 } = datos;

      if (!name || !name.trim()) {
        throw new Error('El nombre de la materia es requerido');
      }

      const request = new sql.Request(pool);
      request.input('name', sql.NVarChar, name.trim());
      request.input('iduser', sql.Int, iduser);
      request.input('status', sql.Int, status);

      const resultado = await request.query(`
        INSERT INTO courses (name, iduser, date, status)
        VALUES (@name, @iduser, GETDATE(), @status);
        SELECT SCOPE_IDENTITY() AS id;
      `);

      return {
        id: resultado.recordset[0].id,
        name: name.trim(),
        iduser,
        status
      };
    } catch (error) {
      throw error;
    }
  }

  // Actualizar una materia
  static async actualizar(id, datos) {
    try {
      await this.asegurarTabla();
      const materiaExistente = await this.obtenerPorId(id);
      if (!materiaExistente) {
        throw new Error('Materia no encontrada');
      }

      const { name, status } = datos;

      const request = new sql.Request(pool);
      request.input('id', sql.Int, id);
      request.input('name', sql.NVarChar, name ? name.trim() : materiaExistente.name);
      request.input('status', sql.Int, status !== undefined ? status : materiaExistente.status);

      await request.query(`
        UPDATE courses
        SET
          name = @name,
          status = @status
        WHERE id = @id
      `);

      return {
        id,
        name: name ? name.trim() : materiaExistente.name,
        status: status !== undefined ? status : materiaExistente.status
      };
    } catch (error) {
      throw error;
    }
  }

  // Desactivación lógica (Soft delete)
  static async eliminar(id) {
    try {
      await this.asegurarTabla();
      const materia = await this.obtenerPorId(id);
      if (!materia) {
        throw new Error('Materia no encontrada');
      }

      const request = new sql.Request(pool);
      request.input('id', sql.Int, id);
      await request.query(`UPDATE courses SET status = 0 WHERE id = @id`);

      return {
        id,
        name: materia.name,
        mensaje: `La materia "${materia.name}" ha sido desactivada exitosamente.`
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Course;