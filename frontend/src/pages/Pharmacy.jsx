import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import AppLayout from '../components/AppLayout';
import {
  Pill,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Calendar,
  Package,
  PackageMinus,
  CheckCircle2,
  X,
  Search
} from 'lucide-react';

function Pharmacy() {
  const [medicines, setMedicines] = useState([]);
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({ name: '', category: '', stockQuantity: '', unit: 'tablets', pricePerUnit: '', expiryDate: '', supplier: '' });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');

  // Dispense Modal State
  const [dispenseItem, setDispenseItem] = useState(null);
  const [dispenseForm, setDispenseForm] = useState({ quantity: 1, patient: '', instructions: '' });
  const [dispenseLoading, setDispenseLoading] = useState(false);

  const fetchMedicines = async () => {
    try {
      const [medRes, patRes] = await Promise.all([
        axios.get(`${API_URL}/api/medicines`),
        axios.get(`${API_URL}/api/patients`).catch(() => ({ data: [] }))
      ]);
      setMedicines(medRes.data || []);
      setPatients(patRes.data || []);
    } catch (err) {
      console.error('Error fetching medicines:', err);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({ name: '', category: '', stockQuantity: '', unit: 'tablets', pricePerUnit: '', expiryDate: '', supplier: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleDispenseSubmit = async (e) => {
    e.preventDefault();
    if (!dispenseItem) return;
    const qty = Number(dispenseForm.quantity);
    if (qty <= 0) {
      alert('Quantity must be greater than 0.');
      return;
    }
    if (qty > dispenseItem.stockQuantity) {
      alert(`Insufficient stock. Current inventory has only ${dispenseItem.stockQuantity} ${dispenseItem.unit}.`);
      return;
    }

    setDispenseLoading(true);
    try {
      const updatedStock = dispenseItem.stockQuantity - qty;
      await axios.put(`${API_URL}/api/medicines/${dispenseItem._id}`, {
        stockQuantity: updatedStock
      });
      alert(`Dispensed ${qty} ${dispenseItem.unit} of ${dispenseItem.name} successfully.`);
      setDispenseItem(null);
      setDispenseForm({ quantity: 1, patient: '', instructions: '' });
      fetchMedicines();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to dispense medication.');
    } finally {
      setDispenseLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/api/medicines/${editingId}`, form);
      } else {
        await axios.post(`${API_URL}/api/medicines`, form);
      }
      resetForm();
      fetchMedicines();
    } catch (err) {
      alert('Failed to save medicine record');
    }
  };

  const handleEdit = (m) => {
    setForm({
      name: m.name || '',
      category: m.category || '',
      stockQuantity: m.stockQuantity ?? '',
      unit: m.unit || 'tablets',
      pricePerUnit: m.pricePerUnit ?? '',
      expiryDate: m.expiryDate ? m.expiryDate.substring(0, 10) : '',
      supplier: m.supplier || ''
    });
    setEditingId(m._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this medicine from inventory?')) return;
    try {
      await axios.delete(`${API_URL}/api/medicines/${id}`);
      fetchMedicines();
    } catch (err) {
      alert('Failed to delete item');
    }
  };

  const isExpiringSoon = (dateStr) => {
    const days = (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24);
    return days <= 60 && days >= 0;
  };
  const isExpired = (dateStr) => new Date(dateStr) < new Date();

  const filteredMedicines = medicines.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.category && m.category.toLowerCase().includes(search.toLowerCase())) ||
      (m.supplier && m.supplier.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Pharmacy & Medicine Inventory
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Stock monitoring, expiry tracking, and pharmaceutical supplies.
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
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
            <span>{showForm ? 'Close Form' : 'Add New Medicine'}</span>
          </button>
        </div>

        {/* Form Card */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 animate-in fade-in duration-150"
          >
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingId ? 'Edit Medicine Details' : 'Add Medication to Inventory'}
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Medicine Name</label>
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <input
                  name="category"
                  placeholder=""
                  value={form.category}
                  onChange={handleChange}
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Stock Quantity</label>
                <input
                  name="stockQuantity"
                  type="number"
                  placeholder=""
                  value={form.stockQuantity}
                  onChange={handleChange}
                  required
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Packaging Unit</label>
                <select
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                >
                  <option value="tablets">Tablets</option>
                  <option value="bottles">Bottles</option>
                  <option value="vials">Vials</option>
                  <option value="strips">Strips</option>
                  <option value="boxes">Boxes</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Price ($)</label>
                <input
                  name="pricePerUnit"
                  type="number"
                  step="0.01"
                  placeholder=""
                  value={form.pricePerUnit}
                  onChange={handleChange}
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry Date</label>
                <input
                  name="expiryDate"
                  type="date"
                  value={form.expiryDate}
                  onChange={handleChange}
                  required
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Distributor / Supplier</label>
                <input
                  name="supplier"
                  placeholder=""
                  value={form.supplier}
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
                {editingId ? 'Save Changes' : 'Add Medication'}
              </button>
            </div>
          </form>
        )}

        {/* Filter */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              placeholder="Search medicines by name, category, or supplier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-200/90 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition shadow-2xs"
            />
          </div>
          <span className="text-xs font-medium text-slate-400">
            {filteredMedicines.length} item(s) in inventory
          </span>
        </div>

        {/* Medicines Table */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Medicine</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Stock Level</th>
                  <th className="px-4 py-3.5">Unit Price</th>
                  <th className="px-4 py-3.5">Expiry Date</th>
                  <th className="px-4 py-3.5">Supplier</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {filteredMedicines.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-5 py-10 text-center text-slate-400">
                      No medicines found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredMedicines.map((m) => {
                    const lowStock = m.stockQuantity <= 10;
                    const expired = isExpired(m.expiryDate);
                    const soon = isExpiringSoon(m.expiryDate);

                    return (
                      <tr key={m._id} className="hover:bg-slate-50/70 transition group">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center shrink-0 text-xs">
                              <Pill className="w-4 h-4" />
                            </div>
                            <span className="font-bold text-slate-900 group-hover:text-blue-600 transition">
                              {m.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 font-medium">
                          {m.category || 'General'}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold ${
                              lowStock
                                ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {m.stockQuantity} {m.unit}
                            {lowStock && ' (Low Stock)'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-700 font-semibold">
                          ${m.pricePerUnit}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                              expired
                                ? 'bg-rose-100 text-rose-800'
                                : soon
                                ? 'bg-amber-100 text-amber-800'
                                : 'text-slate-600'
                            }`}
                          >
                            {new Date(m.expiryDate).toLocaleDateString()}
                            {expired && ' (Expired)'}
                            {soon && !expired && ' (Soon)'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 font-medium">
                          {m.supplier || '—'}
                        </td>
                        <td className="px-5 py-3.5 text-right space-x-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setDispenseItem(m);
                              setDispenseForm({ quantity: 1, patient: '', instructions: '' });
                            }}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/60 rounded-lg text-xs font-semibold transition cursor-pointer"
                            title="Dispense Medicine"
                          >
                            Dispense
                          </button>
                          <button
                            onClick={() => handleEdit(m)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5 inline" />
                          </button>
                          <button
                            onClick={() => handleDelete(m._id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline" />
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

      {/* DISPENSE MEDICATION MODAL */}
      {dispenseItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <PackageMinus className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Dispense Medication</h3>
              </div>
              <button
                type="button"
                onClick={() => setDispenseItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4 text-xs space-y-1">
              <p className="font-bold text-slate-900">{dispenseItem.name} ({dispenseItem.category || 'General'})</p>
              <p className="text-slate-500">
                Available Stock: <strong className="text-blue-600">{dispenseItem.stockQuantity} {dispenseItem.unit}</strong> • Unit Price: ${dispenseItem.pricePerUnit}
              </p>
            </div>

            <form onSubmit={handleDispenseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Patient (Optional)</label>
                <select
                  value={dispenseForm.patient}
                  onChange={(e) => setDispenseForm({ ...dispenseForm, patient: e.target.value })}
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                >
                  <option value="">-- Direct Dispensary / Walk-in --</option>
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>{p.name} ({p.contact || 'No contact'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantity to Dispense ({dispenseItem.unit}) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={dispenseItem.stockQuantity}
                  required
                  value={dispenseForm.quantity}
                  onChange={(e) => setDispenseForm({ ...dispenseForm, quantity: e.target.value })}
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Prescription Dosage Instructions</label>
                <input
                  type="text"
                  placeholder="e.g. 1 tab after meals twice daily for 5 days"
                  value={dispenseForm.instructions}
                  onChange={(e) => setDispenseForm({ ...dispenseForm, instructions: e.target.value })}
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDispenseItem(null)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={dispenseLoading}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  {dispenseLoading ? 'Dispensing...' : 'Confirm Dispense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

export default Pharmacy;