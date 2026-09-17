const sql = require('mssql');
const pool = require('../config/database');

// Relación entre un ciclo escolar (cycles) y una materia (courses)
class CycleCourse {
  // Listar materias asignadas a ciclos, con nombres relacionados
  static async listarTodos() {
    const request = new sql.Request(pool);
    const resultado = await request.query(`
      SELECT
        cc.id,
        cc.idcycle,
        cc.idcourse,
        c.name  AS cycleName,
        co.name AS courseName,
        cc.iduser,
        cc.date,
        cc.status
      FROM cyclecourses cc
      LEFT JOIN cycles  c  ON c.id  = cc.idcycle
      LEFT JOIN courses co ON co.id = cc.idcourse
      WHERE cc.status = 1
      ORDER BY cc.id DESC
    `);
    return resultado.recordset;
  }

  // Listar materias de un ciclo específico
  static async listarPorCiclo(idcycle) {
    const request = new sql.Request(pool);
    request.input('idcycle', sql.Int, idcycle);
    const resultado = await request.query(`
      SELECT
        cc.id,
        cc.idcycle,
        cc.idcourse,
        co.name AS courseName,
        cc.status
      FROM cyclecourses cc
      LEFT JOIN courses co ON co.id = cc.idcourse
      WHERE cc.status = 1 AND cc.idcycle = @idcycle
      ORDER BY co.name ASC
    `);
    return resultado.recordset;
  }

  static async obtenerPorId(id) {
    const request = new sql.Request(pool);
    request.input('id', sql.Int, id);
    const resultado = await request.query(`
      SELECT
        cc.id,
        cc.idcycle,
        cc.idcourse,
        c.name  AS cycleName,
        co.name AS courseName,
        cc.iduser,
        cc.date,
        cc.status
      FROM cyclecourses cc
      LEFT JOIN cycles  c  ON c.id  = cc.idcycle
      LEFT JOIN courses co ON co.id = cc.idcourse
      WHERE cc.id = @id
    `);
    return resultado.recordset[0] || null;
  }

  // Crear la relación ciclo-materia (evita duplicados activos)
  static async crear(datos) {
    const idcycle = parseInt(datos.idcycle, 10);
    const idcourse = parseInt(datos.idcourse, 10);
    const iduser = datos.iduser ? parseInt(datos.iduser, 10) : 3;

    if (!idcycle || !idcourse) {
      throw new Error('Debe seleccionar un ciclo y una materia');
    }

    const request = new sql.Request(pool);
    request.input('idcycle', sql.Int, idcycle);
    request.input('idcourse', sql.Int, idcourse);
    request.input('iduser', sql.Int, iduser);

    const resultado = await request.query(`
      IF EXISTS (
        SELECT 1 FROM cyclecourses
        WHERE idcycle = @idcycle AND idcourse = @idcourse AND status = 1
      )
        THROW 50001, 'Esta materia ya está asignada a este ciclo', 1;

      DECLARE @NextId INT;
      SELECT @NextId = ISNULL(MAX(id), 0) + 1 FROM cyclecourses;

      INSERT INTO cyclecourses (id, idcycle, idcourse, iduser, date, status)
      VALUES (@NextId, @idcycle, @idcourse, @iduser, GETDATE(), 1);

      SELECT @NextId AS id;
    `);

    return { id: resultado.recordset[0].id, idcycle, idcourse, iduser };
  }

  static async actualizar(id, datos) {
    const existente = await this.obtenerPorId(id);
    if (!existente) {
      throw new Error('Asignación no encontrada');
    }

    const idcycle = datos.idcycle ? parseInt(datos.idcycle, 10) : existente.idcycle;
    const idcourse = datos.idcourse ? parseInt(datos.idcourse, 10) : existente.idcourse;

    const request = new sql.Request(pool);
    request.input('id', sql.Int, id);
    request.input('idcycle', sql.Int, idcycle);
    request.input('idcourse', sql.Int, idcourse);

    await request.query(`
      UPDATE cyclecourses
      SET idcycle = @idcycle, idcourse = @idcourse
      WHERE id = @id
    `);

    return { id, idcycle, idcourse };
  }

  static async eliminar(id) {
    const existente = await this.obtenerPorId(id);
    if (!existente) {
      throw new Error('Asignación no encontrada');
    }

    const request = new sql.Request(pool);
    request.input('id', sql.Int, id);
    await request.query(`UPDATE cyclecourses SET status = 0 WHERE id = @id`);

    return {
      id,
      mensaje: `La materia "${existente.courseName || ''}" se quitó del ciclo "${existente.cycleName || ''}".`
    };
  }
}

module.exports = CycleCourse;