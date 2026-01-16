const db = require('./database');

// Sample employees data - you can modify this array
const employees = [
  {
    employeeId: 'EMP001',
    fullName: 'John Doe',
    email: 'john.doe@company.com',
    department: 'Engineering'
  },
  {
    employeeId: 'EMP002',
    fullName: 'Jane Smith',
    email: 'jane.smith@company.com',
    department: 'Marketing'
  },
  {
    employeeId: 'EMP003',
    fullName: 'Bob Johnson',
    email: 'bob.johnson@company.com',
    department: 'Sales'
  },
  {
    employeeId: 'EMP004',
    fullName: 'Alice Williams',
    email: 'alice.williams@company.com',
    department: 'HR'
  },
  {
    employeeId: 'EMP005',
    fullName: 'Charlie Brown',
    email: 'charlie.brown@company.com',
    department: 'Finance'
  }
];

async function addEmployees() {
  try {
    // Initialize database
    await db.init();
    console.log('Database initialized...\n');

    let addedCount = 0;
    let skippedCount = 0;

    for (const employee of employees) {
      try {
        // Check if employee already exists
        const existing = await db.getEmployeeById(employee.employeeId);
        
        if (existing) {
          console.log(`⚠️  Employee ${employee.employeeId} already exists - Skipping`);
          skippedCount++;
          continue;
        }

        // Add employee
        await db.addEmployee(
          employee.employeeId,
          employee.fullName,
          employee.email,
          employee.department
        );
        
        console.log(`✅ Added: ${employee.employeeId} - ${employee.fullName} (${employee.department})`);
        addedCount++;
      } catch (error) {
        console.error(`❌ Error adding ${employee.employeeId}:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`Summary:`);
    console.log(`  ✅ Added: ${addedCount} employees`);
    console.log(`  ⚠️  Skipped: ${skippedCount} employees`);
    console.log('='.repeat(50));

    // Close database connection
    await db.close();
    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
addEmployees();
