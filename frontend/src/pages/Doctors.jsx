import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

function Doctors() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ name: '', department: '', specialization: '', contact: '', schedule: '' });
  const [editingId, setEditingId] = useState(null);

  const fetchDoctors = async () => {
    const res = await axios.get('http://localhost:5000/api/doctors');
    setDoctors(res.data);
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({ name: '', department: '', specialization: '', contact: '', schedule: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await axios.put(`http://localhost:5000/api/doctors/${editingId}`, form);
    } else {
      await axios.post('http://localhost:5000/api/doctors', form);
    }
    resetForm();
    fetchDoctors();
  };

  const handleEdit = (d) => {
    setForm({
      name: d.name || '',
      department: d.department || '',
      specialization: d.specialization || '',
      contact: d.contact || '',
      schedule: d.schedule || ''
    });
    setEditingId(d._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this doctor? This cannot be undone.')) return;
    await axios.delete(`http://localhost:5000/api/doctors/${id}`);
    fetchDoctors();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h3 className="font-semibold text-gray-800 mb-4">
            {editingId ? 'Edit Doctor' : 'Add New Doctor'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input name="name" placeholder="Doctor's name" value={form.name} onChange={handleChange} required
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <input name="department" placeholder="Department" value={form.department} onChange={handleChange} required
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <input name="specialization" placeholder="Specialization" value={form.specialization} onChange={handleChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <input name="contact" placeholder="Contact number" value={form.contact} onChange={handleChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <input name="schedule" placeholder="Schedule (e.g. Mon-Fri 9AM-5PM)" value={form.schedule} onChange={handleChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 sm:col-span-2" />
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2 rounded-lg transition">
              {editingId ? 'Save Changes' : 'Add Doctor'}
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
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Specialization</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Schedule</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((d) => (
                <tr key={d._id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-800">{d.name}</td>
                  <td className="px-4 py-3 text-gray-600">{d.department}</td>
                  <td className="px-4 py-3 text-gray-600">{d.specialization}</td>
                  <td className="px-4 py-3 text-gray-600">{d.contact}</td>
                  <td className="px-4 py-3 text-gray-600">{d.schedule}</td>
                  <td className="px-4 py-3 space-x-3">
                    <button onClick={() => handleEdit(d)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(d._id)} className="text-red-600 hover:text-red-800 text-sm font-medium">
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

export default Doctors;