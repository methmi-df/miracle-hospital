import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { API_URL } from '../config';
import AppLayout from '../components/AppLayout';
import {
  FileText,
  Plus,
  ArrowLeft,
  Stethoscope,
  Calendar,
  Pill,
  Printer,
  X
} from 'lucide-react';

function PatientRecords() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ doctor: '', diagnosis: '', prescription: '', notes: '' });
  const [showForm, setShowForm] = useState(false);

  const fetchData = async () => {
    try {
      const [recRes, docRes, patRes] = await Promise.all([
        axios.get(`${API_URL}/api/medical-records/patient/${patientId}`),
        axios.get(`${API_URL}/api/doctors`),
        axios.get(`${API_URL}/api/patients/${patientId}`).catch(() => ({ data: null })),
      ]);
      setRecords(recRes.data || []);
      setDoctors(docRes.data || []);
      setPatient(patRes.data);
    } catch (err) {
      console.error('Error fetching clinical history:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [patientId]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/medical-records`, { ...form, patient: patientId });
      setForm({ doctor: '', diagnosis: '', prescription: '', notes: '' });
      setShowForm(false);
      fetchData();
    } catch (err) {
      alert('Failed to save record.');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header with Back button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => navigate('/patients')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Patients list</span>
            </button>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Electronic Medical Records {patient && `— ${patient.name}`}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Diagnosis history, clinician consultations, and drug prescriptions.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {records.length > 0 && (
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 transition cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>Print Medical Summary</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer shrink-0"
            >
              {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
              <span>{showForm ? 'Close Entry' : 'Add Clinical Note'}</span>
            </button>
          </div>
        </div>

        {/* Record Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 animate-in fade-in duration-150"
          >
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Add Medical Record</h3>
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Attending Physician</label>
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Diagnosis</label>
                <input
                  name="diagnosis"
                  placeholder=""
                  value={form.diagnosis}
                  onChange={handleChange}
                  required
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Prescription (Rx)</label>
                <input
                  name="prescription"
                  placeholder=""
                  value={form.prescription}
                  onChange={handleChange}
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Physician Clinical Notes</label>
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
                Save Record
              </button>
            </div>
          </form>
        )}

        {/* Records Timeline */}
        <div className="space-y-4">
          {records.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/70 p-10 text-center text-xs text-slate-400">
              No historical medical entries recorded for this patient.
            </div>
          ) : (
            records.map((r) => (
              <div
                key={r._id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{r.diagnosis}</h4>
                  </div>
                  <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(r.date).toLocaleDateString()}
                  </span>
                </div>

                <div className="pl-10 space-y-2 mt-1">
                  <p className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                    <span>Physician:</span>
                    <span className="font-bold text-slate-800">
                      Dr. {r.doctor?.name} ({r.doctor?.department || 'Consultant'})
                    </span>
                  </p>

                  {r.prescription && (
                    <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 text-xs">
                      <p className="font-bold text-blue-900 flex items-center gap-1.5">
                        <Pill className="w-3.5 h-3.5 text-blue-600" />
                        Prescription (Rx):
                      </p>
                      <p className="text-blue-800 mt-0.5">{r.prescription}</p>
                    </div>
                  )}

                  {r.notes && (
                    <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="font-semibold text-slate-700">Observation:</span> {r.notes}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default PatientRecords;