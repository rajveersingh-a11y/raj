const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

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

async function addEmployeesViaAPI() {
  try {
    // Check if server is running
    try {
      await axios.get(`${API_BASE_URL}/health`);
      console.log('✅ Backend server is running...\n');
    } catch (error) {
      console.error('❌ Error: Backend server is not running!');
      console.error('   Please start the server first: npm start');
      process.exit(1);
    }

    let addedCount = 0;
    let errorCount = 0;

    for (const employee of employees) {
      try {
        const response = await axios.post(`${API_BASE_URL}/employees`, employee);
        
        if (response.data.success) {
          console.log(`✅ Added: ${employee.employeeId} - ${employee.fullName} (${employee.department})`);
          addedCount++;
        } else {
          console.log(`⚠️  ${employee.employeeId}: ${response.data.message}`);
        }
      } catch (error) {
        if (error.response) {
          console.error(`❌ Error adding ${employee.employeeId}: ${error.response.data.message || error.message}`);
        } else {
          console.error(`❌ Error adding ${employee.employeeId}: ${error.message}`);
        }
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`Summary:`);
    console.log(`  ✅ Added: ${addedCount} employees`);
    console.log(`  ❌ Errors: ${errorCount} employees`);
    console.log('='.repeat(50));

    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the script
console.log('='.repeat(50));
console.log('HRMS Lite - Add Employees via API');
console.log('='.repeat(50) + '\n');
addEmployeesViaAPI();
