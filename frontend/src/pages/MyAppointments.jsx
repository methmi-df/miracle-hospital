import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

function MyAppointments() {
  const navigate = useNavigate();
  const patientId = localStorage.getItem('patientId');
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ doctor: '', date: '', time: '' });

  const fetchAll = async () => {
    const [apptRes, docRes] = await Promise.all([
      axios.get('http://localhost:5000/api/appointments'),
      axios.get('http://localhost:5000/api/doctors'),
    ]);
    setAppointments(apptRes.data.filter((a) => a.patient?._id === patientId));
    setDoctors(docRes.data);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/appointments', { ...form, patient: patientId });
      setForm({ doctor: '', date: '', time: '' });
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to book appointment.');
    }
  };

  const statusColor = {
    scheduled: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h3 className="font-semibold text-gray-800 mb-4">Book New Appointment</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 sm:col-span-2" />
          </div>
          <button type="submit" className="mt-4 bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2 rounded-lg transition">
            Book Appointment
          </button>
        </form>

        <div className="space-y-3">
          {appointments.length === 0 && <p className="text-gray-400 text-sm">You have no appointments yet.</p>}
          {appointments.map((a) => (
            <div key={a._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-800">{a.doctor?.name}</p>
                <p className="text-sm text-gray-500">{new Date(a.date).toLocaleDateString()} at {a.time}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[a.status]}`}>
                {a.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MyAppointments;