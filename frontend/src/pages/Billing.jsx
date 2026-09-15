import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

function Billing() {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({ patient: '', consultationFee: '', labFee: '', pharmacyFee: '', admissionFee: '' });

  const fetchAll = async () => {
    const [billRes, patRes] = await Promise.all([
      axios.get('http://localhost:5000/api/billing'),
      axios.get('http://localhost:5000/api/patients'),
    ]);
    setBills(billRes.data);
    setPatients(patRes.data);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/api/billing', form);
    setForm({ patient: '', consultationFee: '', labFee: '', pharmacyFee: '', admissionFee: '' });
    fetchAll();
  };

  const markPaid = async (id) => {
    await axios.put(`http://localhost:5000/api/billing/${id}`, { status: 'paid' });
    fetchAll();
  };

  const total =
    (Number(form.consultationFee) || 0) +
    (Number(form.labFee) || 0) +
    (Number(form.pharmacyFee) || 0) +
    (Number(form.admissionFee) || 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h3 className="font-semibold text-gray-800 mb-4">Generate New Bill</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select name="patient" value={form.patient} onChange={handleChange} required
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 sm:col-span-2">
              <option value="">Select patient</option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
            <input name="consultationFee" type="number" placeholder="Consultation fee" value={form.consultationFee} onChange={handleChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <input name="labFee" type="number" placeholder="Lab fee" value={form.labFee} onChange={handleChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <input name="pharmacyFee" type="number" placeholder="Pharmacy fee" value={form.pharmacyFee} onChange={handleChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <input name="admissionFee" type="number" placeholder="Admission fee" value={form.admissionFee} onChange={handleChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <p className="mt-4 text-gray-700 font-medium">Total: <span className="text-teal-700">Rs. {total.toFixed(2)}</span></p>
          <button type="submit" className="mt-3 bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2 rounded-lg transition">
            Generate Bill
          </button>
        </form>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((b) => (
                <tr key={b._id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-800">{b.patient?.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">Rs. {b.total.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      b.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{new Date(b.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {b.status === 'unpaid' && (
                      <button onClick={() => markPaid(b._id)} className="text-teal-600 hover:text-teal-800 text-sm font-medium">
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Billing;