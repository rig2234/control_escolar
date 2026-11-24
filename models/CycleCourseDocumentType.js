const sql = require('mssql');
const pool = require('../config/database');

class CycleCourseDocumentType {
  static async listarPorCurso(idcyclecourse) {
    const request = new sql.Request(pool);
    request.input('idcyclecourse', sql.Int, idcyclecourse);

    const resultado = await request.query(`
      SELECT
        dt.id AS iddocumenttype,
        dt.name AS documentName,
        dt.abbreviation,
        CAST(CASE WHEN ccdt.id IS NULL THEN 0 ELSE 1 END AS BIT) AS related,
        ISNULL(ccdt.obligatory, 0) AS obligatory
      FROM documenttypes dt
      LEFT JOIN cyclecoursesdocumenttypes ccdt
        ON ccdt.iddocumenttype = dt.id
        AND ccdt.idcyclecourse = @idcyclecourse
        AND ccdt.status = 1
      WHERE dt.status = 1
      ORDER BY dt.name ASC
    `);
    return resultado.recordset;
  }

  static async actualizarRelacion(idcyclecourse, iddocumenttype, datos) {
    const related = datos.related === true;
    const obligatory = related && datos.obligatory === true;
    const iduser = datos.iduser ? parseInt(datos.iduser, 10) : 3;
    const request = new sql.Request(pool);
    request.input('idcyclecourse', sql.Int, idcyclecourse);
    request.input('iddocumenttype', sql.Int, iddocumenttype);
    request.input('iduser', sql.Int, iduser);
    request.input('related', sql.Bit, related);
    request.input('obligatory', sql.Bit, obligatory);

    await request.query(`
      IF NOT EXISTS (
        SELECT 1 FROM cyclecourses
        WHERE id = @idcyclecourse AND status = 1
      )
        THROW 50010, 'El curso no está vinculado a un ciclo activo', 1;

      IF NOT EXISTS (
        SELECT 1 FROM documenttypes
        WHERE id = @iddocumenttype AND status = 1
      )
        THROW 50011, 'El documento requerido no está activo', 1;

      IF @related = 0
      BEGIN
        UPDATE cyclecoursesdocumenttypes
        SET status = 0, date = GETDATE(), iduser = @iduser
        WHERE idcyclecourse = @idcyclecourse
          AND iddocumenttype = @iddocumenttype
          AND status = 1;
      END
      ELSE
      BEGIN
        DECLARE @RelationId INT;
        SELECT TOP 1 @RelationId = id
        FROM cyclecoursesdocumenttypes
        WHERE idcyclecourse = @idcyclecourse
          AND iddocumenttype = @iddocumenttype
        ORDER BY CASE WHEN status = 1 THEN 0 ELSE 1 END, id DESC;

        IF @RelationId IS NULL
        BEGIN
          SELECT @RelationId = ISNULL(MAX(id), 0) + 1
          FROM cyclecoursesdocumenttypes;

          INSERT INTO cyclecoursesdocumenttypes
            (id, idcyclecourse, iddocumenttype, obligatory, iduser, date, status)
          VALUES
            (@RelationId, @idcyclecourse, @iddocumenttype, @obligatory, @iduser, GETDATE(), 1);
        END
        ELSE
        BEGIN
          UPDATE cyclecoursesdocumenttypes
          SET status = 1, obligatory = @obligatory, date = GETDATE(), iduser = @iduser
          WHERE id = @RelationId;
        END
      END
    `);
  }
}

module.exports = CycleCourseDocumentType;
