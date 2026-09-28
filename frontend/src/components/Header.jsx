import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Bell,
  Menu,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  User,
  X
} from 'lucide-react';

function Header({ setMobileOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Admin';
  const role = localStorage.getItem('role') || 'admin';

  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Lab Report Ready',
      desc: 'Blood count results for Noah Williams are finalized',
      time: '12 min ago',
      type: 'lab',
      unread: true,
    },
    {
      id: 2,
      title: 'New Patient Registered',
      desc: 'Olivia Bennett added to Cardiology ward',
      time: '25 min ago',
      type: 'patient',
      unread: true,
    },
    {
      id: 3,
      title: 'Low Stock Alert',
      desc: 'Amoxicillin 500mg has reached reorder threshold (8 units left)',
      time: '1 hour ago',
      type: 'pharmacy',
      unread: true,
    },
    {
      id: 4,
      title: 'Payment Confirmed',
      desc: 'Invoice #INV-2048 paid via Card ($320.00)',
      time: '2 hours ago',
      type: 'billing',
      unread: false,
    },
  ]);

  // Path names mapping for breadcrumbs
  const routeNames = {
    '/dashboard': 'Dashboard',
    '/patients': 'Patients',
    '/appointments': 'Appointments',
    '/doctors': 'Doctors',
    '/billing': 'Billing & Payments',
    '/pharmacy': 'Pharmacy Inventory',
    '/laboratory': 'Laboratory Services',
    '/staff': 'Staff Management',
    '/beds': 'Bed Management',
    '/reports': 'Reports & Analytics',
    '/my-appointments': 'My Appointments',
    '/my-records': 'My Medical Records',
  };

  const currentTitle = routeNames[location.pathname] || 'Dashboard';

  // Keyboard shortcut Ctrl+K / Cmd+K to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setNotificationsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const initials = username
    ? username
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'AD';

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    setUnreadCount(0);
  };

  const quickSearchItems = [
    { title: 'Patients Management', path: '/patients', category: 'Module' },
    { title: 'Today\'s Appointments', path: '/appointments', category: 'Module' },
    { title: 'Doctors Directory', path: '/doctors', category: 'Module' },
    { title: 'Pharmacy & Stock', path: '/pharmacy', category: 'Module' },
    { title: 'Laboratory Tests', path: '/laboratory', category: 'Module' },
    { title: 'Billing & Invoices', path: '/billing', category: 'Module' },
    { title: 'Staff Directory', path: '/staff', category: 'Module' },
    { title: 'Bed Management & Wards', path: '/beds', category: 'Module' },
  ];

  const filteredSearch = searchQuery.trim()
    ? quickSearchItems.filter((i) =>
        i.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : quickSearchItems.slice(0, 5);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 sm:px-8 flex items-center justify-between">
      {/* Left: Mobile Menu + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen((prev) => !prev)}
          className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumbs matching Careflow screenshot */}
        <nav className="flex items-center gap-1.5 text-sm">
          <span className="text-slate-400 font-medium">Workspace</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 stroke-[2.5]" />
          <span className="font-semibold text-slate-800">{currentTitle}</span>
        </nav>
      </div>

      {/* Center: Search Bar */}
      <div className="relative max-w-md w-full mx-4 hidden md:block">
        <div
          onClick={() => setSearchOpen(true)}
          className="flex items-center justify-between px-3.5 py-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/90 rounded-xl cursor-pointer transition text-sm group"
        >
          <div className="flex items-center gap-2.5 text-slate-400 group-hover:text-slate-600">
            <Search className="w-4 h-4" />
            <span className="text-xs font-medium text-slate-400">Search patients, doctors...</span>
          </div>
          <kbd className="text-[11px] font-semibold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded-md shadow-2xs">
            ⌘ K
          </kbd>
        </div>

        {/* Quick Search Palette Dropdown */}
        {searchOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 p-3 z-50">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 mb-2">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Type to search patients, doctors, records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs font-medium text-slate-800 outline-none placeholder-slate-400"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Navigation & Shortcuts
              </p>
              {filteredSearch.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => {
                    navigate(item.path);
                    setSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50/70 rounded-xl flex items-center justify-between transition cursor-pointer"
                >
                  <span>{item.title}</span>
                  <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                    {item.category}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right: Notifications & Profile Avatar */}
      <div className="flex items-center gap-3">
        {/* Mobile search toggle */}
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition cursor-pointer"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-50">
              <div className="px-4 pb-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Notifications</h4>
                  <p className="text-xs text-slate-400">Latest hospital events & alerts</p>
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-50 py-1">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 hover:bg-slate-50/80 transition flex items-start gap-3 ${
                      n.unread ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        n.type === 'lab'
                          ? 'bg-amber-100 text-amber-700'
                          : n.type === 'patient'
                          ? 'bg-blue-100 text-blue-700'
                          : n.type === 'pharmacy'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {n.type === 'lab' ? (
                        <FileText className="w-4 h-4" />
                      ) : n.type === 'patient' ? (
                        <User className="w-4 h-4" />
                      ) : n.type === 'pharmacy' ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-900 truncate">{n.title}</p>
                        <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {n.time}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                        {n.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-4 pt-2 border-t border-slate-100 text-center">
                <span className="text-xs font-medium text-slate-400">
                  System uptime 99.9% · Real-time monitoring active
                </span>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar Circle */}
        <div className="relative pl-1">
          <div
            className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 border-2 border-white shadow-xs flex items-center justify-center font-bold text-xs cursor-pointer hover:ring-2 hover:ring-blue-500/30 transition"
            title={`${username} (${role})`}
          >
            {initials}
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
        </div>
      </div>
    </header>
  );
}

export default Header;
