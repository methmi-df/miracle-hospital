import { Link, useLocation, useNavigate } from 'react-router-dom';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const username = localStorage.getItem('username');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const allLinks = [
    { name: 'Dashboard', path: '/dashboard', roles: ['admin','doctor','nurse','receptionist','lab','pharmacist','accountant','patient'] },
    { name: 'Patients', path: '/patients', roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
    { name: 'Doctors', path: '/doctors', roles: ['admin'] },
    { name: 'Appointments', path: '/appointments', roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
    { name: 'Billing', path: '/billing', roles: ['admin', 'receptionist', 'accountant'] },
    { name: 'Pharmacy', path: '/pharmacy', roles: ['admin', 'pharmacist'] },
    { name: 'Laboratory', path: '/laboratory', roles: ['admin', 'doctor', 'lab'] },
    { name: 'Staff', path: '/staff', roles: ['admin'] },
    { name: 'Reports', path: '/reports', roles: ['admin', 'accountant'] },
    { name: 'My Appointments', path: '/my-appointments', roles: ['patient'] },
    { name: 'My Records', path: '/my-records', roles: ['patient'] },
  ];

  const links = allLinks.filter((l) => l.roles.includes(role));

  return (
    <div>
      {/* Top bar: logo + brand + user info */}
      <div className="bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-teal-700 rounded-lg flex items-center justify-center text-white text-lg">
            🏥
          </div>
          <span className="font-bold text-xl text-gray-800">Miracle Hospital</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {username} <span className="text-gray-400">({role})</span>
          </span>
          <button
            onClick={handleLogout}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-1.5 rounded-lg text-sm font-medium transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Bottom bar: navigation links */}
      <div className="bg-slate-800 px-8">
        <div className="flex items-center gap-1 flex-wrap">
          {links.map((l) => (
            <Link
              key={l.path}
              to={l.path}
              className={`px-4 py-3 text-sm font-medium transition border-b-2 ${
                location.pathname === l.path
                  ? 'text-white border-teal-400'
                  : 'text-slate-300 border-transparent hover:text-white hover:border-slate-500'
              }`}
            >
              {l.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Navbar;