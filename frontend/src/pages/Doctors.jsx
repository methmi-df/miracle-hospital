import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import AppLayout from '../components/AppLayout';
import {
  Stethoscope,
  Plus,
  Edit2,
  Trash2,
  Phone,
  Clock,
  Briefcase,
  X,
  Search
} from 'lucide-react';

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ name: '', department: '', specialization: '', contact: '', schedule: '' });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');

  const fetchDoctors = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/doctors`);
      setDoctors(res.data);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({ name: '', department: '', specialization: '', contact: '', schedule: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/api/doctors/${editingId}`, form);
      } else {
        await axios.post(`${API_URL}/api/doctors`, form);
      }
      resetForm();
      fetchDoctors();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving doctor record');
    }
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
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this doctor profile? This cannot be undone.')) return;
    try {
      await axios.delete(`${API_URL}/api/doctors/${id}`);
      fetchDoctors();
    } catch (err) {
      alert('Failed to delete doctor profile');
    }
  };

  const filteredDoctors = doctors.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.department.toLowerCase().includes(search.toLowerCase()) ||
      (d.specialization && d.specialization.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Medical Doctors Directory
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Manage clinical staff profiles, departments, and consultation rotas.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (showForm) resetForm();
              else setShowForm(true);
            }}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer shrink-0"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
            <span>{showForm ? 'Close Form' : 'Add New Doctor'}</span>
          </button>
        </div>

        {/* Doctor Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 animate-in fade-in duration-150"
          >
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingId ? 'Edit Doctor Profile' : 'Add Medical Doctor'}
              </h3>
              <button
                type="button"
                onClick={resetForm}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Doctor Name</label>
                <input
                  name="name"
                  placeholder=""
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                <input
                  name="department"
                  placeholder=""
                  value={form.department}
                  onChange={handleChange}
                  required
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Specialization</label>
                <input
                  name="specialization"
                  placeholder=""
                  value={form.specialization}
                  onChange={handleChange}
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                <input
                  name="contact"
                  placeholder=""
                  value={form.contact}
                  onChange={handleChange}
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Consultation Schedule</label>
                <input
                  name="schedule"
                  placeholder=""
                  value={form.schedule}
                  onChange={handleChange}
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer"
              >
                {editingId ? 'Save Profile' : 'Register Doctor'}
              </button>
            </div>
          </form>
        )}

        {/* Filter */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              placeholder="Search doctors by name or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-200/90 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition shadow-2xs"
            />
          </div>
          <span className="text-xs font-medium text-slate-400">
            {filteredDoctors.length} specialist(s) listed
          </span>
        </div>

        {/* Doctors Table */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Doctor</th>
                  <th className="px-4 py-3.5">Department</th>
                  <th className="px-4 py-3.5">Specialization</th>
                  <th className="px-4 py-3.5">Contact</th>
                  <th className="px-4 py-3.5">Schedule</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {filteredDoctors.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-10 text-center text-slate-400">
                      No doctors found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredDoctors.map((d) => (
                    <tr key={d._id} className="hover:bg-slate-50/70 transition group">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-xs">
                            <Stethoscope className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-slate-900 group-hover:text-blue-600 transition">
                            {d.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-700">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md font-medium text-[11px]">
                          {d.department}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 font-medium">
                        {d.specialization || 'General Specialist'}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 font-medium">
                        {d.contact || '—'}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        <div className="flex items-center gap-1 text-[11px]">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-xs">{d.schedule || 'Regular Shift'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleEdit(d)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() => handleDelete(d._id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default Doctors;