const sql = require('mssql');
const pool = require('../config/database');

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
    const request = new sql.Request(pool);
    
    // Parámetros de texto y números opcionales
    request.input('name', sql.VarChar, datos.name);
    request.input('firstlastname', sql.VarChar, datos.firstlastname);
    request.input('secondlastname', sql.VarChar, datos.secondlastname ? datos.secondlastname.trim() : null);
    request.input('sex', sql.VarChar, datos.sex ? datos.sex : null);
    
    const gradeVal = datos.idgrade && !isNaN(datos.idgrade) ? parseInt(datos.idgrade, 10) : null;
    request.input('idgrade', sql.Int, gradeVal);
    
    request.input('CURP', sql.VarChar, datos.CURP ? datos.CURP.trim().toUpperCase() : null);
    request.input('RFC', sql.VarChar, datos.RFC ? datos.RFC.trim().toUpperCase() : null);
    
    // Campos obligatorios por la BD con valores por defecto
    request.input('iduser', sql.Int, datos.iduser ? parseInt(datos.iduser, 10) : 3);
    request.input('idstate', sql.Int, datos.idstate ? parseInt(datos.idstate, 10) : 25); // 25 por defecto
    request.input('state', sql.VarChar, datos.state ? datos.state : 'SINALOA');

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