# HRMS Lite - Full-Stack Human Resource Management System

A lightweight, production-ready Human Resource Management System built with React frontend and Node.js/Express backend. This application demonstrates end-to-end full-stack development with clean architecture, proper validation, error handling, and a professional UI.

## Features

### Employee Management
- ✅ Add new employees with unique Employee ID, Full Name, Email, and Department
- ✅ View list of all employees in a clean table format
- ✅ Delete employees with confirmation
- ✅ Server-side validation for required fields and email format
- ✅ Duplicate Employee ID prevention

### Attendance Management
- ✅ Mark attendance for employees (Present/Absent)
- ✅ View attendance records per employee
- ✅ Date-based attendance tracking
- ✅ Prevent duplicate attendance entries for the same date
- ✅ Professional status badges (Green for Present, Red for Absent)

### UI/UX Features
- ✅ Modern, responsive design with Tailwind CSS
- ✅ Loading states for async operations
- ✅ Empty states with helpful messages
- ✅ Error handling with clear error messages
- ✅ Success notifications
- ✅ Intuitive navigation with tab-based interface
- ✅ Form validation with inline error messages

## Tech Stack

### Frontend
- **React 18** - UI library
- **Tailwind CSS** - Styling framework
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite** - Database (no external setup required)
- **express-validator** - Request validation

## Project Structure

```
HRMS01/
├── backend/
│   ├── server.js          # Express server and API routes
│   ├── database.js         # SQLite database operations
│   ├── package.json        # Backend dependencies
│   └── .gitignore
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── EmployeeManagement.js
│   │   │   └── AttendanceManagement.js
│   │   ├── services/
│   │   │   └── api.js      # API service layer
│   │   ├── App.js          # Main app component
│   │   ├── index.js        # React entry point
│   │   └── index.css       # Global styles with Tailwind
│   ├── package.json        # Frontend dependencies
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## Setup Instructions

### Prerequisites
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**

### Step 1: Clone/Download the Project
Navigate to the project directory:
```bash
cd HRMS01
```

### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 3: Install Frontend Dependencies
Open a new terminal window and navigate to the frontend directory:
```bash
cd frontend
npm install
```

### Step 4: Start the Backend Server
From the `backend` directory:
```bash
npm start
```

The backend server will start on `http://localhost:5000`

You should see:
```
Connected to SQLite database
Server is running on http://localhost:5000
```

**Note:** The SQLite database (`hrms.db`) will be automatically created in the `backend` directory on first run.

### Step 5: Start the Frontend Development Server
From the `frontend` directory (in a new terminal):
```bash
npm start
```

The frontend will start on `http://localhost:3000` and automatically open in your browser.

## API Endpoints

### Employee Management

#### Get All Employees
```
GET /api/employees
Response: { success: true, data: [...] }
```

#### Add Employee
```
POST /api/employees
Body: {
  employeeId: string,
  fullName: string,
  email: string,
  department: string
}
Response: { success: true, data: {...}, message: "..." }
```

#### Delete Employee
```
DELETE /api/employees/:employeeId
Response: { success: true, message: "..." }
```

### Attendance Management

#### Get Attendance Records for Employee
```
GET /api/attendance/:employeeId
Response: { success: true, data: [...] }
```

#### Mark Attendance
```
POST /api/attendance
Body: {
  employeeId: string,
  date: string (YYYY-MM-DD),
  status: "Present" | "Absent"
}
Response: { success: true, data: {...}, message: "..." }
```

#### Get All Attendance Records
```
GET /api/attendance
Response: { success: true, data: [...] }
```

### Health Check
```
GET /api/health
Response: { success: true, message: "Server is running" }
```

## Database Schema

### Employees Table
- `employee_id` (TEXT, PRIMARY KEY)
- `full_name` (TEXT, NOT NULL)
- `email` (TEXT, NOT NULL)
- `department` (TEXT, NOT NULL)
- `created_at` (DATETIME)

### Attendance Table
- `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
- `employee_id` (TEXT, FOREIGN KEY)
- `date` (TEXT, NOT NULL)
- `status` (TEXT, CHECK: 'Present' | 'Absent')
- `created_at` (DATETIME)
- UNIQUE constraint on (employee_id, date)

## Validation Rules

### Employee
- Employee ID: Required, must be unique
- Full Name: Required
- Email: Required, must be valid email format
- Department: Required

### Attendance
- Employee ID: Required, must exist in employees table
- Date: Required, format YYYY-MM-DD
- Status: Required, must be "Present" or "Absent"
- Cannot mark attendance twice for the same employee on the same date

## Error Handling

The application handles errors gracefully with:
- **400 Bad Request** - Validation errors
- **404 Not Found** - Resource not found
- **409 Conflict** - Duplicate entries
- **500 Internal Server Error** - Server errors

All errors return a consistent format:
```json
{
  "success": false,
  "message": "Error message",
  "errors": [...] // Optional validation errors
}
```

## Development

### Running in Development Mode

**Backend with auto-reload:**
```bash
cd backend
npm run dev  # Requires nodemon (installed as dev dependency)
```

**Frontend:**
The React app runs in development mode with hot-reload by default when using `npm start`.

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
```

This creates an optimized production build in the `frontend/build` directory.

## Troubleshooting

### Backend Issues

1. **Port 5000 already in use:**
   - Change the PORT in `backend/server.js` or set environment variable: `PORT=5001 npm start`

2. **Database errors:**
   - Delete `backend/hrms.db` and restart the server to recreate the database

3. **Module not found errors:**
   - Make sure you've run `npm install` in the backend directory

### Frontend Issues

1. **Port 3000 already in use:**
   - React will automatically suggest using port 3001

2. **Cannot connect to backend:**
   - Ensure the backend server is running on port 5000
   - Check `frontend/src/services/api.js` for the correct API URL
   - For production, set `REACT_APP_API_URL` environment variable

3. **Tailwind styles not working:**
   - Make sure Tailwind CSS is installed: `npm install -D tailwindcss postcss autoprefixer`
   - Verify `tailwind.config.js` and `postcss.config.js` are configured correctly

## Future Enhancements (Out of Scope)

- User authentication and authorization
- Leave management
- Payroll system
- Employee profiles with photos
- Advanced reporting and analytics
- Export functionality (CSV, PDF)
- Email notifications
- Multi-admin support

## License

This project is created for demonstration purposes.

## Author

Built as a full-stack development demonstration project.

---

**Note:** This is a lightweight HRMS system designed for demonstration. For production use, consider adding authentication, authorization, data encryption, and additional security measures.
