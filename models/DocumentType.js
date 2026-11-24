const sql = require('mssql');
const pool = require('../config/database');

class DocumentType {
  static async listarTodos() {
    const request = new sql.Request(pool);
    const resultado = await request.query(`
      SELECT id, name, abbreviation, iduser, date, status
      FROM documenttypes
      WHERE status = 1
      ORDER BY name ASC
    `);
    return resultado.recordset;
  }

  static async obtenerPorId(id) {
    const request = new sql.Request(pool);
    request.input('id', sql.Int, id);

    const resultado = await request.query(`
      SELECT id, name, abbreviation, iduser, date, status
      FROM documenttypes
      WHERE id = @id
    `);
    return resultado.recordset[0] || null;
  }

  static async crear(datos) {
    const name = typeof datos.name === 'string' ? datos.name.trim() : '';
    const abbreviation = typeof datos.abbreviation === 'string' && datos.abbreviation.trim()
      ? datos.abbreviation.trim()
      : null;
    const iduser = datos.iduser ? parseInt(datos.iduser, 10) : 3;

    if (!name) {
      throw new Error('El nombre del documento es requerido');
    }

    const request = new sql.Request(pool);
    request.input('name', sql.VarChar(250), name);
    request.input('abbreviation', sql.VarChar(20), abbreviation);
    request.input('iduser', sql.Int, iduser);

    const resultado = await request.query(`
      DECLARE @NextId INT;
      SELECT @NextId = ISNULL(MAX(id), 0) + 1 FROM documenttypes;

      INSERT INTO documenttypes (id, name, abbreviation, iduser, date, status)
      VALUES (@NextId, @name, @abbreviation, @iduser, GETDATE(), 1);

      SELECT @NextId AS id;
    `);

    return { id: resultado.recordset[0].id, name, abbreviation, iduser, status: 1 };
  }

  static async actualizar(id, datos) {
    const existente = await this.obtenerPorId(id);
    if (!existente) {
      throw new Error('Documento requerido no encontrado');
    }

    const name = typeof datos.name === 'string' ? datos.name.trim() : '';
    const abbreviation = typeof datos.abbreviation === 'string' && datos.abbreviation.trim()
      ? datos.abbreviation.trim()
      : null;
    const iduser = datos.iduser ? parseInt(datos.iduser, 10) : existente.iduser;

    if (!name) {
      throw new Error('El nombre del documento es requerido');
    }

    const request = new sql.Request(pool);
    request.input('id', sql.Int, id);
    request.input('name', sql.VarChar(250), name);
    request.input('abbreviation', sql.VarChar(20), abbreviation);
    request.input('iduser', sql.Int, iduser);

    await request.query(`
      UPDATE documenttypes
      SET name = @name, abbreviation = @abbreviation, iduser = @iduser, date = GETDATE()
      WHERE id = @id
    `);

    return { id, name, abbreviation, iduser };
  }

  static async eliminar(id) {
    const existente = await this.obtenerPorId(id);
    if (!existente) {
      throw new Error('Documento requerido no encontrado');
    }

    const request = new sql.Request(pool);
    request.input('id', sql.Int, id);
    await request.query('UPDATE documenttypes SET status = 0 WHERE id = @id');

    return {
      id,
      name: existente.name,
      mensaje: `El documento requerido "${existente.name}" se desactivó exitosamente.`
    };
  }
}

module.exports = DocumentType;
