import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

function Pharmacy() {
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [form, setForm] = useState({ name: '', category: '', stockQuantity: '', unit: 'tablets', pricePerUnit: '', expiryDate: '', supplier: '' });
  const [editingId, setEditingId] = useState(null);

  const fetchMedicines = async () => {
    const res = await axios.get('http://localhost:5000/api/medicines');
    setMedicines(res.data);
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({ name: '', category: '', stockQuantity: '', unit: 'tablets', pricePerUnit: '', expiryDate: '', supplier: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await axios.put(`http://localhost:5000/api/medicines/${editingId}`, form);
    } else {
      await axios.post('http://localhost:5000/api/medicines', form);
    }
    resetForm();
    fetchMedicines();
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this medicine from inventory?')) return;
    await axios.delete(`http://localhost:5000/api/medicines/${id}`);
    fetchMedicines();
  };

  const isExpiringSoon = (dateStr) => {
    const days = (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24);
    return days <= 60 && days >= 0;
  };
  const isExpired = (dateStr) => new Date(dateStr) < new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h3 className="font-semibold text-gray-800 mb-4">
            {editingId ? 'Edit Medicine' : 'Add New Medicine'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input name="name" placeholder="Medicine name" value={form.name} onChange={handleChange} required
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <input name="category" placeholder="Category (e.g. Antibiotic)" value={form.category} onChange={handleChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <input name="stockQuantity" type="number" placeholder="Stock quantity" value={form.stockQuantity} onChange={handleChange} required
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <select name="unit" value={form.unit} onChange={handleChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="tablets">Tablets</option>
              <option value="bottles">Bottles</option>
              <option value="vials">Vials</option>
              <option value="strips">Strips</option>
              <option value="boxes">Boxes</option>
            </select>
            <input name="pricePerUnit" type="number" placeholder="Price per unit" value={form.pricePerUnit} onChange={handleChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <input name="expiryDate" type="date" value={form.expiryDate} onChange={handleChange} required
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <input name="supplier" placeholder="Supplier" value={form.supplier} onChange={handleChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 sm:col-span-2" />
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2 rounded-lg transition">
              {editingId ? 'Save Changes' : 'Add Medicine'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-5 py-2 rounded-lg transition">
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Expiry</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((m) => (
                <tr key={m._id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-800">{m.name}</td>
                  <td className="px-4 py-3 text-gray-600">{m.category || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={m.stockQuantity <= 10 ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                      {m.stockQuantity} {m.unit}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">Rs. {m.pricePerUnit}</td>
                  <td className="px-4 py-3">
                    <span className={
                      isExpired(m.expiryDate) ? 'text-red-600 font-semibold' :
                      isExpiringSoon(m.expiryDate) ? 'text-yellow-600 font-semibold' :
                      'text-gray-600'
                    }>
                      {new Date(m.expiryDate).toLocaleDateString()}
                      {isExpired(m.expiryDate) && ' (Expired)'}
                      {!isExpired(m.expiryDate) && isExpiringSoon(m.expiryDate) && ' (Soon)'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{m.supplier || '-'}</td>
                  <td className="px-4 py-3 space-x-3">
                    <button onClick={() => handleEdit(m)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(m._id)} className="text-red-600 hover:text-red-800 text-sm font-medium">
                      Delete
                    </button>
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

export default Pharmacy;