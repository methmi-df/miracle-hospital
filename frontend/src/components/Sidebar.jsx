import { Link, useLocation, useNavigate } from 'react-router-dom';

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const username = localStorage.getItem('username');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const allLinks = [
    { name: 'Dashboard', icon: '📊', path: '/dashboard', roles: ['admin','doctor','nurse','receptionist','lab','pharmacist','accountant','patient'] },
    { name: 'Patients', icon: '🧑‍⚕️', path: '/patients', roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
    { name: 'Doctors', icon: '👨‍⚕️', path: '/doctors', roles: ['admin'] },
    { name: 'Appointments', icon: '📅', path: '/appointments', roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
    { name: 'Billing', icon: '💳', path: '/billing', roles: ['admin', 'receptionist', 'accountant'] },
    { name: 'Pharmacy', icon: '💊', path: '/pharmacy', roles: ['admin', 'pharmacist'] },
    { name: 'Laboratory', icon: '🧪', path: '/laboratory', roles: ['admin', 'doctor', 'lab'] },
    { name: 'Staff', icon: '👥', path: '/staff', roles: ['admin'] },
    { name: 'Reports', icon: '📈', path: '/reports', roles: ['admin', 'accountant'] },
    { name: 'My Appointments', icon: '📅', path: '/my-appointments', roles: ['patient'] },
    { name: 'My Records', icon: '📋', path: '/my-records', roles: ['patient'] },
  ];
  const links = allLinks.filter((l) => l.roles.includes(role));

  return (
    <div className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
        <div className="w-9 h-9 bg-teal-700 rounded-lg flex items-center justify-center text-white">🏥</div>
        <div>
          <p className="font-bold text-gray-800 leading-tight">Miracle Hospital</p>
          <p className="text-xs text-gray-400">Hospital Management</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map((l) => (
          <Link
            key={l.path}
            to={l.path}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
              location.pathname === l.path
                ? 'bg-teal-50 text-teal-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span>{l.icon}</span>
            {l.name}
          </Link>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-semibold text-sm">
            {username?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">{username}</p>
            <p className="text-xs text-gray-400 capitalize">{role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 rounded-lg transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;