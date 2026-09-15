import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';

function PatientRecords() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ doctor: '', diagnosis: '', prescription: '', notes: '' });

  const fetchData = async () => {
    const [recRes, docRes, patRes] = await Promise.all([
      axios.get(`http://localhost:5000/api/medical-records/patient/${patientId}`),
      axios.get('http://localhost:5000/api/doctors'),
      axios.get('http://localhost:5000/api/patients'),
    ]);
    setRecords(recRes.data);
    setDoctors(docRes.data);
    setPatient(patRes.data.find((p) => p._id === patientId));
  };

  useEffect(() => {
    fetchData();
  }, [patientId]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/api/medical-records', { ...form, patient: patientId });
    setForm({ doctor: '', diagnosis: '', prescription: '', notes: '' });
    fetchData();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-8 py-8">
        <button onClick={() => navigate('/patients')} className="text-teal-600 hover:text-teal-800 text-sm font-medium mb-4">
          ← Back to Patients
        </button>
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          Medical Records {patient && `— ${patient.name}`}
        </h2>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h3 className="font-semibold text-gray-800 mb-4">Add New Record</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select name="doctor" value={form.doctor} onChange={handleChange} required
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="">Select doctor</option>
              {doctors.map((d) => (
                <option key={d._id} value={d._id}>{d.name} ({d.department})</option>
              ))}
            </select>
            <input name="diagnosis" placeholder="Diagnosis" value={form.diagnosis} onChange={handleChange} required
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <input name="prescription" placeholder="Prescription" value={form.prescription} onChange={handleChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 sm:col-span-2" />
            <input name="notes" placeholder="Notes" value={form.notes} onChange={handleChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 sm:col-span-2" />
          </div>
          <button type="submit" className="mt-4 bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2 rounded-lg transition">
            Add Record
          </button>
        </form>

        <div className="space-y-4">
          {records.map((r) => (
            <div key={r._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-800">{r.diagnosis}</h4>
                <span className="text-xs text-gray-400">{new Date(r.date).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-gray-600">Dr. {r.doctor?.name} — {r.doctor?.department}</p>
              {r.prescription && <p className="text-sm text-gray-600 mt-1"><strong>Rx:</strong> {r.prescription}</p>}
              {r.notes && <p className="text-sm text-gray-500 mt-1">{r.notes}</p>}
            </div>
          ))}
          {records.length === 0 && <p className="text-gray-400 text-sm">No records yet.</p>}
        </div>
      </div>
    </div>
  );
}

export default PatientRecords;