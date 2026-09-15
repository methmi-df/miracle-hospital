import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

function Appointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ patient: '', doctor: '', date: '', time: '' });

  const fetchAll = async () => {
    const [apptRes, patRes, docRes] = await Promise.all([
      axios.get('http://localhost:5000/api/appointments'),
      axios.get('http://localhost:5000/api/patients'),
      axios.get('http://localhost:5000/api/doctors'),
    ]);
    setAppointments(apptRes.data);
    setPatients(patRes.data);
    setDoctors(docRes.data);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/appointments', form);
      setForm({ patient: '', doctor: '', date: '', time: '' });
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to book appointment.');
    }
  };

  const updateStatus = async (id, status) => {
    await axios.put(`http://localhost:5000/api/appointments/${id}`, { status });
    fetchAll();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this appointment? This cannot be undone.')) return;
    await axios.delete(`http://localhost:5000/api/appointments/${id}`);
    fetchAll();
  };

  const statusColor = {
    scheduled: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h3 className="font-semibold text-gray-800 mb-4">Book New Appointment</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select name="patient" value={form.patient} onChange={handleChange} required
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="">Select patient</option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>

            <select name="doctor" value={form.doctor} onChange={handleChange} required
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="">Select doctor</option>
              {doctors.map((d) => (
                <option key={d._id} value={d._id}>{d.name} ({d.department})</option>
              ))}
            </select>

            <input name="date" type="date" value={form.date} onChange={handleChange} required
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />

            <input name="time" type="time" value={form.time} onChange={handleChange} required
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <button type="submit" className="mt-4 bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2 rounded-lg transition">
            Book Appointment
          </button>
        </form>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Doctor</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a._id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-800">{a.patient?.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{a.doctor?.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{new Date(a.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-gray-600">{a.time}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[a.status] || 'bg-gray-100 text-gray-600'}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 space-x-3">
                    {a.status === 'scheduled' && (
                      <>
                        <button onClick={() => updateStatus(a._id, 'completed')} className="text-green-600 hover:text-green-800 text-sm font-medium">
                          Complete
                        </button>
                        <button onClick={() => updateStatus(a._id, 'cancelled')} className="text-orange-600 hover:text-orange-800 text-sm font-medium">
                          Cancel
                        </button>
                      </>
                    )}
                    <button onClick={() => handleDelete(a._id)} className="text-red-600 hover:text-red-800 text-sm font-medium">
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

export default Appointments;