const sql = require('mssql');
const pool = require('../config/database');

class CareerEnrollment {
  /**
   * Inscribe a un estudiante en un curso para un ciclo determinado.
   *
   * Nota: el dashboard envía actualmente el ID del curso en el campo
   * "idgrade". Se conserva ese nombre para mantener compatible el endpoint,
   * pero ese valor NO debe asignarse a students.idgrade.
   */
  static async inscribirCarrera(datos) {
    const idstudent = parseInt(datos.idstudent, 10);
    const idcycle = parseInt(datos.idcycle, 10);
    const idcourse = parseInt(datos.idgrade, 10);
    const iduser = datos.iduser ? parseInt(datos.iduser, 10) : 3;

    if (!idstudent || !idcycle || !idcourse) {
      throw new Error('Debe proporcionar el estudiante, el ciclo y el curso');
    }

    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      // Validar que el estudiante exista y esté activo.
      const reqStudent = new sql.Request(transaction);
      reqStudent.input('idstudent', sql.Int, idstudent);

      const resStudent = await reqStudent.query(`
        SELECT id
        FROM students
        WHERE id = @idstudent AND status = 1
      `);

      if (resStudent.recordset.length === 0) {
        throw new Error('El estudiante especificado no existe o no está activo');
      }

      // Validar y obtener el curso seleccionado.
      const reqCourse = new sql.Request(transaction);
      reqCourse.input('idcourse', sql.Int, idcourse);

      const resCourse = await reqCourse.query(`
        SELECT id AS idcourse, name AS courseName
        FROM courses
        WHERE id = @idcourse AND status = 1
      `);

      if (resCourse.recordset.length === 0) {
        throw new Error('El curso seleccionado no existe o no está activo');
      }

      const curso = resCourse.recordset[0];

      // Buscar o crear la relación entre el ciclo y el curso.
      const reqCCExist = new sql.Request(transaction);
      reqCCExist.input('idcycle', sql.Int, idcycle);
      reqCCExist.input('idcourse', sql.Int, curso.idcourse);

      const resCCExist = await reqCCExist.query(`
        SELECT id
        FROM cyclecourses
        WHERE idcycle = @idcycle
          AND idcourse = @idcourse
          AND status = 1
      `);

      let idcyclecourse;

      if (resCCExist.recordset.length > 0) {
        idcyclecourse = resCCExist.recordset[0].id;
      } else {
        const reqCCInsert = new sql.Request(transaction);
        reqCCInsert.input('idcycle', sql.Int, idcycle);
        reqCCInsert.input('idcourse', sql.Int, curso.idcourse);
        reqCCInsert.input('iduser', sql.Int, iduser);

        const resCCInsert = await reqCCInsert.query(`
          DECLARE @NextIdCC INT;
          SELECT @NextIdCC = ISNULL(MAX(id), 0) + 1
          FROM cyclecourses;

          INSERT INTO cyclecourses
            (id, idcycle, idcourse, iduser, date, status)
          VALUES
            (@NextIdCC, @idcycle, @idcourse, @iduser, GETDATE(), 1);

          SELECT @NextIdCC AS idcyclecourse;
        `);

        idcyclecourse = resCCInsert.recordset[0].idcyclecourse;
      }

      // Inscribir al estudiante en el curso del ciclo, evitando duplicados activos.
      const reqCCS = new sql.Request(transaction);
      reqCCS.input('idcyclecourse', sql.Int, idcyclecourse);
      reqCCS.input('idstudent', sql.Int, idstudent);
      reqCCS.input('iduser', sql.Int, iduser);

      const resCCS = await reqCCS.query(`
        IF NOT EXISTS (
          SELECT 1
          FROM cyclecoursestudents
          WHERE idcyclecourse = @idcyclecourse
            AND idstudent = @idstudent
            AND status = 1
        )
        BEGIN
          DECLARE @NextId INT;
          SELECT @NextId = ISNULL(MAX(id), 0) + 1
          FROM cyclecoursestudents;

          INSERT INTO cyclecoursestudents
            (id, idcyclecourse, idstudent, iduser, date, status)
          VALUES
            (@NextId, @idcyclecourse, @idstudent, @iduser, GETDATE(), 1);

          SELECT @NextId AS id, 'INSCRITO' AS estado;
        END
        ELSE
        BEGIN
          SELECT id, 'YA_INSCRITO' AS estado
          FROM cyclecoursestudents
          WHERE idcyclecourse = @idcyclecourse
            AND idstudent = @idstudent
            AND status = 1;
        END
      `);

      await transaction.commit();

      return {
        idstudent,
        idcycle,
        idcourse: curso.idcourse,
        totalMaterias: 1,
        detalles: [
          {
            idcourse: curso.idcourse,
            courseName: curso.courseName,
            idcyclecourse,
            idinscripcion: resCCS.recordset[0].id,
            estado: resCCS.recordset[0].estado
          }
        ]
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = CareerEnrollment;