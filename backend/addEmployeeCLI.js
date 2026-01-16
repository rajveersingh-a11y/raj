const db = require('./database');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function addEmployeeInteractive() {
  try {
    // Initialize database
    await db.init();
    console.log('Database initialized...\n');
    console.log('Enter employee details (press Enter to skip optional fields):\n');

    // Get employee details
    const employeeId = await question('Employee ID: ');
    const fullName = await question('Full Name: ');
    const email = await question('Email: ');
    const department = await question('Department: ');

    // Use defaults if empty
    const empId = employeeId.trim() || `EMP${Date.now()}`;
    const name = fullName.trim() || 'Unknown';
    const empEmail = email.trim() || '';
    const dept = department.trim() || 'General';

    console.log('\nAdding employee...');
    
    try {
      const employee = await db.addEmployee(empId, name, empEmail, dept);
      console.log('\n✅ Employee added successfully!');
      console.log('Details:');
      console.log(`  Employee ID: ${employee.employee_id}`);
      console.log(`  Full Name: ${employee.full_name}`);
      console.log(`  Email: ${employee.email}`);
      console.log(`  Department: ${employee.department}`);
    } catch (error) {
      console.error('\n❌ Error adding employee:', error.message);
    }

    // Ask if user wants to add more
    const addMore = await question('\nAdd another employee? (y/n): ');
    if (addMore.toLowerCase() === 'y' || addMore.toLowerCase() === 'yes') {
      console.log('\n' + '-'.repeat(50) + '\n');
      await addEmployeeInteractive();
    } else {
      console.log('\nDone!');
      await db.close();
      rl.close();
      process.exit(0);
    }
  } catch (error) {
    console.error('Fatal error:', error);
    await db.close();
    rl.close();
    process.exit(1);
  }
}

// Start interactive mode
console.log('='.repeat(50));
console.log('HRMS Lite - Add Employee Script');
console.log('='.repeat(50) + '\n');
addEmployeeInteractive();
