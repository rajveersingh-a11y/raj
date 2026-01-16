import React, { useState, useEffect } from 'react';
import { getEmployees, markAttendance, getAttendanceRecords, updateAttendance, deleteAttendance } from '../services/api';

const AttendanceManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present'
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [editingRecord, setEditingRecord] = useState(null);
  const [editFormData, setEditFormData] = useState({
    status: 'Present'
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchAttendanceRecords(selectedEmployee);
    } else {
      setAttendanceRecords([]);
    }
  }, [selectedEmployee]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getEmployees();
      if (response.success) {
        setEmployees(response.data);
      } else {
        setError('Failed to fetch employees');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch employees. Please check if the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceRecords = async (employeeId) => {
    try {
      setRecordsLoading(true);
      setError(null);
      const response = await getAttendanceRecords(employeeId);
      if (response.success) {
        setAttendanceRecords(response.data);
      } else {
        setError('Failed to fetch attendance records');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch attendance records');
    } finally {
      setRecordsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError(null);
      
      if (!formData.employeeId) {
        setError('Please select an employee');
        return;
      }

      const response = await markAttendance(formData);
      
      if (response.success) {
        setSuccessMessage('Attendance marked successfully!');
        setFormData({
          employeeId: '',
          date: new Date().toISOString().split('T')[0],
          status: 'Present'
        });
        setShowForm(false);
        
        // Refresh records if viewing that employee
        if (selectedEmployee === formData.employeeId) {
          fetchAttendanceRecords(formData.employeeId);
        }
        
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to mark attendance';
      setError(errorMsg);
      if (err.response?.data?.errors) {
        const validationErrors = {};
        err.response.data.errors.forEach(err => {
          if (err.param) {
            validationErrors[err.param] = err.msg;
          }
        });
        setFormErrors(validationErrors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setEditFormData({ status: record.status });
    setError(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError(null);
      
      const response = await updateAttendance(editingRecord.id, editFormData);
      
      if (response.success) {
        setSuccessMessage('Attendance updated successfully!');
        setEditingRecord(null);
        
        // Refresh records
        if (selectedEmployee) {
          fetchAttendanceRecords(selectedEmployee);
        }
        
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update attendance';
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this attendance record?')) {
      return;
    }

    try {
      setError(null);
      const response = await deleteAttendance(recordId);
      
      if (response.success) {
        setSuccessMessage('Attendance record deleted successfully!');
        
        // Refresh records
        if (selectedEmployee) {
          fetchAttendanceRecords(selectedEmployee);
        }
        
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete attendance record';
      setError(errorMsg);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div>
      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Header with Add Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Attendance Management</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setFormData({
              employeeId: selectedEmployee || '',
              date: new Date().toISOString().split('T')[0],
              status: 'Present'
            });
            setFormErrors({});
            setError(null);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          {showForm ? 'Cancel' : '+ Mark Attendance'}
        </button>
      </div>

      {/* Mark Attendance Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mark Attendance</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                  <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-1">
                    Employee
                  </label>
                <select
                  id="employeeId"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.employeeId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select an employee</option>
                  {employees.map((emp) => (
                    <option key={emp.employee_id} value={emp.employee_id}>
                      {emp.employee_id} - {emp.full_name}
                    </option>
                  ))}
                </select>
                {formErrors.employeeId && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.employeeId}</p>
                )}
              </div>

              <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.date && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.date}</p>
                )}
              </div>

              <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.status ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                </select>
                {formErrors.status && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.status}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Marking...' : 'Mark Attendance'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Employee Selector */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <label htmlFor="employeeSelect" className="block text-sm font-medium text-gray-700 mb-2">
          View Attendance Records
        </label>
        <select
          id="employeeSelect"
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select an employee to view records</option>
          {employees.map((emp) => (
            <option key={emp.employee_id} value={emp.employee_id}>
              {emp.employee_id} - {emp.full_name} ({emp.department})
            </option>
          ))}
        </select>
      </div>

      {/* Attendance Records */}
      {selectedEmployee && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {recordsLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading attendance records...</p>
            </div>
          ) : attendanceRecords.length === 0 ? (
            <div className="p-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No attendance records</h3>
              <p className="mt-1 text-sm text-gray-500">No attendance has been marked for this employee yet.</p>
            </div>
          ) : (
            <>
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Attendance Records
                  {selectedEmployee && employees.find(e => e.employee_id === selectedEmployee) && (
                    <span className="text-sm font-normal text-gray-600 ml-2">
                      - {employees.find(e => e.employee_id === selectedEmployee).full_name}
                    </span>
                  )}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendanceRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(record.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingRecord && editingRecord.id === record.id ? (
                            <form onSubmit={handleEditSubmit} className="flex items-center gap-2">
                              <select
                                value={editFormData.status}
                                onChange={(e) => setEditFormData({ status: e.target.value })}
                                className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="Present">Present</option>
                                <option value="Absent">Absent</option>
                              </select>
                              <button
                                type="submit"
                                disabled={submitting}
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 disabled:opacity-50"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingRecord(null)}
                                className="px-3 py-1 bg-gray-500 text-white text-xs rounded-md hover:bg-gray-600"
                              >
                                Cancel
                              </button>
                            </form>
                          ) : (
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                record.status === 'Present'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {record.status}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {editingRecord && editingRecord.id === record.id ? null : (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEdit(record)}
                                className="text-blue-600 hover:text-blue-900 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(record.id)}
                                className="text-red-600 hover:text-red-900 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {!selectedEmployee && !loading && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Select an employee</h3>
          <p className="mt-1 text-sm text-gray-500">Choose an employee from the dropdown above to view their attendance records.</p>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;
