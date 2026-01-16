const { Pool } = require('pg');

// Neon PostgreSQL connection string
const NEON_DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_Izn8iy9oDFKU@ep-bitter-frost-ahf72jwq-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

class Database {
  constructor() {
    this.pool = null;
  }

  init() {
    return new Promise((resolve, reject) => {
      try {
        this.pool = new Pool({
          connectionString: NEON_DATABASE_URL,
          ssl: {
            rejectUnauthorized: false
          }
        });

        // Test the connection
        this.pool.query('SELECT NOW()', (err, res) => {
          if (err) {
            console.error('Error connecting to PostgreSQL database:', err);
            reject(err);
          } else {
            console.log('Connected to Neon PostgreSQL database');
            this.createTables()
              .then(() => resolve())
              .catch(reject);
          }
        });
      } catch (error) {
        console.error('Error initializing database:', error);
        reject(error);
      }
    });
  }

  async createTables() {
    try {
      // Employees table
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS employees (
          employee_id TEXT PRIMARY KEY,
          full_name TEXT NOT NULL,
          email TEXT NOT NULL,
          department TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Attendance table
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS attendance (
          id SERIAL PRIMARY KEY,
          employee_id TEXT NOT NULL,
          date TEXT NOT NULL,
          status TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
        )
      `);

      console.log('Database tables created/verified');
    } catch (error) {
      console.error('Error creating tables:', error);
      throw error;
    }
  }

  // Employee methods
  async getAllEmployees() {
    try {
      const result = await this.pool.query('SELECT * FROM employees ORDER BY created_at DESC');
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  async getEmployeeById(employeeId) {
    try {
      const result = await this.pool.query('SELECT * FROM employees WHERE employee_id = $1', [employeeId]);
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  async addEmployee(employeeId, fullName, email, department) {
    try {
      const result = await this.pool.query(
        'INSERT INTO employees (employee_id, full_name, email, department) VALUES ($1, $2, $3, $4) RETURNING *',
        [employeeId, fullName, email, department]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async updateEmployee(employeeId, fullName, email, department) {
    try {
      const result = await this.pool.query(
        'UPDATE employees SET full_name = $1, email = $2, department = $3 WHERE employee_id = $4 RETURNING *',
        [fullName, email, department, employeeId]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  async deleteEmployee(employeeId) {
    try {
      const result = await this.pool.query('DELETE FROM employees WHERE employee_id = $1', [employeeId]);
      return result.rowCount > 0;
    } catch (error) {
      throw error;
    }
  }

  // Attendance methods
  async getAttendanceRecords(employeeId) {
    try {
      const result = await this.pool.query('SELECT * FROM attendance WHERE employee_id = $1 ORDER BY date DESC', [employeeId]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  async getAllAttendanceRecords() {
    try {
      const result = await this.pool.query(
        `SELECT a.*, e.full_name, e.department 
         FROM attendance a 
         JOIN employees e ON a.employee_id = e.employee_id 
         ORDER BY a.date DESC, e.full_name ASC`
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  async getAttendanceByDate(employeeId, date) {
    try {
      const result = await this.pool.query('SELECT * FROM attendance WHERE employee_id = $1 AND date = $2', [employeeId, date]);
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  async markAttendance(employeeId, date, status) {
    try {
      const result = await this.pool.query(
        'INSERT INTO attendance (employee_id, date, status) VALUES ($1, $2, $3) RETURNING *',
        [employeeId, date, status]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async updateAttendance(id, status) {
    try {
      const result = await this.pool.query(
        'UPDATE attendance SET status = $1 WHERE id = $2 RETURNING *',
        [status, id]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  async deleteAttendance(employeeId, date) {
    try {
      const result = await this.pool.query('DELETE FROM attendance WHERE employee_id = $1 AND date = $2', [employeeId, date]);
      return result.rowCount > 0;
    } catch (error) {
      throw error;
    }
  }

  async deleteAttendanceById(id) {
    try {
      const result = await this.pool.query('DELETE FROM attendance WHERE id = $1', [id]);
      return result.rowCount > 0;
    } catch (error) {
      throw error;
    }
  }

  async close() {
    try {
      if (this.pool) {
        await this.pool.end();
        console.log('Database connection closed');
      }
    } catch (error) {
      throw error;
    }
  }
}

// Create singleton instance
const db = new Database();

module.exports = db;
