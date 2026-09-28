import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Stethoscope,
  FileText,
  FlaskConical,
  Pill,
  CreditCard,
  UserCheck,
  BarChart3,
  Settings,
  ShieldCheck,
  ChevronDown,
  LogOut,
  Building2,
  MoreVertical,
  Activity,
  Bed,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';

function Sidebar({ mobileOpen, setMobileOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Admin';
  const role = localStorage.getItem('role') || 'admin';
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState('Miracle Central Hospital');

  // Password Change Modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState(null);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({ text: 'New passwords do not match.', type: 'error' });
      return;
    }
    setPasswordLoading(true);
    setPasswordMsg(null);
    try {
      await axios.post(`${API_URL}/api/auth/change-password`, {
        username,
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordMsg({ text: 'Password successfully updated!', type: 'success' });
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordMsg(null);
      }, 1500);
    } catch (err) {
      setPasswordMsg({ text: err.response?.data?.message || 'Failed to update password.', type: 'error' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // Extract initials
  const initials = username
    ? username
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'AD';

  const overviewLinks = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['admin', 'doctor', 'nurse', 'receptionist', 'lab', 'pharmacist', 'accountant', 'patient'] },
  ];

  const managementLinks = [
    { name: 'Patients', icon: Users, path: '/patients', roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
    { name: 'Appointments', icon: Calendar, path: '/appointments', roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
    { name: 'Doctors', icon: Stethoscope, path: '/doctors', roles: ['admin'] },
    { name: 'Medical records', icon: FileText, path: '/patients', roles: ['admin', 'doctor', 'nurse'] },
    { name: 'Laboratory', icon: FlaskConical, path: '/laboratory', roles: ['admin', 'doctor', 'lab'] },
    { name: 'Pharmacy', icon: Pill, path: '/pharmacy', roles: ['admin', 'pharmacist'] },
    { name: 'Billing', icon: CreditCard, path: '/billing', roles: ['admin', 'receptionist', 'accountant'] },
    { name: 'Staff', icon: UserCheck, path: '/staff', roles: ['admin'] },
    { name: 'Beds', icon: Bed, path: '/beds', roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
    { name: 'Reports', icon: BarChart3, path: '/reports', roles: ['admin', 'accountant'] },
    // Patient specific
    { name: 'My Appointments', icon: Calendar, path: '/my-appointments', roles: ['patient'] },
    { name: 'My Records', icon: FileText, path: '/my-records', roles: ['patient'] },
  ];

  const filteredOverview = overviewLinks.filter((l) => l.roles.includes(role));
  const filteredManagement = managementLinks.filter((l) => l.roles.includes(role));

  const roleLabels = {
    admin: 'Administrator',
    doctor: 'Medical Doctor',
    nurse: 'Senior Nurse',
    receptionist: 'Front Desk',
    lab: 'Laboratory Specialist',
    pharmacist: 'Lead Pharmacist',
    accountant: 'Finance Accountant',
    patient: 'Patient'
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 shrink-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
              <Activity className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-lg leading-tight tracking-tight">
                Miracle HMS
              </h1>
              <p className="text-xs font-medium text-slate-400">Hospital management</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace Selector */}
        <div className="px-4 py-2">
          <div className="relative">
            <button
              onClick={() => setWorkspaceOpen(!workspaceOpen)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/70 transition-colors text-left group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                  MH
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider leading-none">
                    Workspace
                  </p>
                  <p className="text-xs font-semibold text-slate-800 truncate mt-0.5">
                    {selectedWorkspace}
                  </p>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 shrink-0 ml-1" />
            </button>

            {/* Workspace dropdown */}
            {workspaceOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-20">
                {['Miracle Central Hospital', 'Miracle West Wing Clinic', 'Miracle Emergency Unit'].map(
                  (ws) => (
                    <button
                      key={ws}
                      onClick={() => {
                        setSelectedWorkspace(ws);
                        setWorkspaceOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center gap-2 hover:bg-slate-50 transition ${
                        selectedWorkspace === ws ? 'text-blue-600 bg-blue-50/60 font-semibold' : 'text-slate-600'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span className="truncate">{ws}</span>
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 px-3 py-3 overflow-y-auto space-y-6">
          {/* OVERVIEW */}
          <div>
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Overview
            </p>
            <div className="space-y-1">
              {filteredOverview.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileOpen?.(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-blue-50/90 text-blue-600 shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 stroke-[2.2]' : 'text-slate-400 stroke-[1.8]'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* MANAGEMENT */}
          {filteredManagement.length > 0 && (
            <div>
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Management
              </p>
              <div className="space-y-1">
                {filteredManagement.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setMobileOpen?.(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                        isActive
                          ? 'bg-blue-50/90 text-blue-600 shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 stroke-[2.2]' : 'text-slate-400 stroke-[1.8]'}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Support Card & Footer Profile */}
        <div className="p-3 border-t border-slate-100 space-y-2 bg-white">
          {/* Need help card */}
          <div className="bg-blue-50/60 border border-blue-100/80 rounded-2xl p-3.5">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Need help?</p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                  Visit our support center
                </p>
                <button
                  type="button"
                  onClick={() => {
                    alert('Miracle Hospital Support Desk: ext 4099 | emergency@miraclehms.org');
                  }}
                  className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-700 mt-2 transition cursor-pointer"
                >
                  Get support →
                </button>
              </div>
            </div>
          </div>

          {/* Settings link */}
          <button
            type="button"
            onClick={() => {
              setShowPasswordModal(true);
              setPasswordMsg(null);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100/70 transition text-left cursor-pointer"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Account Settings</span>
          </button>

          {/* User Profile */}
          <div className="relative pt-1">
            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200/60">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 border-2 border-white shadow-xs flex items-center justify-center font-bold text-xs shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {username}
                  </p>
                  <p className="text-[11px] font-medium text-slate-400 capitalize truncate">
                    {roleLabels[role] || role}
                  </p>
                </div>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition cursor-pointer"
                  title="Account options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {showUserMenu && (
                  <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-30">
                    <div className="px-3 py-1.5 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900 truncate">{username}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">{role}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        setShowPasswordModal(true);
                        setPasswordMsg(null);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                      Change Password
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* CHANGE PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Security & Password</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {passwordMsg && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  passwordMsg.type === 'error'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {passwordMsg.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Enter current password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Password (min. 6 chars) *</label>
                <input
                  type="password"
                  required
                  placeholder="Enter new password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Repeat new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition shadow-md shadow-blue-500/20"
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;