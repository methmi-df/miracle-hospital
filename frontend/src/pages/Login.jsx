import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { Activity, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';

function Login() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        username,
        password
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('username', res.data.username);
      if (res.data.patientId) {
        localStorage.setItem('patientId', res.data.patientId);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoUser = (user, pass) => {
    setUsername(user);
    setPassword(pass);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 py-10">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
          {/* Header Banner */}
          <div className="bg-linear-to-r from-blue-600 to-indigo-600 px-8 py-7 text-center text-white relative">
            <div className="w-12 h-12 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Activity className="w-6 h-6 stroke-[2.5] text-white" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight">Miracle HMS</h1>
            <p className="text-blue-100 text-xs mt-1 font-medium">
              Enterprise Hospital Management System
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="px-8 py-7 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl px-4 py-2.5 font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer mt-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Switcher Pills */}
          <div className="px-8 pb-6 pt-2 border-t border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Quick Demo Accounts
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setDemoUser('admin', 'admin123')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-lg text-[11px] font-semibold transition"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => setDemoUser('doctor1', 'doctor123')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-lg text-[11px] font-semibold transition"
              >
                Doctor
              </button>
              <button
                type="button"
                onClick={() => setDemoUser('nurse1', 'nurse123')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-lg text-[11px] font-semibold transition"
              >
                Nurse
              </button>
              <button
                type="button"
                onClick={() => setDemoUser('reception1', 'reception123')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-lg text-[11px] font-semibold transition"
              >
                Reception
              </button>
              <button
                type="button"
                onClick={() => setDemoUser('pharmacy1', 'pharmacy123')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-lg text-[11px] font-semibold transition"
              >
                Pharmacy
              </button>
              <button
                type="button"
                onClick={() => setDemoUser('lab1', 'lab123')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-lg text-[11px] font-semibold transition"
              >
                Lab
              </button>
              <button
                type="button"
                onClick={() => setDemoUser('accounts1', 'accounts123')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-lg text-[11px] font-semibold transition"
              >
                Finance
              </button>
            </div>

            <p className="text-center text-xs text-slate-500 mt-4">
              Patient portal access?{' '}
              <Link to="/register" className="text-blue-600 font-bold hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-slate-400 text-xs mt-6 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>HIPAA & GDPR Compliant Medical Portal</span>
        </div>
      </div>
    </div>
  );
}

export default Login;