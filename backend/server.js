const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ==================== EMPLOYEE ROUTES ====================

// Get all employees
app.get('/api/employees', async (req, res) => {
  try {
    const employees = await db.getAllEmployees();
    res.json({ success: true, data: employees });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch employees', error: error.message });
  }
});

// Add new employee
app.post('/api/employees', async (req, res) => {
  try {
    const { employeeId, fullName, email, department } = req.body;
    
    // Validate required fields
    if (!fullName || fullName.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'Full name is required' 
      });
    }

    // Use defaults if fields are empty
    const empId = employeeId || `EMP${Date.now()}`;
    const name = fullName.trim();
    const empEmail = email ? email.trim() : '';
    const dept = department ? department.trim() : 'General';

    // Check if employee ID already exists
    const existing = await db.getEmployeeById(empId);
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: `Employee with ID ${empId} already exists` 
      });
    }

    const employee = await db.addEmployee(empId, name, empEmail, dept);
    res.status(201).json({ success: true, data: employee, message: 'Employee added successfully' });
  } catch (error) {
    // Handle PostgreSQL duplicate key error
    if (error.code === '23505' || error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Employee ID already exists',
        error: error.message 
      });
    }
    
    // Handle other database errors
    console.error('Error adding employee:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add employee', 
      error: error.message 
    });
  }
});

// Update employee
app.put('/api/employees/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { fullName, email, department } = req.body;
    
    // Validate required fields
    if (!fullName || fullName.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'Full name is required' 
      });
    }

    // Check if employee exists
    const existing = await db.getEmployeeById(employeeId);
    if (!existing) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found' 
      });
    }

    const name = fullName.trim();
    const empEmail = email ? email.trim() : '';
    const dept = department ? department.trim() : 'General';

    const employee = await db.updateEmployee(employeeId, name, empEmail, dept);
    res.json({ success: true, data: employee, message: 'Employee updated successfully' });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update employee', 
      error: error.message 
    });
  }
});

// Delete employee
app.delete('/api/employees/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    const employee = await db.getEmployeeById(employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    await db.deleteEmployee(employeeId);
    res.json({ success: true, message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete employee', error: error.message });
  }
});

// ==================== ATTENDANCE ROUTES ====================

// Get attendance records for an employee
app.get('/api/attendance/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    const records = await db.getAttendanceRecords(employeeId);
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch attendance records', error: error.message });
  }
});

// Mark attendance
app.post('/api/attendance', async (req, res) => {
  try {
    const { employeeId, date, status } = req.body;
    
    // Validate required fields
    if (!employeeId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Employee ID is required' 
      });
    }

    if (!date) {
      return res.status(400).json({ 
        success: false, 
        message: 'Date is required' 
      });
    }

    // Check if employee exists (required for foreign key constraint)
    const employee = await db.getEmployeeById(employeeId);
    if (!employee) {
      return res.status(400).json({ 
        success: false, 
        message: `Employee with ID ${employeeId} does not exist` 
      });
    }

    // Use defaults if status is empty
    const attendanceStatus = status || 'Present';

    // Check if attendance already exists for this employee and date
    const existing = await db.getAttendanceByDate(employeeId, date);
    
    if (existing) {
      // Update existing record
      const record = await db.updateAttendance(existing.id, attendanceStatus);
      return res.status(200).json({ 
        success: true, 
        data: record, 
        message: 'Attendance updated successfully' 
      });
    } else {
      // Create new record
      const record = await db.markAttendance(employeeId, date, attendanceStatus);
      return res.status(201).json({ 
        success: true, 
        data: record, 
        message: 'Attendance marked successfully' 
      });
    }
  } catch (error) {
    console.error('Error marking attendance:', error);
    
    // Handle foreign key constraint violation
    if (error.code === '23503' || error.message.includes('foreign key') || error.message.includes('violates foreign key constraint')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Employee does not exist. Please select a valid employee.' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark attendance', 
      error: error.message 
    });
  }
});

// Get all attendance records (for admin view)
app.get('/api/attendance', async (req, res) => {
  try {
    const records = await db.getAllAttendanceRecords();
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch attendance records', error: error.message });
  }
});

// Update attendance record
app.put('/api/attendance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Status is required' 
      });
    }

    const record = await db.updateAttendance(id, status);
    if (!record) {
      return res.status(404).json({ 
        success: false, 
        message: 'Attendance record not found' 
      });
    }

    res.json({ success: true, data: record, message: 'Attendance updated successfully' });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update attendance', 
      error: error.message 
    });
  }
});

// Delete attendance record
app.delete('/api/attendance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await db.deleteAttendanceById(id);
    if (!deleted) {
      return res.status(404).json({ 
        success: false, 
        message: 'Attendance record not found' 
      });
    }

    res.json({ success: true, message: 'Attendance record deleted successfully' });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete attendance', 
      error: error.message 
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Initialize database and start server
db.init()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
