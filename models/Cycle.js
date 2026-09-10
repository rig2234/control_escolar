const sql = require('mssql');
const pool = require('../config/database');

class Cycle {
  // Listar todos los ciclos escolares activos (Soft Delete)
  static async listarTodos() {
    try {
      const request = new sql.Request(pool);
      const resultado = await request.query(`
        SELECT
          id,
          name,
          initialdate,
          finaldate,
          iduser,
          date,
          status
        FROM cycles
        WHERE status = 1
        ORDER BY initialdate DESC
      `);

      return resultado.recordset;
    } catch (error) {
      throw error;
    }
  }

  // Obtener un ciclo por ID
  static async obtenerPorId(id) {
    try {
      const request = new sql.Request(pool);
      request.input('id', sql.Int, id);

      const resultado = await request.query(`
        SELECT
          id,
          name,
          initialdate,
          finaldate,
          iduser,
          date,
          status
        FROM cycles
        WHERE id = @id
      `);

      return resultado.recordset[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Crear un nuevo ciclo escolar
  static async crear(datos) {
    try {
      const { name, initialdate, finaldate, iduser = 1, status = 1 } = datos;

      if (!name || !initialdate || !finaldate) {
        throw new Error('Faltan campos requeridos: name, initialdate, finaldate');
      }

      // Validar que la fecha final sea posterior a la inicial
      const fechaInicio = new Date(initialdate);
      const fechaFin = new Date(finaldate);

      if (fechaFin <= fechaInicio) {
        throw new Error('La fecha final debe ser posterior a la fecha inicial');
      }

      const request = new sql.Request(pool);
      request.input('name', sql.NVarChar, name.trim());
      request.input('initialdate', sql.DateTime, fechaInicio);
      request.input('finaldate', sql.DateTime, fechaFin);
      request.input('iduser', sql.Int, iduser);
      request.input('status', sql.Int, status);

      const resultado = await request.query(`
        INSERT INTO cycles (name, initialdate, finaldate, iduser, date, status)
        VALUES (@name, @initialdate, @finaldate, @iduser, GETDATE(), @status);
        SELECT SCOPE_IDENTITY() AS id;
      `);

      return {
        id: resultado.recordset[0].id,
        name,
        initialdate: fechaInicio.toISOString().split('T')[0],
        finaldate: fechaFin.toISOString().split('T')[0],
        iduser,
        status
      };
    } catch (error) {
      throw error;
    }
  }

  // Actualizar un ciclo escolar
  static async actualizar(id, datos) {
    try {
      const cicloExistente = await this.obtenerPorId(id);
      if (!cicloExistente) {
        throw new Error('Ciclo escolar no encontrado');
      }

      const { name, initialdate, finaldate, status } = datos;

      // Validar que la fecha final sea posterior a la inicial si ambas se proporcionan
      if (initialdate && finaldate) {
        const fechaInicio = new Date(initialdate);
        const fechaFin = new Date(finaldate);

        if (fechaFin <= fechaInicio) {
          throw new Error('La fecha final debe ser posterior a la fecha inicial');
        }
      }

      const request = new sql.Request(pool);
      request.input('id', sql.Int, id);
      request.input('name', sql.NVarChar, name ? name.trim() : cicloExistente.name);
      request.input('initialdate', sql.DateTime, initialdate ? new Date(initialdate) : cicloExistente.initialdate);
      request.input('finaldate', sql.DateTime, finaldate ? new Date(finaldate) : cicloExistente.finaldate);
      request.input('status', sql.Int, status !== undefined ? status : cicloExistente.status);

      await request.query(`
        UPDATE cycles
        SET
          name = @name,
          initialdate = @initialdate,
          finaldate = @finaldate,
          status = @status
        WHERE id = @id
      `);

      return {
        id,
        name: name ? name.trim() : cicloExistente.name,
        initialdate: (initialdate ? new Date(initialdate) : cicloExistente.initialdate).toISOString().split('T')[0],
        finaldate: (finaldate ? new Date(finaldate) : cicloExistente.finaldate).toISOString().split('T')[0],
        status: status !== undefined ? status : cicloExistente.status
      };
    } catch (error) {
      throw error;
    }
  }

  // Eliminar un ciclo escolar (Soft Delete / Desactivación)
  static async eliminar(id) {
    try {
      const ciclo = await this.obtenerPorId(id);
      if (!ciclo) {
        throw new Error('Ciclo escolar no encontrado');
      }

      const request = new sql.Request(pool);
      request.input('id', sql.Int, id);

      // Cambiamos el estado a 0 en lugar de eliminar físicamente
      await request.query(`UPDATE cycles SET status = 0 WHERE id = @id`);

      return {
        id,
        name: ciclo.name,
        mensaje: `El ciclo escolar "${ciclo.name}" ha sido desactivado exitosamente.`
      };
    } catch (error) {
      throw error;
    }
  }

  // Obtener ciclos activos
  static async obtenerActivos() {
    try {
      const request = new sql.Request(pool);
      const resultado = await request.query(`
        SELECT
          id,
          name,
          initialdate,
          finaldate,
          iduser,
          date,
          status
        FROM cycles
        WHERE status = 1
        ORDER BY initialdate DESC
      `);

      return resultado.recordset;
    } catch (error) {
      throw error;
    }
  }

  // Obtener ciclo actual (basado en la fecha del sistema)
  static async obtenerActual() {
    try {
      const request = new sql.Request(pool);
      const resultado = await request.query(`
        SELECT TOP 1
          id,
          name,
          initialdate,
          finaldate,
          iduser,
          date,
          status
        FROM cycles
        WHERE status = 1
          AND GETDATE() BETWEEN initialdate AND finaldate
        ORDER BY initialdate DESC
      `);

      return resultado.recordset[0] || null;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Cycle;
