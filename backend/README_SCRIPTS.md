# Employee Addition Scripts

This directory contains several scripts to add employees to the HRMS Lite system.

## Available Scripts

### 1. `addEmployees.js` - Bulk Add Employees (Direct Database)
Adds multiple employees directly to the database.

**Usage:**
```bash
npm run add-employees
# or
node addEmployees.js
```

**Features:**
- Adds employees from a predefined array
- Skips employees that already exist
- Works directly with the database (no server needed)
- Fast and efficient for bulk operations

**To customize:** Edit the `employees` array in `addEmployees.js`

---

### 2. `addEmployeeCLI.js` - Interactive CLI (Direct Database)
Interactive command-line interface to add employees one by one.

**Usage:**
```bash
npm run add-employee
# or
node addEmployeeCLI.js
```

**Features:**
- Interactive prompts for each field
- Can add multiple employees in one session
- Works directly with the database (no server needed)
- User-friendly interface

---

### 3. `addEmployeeAPI.js` - Bulk Add via API
Adds multiple employees through the REST API (requires server to be running).

**Usage:**
```bash
npm run add-employees-api
# or
node addEmployeeAPI.js
```

**Features:**
- Uses the REST API (tests the full stack)
- Requires backend server to be running
- Adds employees from a predefined array
- Good for testing the API endpoints

**To customize:** Edit the `employees` array in `addEmployeeAPI.js`

---

## Quick Start

### Option 1: Quick Bulk Add (No Server Required)
```bash
cd backend
npm run add-employees
```

### Option 2: Interactive Add (No Server Required)
```bash
cd backend
npm run add-employee
```

### Option 3: Add via API (Server Required)
```bash
# Terminal 1: Start the server
cd backend
npm start

# Terminal 2: Run the script
cd backend
npm run add-employees-api
```

---

## Customizing Employee Data

### For `addEmployees.js` and `addEmployeeAPI.js`:

Edit the `employees` array in the script file:

```javascript
const employees = [
  {
    employeeId: 'EMP001',
    fullName: 'Your Name',
    email: 'your.email@company.com',
    department: 'Your Department'
  },
  // Add more employees...
];
```

---

## Notes

- All scripts handle empty fields gracefully (uses defaults)
- Duplicate employee IDs are allowed (validation removed)
- Scripts automatically close database connections when done
- The API script checks if the server is running before proceeding
