const sql = require('mssql');
const pool = require('../config/database');

// Inscripción: relación entre un estudiante y una materia-de-ciclo (cyclecourses)
class CycleCourseStudent {
  // Listar inscripciones con nombres de estudiante, materia y ciclo
  static async listarTodos() {
    const request = new sql.Request(pool);
    const resultado = await request.query(`
      SELECT
        ccs.id,
        ccs.idcyclecourse,
        ccs.idstudent,
        co.name AS courseName,
        c.name  AS cycleName,
        (s.name + ' ' + s.firstlastname + ' ' + ISNULL(s.secondlastname, '')) AS studentName,
        ccs.iduser,
        ccs.date,
        ccs.status
      FROM cyclecoursestudents ccs
      LEFT JOIN cyclecourses cc ON cc.id = ccs.idcyclecourse
      LEFT JOIN courses      co ON co.id = cc.idcourse
      LEFT JOIN cycles       c  ON c.id  = cc.idcycle
      LEFT JOIN students     s  ON s.id  = ccs.idstudent
      WHERE ccs.status = 1
      ORDER BY ccs.id DESC
    `);
    return resultado.recordset;
  }

  // Listar inscripciones de un estudiante
  static async listarPorEstudiante(idstudent) {
    const request = new sql.Request(pool);
    request.input('idstudent', sql.Int, idstudent);
    const resultado = await request.query(`
      SELECT
        ccs.id,
        ccs.idcyclecourse,
        co.name AS courseName,
        c.name  AS cycleName,
        ccs.status
      FROM cyclecoursestudents ccs
      LEFT JOIN cyclecourses cc ON cc.id = ccs.idcyclecourse
      LEFT JOIN courses      co ON co.id = cc.idcourse
      LEFT JOIN cycles       c  ON c.id  = cc.idcycle
      WHERE ccs.status = 1 AND ccs.idstudent = @idstudent
      ORDER BY ccs.id DESC
    `);
    return resultado.recordset;
  }

  static async listarPorCurso(idcyclecourse) {
    const request = new sql.Request(pool);
    request.input('idcyclecourse', sql.Int, idcyclecourse);
    const resultado = await request.query(`
      SELECT
        s.id AS idstudent,
        s.name,
        s.firstlastname,
        s.secondlastname,
        s.CURP,
        ccs.id AS idcyclecoursestudent,
        CAST(CASE WHEN ccs.id IS NULL THEN 0 ELSE 1 END AS BIT) AS related,
        (
          SELECT COUNT(1)
          FROM cyclecoursestudentdocuments ccsd
          WHERE ccsd.idcyclecoursestudent = ccs.id AND ccsd.status = 1
        ) AS documentCount
      FROM students s
      LEFT JOIN cyclecoursestudents ccs
        ON ccs.idstudent = s.id
        AND ccs.idcyclecourse = @idcyclecourse
        AND ccs.status = 1
      WHERE s.status = 1
      ORDER BY CASE WHEN ccs.id IS NULL THEN 1 ELSE 0 END,
        s.firstlastname, s.secondlastname, s.name
    `);
    return resultado.recordset;
  }

  static async actualizarRelacion(idcyclecourse, idstudent, datos) {
    const related = datos.related === true;
    const iduser = datos.iduser ? parseInt(datos.iduser, 10) : 3;
    const request = new sql.Request(pool);
    request.input('idcyclecourse', sql.Int, idcyclecourse);
    request.input('idstudent', sql.Int, idstudent);
    request.input('iduser', sql.Int, iduser);
    request.input('related', sql.Bit, related);

    await request.query(`
      IF NOT EXISTS (
        SELECT 1 FROM cyclecourses
        WHERE id = @idcyclecourse AND status = 1
      )
        THROW 50010, 'El curso no está vinculado a un ciclo activo', 1;

      IF NOT EXISTS (
        SELECT 1 FROM students
        WHERE id = @idstudent AND status = 1
      )
        THROW 50012, 'El estudiante no está activo', 1;

      IF @related = 0
      BEGIN
        UPDATE cyclecoursestudents
        SET status = 0, date = GETDATE(), iduser = @iduser
        WHERE idcyclecourse = @idcyclecourse
          AND idstudent = @idstudent
          AND status = 1;
      END
      ELSE
      BEGIN
        DECLARE @RelationId INT;
        SELECT TOP 1 @RelationId = id
        FROM cyclecoursestudents
        WHERE idcyclecourse = @idcyclecourse
          AND idstudent = @idstudent
        ORDER BY CASE WHEN status = 1 THEN 0 ELSE 1 END, id DESC;

        IF @RelationId IS NULL
        BEGIN
          SELECT @RelationId = ISNULL(MAX(id), 0) + 1
          FROM cyclecoursestudents;

          INSERT INTO cyclecoursestudents
            (id, idcyclecourse, idstudent, iduser, date, status)
          VALUES
            (@RelationId, @idcyclecourse, @idstudent, @iduser, GETDATE(), 1);
        END
        ELSE
        BEGIN
          UPDATE cyclecoursestudents
          SET status = 1, date = GETDATE(), iduser = @iduser
          WHERE id = @RelationId;
        END
      END
    `);
  }

  static async obtenerPorId(id) {
    const request = new sql.Request(pool);
    request.input('id', sql.Int, id);
    const resultado = await request.query(`
      SELECT
        ccs.id,
        ccs.idcyclecourse,
        ccs.idstudent,
        co.name AS courseName,
        (s.name + ' ' + s.firstlastname + ' ' + ISNULL(s.secondlastname, '')) AS studentName,
        ccs.iduser,
        ccs.date,
        ccs.status
      FROM cyclecoursestudents ccs
      LEFT JOIN cyclecourses cc ON cc.id = ccs.idcyclecourse
      LEFT JOIN courses      co ON co.id = cc.idcourse
      LEFT JOIN students     s  ON s.id  = ccs.idstudent
      WHERE ccs.id = @id
    `);
    return resultado.recordset[0] || null;
  }

  // Inscribir estudiante a una materia-de-ciclo (evita duplicados activos)
  static async crear(datos) {
    const idcyclecourse = parseInt(datos.idcyclecourse, 10);
    const idstudent = parseInt(datos.idstudent, 10);
    const iduser = datos.iduser ? parseInt(datos.iduser, 10) : 3;

    if (!idcyclecourse || !idstudent) {
      throw new Error('Debe seleccionar una materia del ciclo y un estudiante');
    }

    const request = new sql.Request(pool);
    request.input('idcyclecourse', sql.Int, idcyclecourse);
    request.input('idstudent', sql.Int, idstudent);
    request.input('iduser', sql.Int, iduser);

    const resultado = await request.query(`
      IF EXISTS (
        SELECT 1 FROM cyclecoursestudents
        WHERE idcyclecourse = @idcyclecourse AND idstudent = @idstudent AND status = 1
      )
        THROW 50002, 'El estudiante ya está inscrito en esta materia del ciclo', 1;

      DECLARE @NextId INT;
      SELECT @NextId = ISNULL(MAX(id), 0) + 1 FROM cyclecoursestudents;

      INSERT INTO cyclecoursestudents (id, idcyclecourse, idstudent, iduser, date, status)
      VALUES (@NextId, @idcyclecourse, @idstudent, @iduser, GETDATE(), 1);

      SELECT @NextId AS id;
    `);

    return { id: resultado.recordset[0].id, idcyclecourse, idstudent, iduser };
  }

  static async actualizar(id, datos) {
    const existente = await this.obtenerPorId(id);
    if (!existente) {
      throw new Error('Inscripción no encontrada');
    }

    const idcyclecourse = datos.idcyclecourse ? parseInt(datos.idcyclecourse, 10) : existente.idcyclecourse;
    const idstudent = datos.idstudent ? parseInt(datos.idstudent, 10) : existente.idstudent;

    const request = new sql.Request(pool);
    request.input('id', sql.Int, id);
    request.input('idcyclecourse', sql.Int, idcyclecourse);
    request.input('idstudent', sql.Int, idstudent);

    await request.query(`
      UPDATE cyclecoursestudents
      SET idcyclecourse = @idcyclecourse, idstudent = @idstudent
      WHERE id = @id
    `);

    return { id, idcyclecourse, idstudent };
  }

  static async eliminar(id) {
    const existente = await this.obtenerPorId(id);
    if (!existente) {
      throw new Error('Inscripción no encontrada');
    }

    const request = new sql.Request(pool);
    request.input('id', sql.Int, id);
    await request.query(`UPDATE cyclecoursestudents SET status = 0 WHERE id = @id`);

    return {
      id,
      mensaje: `La inscripción de "${(existente.studentName || '').trim()}" fue cancelada.`
    };
  }
}

module.exports = CycleCourseStudent;