import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import AppLayout from '../components/AppLayout';
import {
  Calendar,
  Clock,
  Plus,
  CheckCircle,
  XCircle,
  Trash2,
  Filter,
  User,
  Stethoscope,
  Edit3,
  CalendarDays,
  X
} from 'lucide-react';

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ patient: '', doctor: '', date: '', time: '' });
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [rescheduleModalAppt, setRescheduleModalAppt] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({ date: '', time: '' });
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  const fetchAll = async () => {
    try {
      const [apptRes, patRes, docRes] = await Promise.all([
        axios.get(`${API_URL}/api/appointments`),
        axios.get(`${API_URL}/api/patients`),
        axios.get(`${API_URL}/api/doctors`),
      ]);
      setAppointments(apptRes.data);
      setPatients(patRes.data);
      setDoctors(docRes.data);
    } catch (err) {
      console.error('Error fetching appointment data:', err);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/appointments`, form);
      setForm({ patient: '', doctor: '', date: '', time: '' });
      setShowForm(false);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to book appointment.');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API_URL}/api/appointments/${id}`, { status });
      fetchAll();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const openRescheduleModal = (appt) => {
    setRescheduleModalAppt(appt);
    setRescheduleForm({
      date: appt.date ? appt.date.substring(0, 10) : '',
      time: appt.time || '10:00 AM'
    });
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleModalAppt) return;
    setRescheduleLoading(true);
    try {
      await axios.put(`${API_URL}/api/appointments/${rescheduleModalAppt._id}`, {
        date: rescheduleForm.date,
        time: rescheduleForm.time,
        status: 'scheduled'
      });
      setRescheduleModalAppt(null);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reschedule appointment.');
    } finally {
      setRescheduleLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this appointment? This cannot be undone.')) return;
    try {
      await axios.delete(`${API_URL}/api/appointments/${id}`);
      fetchAll();
    } catch (err) {
      alert('Failed to delete appointment');
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
      case 'confirmed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
      case 'waiting':
        return 'bg-amber-50 text-amber-700 border-amber-200/60';
      case 'in progress':
        return 'bg-blue-50 text-blue-700 border-blue-200/60';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200/60';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    if (statusFilter === 'all') return true;
    return a.status === statusFilter;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Appointment Scheduling
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Organize, book, and monitor patient consultations with doctors.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer shrink-0"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
            <span>{showForm ? 'Close Booking' : 'Book Appointment'}</span>
          </button>
        </div>

        {/* Booking Form Card */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 animate-in fade-in duration-150"
          >
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Schedule Consultation</h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Patient</label>
                <select
                  name="patient"
                  value={form.patient}
                  onChange={handleChange}
                  required
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                >
                  <option value="">Choose patient</option>
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Doctor</label>
                <select
                  name="doctor"
                  value={form.doctor}
                  onChange={handleChange}
                  required
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                >
                  <option value="">Choose doctor</option>
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Time</label>
                <input
                  name="time"
                  type="text"
                  placeholder=""
                  value={form.time}
                  onChange={handleChange}
                  required
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-slate-100">
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

        {/* Filter Pills */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['all', 'scheduled', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition cursor-pointer ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200/90 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {status === 'all' ? 'All Appointments' : status}
              </button>
            ))}
          </div>

          <span className="text-xs font-medium text-slate-400 shrink-0">
            {filteredAppointments.length} record(s)
          </span>
        </div>

        {/* Appointments Table Card */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Patient</th>
                  <th className="px-4 py-3.5">Doctor & Dept</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Time</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-10 text-center text-slate-400">
                      No appointments matching the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((a, idx) => {
                    const patientName = a.patient?.name || 'Unknown Patient';
                    const initials = patientName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase();

                    return (
                      <tr key={a._id} className="hover:bg-slate-50/70 transition group">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                              {initials}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 group-hover:text-blue-600 transition">
                                {patientName}
                              </p>
                              <p className="text-[11px] text-slate-400">{a.patient?.contact || '—'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-slate-800">{a.doctor?.name || '—'}</p>
                          <p className="text-[11px] text-slate-400">{a.doctor?.department || 'General'}</p>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 font-medium">
                          {new Date(a.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{a.time}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                              a.status
                            )}`}
                          >
                            {a.status?.charAt(0).toUpperCase() + a.status?.slice(1)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right space-x-1.5">
                          {a.status === 'scheduled' && (
                            <>
                              <button
                                onClick={() => openRescheduleModal(a)}
                                className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/60 rounded-lg transition"
                                title="Reschedule Date/Time"
                              >
                                Reschedule
                              </button>
                              <button
                                onClick={() => updateStatus(a._id, 'completed')}
                                className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 rounded-lg transition"
                              >
                                Complete
                              </button>
                              <button
                                onClick={() => updateStatus(a._id, 'cancelled')}
                                className="px-2.5 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 rounded-lg transition"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(a._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Reschedule Modal */}
      {rescheduleModalAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Reschedule Appointment</h3>
              </div>
              <button
                type="button"
                onClick={() => setRescheduleModalAppt(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Rescheduling for patient <strong className="text-slate-800">{rescheduleModalAppt.patient?.name}</strong> with <strong className="text-slate-800">Dr. {rescheduleModalAppt.doctor?.name}</strong>.
            </p>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Appointment Date</label>
                <input
                  type="date"
                  required
                  value={rescheduleForm.date}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, date: e.target.value })}
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Consultation Time Slot</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 11:30 AM"
                  value={rescheduleForm.time}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, time: e.target.value })}
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRescheduleModalAppt(null)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rescheduleLoading}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition shadow-md shadow-blue-500/20"
                >
                  {rescheduleLoading ? 'Saving...' : 'Confirm Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

export default Appointments;