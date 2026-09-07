const sql = require('mssql');
const pool = require('../config/database');

class Student {
  static async listarTodos() {
    const request = new sql.Request(pool);
    const resultado = await request.query(`
      SELECT
        id,
        name,
        firstname,
        secondlastname,
        sex,
        idgrade,
        status
      FROM students
      ORDER BY id DESC
    `);

    return resultado.recordset;
  }
}

module.exports = Student;