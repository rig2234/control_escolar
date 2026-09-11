const sql = require('mssql');
const pool = require('../config/database');

let tablaVerificada = false;

class Master {
  // Crea la tabla "masters" si aún no existe (tabla nueva para Maestrías)
  static async asegurarTabla() {
    if (tablaVerificada) return;
    try {
      const request = new sql.Request(pool);
      await request.query(`
        IF NOT EXISTS (
          SELECT * FROM sysobjects WHERE name = 'masters' AND xtype = 'U'
        )
        CREATE TABLE masters (
          id INT IDENTITY(1,1) PRIMARY KEY,
          name NVARCHAR(150) NOT NULL,
          description NVARCHAR(500) NULL,
          duration INT NOT NULL,
          credits INT NULL,
          iduser INT NOT NULL DEFAULT 1,
          date DATETIME NOT NULL DEFAULT GETDATE(),
          status INT NOT NULL DEFAULT 1
        );
      `);
      tablaVerificada = true;
    } catch (error) {
      throw error;
    }
  }

  // Listar todas las maestrías activas (Soft Delete)
  static async listarTodos() {
    try {
      await this.asegurarTabla();
      const request = new sql.Request(pool);
      const resultado = await request.query(`
        SELECT id, name, description, duration, credits, iduser, date, status
        FROM masters
        WHERE status = 1
        ORDER BY name ASC
      `);

      return resultado.recordset;
    } catch (error) {
      throw error;
    }
  }

  // Obtener una maestría por ID
  static async obtenerPorId(id) {
    try {
      await this.asegurarTabla();
      const request = new sql.Request(pool);
      request.input('id', sql.Int, id);

      const resultado = await request.query(`
        SELECT id, name, description, duration, credits, iduser, date, status
        FROM masters
        WHERE id = @id
      `);

      return resultado.recordset[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Crear una nueva maestría
  static async crear(datos) {
    try {
      await this.asegurarTabla();
      const { name, description = null, duration, credits = null, iduser = 1, status = 1 } = datos;

      if (!name || duration === undefined || duration === null || duration === '') {
        throw new Error('Faltan campos requeridos: name, duration');
      }

      const duracionNum = parseInt(duration, 10);
      if (isNaN(duracionNum) || duracionNum < 1) {
        throw new Error('La duración debe ser un número de semestres válido');
      }

      const creditosNum = credits === null || credits === '' ? null : parseInt(credits, 10);

      const request = new sql.Request(pool);
      request.input('name', sql.NVarChar, name.trim());
      request.input('description', sql.NVarChar, description ? String(description).trim() : null);
      request.input('duration', sql.Int, duracionNum);
      request.input('credits', sql.Int, creditosNum);
      request.input('iduser', sql.Int, iduser);
      request.input('status', sql.Int, status);

      const resultado = await request.query(`
        INSERT INTO masters (name, description, duration, credits, iduser, date, status)
        VALUES (@name, @description, @duration, @credits, @iduser, GETDATE(), @status);
        SELECT SCOPE_IDENTITY() AS id;
      `);

      return {
        id: resultado.recordset[0].id,
        name: name.trim(),
        description,
        duration: duracionNum,
        credits: creditosNum,
        iduser,
        status
      };
    } catch (error) {
      throw error;
    }
  }

  // Actualizar una maestría
  static async actualizar(id, datos) {
    try {
      await this.asegurarTabla();
      const maestriaExistente = await this.obtenerPorId(id);
      if (!maestriaExistente) {
        throw new Error('Maestría no encontrada');
      }

      const { name, description, duration, credits, status } = datos;

      let duracionNum = maestriaExistente.duration;
      if (duration !== undefined && duration !== null && duration !== '') {
        duracionNum = parseInt(duration, 10);
        if (isNaN(duracionNum) || duracionNum < 1) {
          throw new Error('La duración debe ser un número de semestres válido');
        }
      }

      let creditosNum = maestriaExistente.credits;
      if (credits !== undefined) {
        creditosNum = credits === null || credits === '' ? null : parseInt(credits, 10);
      }

      const request = new sql.Request(pool);
      request.input('id', sql.Int, id);
      request.input('name', sql.NVarChar, name ? name.trim() : maestriaExistente.name);
      request.input('description', sql.NVarChar, description !== undefined ? (description ? String(description).trim() : null) : maestriaExistente.description);
      request.input('duration', sql.Int, duracionNum);
      request.input('credits', sql.Int, creditosNum);
      request.input('status', sql.Int, status !== undefined ? status : maestriaExistente.status);

      await request.query(`
        UPDATE masters
        SET
          name = @name,
          description = @description,
          duration = @duration,
          credits = @credits,
          status = @status
        WHERE id = @id
      `);

      return {
        id,
        name: name ? name.trim() : maestriaExistente.name,
        description: description !== undefined ? description : maestriaExistente.description,
        duration: duracionNum,
        credits: creditosNum,
        status: status !== undefined ? status : maestriaExistente.status
      };
    } catch (error) {
      throw error;
    }
  }

  // Eliminar una maestría (Soft Delete / Desactivación)
  static async eliminar(id) {
    try {
      await this.asegurarTabla();
      const maestria = await this.obtenerPorId(id);
      if (!maestria) {
        throw new Error('Maestría no encontrada');
      }

      const request = new sql.Request(pool);
      request.input('id', sql.Int, id);

      await request.query(`UPDATE masters SET status = 0 WHERE id = @id`);

      return {
        id,
        name: maestria.name,
        mensaje: `La maestría "${maestria.name}" ha sido desactivada exitosamente.`
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Master;
