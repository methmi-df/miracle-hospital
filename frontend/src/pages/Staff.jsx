import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import AppLayout from '../components/AppLayout';
import {
  UserCheck,
  Plus,
  Edit2,
  Trash2,
  UserPlus,
  Mail,
  Phone,
  Building,
  CheckCircle,
  XCircle,
  X,
  Search,
  CalendarDays,
  Clock,
  FileCheck,
  Check,
  AlertCircle
} from 'lucide-react';

function Staff() {
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'leaves'
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [form, setForm] = useState({ name: '', role: '', department: '', contact: '', email: '' });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');

  // Leave Form State
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    employee: '',
    leaveType: 'Annual Leave',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [leaveFilter, setLeaveFilter] = useState('all');

  const fetchAll = async () => {
    try {
      const [empRes, leaveRes] = await Promise.all([
        axios.get(`${API_URL}/api/employees`),
        axios.get(`${API_URL}/api/employees/leaves`).catch(() => ({ data: [] }))
      ]);
      setEmployees(empRes.data || []);
      setLeaves(leaveRes.data || []);
    } catch (err) {
      console.error('Error fetching staff and leave data:', err);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({ name: '', role: '', department: '', contact: '', email: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/api/employees/${editingId}`, form);
      } else {
        await axios.post(`${API_URL}/api/employees`, form);
      }
      resetForm();
      fetchAll();
    } catch (err) {
      alert('Failed to save staff record');
    }
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
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this staff record? This cannot be undone.')) return;
    try {
      await axios.delete(`${API_URL}/api/employees/${id}`);
      fetchAll();
    } catch (err) {
      alert('Failed to delete staff member');
    }
  };

  const markAttendance = async (id, status) => {
    try {
      await axios.post(`${API_URL}/api/employees/${id}/attendance`, { status });
      alert(`Marked ${status} for today.`);
    } catch (err) {
      alert('Failed to log attendance.');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API_URL}/api/employees/${id}`, { status });
      fetchAll();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  // Leave Actions
  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    if (!leaveForm.employee) {
      alert('Please select an employee.');
      return;
    }
    try {
      await axios.post(`${API_URL}/api/employees/${leaveForm.employee}/leave`, leaveForm);
      setLeaveForm({ employee: '', leaveType: 'Annual Leave', startDate: '', endDate: '', reason: '' });
      setShowLeaveModal(false);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit leave request.');
    }
  };

  const updateLeaveStatus = async (leaveId, status) => {
    try {
      await axios.put(`${API_URL}/api/employees/leaves/${leaveId}`, { status });
      fetchAll();
    } catch (err) {
      alert('Failed to update leave status.');
    }
  };

  const deleteLeaveRecord = async (leaveId) => {
    if (!window.confirm('Delete this leave record?')) return;
    try {
      await axios.delete(`${API_URL}/api/employees/leaves/${leaveId}`);
      fetchAll();
    } catch (err) {
      alert('Failed to delete leave record.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
      case 'on-leave':
        return 'bg-amber-50 text-amber-700 border-amber-200/60';
      case 'terminated':
        return 'bg-rose-50 text-rose-700 border-rose-200/60';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getLeaveBadge = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.role.toLowerCase().includes(search.toLowerCase()) ||
      (emp.department && emp.department.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredLeaves = leaves.filter((l) => {
    if (leaveFilter === 'all') return true;
    return l.status === leaveFilter;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Hospital Staff & Human Resources
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Manage clinical personnel credentials, department rosters, attendance, and leave requests.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {activeTab === 'directory' ? (
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(!showForm);
                }}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer shrink-0"
              >
                {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
                <span>{showForm ? 'Close' : 'Add Employee'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowLeaveModal(true)}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Request Leave</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('directory')}
            className={`pb-3 px-3 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'directory'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Staff Directory ({employees.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('leaves')}
            className={`pb-3 px-3 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'leaves'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Leave Records & Approvals ({leaves.length})</span>
          </button>
        </div>

        {/* TAB 1: STAFF DIRECTORY */}
        {activeTab === 'directory' && (
          <div className="space-y-6">
            {/* Form */}
            {showForm && (
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 animate-in fade-in duration-150"
              >
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-sm">
                    {editingId ? 'Edit Staff Profile' : 'Register New Personnel'}
                  </h3>
                  <button type="button" onClick={resetForm} className="text-slate-400 hover:text-slate-600 p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                    <input
                      name="name"
                      placeholder="e.g. Dr. Arthur Pendelton"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Role *</label>
                    <input
                      name="role"
                      placeholder="e.g. Senior Nurse, Lab Tech"
                      value={form.role}
                      onChange={handleChange}
                      required
                      className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                    <input
                      name="department"
                      placeholder="e.g. Intensive Care, Oncology"
                      value={form.department}
                      onChange={handleChange}
                      className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Extension</label>
                    <input
                      name="contact"
                      placeholder="e.g. +1 555-0199"
                      value={form.contact}
                      onChange={handleChange}
                      className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email</label>
                    <input
                      name="email"
                      type="email"
                      placeholder="e.g. a.pendelton@miracle.org"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
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
                    {editingId ? 'Update Record' : 'Save Personnel'}
                  </button>
                </div>
              </form>
            )}

            {/* Search */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search staff by name, role or department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 transition shadow-2xs"
              />
            </div>

            {/* Staff Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEmployees.length === 0 ? (
                <div className="col-span-full bg-white rounded-2xl border border-slate-200/70 p-12 text-center text-xs text-slate-400">
                  No staff members matching your search.
                </div>
              ) : (
                filteredEmployees.map((emp) => (
                  <div
                    key={emp._id}
                    className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 font-bold flex items-center justify-center shrink-0">
                            <UserCheck className="w-5 h-5 stroke-[2.2]" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition">
                              {emp.name}
                            </h4>
                            <p className="text-xs font-medium text-slate-500">{emp.role}</p>
                          </div>
                        </div>

                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(
                            emp.status
                          )}`}
                        >
                          {emp.status || 'Active'}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                        <p className="flex items-center gap-2">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>Dept: <strong>{emp.department || 'General Staff'}</strong></span>
                        </p>
                        {emp.contact && (
                          <p className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{emp.contact}</span>
                          </p>
                        )}
                        {emp.email && (
                          <p className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span className="truncate">{emp.email}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Quick Attendance & Admin Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => markAttendance(emp._id, 'present')}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold border border-emerald-200 transition"
                          title="Mark Present Today"
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => markAttendance(emp._id, 'leave')}
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-[10px] font-bold border border-amber-200 transition"
                          title="Mark on Leave"
                        >
                          Leave
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(emp)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit Profile"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(emp._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Employee"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: LEAVE RECORDS & APPROVALS */}
        {activeTab === 'leaves' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl">
                {['all', 'pending', 'approved', 'rejected'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setLeaveFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                      leaveFilter === st
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st === 'all' ? 'All Leaves' : st}
                  </button>
                ))}
              </div>
              <span className="text-xs font-medium text-slate-400">
                {filteredLeaves.length} leave record(s)
              </span>
            </div>

            {/* Leaves Table */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-5 py-3.5">Employee</th>
                      <th className="px-4 py-3.5">Leave Type</th>
                      <th className="px-4 py-3.5">Date Period</th>
                      <th className="px-4 py-3.5">Reason</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Approval Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/80">
                    {filteredLeaves.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-5 py-10 text-center text-slate-400">
                          No leave requests recorded for this filter.
                        </td>
                      </tr>
                    ) : (
                      filteredLeaves.map((l) => (
                        <tr key={l._id} className="hover:bg-slate-50/70 transition">
                          <td className="px-5 py-3.5">
                            <p className="font-bold text-slate-900">{l.employee?.name || 'Staff'}</p>
                            <p className="text-[11px] text-slate-400">
                              {l.employee?.role} • {l.employee?.department}
                            </p>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                              {l.leaveType}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-slate-600 font-medium">
                            {new Date(l.startDate).toLocaleDateString()} →{' '}
                            {new Date(l.endDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3.5 text-slate-600 max-w-xs truncate">
                            {l.reason || '—'}
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border capitalize ${getLeaveBadge(
                                l.status
                              )}`}
                            >
                              {l.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right space-x-1.5">
                            {l.status === 'pending' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => updateLeaveStatus(l._id, 'approved')}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition"
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateLeaveStatus(l._id, 'rejected')}
                                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() => deleteLeaveRecord(l._id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
        )}
      </div>

      {/* REQUEST LEAVE MODAL */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Request Staff Leave</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLeaveModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLeaveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Employee *</label>
                <select
                  value={leaveForm.employee}
                  onChange={(e) => setLeaveForm({ ...leaveForm, employee: e.target.value })}
                  required
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                >
                  <option value="">-- Choose Personnel --</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} ({emp.role} • {emp.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Leave Category *</label>
                <select
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                >
                  <option value="Annual Leave">Annual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Maternity Leave">Maternity Leave</option>
                  <option value="Emergency Leave">Emergency Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason / Notes</label>
                <textarea
                  rows="2"
                  placeholder="Medical certificate, family emergency, or travel details..."
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition shadow-md shadow-blue-500/20"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

export default Staff;