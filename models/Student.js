const sql = require('mssql');
const pool = require('../config/database');

// Función helper para procesar la CURP automáticamente
async function procesarDatosCURP(curp) {
  if (!curp || curp.length !== 18) {
    return { birthdate: null, idstate: 0, state: 'NO ESPECIFICADO' };
  }

  const curpUpper = curp.toUpperCase().trim();

  // 1. Fecha de nacimiento
  const yy = curpUpper.substring(4, 6);
  const mm = curpUpper.substring(6, 8);
  const dd = curpUpper.substring(8, 10);
  
  const anioActual = parseInt(new Date().getFullYear().toString().substring(2), 10);
  const siglo = parseInt(yy, 10) > anioActual ? '19' : '20';
  const birthdate = `${siglo}${yy}-${mm}-${dd}`;

  // 2. Abreviatura del Estado
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
    console.error('Error al consultar tabla states:', error);
  }

  return { birthdate, idstate, state };
}

class Student {
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

  static async crear(datos) {
    const curpVal = datos.CURP ? datos.CURP.trim().toUpperCase() : null;
    const rfcVal = datos.RFC ? datos.RFC.trim().toUpperCase() : null;

    // Obtener fecha y estado automáticamente desde la CURP
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
}

module.exports = Student;