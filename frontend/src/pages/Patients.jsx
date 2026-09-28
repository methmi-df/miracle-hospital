import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import AppLayout from '../components/AppLayout';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  FileText,
  UserPlus,
  Phone,
  MapPin,
  Calendar,
  X
} from 'lucide-react';

function Patients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({ name: '', dob: '', gender: 'male', contact: '', address: '', medicalHistory: '' });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const fetchPatients = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/patients`);
      setPatients(res.data);
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
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
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/api/patients/${editingId}`, form);
      } else {
        await axios.post(`${API_URL}/api/patients`, form);
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
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this patient? This cannot be undone.')) return;
    try {
      await axios.delete(`${API_URL}/api/patients/${id}`);
      fetchPatients();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete patient.');
    }
  };

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.contact && p.contact.includes(search))
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Patient Management
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Register, manage, and review patient clinical histories.
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
            {showForm ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            <span>{showForm ? 'Close Form' : 'Add New Patient'}</span>
          </button>
        </div>

        {/* Patient Form Accordion/Modal Card */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 animate-in fade-in duration-150"
          >
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingId ? 'Edit Patient Details' : 'Register New Patient'}
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                <input
                  name="dob"
                  type="date"
                  value={form.dob}
                  onChange={handleChange}
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Contact</label>
                <input
                  name="contact"
                  placeholder=""
                  value={form.contact}
                  onChange={handleChange}
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Address</label>
                <input
                  name="address"
                  placeholder=""
                  value={form.address}
                  onChange={handleChange}
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Medical History / Notes</label>
                <input
                  name="medicalHistory"
                  placeholder=""
                  value={form.medicalHistory}
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
                {editingId ? 'Save Changes' : 'Complete Registration'}
              </button>
            </div>
          </form>
        )}

        {/* Filter Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              placeholder="Search patients by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-200/90 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition shadow-2xs"
            />
          </div>
          <div className="text-xs font-medium text-slate-400">
            Total {filteredPatients.length} patient(s)
          </div>
        </div>

        {/* Patients Table */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Patient</th>
                  <th className="px-4 py-3.5">DOB</th>
                  <th className="px-4 py-3.5">Gender</th>
                  <th className="px-4 py-3.5">Contact</th>
                  <th className="px-4 py-3.5">Address</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-10 text-center text-slate-400">
                      No patients found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((p, idx) => {
                    const initials = p.name
                      ? p.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()
                      : 'PT';
                    return (
                      <tr key={p._id} className="hover:bg-slate-50/70 transition group">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                              {initials}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 group-hover:text-blue-600 transition">
                                {p.name}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                {p.medicalHistory ? p.medicalHistory.slice(0, 24) + '...' : 'No conditions recorded'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 font-medium">
                          {p.dob ? new Date(p.dob).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-4 py-3.5 capitalize text-slate-600 font-medium">
                          <span className={`inline-flex px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                            p.gender === 'female' ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700'
                          }`}>
                            {p.gender}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 font-medium">
                          {p.contact || '—'}
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 truncate max-w-xs">
                          {p.address || '—'}
                        </td>
                        <td className="px-5 py-3.5 text-right space-x-2">
                          <button
                            onClick={() => navigate(`/patients/${p._id}/records`)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg font-semibold transition"
                            title="Clinical Records"
                          >
                            <FileText className="w-4 h-4 inline" />
                          </button>
                          <button
                            onClick={() => handleEdit(p)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold transition"
                            title="Edit Patient"
                          >
                            <Edit2 className="w-4 h-4 inline" />
                          </button>
                          <button
                            onClick={() => handleDelete(p._id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg font-semibold transition"
                            title="Delete Patient"
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
    </AppLayout>
  );
}

export default Patients;