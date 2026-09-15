import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

function Staff() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ name: '', role: '', department: '', contact: '', email: '' });
  const [editingId, setEditingId] = useState(null);

  const fetchEmployees = async () => {
    const res = await axios.get('http://localhost:5000/api/employees');
    setEmployees(res.data);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({ name: '', role: '', department: '', contact: '', email: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await axios.put(`http://localhost:5000/api/employees/${editingId}`, form);
    } else {
      await axios.post('http://localhost:5000/api/employees', form);
    }
    resetForm();
    fetchEmployees();
  };

  const handleEdit = (emp) => {
    setForm({
      name: emp.name || '',
      role: emp.role || '',
      department: emp.department || '',
      contact: emp.contact || '',
      email: emp.email || ''
    });
    setEditingId(emp._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this employee? This cannot be undone.')) return;
    await axios.delete(`http://localhost:5000/api/employees/${id}`);
    fetchEmployees();
  };

  const markAttendance = async (id, status) => {
    await axios.post(`http://localhost:5000/api/employees/${id}/attendance`, { status });
    alert(`Marked ${status} for today.`);
  };

  const updateStatus = async (id, status) => {
    await axios.put(`http://localhost:5000/api/employees/${id}`, { status });
    fetchEmployees();
  };

  const statusColor = {
    active: 'bg-green-100 text-green-700',
    'on-leave': 'bg-yellow-100 text-yellow-700',
    terminated: 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h3 className="font-semibold text-gray-800 mb-4">
            {editingId ? 'Edit Employee' : 'Add New Employee'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input name="name" placeholder="Full name" value={form.name} onChange={handleChange} required
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <input name="role" placeholder="Role (e.g. Nurse, Receptionist)" value={form.role} onChange={handleChange} required
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <input name="department" placeholder="Department" value={form.department} onChange={handleChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <input name="contact" placeholder="Contact number" value={form.contact} onChange={handleChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <input name="email" placeholder="Email" value={form.email} onChange={handleChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 sm:col-span-2" />
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2 rounded-lg transition">
              {editingId ? 'Save Changes' : 'Add Employee'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-5 py-2 rounded-lg transition">
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Attendance</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp._id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-800">{emp.name}</td>
                  <td className="px-4 py-3 text-gray-600">{emp.role}</td>
                  <td className="px-4 py-3 text-gray-600">{emp.department || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{emp.contact || '-'}</td>
                  <td className="px-4 py-3">
                    <select
                      value={emp.status}
                      onChange={(e) => updateStatus(emp._id, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${statusColor[emp.status]}`}
                    >
                      <option value="active">active</option>
                      <option value="on-leave">on-leave</option>
                      <option value="terminated">terminated</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <button onClick={() => markAttendance(emp._id, 'present')} className="text-green-600 hover:text-green-800 text-xs font-medium">
                      Present
                    </button>
                    <button onClick={() => markAttendance(emp._id, 'absent')} className="text-red-600 hover:text-red-800 text-xs font-medium">
                      Absent
                    </button>
                  </td>
                  <td className="px-4 py-3 space-x-3">
                    <button onClick={() => handleEdit(emp)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(emp._id)} className="text-red-600 hover:text-red-800 text-sm font-medium">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Staff;