const sql = require('mssql');
const pool = require('../config/database');

class Grade {
  // Listar todos los grados activos
  static async listarTodos() {
    const request = new sql.Request(pool);
    const resultado = await request.query(`
      SELECT id, name, iduser, date, status
      FROM grades
      WHERE status = 1
      ORDER BY name ASC
    `);
    return resultado.recordset;
  }

  // Obtener un grado por ID
  static async obtenerPorId(id) {
    const request = new sql.Request(pool);
    request.input('id', sql.Int, id);

    const resultado = await request.query(`
      SELECT id, name, iduser, date, status
      FROM grades
      WHERE id = @id
    `);
    return resultado.recordset[0] || null;
  }

  // Crear un grado (ID manual, consistente con el resto del esquema)
  static async crear(datos) {
    const { name, iduser = 3, status = 1 } = datos;

    if (!name || !name.trim()) {
      throw new Error('El nombre del grado es requerido');
    }

    const request = new sql.Request(pool);
    request.input('name', sql.NVarChar, name.trim());
    request.input('iduser', sql.Int, iduser);
    request.input('status', sql.Int, status);

    const resultado = await request.query(`
      DECLARE @NextId INT;
      SELECT @NextId = ISNULL(MAX(id), 0) + 1 FROM grades;

      INSERT INTO grades (id, name, iduser, date, status)
      VALUES (@NextId, @name, @iduser, GETDATE(), @status);

      SELECT @NextId AS id;
    `);

    return {
      id: resultado.recordset[0].id,
      name: name.trim(),
      iduser,
      status
    };
  }

  // Actualizar un grado
  static async actualizar(id, datos) {
    const gradoExistente = await this.obtenerPorId(id);
    if (!gradoExistente) {
      throw new Error('Grado no encontrado');
    }

    const { name, status } = datos;

    const request = new sql.Request(pool);
    request.input('id', sql.Int, id);
    request.input('name', sql.NVarChar, name ? name.trim() : gradoExistente.name);
    request.input('status', sql.Int, status !== undefined ? status : gradoExistente.status);

    await request.query(`
      UPDATE grades
      SET name = @name, status = @status
      WHERE id = @id
    `);

    return {
      id,
      name: name ? name.trim() : gradoExistente.name,
      status: status !== undefined ? status : gradoExistente.status
    };
  }

  // Desactivación lógica (Soft delete)
  static async eliminar(id) {
    const grado = await this.obtenerPorId(id);
    if (!grado) {
      throw new Error('Grado no encontrado');
    }

    const request = new sql.Request(pool);
    request.input('id', sql.Int, id);
    await request.query(`UPDATE grades SET status = 0 WHERE id = @id`);

    return {
      id,
      name: grado.name,
      mensaje: `El grado "${grado.name}" ha sido desactivado exitosamente.`
    };
  }
}

module.exports = Grade;