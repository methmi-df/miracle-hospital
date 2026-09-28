import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../config';

function Register() {
  const [form, setForm] = useState({
    username: '', password: '', name: '', dob: '', gender: 'male', contact: '', address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('username', res.data.username);
      localStorage.setItem('patientId', res.data.patientId);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-600 via-teal-700 to-slate-900 px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-teal-700 px-8 py-6 text-center">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🏥</span>
            </div>
            <h1 className="text-xl font-bold text-white">Miracle Hospital</h1>
            <p className="text-teal-100 text-sm mt-1">Patient Registration</p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input name="name" placeholder="Full name" value={form.name} onChange={handleChange} required
                className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 sm:col-span-2" />
              <input name="dob" type="date" value={form.dob} onChange={handleChange}
                className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500" />
              <select name="gender" value={form.gender} onChange={handleChange}
                className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <input name="contact" placeholder="Contact number" value={form.contact} onChange={handleChange}
                className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500" />
              <input name="address" placeholder="Address" value={form.address} onChange={handleChange}
                className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>

            <hr className="border-gray-100" />

            <input name="username" placeholder="Choose a username" value={form.username} onChange={handleChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <input name="password" type="password" placeholder="Choose a password" value={form.password} onChange={handleChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500" />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition shadow-lg shadow-teal-600/30"
            >
              {loading ? 'Creating account...' : 'Register'}
            </button>

            <p className="text-center text-sm text-gray-500">
              Already have an account? <Link to="/" className="text-teal-600 font-medium hover:underline">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;