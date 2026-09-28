import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import AppLayout from '../components/AppLayout';
import {
  FileText,
  Calendar,
  Stethoscope,
  Pill
} from 'lucide-react';

function MyRecords() {
  const patientId = localStorage.getItem('patientId');
  const [records, setRecords] = useState([]);

  useEffect(() => {
    if (patientId) {
      axios
        .get(`${API_URL}/api/medical-records/patient/${patientId}`)
        .then((res) => setRecords(res.data))
        .catch((err) => console.error('Error fetching records:', err));
    }
  }, [patientId]);

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            My Medical History & Records
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Access your past diagnoses, clinician prescriptions, and treatment notes.
          </p>
        </div>

        <div className="space-y-4">
          {records.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/70 p-10 text-center text-xs text-slate-400">
              No clinical medical records on file yet.
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

                <div className="pl-10 space-y-2 mt-2">
                  <p className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                    <span>Treating Doctor:</span>
                    <span className="font-bold text-slate-800">
                      Dr. {r.doctor?.name} ({r.doctor?.department || 'Specialist'})
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
                      <span className="font-semibold text-slate-700">Doctor's Clinical Notes:</span> {r.notes}
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

export default MyRecords;