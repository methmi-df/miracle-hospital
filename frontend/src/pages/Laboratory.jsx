import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

function Laboratory() {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ patient: '', doctor: '', testType: '', notes: '' });

  const fetchAll = async () => {
    const [testRes, patRes, docRes] = await Promise.all([
      axios.get('http://localhost:5000/api/labtests'),
      axios.get('http://localhost:5000/api/patients'),
      axios.get('http://localhost:5000/api/doctors'),
    ]);
    setTests(testRes.data);
    setPatients(patRes.data);
    setDoctors(docRes.data);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/api/labtests', form);
    setForm({ patient: '', doctor: '', testType: '', notes: '' });
    fetchAll();
  };

  const updateStatus = async (id, status) => {
    await axios.put(`http://localhost:5000/api/labtests/${id}`, { status });
    fetchAll();
  };

  const toggleSample = async (id, current) => {
    await axios.put(`http://localhost:5000/api/labtests/${id}`, { sampleCollected: !current });
    fetchAll();
  };

  const saveResult = async (id, result) => {
    await axios.put(`http://localhost:5000/api/labtests/${id}`, { result, status: 'completed' });
    fetchAll();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lab test record?')) return;
    await axios.delete(`http://localhost:5000/api/labtests/${id}`);
    fetchAll();
  };

  const statusColor = {
    requested: 'bg-yellow-100 text-yellow-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h3 className="font-semibold text-gray-800 mb-4">Request New Lab Test</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select name="patient" value={form.patient} onChange={handleChange} required
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="">Select patient</option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
            <select name="doctor" value={form.doctor} onChange={handleChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="">Select doctor (optional)</option>
              {doctors.map((d) => (
                <option key={d._id} value={d._id}>{d.name} ({d.department})</option>
              ))}
            </select>
            <input name="testType" placeholder="Test type (e.g. CBC, X-Ray)" value={form.testType} onChange={handleChange} required
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 sm:col-span-2" />
            <input name="notes" placeholder="Notes" value={form.notes} onChange={handleChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 sm:col-span-2" />
          </div>
          <button type="submit" className="mt-4 bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2 rounded-lg transition">
            Request Test
          </button>
        </form>

        <div className="space-y-4">
          {tests.map((t) => (
            <div key={t._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-gray-800">{t.testType}</h4>
                  <p className="text-sm text-gray-500">
                    {t.patient?.name || '—'} {t.doctor?.name && `· Requested by ${t.doctor.name}`}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[t.status]}`}>
                  {t.status}
                </span>
              </div>

              {t.notes && <p className="text-sm text-gray-500 mb-2">{t.notes}</p>}

              <div className="flex flex-wrap items-center gap-3 mt-3">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={t.sampleCollected}
                    onChange={() => toggleSample(t._id, t.sampleCollected)}
                  />
                  Sample collected
                </label>

                {t.status === 'requested' && (
                  <button onClick={() => updateStatus(t._id, 'in-progress')} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Mark In Progress
                  </button>
                )}

                {t.status !== 'completed' && (
                  <ResultInput onSave={(result) => saveResult(t._id, result)} />
                )}

                <button onClick={() => handleDelete(t._id)} className="text-red-600 hover:text-red-800 text-sm font-medium ml-auto">
                  Delete
                </button>
              </div>

              {t.result && (
                <div className="mt-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm text-green-800">
                  <strong>Result:</strong> {t.result}
                </div>
              )}
            </div>
          ))}
          {tests.length === 0 && <p className="text-gray-400 text-sm">No lab tests yet.</p>}
        </div>
      </div>
    </div>
  );
}

function ResultInput({ onSave }) {
  const [value, setValue] = useState('');
  return (
    <div className="flex items-center gap-2">
      <input
        placeholder="Enter result..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="px-2 py-1 border border-gray-300 rounded-lg text-sm w-40"
      />
      <button
        onClick={() => value.trim() && onSave(value)}
        className="text-green-600 hover:text-green-800 text-sm font-medium"
      >
        Save Result
      </button>
    </div>
  );
}

export default Laboratory;