import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import AppLayout from '../components/AppLayout';
import {
  CreditCard,
  Plus,
  CheckCircle2,
  Clock,
  DollarSign,
  Receipt,
  Printer,
  FileText,
  Activity,
  X,
  Search
} from 'lucide-react';

function Billing() {
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({ patient: '', consultationFee: '', labFee: '', pharmacyFee: '', admissionFee: '' });
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const fetchAll = async () => {
    try {
      const [billRes, patRes] = await Promise.all([
        axios.get(`${API_URL}/api/billing`),
        axios.get(`${API_URL}/api/patients`),
      ]);
      setBills(billRes.data);
      setPatients(patRes.data);
    } catch (err) {
      console.error('Error fetching billing data:', err);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/billing`, form);
      setForm({ patient: '', consultationFee: '', labFee: '', pharmacyFee: '', admissionFee: '' });
      setShowForm(false);
      fetchAll();
    } catch (err) {
      alert('Failed to generate invoice.');
    }
  };

  const markPaid = async (id) => {
    try {
      await axios.put(`${API_URL}/api/billing/${id}`, { status: 'paid' });
      fetchAll();
    } catch (err) {
      alert('Failed to update invoice payment status.');
    }
  };

  const total =
    (Number(form.consultationFee) || 0) +
    (Number(form.labFee) || 0) +
    (Number(form.pharmacyFee) || 0) +
    (Number(form.admissionFee) || 0);

  const filteredBills = bills.filter((b) => {
    if (filterStatus === 'all') return true;
    return b.status === filterStatus;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Hospital Billing & Invoices
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Issue patient invoices, track payments, and verify fee breakdowns.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer shrink-0"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
            <span>{showForm ? 'Close Invoice' : 'Generate Invoice'}</span>
          </button>
        </div>

        {/* Invoice Generator Card */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 animate-in fade-in duration-150"
          >
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Generate Patient Invoice</h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="sm:col-span-2 lg:col-span-3">
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
                    <option key={p._id} value={p._id}>{p.name} ({p.contact || 'No phone'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Consultation Fee ($)</label>
                <input
                  name="consultationFee"
                  type="number"
                  placeholder="0.00"
                  value={form.consultationFee}
                  onChange={handleChange}
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Laboratory Fee ($)</label>
                <input
                  name="labFee"
                  type="number"
                  placeholder="0.00"
                  value={form.labFee}
                  onChange={handleChange}
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pharmacy Medication Fee ($)</label>
                <input
                  name="pharmacyFee"
                  type="number"
                  placeholder="0.00"
                  value={form.pharmacyFee}
                  onChange={handleChange}
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Admission / Bed Fee ($)</label>
                <input
                  name="admissionFee"
                  type="number"
                  placeholder="0.00"
                  value={form.admissionFee}
                  onChange={handleChange}
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Calculated Invoice Total:</span>
                <span className="text-lg font-extrabold text-blue-600">${total.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-3">
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
                  Issue Bill
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Filter */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {['all', 'paid', 'unpaid'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition cursor-pointer ${
                  filterStatus === st
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200/90 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {st === 'all' ? 'All Invoices' : st}
              </button>
            ))}
          </div>
          <span className="text-xs font-medium text-slate-400">
            {filteredBills.length} invoice(s)
          </span>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Patient</th>
                  <th className="px-4 py-3.5">Invoice Amount</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Issued Date</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {filteredBills.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-5 py-10 text-center text-slate-400">
                      No invoices recorded for this filter.
                    </td>
                  </tr>
                ) : (
                  filteredBills.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50/70 transition group">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center shrink-0">
                            <Receipt className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-slate-900 group-hover:text-blue-600 transition">
                            {b.patient?.name || 'Walk-in Patient'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900">
                        ${b.total?.toFixed(2)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                            b.status === 'paid'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                              : 'bg-amber-50 text-amber-700 border-amber-200/60'
                          }`}
                        >
                          {b.status === 'paid' ? 'Paid in Full' : 'Pending Payment'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 font-medium">
                        {new Date(b.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedReceipt(b)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Print Hospital Receipt"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          {b.status === 'unpaid' ? (
                            <button
                              onClick={() => markPaid(b._id)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-xs transition cursor-pointer"
                            >
                              Mark Paid
                            </button>
                          ) : (
                            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Settled
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
            {/* Action Bar (hidden when printing) */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Official Hospital Receipt
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedReceipt(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Body */}
            <div className="p-8 space-y-6" id="printable-receipt">
              {/* Header */}
              <div className="text-center pb-6 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-2 shadow-md shadow-blue-500/25">
                  <Activity className="w-5 h-5 stroke-[2.5]" />
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">MIRACLE CENTRAL HOSPITAL</h3>
                <p className="text-xs text-slate-500 mt-0.5">100 Healthcare Boulevard, Suite 400 • Ext. 4099</p>
                <p className="text-[11px] text-slate-400">Tax ID: MH-8942-019 • Emergency: +1 (800) 555-0199</p>
              </div>

              {/* Invoice Meta */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Billed Patient</p>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">
                    {selectedReceipt.patient?.name || 'Walk-in Patient'}
                  </p>
                  {selectedReceipt.patient?.contact && (
                    <p className="text-slate-500 text-[11px]">{selectedReceipt.patient.contact}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Receipt Number</p>
                  <p className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                    #INV-{selectedReceipt._id.slice(-6).toUpperCase()}
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Date: {new Date(selectedReceipt.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Fee Breakdown Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-2.5">Service Description</th>
                      <th className="px-4 py-2.5 text-right">Fee ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="px-4 py-2.5 font-medium text-slate-700">Doctor Consultation & Triage</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-slate-900">
                        ${(selectedReceipt.consultationFee || 0).toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-medium text-slate-700">Laboratory Diagnostics & Pathology</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-slate-900">
                        ${(selectedReceipt.labFee || 0).toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-medium text-slate-700">Pharmacy Medication & Dispensary</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-slate-900">
                        ${(selectedReceipt.pharmacyFee || 0).toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-medium text-slate-700">Inpatient Ward & Bed Accommodation</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-slate-900">
                        ${(selectedReceipt.admissionFee || 0).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold">
                    <tr>
                      <td className="px-4 py-3 text-slate-900 text-sm">Total Amount</td>
                      <td className="px-4 py-3 text-right text-blue-600 text-base font-extrabold">
                        ${(selectedReceipt.total || 0).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Payment Status & Seal */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      selectedReceipt.status === 'paid'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {selectedReceipt.status === 'paid' ? '✔ PAYMENT RECEIVED IN FULL' : '⏳ PENDING PAYMENT'}
                  </span>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  <p className="font-semibold text-slate-600">Authorized Accounts</p>
                  <p>Miracle Hospital Finance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

export default Billing;