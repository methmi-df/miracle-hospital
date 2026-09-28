import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import AppLayout from '../components/AppLayout';
import {
  FlaskConical,
  Plus,
  CheckCircle,
  Clock,
  Trash2,
  CheckSquare,
  Square,
  FileCheck,
  Printer,
  Activity,
  X,
  Search
} from 'lucide-react';

function Laboratory() {
  const [tests, setTests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ patient: '', doctor: '', testType: '', notes: '' });
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  const fetchAll = async () => {
    try {
      const [testRes, patRes, docRes] = await Promise.all([
        axios.get(`${API_URL}/api/labtests`),
        axios.get(`${API_URL}/api/patients`),
        axios.get(`${API_URL}/api/doctors`),
      ]);
      setTests(testRes.data);
      setPatients(patRes.data);
      setDoctors(docRes.data);
    } catch (err) {
      console.error('Error fetching lab data:', err);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/labtests`, form);
      setForm({ patient: '', doctor: '', testType: '', notes: '' });
      setShowForm(false);
      fetchAll();
    } catch (err) {
      alert('Failed to request lab test.');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API_URL}/api/labtests/${id}`, { status });
      fetchAll();
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const toggleSample = async (id, current) => {
    try {
      await axios.put(`${API_URL}/api/labtests/${id}`, { sampleCollected: !current });
      fetchAll();
    } catch (err) {
      alert('Failed to update sample status.');
    }
  };

  const saveResult = async (id, result) => {
    try {
      await axios.put(`${API_URL}/api/labtests/${id}`, { result, status: 'completed' });
      fetchAll();
    } catch (err) {
      alert('Failed to save test results.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lab test record?')) return;
    try {
      await axios.delete(`${API_URL}/api/labtests/${id}`);
      fetchAll();
    } catch (err) {
      alert('Failed to delete lab test.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
      case 'in-progress':
        return 'bg-blue-50 text-blue-700 border-blue-200/60';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200/60';
    }
  };

  const filteredTests = tests.filter(
    (t) =>
      t.testType.toLowerCase().includes(search.toLowerCase()) ||
      (t.patient?.name && t.patient.name.toLowerCase().includes(search.toLowerCase())) ||
      (t.notes && t.notes.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Laboratory & Diagnostics
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Test requisitions, specimen tracking, and clinical diagnostic findings.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer shrink-0"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
            <span>{showForm ? 'Close Requisition' : 'Request Lab Test'}</span>
          </button>
        </div>

        {/* Requisition Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 animate-in fade-in duration-150"
          >
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Create Laboratory Requisition</h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Patient</label>
                <select
                  name="patient"
                  value={form.patient}
                  onChange={handleChange}
                  required
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ordering Physician</label>
                <select
                  name="doctor"
                  value={form.doctor}
                  onChange={handleChange}
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                >
                  <option value="">-- Choose Doctor (Optional) --</option>
                  {doctors.map((d) => (
                    <option key={d._id} value={d._id}>{d.name} ({d.department})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Test Type / Panel</label>
                <input
                  name="testType"
                  placeholder=""
                  value={form.testType}
                  onChange={handleChange}
                  required
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Indication / Notes</label>
                <input
                  name="notes"
                  placeholder=""
                  value={form.notes}
                  onChange={handleChange}
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
                Submit Requisition
              </button>
            </div>
          </form>
        )}

        {/* Filter */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              placeholder="Search tests by type, patient, or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-200/90 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition shadow-2xs"
            />
          </div>
          <span className="text-xs font-medium text-slate-400">
            {filteredTests.length} test order(s)
          </span>
        </div>

        {/* Lab Tests List */}
        <div className="space-y-4">
          {filteredTests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/70 p-10 text-center text-xs text-slate-400">
              No laboratory requests found matching criteria.
            </div>
          ) : (
            filteredTests.map((t) => (
              <div
                key={t._id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <FlaskConical className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{t.testType}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Patient: <span className="font-semibold text-slate-800">{t.patient?.name || '—'}</span>
                        {t.doctor?.name && ` · Requested by ${t.doctor.name}`}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                      t.status
                    )} self-start sm:self-auto`}
                  >
                    {t.status}
                  </span>
                </div>

                {t.notes && (
                  <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 my-3">
                    <span className="font-semibold text-slate-700">Notes:</span> {t.notes}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-100 mt-3">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={t.sampleCollected}
                      onChange={() => toggleSample(t._id, t.sampleCollected)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300"
                    />
                    <span>Sample Specimen Collected</span>
                  </label>

                  {t.status === 'requested' && (
                    <button
                      onClick={() => updateStatus(t._id, 'in-progress')}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition"
                    >
                      Process in Lab
                    </button>
                  )}

                  {t.status !== 'completed' && (
                    <ResultInput onSave={(result) => saveResult(t._id, result)} />
                  )}

                  <button
                    onClick={() => handleDelete(t._id)}
                    className="text-xs font-semibold text-slate-400 hover:text-rose-600 ml-auto p-1 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {t.result && (
                  <div className="mt-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-3 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <FileCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-emerald-900">Diagnostic Findings:</p>
                        <p className="text-xs font-medium text-emerald-800 mt-0.5">{t.result}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedReport(t)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold transition shrink-0 cursor-pointer shadow-2xs"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Lab Report</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Printable Lab Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
            {/* Action Bar (hidden when printing) */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Diagnostic Pathology Report
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Body */}
            <div className="p-8 space-y-6" id="printable-lab-report">
              <div className="text-center pb-6 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-2 shadow-md shadow-blue-500/25">
                  <Activity className="w-5 h-5 stroke-[2.5]" />
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">MIRACLE CENTRAL HOSPITAL</h3>
                <p className="text-xs text-slate-500 mt-0.5">Department of Pathology & Clinical Diagnostics</p>
                <p className="text-[11px] text-slate-400">CAP / ISO Accredited Clinical Laboratory • Ext. 4040</p>
              </div>

              {/* Patient and Test Meta */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Patient Name</p>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedReport.patient?.name || 'Walk-in'}</p>
                  <p className="text-slate-500 text-[11px]">Tel: {selectedReport.patient?.contact || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Ordering Physician</p>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">Dr. {selectedReport.doctor?.name || 'Attending Staff'}</p>
                  <p className="text-slate-500 text-[11px]">{selectedReport.doctor?.department || 'Consultant'}</p>
                </div>
              </div>

              {/* Diagnostic Test Info */}
              <div className="space-y-4 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Test Performed:</span>
                  <span className="font-extrabold text-slate-900 text-sm">{selectedReport.testType}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Sample Specimen:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {selectedReport.sampleCollected ? 'Specimen Collected & Verified' : 'Standard Routine'}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Report Date:</span>
                  <span className="font-semibold text-slate-800">{new Date(selectedReport.createdAt).toLocaleDateString()}</span>
                </div>

                <div>
                  <p className="text-slate-500 font-medium mb-1.5">Official Clinical Findings / Lab Results:</p>
                  <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 text-slate-900 font-medium whitespace-pre-wrap leading-relaxed">
                    {selectedReport.result || 'Pending review'}
                  </div>
                </div>

                {selectedReport.notes && (
                  <div>
                    <p className="text-slate-500 font-medium mb-1">Physician Notes / Specimen Context:</p>
                    <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">{selectedReport.notes}</p>
                  </div>
                )}
              </div>

              {/* Signatures */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100 text-[11px]">
                <div>
                  <p className="font-bold text-slate-800">Medical Technologist</p>
                  <p className="text-slate-400">Pathology Laboratory</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800">Chief Pathologist Verification</p>
                  <p className="text-slate-400">Miracle Hospital Diagnostics</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

function ResultInput({ onSave }) {
  const [value, setValue] = useState('');
  return (
    <div className="flex items-center gap-2">
      <input
        placeholder="Enter lab findings..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="px-3 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 w-44"
      />
      <button
        type="button"
        onClick={() => value.trim() && onSave(value)}
        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-xs transition"
      >
        Save Result
      </button>
    </div>
  );
}

export default Laboratory;