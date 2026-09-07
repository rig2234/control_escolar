const sql = require('mssql');
const pool = require('../config/database'); // Subir un nivel a la raíz y entrar a config

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
    
    request.input('name', sql.VarChar, datos.name);
    request.input('firstlastname', sql.VarChar, datos.firstlastname);
    request.input('secondlastname', sql.VarChar, datos.secondlastname || null);
    request.input('sex', sql.VarChar, datos.sex || null);
    request.input('idgrade', sql.Int, datos.idgrade ? parseInt(datos.idgrade) : null);
    request.input('CURP', sql.VarChar, datos.CURP || null);
    request.input('RFC', sql.VarChar, datos.RFC || null);

    const resultado = await request.query(`
      INSERT INTO students (name, firstlastname, secondlastname, sex, idgrade, CURP, RFC, status, date)
      OUTPUT INSERTED.id
      VALUES (@name, @firstlastname, @secondlastname, @sex, @idgrade, @CURP, @RFC, 1, GETDATE())
    `);

    return resultado.recordset[0];
  }
}

module.exports = Student;