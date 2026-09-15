import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

function MyRecords() {
  const navigate = useNavigate();
  const patientId = localStorage.getItem('patientId');
  const [records, setRecords] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/medical-records/patient/${patientId}`)
      .then((res) => setRecords(res.data));
  }, [patientId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-8 py-8 space-y-4">
        {records.length === 0 && <p className="text-gray-400 text-sm">No medical records yet.</p>}
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
      </div>
    </div>
  );
}

export default MyRecords;