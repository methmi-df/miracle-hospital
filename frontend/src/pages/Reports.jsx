import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

function Reports() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/reports/summary').then((res) => setData(res.data));
  }, []);

  if (!data) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading reports...</div>;
  }

  const statCard = (label, value, icon, color) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Overview cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {statCard('Total Patients', data.totalPatients, '🧑‍⚕️', 'bg-blue-50')}
          {statCard('Total Doctors', data.totalDoctors, '👨‍⚕️', 'bg-purple-50')}
          {statCard('Staff Members', data.totalEmployees, '👥', 'bg-orange-50')}
          {statCard('Pending Lab Tests', data.pendingLabTests, '🧪', 'bg-yellow-50')}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          {/* Appointments breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Appointments</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Scheduled</span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  {data.appointmentCounts.scheduled}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completed</span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  {data.appointmentCounts.completed}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cancelled</span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                  {data.appointmentCounts.cancelled}
                </span>
              </div>
            </div>
          </div>

          {/* Revenue breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Revenue</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Paid ({data.revenue.paidCount} bills)</span>
                <span className="font-semibold text-green-700">Rs. {data.revenue.paid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Unpaid ({data.revenue.unpaidCount} bills)</span>
                <span className="font-semibold text-yellow-700">Rs. {data.revenue.unpaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <span className="text-sm font-medium text-gray-800">Total Revenue</span>
                <span className="font-bold text-teal-700">
                  Rs. {(data.revenue.paid + data.revenue.unpaid).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Low stock alert */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Low Stock Medicines (≤10 units)</h3>
          {data.lowStockMedicines.length === 0 ? (
            <p className="text-sm text-gray-400">No medicines are low on stock.</p>
          ) : (
            <div className="space-y-2">
              {data.lowStockMedicines.map((m) => (
                <div key={m._id} className="flex justify-between items-center bg-red-50 border border-red-100 rounded-lg px-4 py-2">
                  <span className="text-sm text-gray-800">{m.name}</span>
                  <span className="text-sm font-semibold text-red-600">{m.stockQuantity} left</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Reports;