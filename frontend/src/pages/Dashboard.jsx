import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

function Dashboard() {
  const username = localStorage.getItem('username');
  const role = localStorage.getItem('role');
  const [summary, setSummary] = useState(null);
  const [appointments, setAppointments] = useState([]);

  const canSeeSummary = ['admin', 'accountant'].includes(role);
  const canSeeAppointments = ['admin', 'doctor', 'nurse', 'receptionist'].includes(role);

  useEffect(() => {
    if (canSeeSummary) {
      axios.get('http://localhost:5000/api/reports/summary').then((res) => setSummary(res.data));
    }
    if (canSeeAppointments) {
      axios.get('http://localhost:5000/api/appointments').then((res) => {
        const today = new Date().toDateString();
        const todays = res.data.filter((a) => new Date(a.date).toDateString() === today);
        setAppointments(todays.slice(0, 5));
      });
    }
  }, [role]);

  const allModules = [
    { name: 'Patients', icon: '🧑‍⚕️', path: '/patients', desc: 'Manage patient records', roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
    { name: 'Doctors', icon: '👨‍⚕️', path: '/doctors', desc: 'Manage doctor profiles', roles: ['admin'] },
    { name: 'Appointments', icon: '📅', path: '/appointments', desc: 'Book & track appointments', roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
    { name: 'Billing', icon: '💳', path: '/billing', desc: 'Manage patient bills', roles: ['admin', 'receptionist', 'accountant'] },
    { name: 'Pharmacy', icon: '💊', path: '/pharmacy', desc: 'Medicine inventory & stock', roles: ['admin', 'pharmacist'] },
    { name: 'Laboratory', icon: '🧪', path: '/laboratory', desc: 'Test requests & results', roles: ['admin', 'doctor', 'lab'] },
    { name: 'Staff', icon: '👥', path: '/staff', desc: 'Employee records & attendance', roles: ['admin'] },
    { name: 'Reports', icon: '📊', path: '/reports', desc: 'Analytics & revenue summary', roles: ['admin', 'accountant'] },
    { name: 'My Appointments', icon: '📅', path: '/my-appointments', desc: 'View & book your appointments', roles: ['patient'] },
    { name: 'My Records', icon: '📋', path: '/my-records', desc: 'View your medical history', roles: ['patient'] },
  ];
  const modules = allModules.filter((m) => m.roles.includes(role));

  const statCard = (label, value, icon, color, link) => {
    const content = (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          </div>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${color}`}>{icon}</div>
        </div>
      </div>
    );
    return link ? <Link to={link}>{content}</Link> : content;
  };

  const statusColor = {
    scheduled: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-8 py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Welcome back, {username} 👋</h2>
        <p className="text-gray-500 mb-8">Here's what's happening at Miracle Hospital today.</p>

        {/* Live stat cards — admin/accountant only */}
        {canSeeSummary && summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {statCard('Total Patients', summary.totalPatients, '🧑‍⚕️', 'bg-blue-50', '/patients')}
            {statCard('Total Doctors', summary.totalDoctors, '👨‍⚕️', 'bg-purple-50', '/doctors')}
            {statCard('Pending Lab Tests', summary.pendingLabTests, '🧪', 'bg-yellow-50', '/laboratory')}
            {statCard('Low Stock Items', summary.lowStockMedicines.length, '💊', 'bg-red-50', '/pharmacy')}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick module links */}
          <div className="lg:col-span-2">
            <h3 className="font-semibold text-gray-800 mb-3">Modules</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {modules.map((m) => (
                <Link
                  key={m.name}
                  to={m.path}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 p-5 transition"
                >
                  <div className="text-2xl mb-2">{m.icon}</div>
                  <h4 className="font-semibold text-gray-800 text-sm">{m.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">{m.desc}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Today's appointments sidebar — staff only */}
          {canSeeAppointments && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Today's Appointments</h3>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
                {appointments.length === 0 && (
                  <p className="text-sm text-gray-400">No appointments scheduled for today.</p>
                )}
                {appointments.map((a) => (
                  <div key={a._id} className="flex justify-between items-center border-b border-gray-50 last:border-0 pb-2 last:pb-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{a.patient?.name || '—'}</p>
                      <p className="text-xs text-gray-500">{a.time} · {a.doctor?.name}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[a.status]}`}>
                      {a.status}
                    </span>
                  </div>
                ))}
                {appointments.length > 0 && (
                  <Link to="/appointments" className="block text-center text-teal-600 text-sm font-medium pt-2">
                    View all →
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Low stock alert banner — admin/pharmacist */}
        {canSeeSummary && summary && summary.lowStockMedicines.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between">
            <p className="text-sm text-red-700">
              ⚠️ {summary.lowStockMedicines.length} medicine(s) are running low on stock.
            </p>
            <Link to="/pharmacy" className="text-sm font-medium text-red-700 underline">
              Review Pharmacy →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;