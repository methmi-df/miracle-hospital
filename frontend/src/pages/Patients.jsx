import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

function Patients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({ name: '', dob: '', gender: 'male', contact: '', address: '', medicalHistory: '' });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');

  const fetchPatients = async () => {
    const res = await axios.get('http://localhost:5000/api/patients');
    setPatients(res.data);
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({ name: '', dob: '', gender: 'male', contact: '', address: '', medicalHistory: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/patients/${editingId}`, form);
      } else {
        await axios.post('http://localhost:5000/api/patients', form);
      }
      resetForm();
      fetchPatients();
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  const handleEdit = (p) => {
    setForm({
      name: p.name || '',
      dob: p.dob ? p.dob.substring(0, 10) : '',
      gender: p.gender || 'male',
      contact: p.contact || '',
      address: p.address || '',
      medicalHistory: p.medicalHistory || ''
    });
    setEditingId(p._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this patient? This cannot be undone.')) return;
    await axios.delete(`http://localhost:5000/api/patients/${id}`);
    fetchPatients();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h3 className="font-semibold text-gray-800 mb-4">
            {editingId ? 'Edit Patient' : 'Add New Patient'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input name="name" placeholder="Full name" value={form.name} onChange={handleChange} required
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <input name="dob" type="date" value={form.dob} onChange={handleChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <select name="gender" value={form.gender} onChange={handleChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <input name="contact" placeholder="Contact number" value={form.contact} onChange={handleChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <input name="address" placeholder="Address" value={form.address} onChange={handleChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <input name="medicalHistory" placeholder="Medical history" value={form.medicalHistory} onChange={handleChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2 rounded-lg transition">
              {editingId ? 'Save Changes' : 'Add Patient'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-5 py-2 rounded-lg transition">
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="mb-4">
          <input
            placeholder="Search patients by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-80 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">DOB</th>
                <th className="px-4 py-3">Gender</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients
                .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
                .map((p) => (
                <tr key={p._id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                  <td className="px-4 py-3 text-gray-600">{p.dob ? new Date(p.dob).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{p.gender}</td>
                  <td className="px-4 py-3 text-gray-600">{p.contact}</td>
                  <td className="px-4 py-3 text-gray-600">{p.address}</td>
                  <td className="px-4 py-3 space-x-3">
                    <button
                      onClick={() => navigate(`/patients/${p._id}/records`)}
                      className="text-teal-600 hover:text-teal-800 text-sm font-medium"
                    >
                      Records
                    </button>
                    <button
                      onClick={() => handleEdit(p)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
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

export default Patients;