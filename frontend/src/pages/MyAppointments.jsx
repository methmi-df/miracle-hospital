import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import AppLayout from '../components/AppLayout';
import {
  Calendar,
  Clock,
  Plus,
  Stethoscope,
  X
} from 'lucide-react';

function MyAppointments() {
  const patientId = localStorage.getItem('patientId');
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ doctor: '', date: '', time: '' });
  const [showForm, setShowForm] = useState(false);

  const fetchAll = async () => {
    try {
      const [apptRes, docRes] = await Promise.all([
        axios.get(`${API_URL}/api/appointments`),
        axios.get(`${API_URL}/api/doctors`),
      ]);
      setAppointments(apptRes.data.filter((a) => a.patient?._id === patientId));
      setDoctors(docRes.data);
    } catch (err) {
      console.error('Error fetching patient appointments:', err);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/appointments`, { ...form, patient: patientId });
      setForm({ doctor: '', date: '', time: '' });
      setShowForm(false);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to book appointment.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200/60';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200/60';
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              My Appointments
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              View your upcoming doctor consultations and schedule new visits.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer shrink-0"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
            <span>{showForm ? 'Close' : 'Book Consultation'}</span>
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 animate-in fade-in duration-150"
          >
            <h3 className="font-bold text-slate-900 text-sm mb-4">Book New Appointment</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Doctor</label>
                <select
                  name="doctor"
                  value={form.doctor}
                  onChange={handleChange}
                  required
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                >
                  <option value="">-- Choose Doctor --</option>
                  {doctors.map((d) => (
                    <option key={d._id} value={d._id}>{d.name} ({d.department})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                <input
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Time</label>
                <input
                  name="time"
                  placeholder="e.g. 11:00 AM"
                  value={form.time}
                  onChange={handleChange}
                  required
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer"
              >
                Confirm Booking
              </button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {appointments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/70 p-10 text-center text-xs text-slate-400">
              You have no appointments booked yet.
            </div>
          ) : (
            appointments.map((a) => (
              <div
                key={a._id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Dr. {a.doctor?.name} ({a.doctor?.department || 'Consultation'})
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>Date: {new Date(a.date).toLocaleDateString()}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {a.time}
                      </span>
                    </div>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                    a.status
                  )}`}
                >
                  {a.status?.charAt(0).toUpperCase() + a.status?.slice(1)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default MyAppointments;