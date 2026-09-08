const sql = require('mssql');
const pool = require('../config/database');

// Helper interno para decodificar CURP y consultar la tabla states
async function procesarDatosCURP(curp) {
  if (!curp || curp.length !== 18) {
    return { birthdate: null, idstate: 0, state: 'NO ESPECIFICADO' };
  }

  const curpUpper = curp.toUpperCase().trim();

  // Extraer fecha de nacimiento (posiciones 4 a 9 -> YYMMDD)
  const yy = curpUpper.substring(4, 6);
  const mm = curpUpper.substring(6, 8);
  const dd = curpUpper.substring(8, 10);
  
  const anioActual = parseInt(new Date().getFullYear().toString().substring(2), 10);
  const siglo = parseInt(yy, 10) > anioActual ? '19' : '20';
  const birthdate = `${siglo}${yy}-${mm}-${dd}`;

  // Extraer abreviatura del estado (posiciones 11 y 12 -> Ej: SL, SR, DF)
  const abreviaturaEstado = curpUpper.substring(11, 13);

  let idstate = 0;
  let state = 'NO ESPECIFICADO';

  try {
    const requestEstado = new sql.Request(pool);
    requestEstado.input('abbrev', sql.VarChar, abreviaturaEstado);
    
    const resultEstado = await requestEstado.query(`
      SELECT id, name 
      FROM states 
      WHERE TRIM(UPPER(abbreviation)) = TRIM(UPPER(@abbrev))
    `);

    if (resultEstado.recordset.length > 0) {
      idstate = resultEstado.recordset[0].id;
      state = resultEstado.recordset[0].name;
    }
  } catch (error) {
    console.error('Error al consultar la tabla states:', error);
  }

  return { birthdate, idstate, state };
}

class Student {
  // Listar todos los estudiantes
  static async listarTodos() {
    const request = new sql.Request(pool);
    const resultado = await request.query(`
      SELECT
        id,
        name,
        firstlastname,
        secondlastname,
        sex,
        idgrade,
        status
      FROM students
      ORDER BY id DESC
    `);

    return resultado.recordset;
  }

  // Crear estudiante con ID manual y CURP parseada
  static async crear(datos) {
    const curpVal = datos.CURP ? datos.CURP.trim().toUpperCase() : null;
    const rfcVal = datos.RFC ? datos.RFC.trim().toUpperCase() : null;

    const datosExtra = await procesarDatosCURP(curpVal);

    const request = new sql.Request(pool);
    
    request.input('name', sql.VarChar, datos.name);
    request.input('firstlastname', sql.VarChar, datos.firstlastname);
    request.input('secondlastname', sql.VarChar, datos.secondlastname ? datos.secondlastname.trim() : null);
    request.input('sex', sql.VarChar, datos.sex ? datos.sex : null);
    
    const gradeVal = datos.idgrade && !isNaN(datos.idgrade) ? parseInt(datos.idgrade, 10) : null;
    request.input('idgrade', sql.Int, gradeVal);
    
    request.input('CURP', sql.VarChar, curpVal);
    request.input('RFC', sql.VarChar, rfcVal);
    request.input('iduser', sql.Int, datos.iduser ? parseInt(datos.iduser, 10) : 3);

    request.input('birthdate', sql.Date, datosExtra.birthdate);
    request.input('idstate', sql.Int, datosExtra.idstate);
    request.input('state', sql.VarChar, datosExtra.state);

    const resultado = await request.query(`
      DECLARE @NextId INT;
      SELECT @NextId = ISNULL(MAX(id), 0) + 1 FROM students;

      INSERT INTO students (
        id,
        name,
        firstlastname,
        secondlastname,
        sex,
        idgrade,
        idstate,
        state,
        birthdate,
        CURP,
        RFC,
        iduser,
        status,
        date
      )
      VALUES (
        @NextId,
        @name,
        @firstlastname,
        @secondlastname,
        @sex,
        @idgrade,
        @idstate,
        @state,
        @birthdate,
        @CURP,
        @RFC,
        @iduser,
        1,
        GETDATE()
      );

      SELECT @NextId AS id;
    `);

    return resultado.recordset[0];
  }

  // Eliminar estudiante y retornar datos para el mensaje
  static async eliminar(id) {
    const request = new sql.Request(pool);
    request.input('id', sql.Int, id);

    // 1. Obtener los datos del estudiante antes de borrarlo
    const estudiante = await request.query(`
      SELECT name, firstlastname 
      FROM students 
      WHERE id = @id
    `);

    if (estudiante.recordset.length === 0) {
      return null;
    }

    // 2. Ejecutar borrado
    await request.query(`DELETE FROM students WHERE id = @id`);

    return estudiante.recordset[0];
  }

  // Obtener estudiante por ID
  static async obtenerPorId(id) {
    const request = new sql.Request(pool);
    request.input('id', sql.Int, id);

    const resultado = await request.query(`
      SELECT
        id,
        name,
        firstlastname,
        secondlastname,
        sex,
        idgrade,
        CURP,
        RFC,
        status
      FROM students
      WHERE id = @id
    `);

    return resultado.recordset[0] || null;
  }

  // Modificar/Actualizar datos del estudiante (soporta actualizar CURP y recalcular fecha/estado)
  static async actualizar(id, datos) {
    const curpVal = datos.CURP ? datos.CURP.trim().toUpperCase() : null;
    const rfcVal = datos.RFC ? datos.RFC.trim().toUpperCase() : null;

    const datosExtra = await procesarDatosCURP(curpVal);

    const request = new sql.Request(pool);
    request.input('id', sql.Int, id);
    request.input('name', sql.VarChar, datos.name);
    request.input('firstlastname', sql.VarChar, datos.firstlastname);
    request.input('secondlastname', sql.VarChar, datos.secondlastname ? datos.secondlastname.trim() : null);
    request.input('sex', sql.VarChar, datos.sex ? datos.sex : null);

    const gradeVal = datos.idgrade && !isNaN(datos.idgrade) ? parseInt(datos.idgrade, 10) : null;
    request.input('idgrade', sql.Int, gradeVal);

    request.input('CURP', sql.VarChar, curpVal);
    request.input('RFC', sql.VarChar, rfcVal);
    request.input('birthdate', sql.Date, datosExtra.birthdate);
    request.input('idstate', sql.Int, datosExtra.idstate);
    request.input('state', sql.VarChar, datosExtra.state);

    await request.query(`
      UPDATE students
      SET
        name = @name,
        firstlastname = @firstlastname,
        secondlastname = @secondlastname,
        sex = @sex,
        idgrade = @idgrade,
        CURP = ISNULL(@CURP, CURP),
        RFC = ISNULL(@RFC, RFC),
        birthdate = ISNULL(@birthdate, birthdate),
        idstate = CASE WHEN @idstate <> 0 THEN @idstate ELSE idstate END,
        state = CASE WHEN @state <> 'NO ESPECIFICADO' THEN @state ELSE state END
      WHERE id = @id
    `);

    return { id, ...datos };
  }
}

module.exports = Student;