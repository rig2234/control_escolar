const sql = require('mssql');
const pool = require('../config/database');

class CareerEnrollment {
  /**
   * Inscribe a un estudiante en todas las materias de una carrera para un ciclo determinado
   */
  static async inscribirCarrera(datos) {
    const idstudent = parseInt(datos.idstudent, 10);
    const idcycle = parseInt(datos.idcycle, 10);
    const idgrade = parseInt(datos.idgrade, 10);
    const iduser = datos.iduser ? parseInt(datos.iduser, 10) : 3;

    if (!idstudent || !idcycle || !idgrade) {
      throw new Error('Debe proporcionar el estudiante, el ciclo y la carrera (grado)');
    }

    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      // 1. Validar que el estudiante exista y esté activo
      const reqStudent = new sql.Request(transaction);
      reqStudent.input('idstudent', sql.Int, idstudent);
      const resStudent = await reqStudent.query(`
        SELECT id, name, firstlastname FROM students WHERE id = @idstudent AND status = 1
      `);

      if (resStudent.recordset.length === 0) {
        throw new Error('El estudiante especificado no existe o no está activo');
      }

      // 2. Obtener todas las materias asociadas a la carrera (tabla gradecourses / courses)
      // 2. Obtener el curso/carrera directamente desde la tabla courses
const reqCourses = new sql.Request(transaction);
reqCourses.input('idgrade', sql.Int, idgrade);
const resCourses = await reqCourses.query(`
  SELECT c.id AS idcourse, c.name AS courseName
  FROM courses c
  WHERE c.id = @idgrade AND c.status = 1
`);

      const materias = resCourses.recordset;

      if (materias.length === 0) {
        throw new Error('La carrera seleccionada no tiene materias asignadas o activas');
      }

      const resultadosInscripcion = [];

      // 3. Recorrer cada materia de la carrera
      for (const materia of materias) {
        // 3.1 Obtener o crear la relación ciclo-materia (cyclecourses)
        // 3.1 Obtener o crear la relación ciclo-materia (cyclecourses)
        // A. Buscar si ya existe la relación ciclo-materia
        const reqCCExist = new sql.Request(transaction);
        reqCCExist.input('idcycle', sql.Int, idcycle);
        reqCCExist.input('idcourse', sql.Int, materia.idcourse);

        const resCCExist = await reqCCExist.query(`
          SELECT id 
          FROM cyclecourses 
          WHERE idcycle = @idcycle AND idcourse = @idcourse AND status = 1
        `);

        let idcyclecourse;

        if (resCCExist.recordset.length > 0) {
          idcyclecourse = resCCExist.recordset[0].id;
        } else {
          // B. Si no existe, crear la relación
          const reqCCInsert = new sql.Request(transaction);
          reqCCInsert.input('idcycle', sql.Int, idcycle);
          reqCCInsert.input('idcourse', sql.Int, materia.idcourse);
          reqCCInsert.input('iduser', sql.Int, iduser);

          const resCCInsert = await reqCCInsert.query(`
            DECLARE @NextIdCC INT;
            SELECT @NextIdCC = ISNULL(MAX(id), 0) + 1 FROM cyclecourses;

            INSERT INTO cyclecourses (id, idcycle, idcourse, iduser, date, status)
            VALUES (@NextIdCC, @idcycle, @idcourse, @iduser, GETDATE(), 1);

            SELECT @NextIdCC AS idcyclecourse;
          `);

          idcyclecourse = resCCInsert.recordset[0].idcyclecourse;
        }

        // 3.2 Inscribir al estudiante en la materia del ciclo (cyclecoursestudents)
        const reqCCS = new sql.Request(transaction);
        reqCCS.input('idcyclecourse', sql.Int, idcyclecourse);
        reqCCS.input('idstudent', sql.Int, idstudent);
        reqCCS.input('iduser', sql.Int, iduser);

        const resCCS = await reqCCS.query(`
          IF NOT EXISTS (
            SELECT 1 FROM cyclecoursestudents
            WHERE idcyclecourse = @idcyclecourse AND idstudent = @idstudent AND status = 1
          )
          BEGIN
            DECLARE @NextId INT;
            SELECT @NextId = ISNULL(MAX(id), 0) + 1 FROM cyclecoursestudents;

            INSERT INTO cyclecoursestudents (id, idcyclecourse, idstudent, iduser, date, status)
            VALUES (@NextId, @idcyclecourse, @idstudent, @iduser, GETDATE(), 1);

            SELECT @NextId AS id, 'INSCRITO' AS estado;
          END
          ELSE
          BEGIN
            SELECT id, 'YA_INSCRITO' AS estado FROM cyclecoursestudents
            WHERE idcyclecourse = @idcyclecourse AND idstudent = @idstudent AND status = 1;
          END
        `);

        resultadosInscripcion.push({
          idcourse: materia.idcourse,
          courseName: materia.courseName,
          idcyclecourse,
          idinscripcion: resCCS.recordset[0].id,
          estado: resCCS.recordset[0].estado
        });
      }

      // 4. Actualizar el grado actual del estudiante
      const reqUpdateStudent = new sql.Request(transaction);
      reqUpdateStudent.input('idstudent', sql.Int, idstudent);
      reqUpdateStudent.input('idgrade', sql.Int, idgrade);
      await reqUpdateStudent.query(`
        UPDATE students SET idgrade = @idgrade WHERE id = @idstudent
      `);

      await transaction.commit();

      return {
        idstudent,
        idgrade,
        idcycle,
        totalMaterias: materias.length,
        detalles: resultadosInscripcion
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
 

module.exports = CareerEnrollment;