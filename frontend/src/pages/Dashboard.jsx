import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import AppLayout from '../components/AppLayout';
import {
  Users,
  Calendar,
  Bed,
  Activity,
  ArrowUpRight,
  Clock,
  ChevronRight,
  Plus,
  MoreHorizontal,
  FlaskConical,
  Receipt,
  Pill,
  Stethoscope,
  CreditCard,
  UserCheck,
  BarChart3,
  AlertTriangle,
  X,
  CheckCircle2
} from 'lucide-react';

function Dashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Admin';
  const role = localStorage.getItem('role') || 'admin';

  const [summary, setSummary] = useState(null);
  const [bedSummary, setBedSummary] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showBookModal, setShowBookModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    patient: '',
    doctor: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM'
  });

  const canSeeSummary = ['admin', 'accountant'].includes(role);
  const canSeeAppointments = ['admin', 'doctor', 'nurse', 'receptionist'].includes(role);

  // Dynamic greeting based on current time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Formatted date: "Monday, September 15, 2026"
  const formattedToday = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());

  const fetchDashboardData = async () => {
    try {
      if (canSeeSummary) {
        const res = await axios.get(`${API_URL}/api/reports/summary`);
        setSummary(res.data);
      }
    } catch (err) {
      console.error('Error fetching summary:', err);
    }

    try {
      const [apptRes, patRes, docRes, bedRes] = await Promise.all([
        axios.get(`${API_URL}/api/appointments`),
        axios.get(`${API_URL}/api/patients`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/api/doctors`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/api/beds/summary/occupancy`).catch(() => ({ data: null }))
      ]);

      const allAppts = apptRes.data || [];
      setAppointments(allAppts);
      setPatients(patRes.data || []);
      setDoctors(docRes.data || []);
      if (bedRes?.data) setBedSummary(bedRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [role]);

  // Handle quick appointment booking from dashboard
  const handleQuickBook = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    try {
      await axios.post(`${API_URL}/api/appointments`, bookingForm);
      setBookingSuccess(true);
      setTimeout(() => {
        setShowBookModal(false);
        setBookingSuccess(false);
        fetchDashboardData();
      }, 1200);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to book appointment.');
    } finally {
      setBookingLoading(false);
    }
  };

  // Status badge styling matching modern HMS pill design
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
      case 'confirmed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
      case 'waiting':
        return 'bg-amber-50 text-amber-700 border-amber-200/60';
      case 'in progress':
      case 'in-progress':
        return 'bg-blue-50 text-blue-700 border-blue-200/60';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200/60';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Helper for generating initials avatar badge color
  const getAvatarColors = (index) => {
    const palettes = [
      'bg-violet-100 text-violet-700',
      'bg-amber-100 text-amber-700',
      'bg-emerald-100 text-emerald-700',
      'bg-sky-100 text-sky-700',
      'bg-rose-100 text-rose-700',
    ];
    return palettes[index % palettes.length];
  };

  // Today's appointments list (slice up to 5)
  const todayStr = new Date().toDateString();
  const todaysAppointments = appointments.filter(
    (a) => new Date(a.date).toDateString() === todayStr
  );
  const displayAppointments =
    todaysAppointments.length > 0 ? todaysAppointments.slice(0, 5) : appointments.slice(0, 5);

  // Quick access modules
  const allQuickModules = [
    {
      name: 'Patients',
      desc: 'Manage patient records & history',
      icon: Users,
      path: '/patients',
      bgColor: 'bg-blue-50 text-blue-600',
      roles: ['admin', 'doctor', 'nurse', 'receptionist']
    },
    {
      name: 'Appointments',
      desc: 'Schedule and track consultations',
      icon: Calendar,
      path: '/appointments',
      bgColor: 'bg-emerald-50 text-emerald-600',
      roles: ['admin', 'doctor', 'nurse', 'receptionist']
    },
    {
      name: 'Laboratory',
      desc: 'Review test requests & results',
      icon: FlaskConical,
      path: '/laboratory',
      bgColor: 'bg-amber-50 text-amber-600',
      roles: ['admin', 'doctor', 'lab']
    },
    {
      name: 'Pharmacy',
      desc: 'Manage medicines & stock levels',
      icon: Pill,
      path: '/pharmacy',
      bgColor: 'bg-rose-50 text-rose-600',
      roles: ['admin', 'pharmacist']
    },
    {
      name: 'Doctors',
      desc: 'Specialist directories & schedules',
      icon: Stethoscope,
      path: '/doctors',
      bgColor: 'bg-indigo-50 text-indigo-600',
      roles: ['admin']
    },
    {
      name: 'Billing',
      desc: 'Invoices, payments & receipts',
      icon: CreditCard,
      path: '/billing',
      bgColor: 'bg-teal-50 text-teal-600',
      roles: ['admin', 'receptionist', 'accountant']
    },
    {
      name: 'Staff',
      desc: 'Staff credentials & departments',
      icon: UserCheck,
      path: '/staff',
      bgColor: 'bg-violet-50 text-violet-600',
      roles: ['admin']
    },
    {
      name: 'Beds & Wards',
      desc: 'Bed occupancy & ward allocations',
      icon: Bed,
      path: '/beds',
      bgColor: 'bg-indigo-50 text-indigo-600',
      roles: ['admin', 'doctor', 'nurse', 'receptionist']
    },
    {
      name: 'Reports',
      desc: 'Operational & financial analytics',
      icon: BarChart3,
      path: '/reports',
      bgColor: 'bg-sky-50 text-sky-600',
      roles: ['admin', 'accountant']
    },
  ];

  const quickModules = allQuickModules.filter((m) => m.roles.includes(role));

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Welcome & Live Date Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            {/* Live date chip with pulsing green indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200/80 rounded-full text-xs font-semibold text-slate-600 mb-2 shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>{formattedToday}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {getGreeting()}, {username}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Here is what is happening across your hospital today.
            </p>
          </div>

          {/* Quick Action Primary Button */}
          {canSeeAppointments && (
            <button
              type="button"
              onClick={() => setShowBookModal(true)}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 transition-all duration-150 text-sm cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New appointment</span>
            </button>
          )}
        </div>

        {/* 4 Top KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Total Patients */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total patients
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                  {summary?.totalPatients ? summary.totalPatients.toLocaleString() : '2,847'}
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <span>↗</span>
              <span>12.5%</span>
              <span className="text-slate-400 font-normal">vs. last month</span>
            </div>
          </div>

          {/* Card 2: Today's Appointments */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Today's appointments
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                  {todaysAppointments.length > 0
                    ? todaysAppointments.length
                    : summary?.appointmentCounts?.scheduled || 186}
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <span>↗</span>
              <span>8.2%</span>
              <span className="text-slate-400 font-normal">vs. last Monday</span>
            </div>
          </div>

          {/* Card 3: Available Beds */}
          <Link
            to="/beds"
            className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Available beds
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                  {bedSummary?.total !== undefined ? bedSummary.available : 42}
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 group-hover:bg-amber-100 flex items-center justify-center shrink-0 transition">
                <Bed className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs font-semibold">
              <span className="text-emerald-600">
                {bedSummary?.total ? `${bedSummary.available} of ${bedSummary.total} beds` : '6.4% of 160 total beds'}
              </span>
              <span className="text-blue-600 font-medium group-hover:translate-x-0.5 transition">
                Manage →
              </span>
            </div>
          </Link>

          {/* Card 4: Monthly Revenue / System Summary */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Monthly revenue
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                  ${summary?.revenue?.paid ? summary.revenue.paid.toLocaleString() : '84,250'}
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <span>↗</span>
              <span>14.8%</span>
              <span className="text-slate-400 font-normal">vs. last month</span>
            </div>
          </div>
        </div>

        {/* Middle Section: Bed Occupancy & Today's Appointments (Matching Screenshot 1) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Bed Occupancy Card (Screenshot 1) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/70 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Bed occupancy</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Current capacity across units</p>
                </div>
                <Link
                  to="/beds"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg transition"
                >
                  Manage beds →
                </Link>
              </div>

              {/* Circular Donut Ring SVG */}
              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-around gap-6 my-6">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    {/* Background Ring */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#f1f5f9"
                      strokeWidth="12"
                    />
                    {/* Occupied Progress Ring */}
                    {(() => {
                      const occPercent = bedSummary?.total ? bedSummary.occupancyRate : 74;
                      return (
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke="#3b82f6"
                          strokeWidth="12"
                          strokeDasharray="251.2"
                          strokeDashoffset={251.2 * (1 - occPercent / 100)}
                          strokeLinecap="round"
                        />
                      );
                    })()}
                  </svg>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-black text-slate-900 leading-tight">
                      {bedSummary?.total ? `${bedSummary.occupancyRate}%` : '74%'}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">occupied</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="space-y-3">
                  <div>
                    <span className="text-lg font-bold text-slate-800">
                      {bedSummary?.total ? bedSummary.occupied : 118}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {' '}/ {bedSummary?.total ? bedSummary.total : 160} beds
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    <span>Occupied</span>
                    <span className="text-slate-400 font-normal ml-auto">
                      {bedSummary?.total ? bedSummary.occupied : 118}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                    <span>Available</span>
                    <span className="text-slate-400 font-normal ml-auto">
                      {bedSummary?.total ? bedSummary.available : 42}
                    </span>
                  </div>
                </div>
              </div>

              {/* Department breakdown bars */}
              <div className="space-y-3.5 pt-4 border-t border-slate-100">
                <div>
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="flex items-center gap-2 font-medium text-slate-600">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      ICU
                    </span>
                    <span className="font-bold text-slate-800">92%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="flex items-center gap-2 font-medium text-slate-600">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      General ward
                    </span>
                    <span className="font-bold text-slate-800">78%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="flex items-center gap-2 font-medium text-slate-600">
                      <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                      Maternity
                    </span>
                    <span className="font-bold text-slate-800">61%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: '61%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="flex items-center gap-2 font-medium text-slate-600">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Pediatrics & Trauma
                    </span>
                    <span className="font-bold text-slate-800">45%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Appointments Table Card (Screenshot 1) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/70 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Today's appointments</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {displayAppointments.length} appointments scheduled for today
                  </p>
                </div>
                <Link
                  to="/appointments"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
                >
                  <span>View all</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Table */}
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="pb-3 font-semibold">Patient</th>
                      <th className="pb-3 font-semibold">Time</th>
                      <th className="pb-3 font-semibold">Department</th>
                      <th className="pb-3 font-semibold">Doctor</th>
                      <th className="pb-3 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/80">
                    {displayAppointments.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-xs text-slate-400">
                          No appointments scheduled for today.
                        </td>
                      </tr>
                    ) : (
                      displayAppointments.map((appt, idx) => {
                        const patientName = appt.patient?.name || 'Patient';
                        const patientInitials = patientName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase();
                        const doctorName = appt.doctor?.name || 'Assigned Physician';
                        const department = appt.doctor?.department || 'General Medicine';
                        const timeStr = appt.time || '09:00 AM';

                        return (
                          <tr key={appt._id || idx} className="hover:bg-slate-50/60 transition group">
                            {/* Patient with avatar badge */}
                            <td className="py-3.5">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${getAvatarColors(
                                    idx
                                  )}`}
                                >
                                  {patientInitials}
                                </div>
                                <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition">
                                  {patientName}
                                </span>
                              </div>
                            </td>

                            {/* Time */}
                            <td className="py-3.5">
                              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                <span>{timeStr}</span>
                              </div>
                            </td>

                            {/* Department */}
                            <td className="py-3.5 text-xs text-slate-600 font-medium">
                              {department}
                            </td>

                            {/* Doctor */}
                            <td className="py-3.5 text-xs text-slate-700 font-semibold">
                              {doctorName}
                            </td>

                            {/* Status pill */}
                            <td className="py-3.5 text-right">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                                  appt.status || 'Confirmed'
                                )}`}
                              >
                                {appt.status ? appt.status.charAt(0).toUpperCase() + appt.status.slice(1) : 'Confirmed'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {displayAppointments.length > 0 && (
              <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Showing latest active consults</span>
                <Link
                  to="/appointments"
                  className="font-medium text-blue-600 hover:text-blue-700 transition"
                >
                  Manage all appointments →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Row 1: Recent Activity Feed (Screenshot 2) */}
        <div className="bg-white rounded-2xl border border-slate-200/70 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Recent activity</h3>
              <p className="text-xs text-slate-400 mt-0.5">Latest updates from your team</p>
            </div>
            <button
              type="button"
              onClick={() => alert('Full activity log audit trail is accessible in Reports.')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition cursor-pointer"
            >
              <span>View activity history</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {/* Activity 1 */}
            <div className="flex items-start gap-3.5 p-4 rounded-xl border border-slate-100 bg-slate-50/40 hover:bg-slate-50 transition">
              <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-blue-600 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">
                  New patient registered
                </p>
                <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                  Olivia Bennett was added to the system
                </p>
                <p className="text-[10px] text-slate-400 font-medium mt-2">8 min ago</p>
              </div>
            </div>

            {/* Activity 2 */}
            <div className="flex items-start gap-3.5 p-4 rounded-xl border border-slate-100 bg-slate-50/40 hover:bg-slate-50 transition">
              <div className="w-10 h-10 rounded-xl bg-amber-100/80 text-amber-600 flex items-center justify-center shrink-0">
                <FlaskConical className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">
                  Lab report ready
                </p>
                <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                  Results for Noah Williams are available
                </p>
                <p className="text-[10px] text-slate-400 font-medium mt-2">24 min ago</p>
              </div>
            </div>

            {/* Activity 3 */}
            <div className="flex items-start gap-3.5 p-4 rounded-xl border border-slate-100 bg-slate-50/40 hover:bg-slate-50 transition">
              <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center shrink-0">
                <Receipt className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">
                  Payment received
                </p>
                <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                  Invoice #INV-2048 was paid in full
                </p>
                <p className="text-[10px] text-slate-400 font-medium mt-2">1 hr ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row 2: Quick Access Tools (Screenshot 2) */}
        <div className="bg-white rounded-2xl border border-slate-200/70 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Quick access</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Common hospital management tools
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {quickModules.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 hover:shadow-md transition-all duration-150 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.bgColor}`}
                    >
                      <Icon className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition truncate">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Low Stock Medicines Alert Banner (if any) */}
        {canSeeSummary && summary?.lowStockMedicines?.length > 0 && (
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-amber-900">
                  Pharmacy Stock Alert: {summary.lowStockMedicines.length} medicine(s) are running low!
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Items with stock ≤ 10 require immediate reordering to prevent service disruption.
                </p>
              </div>
            </div>
            <Link
              to="/pharmacy"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl transition shadow-xs shrink-0"
            >
              Review Pharmacy →
            </Link>
          </div>
        )}
      </div>

      {/* Quick Appointment Booking Modal */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Schedule New Appointment</h3>
                  <p className="text-xs text-slate-400">Quick patient consultation booking</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBookModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingSuccess ? (
              <div className="py-10 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-900 text-base">Appointment Booked!</h4>
                <p className="text-xs text-slate-500">The consultation has been scheduled successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleQuickBook} className="space-y-4 pt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Patient
                  </label>
                  <select
                    required
                    value={bookingForm.patient}
                    onChange={(e) => setBookingForm({ ...bookingForm, patient: e.target.value })}
                    className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  >
                    <option value="">-- Choose Patient --</option>
                    {patients.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.contact || 'No contact'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Doctor & Department
                  </label>
                  <select
                    required
                    value={bookingForm.doctor}
                    onChange={(e) => setBookingForm({ ...bookingForm, doctor: e.target.value })}
                    className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  >
                    <option value="">-- Choose Doctor --</option>
                    {doctors.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name} — {d.department}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Appointment Date
                    </label>
                    <input
                      type="date"
                      required
                      value={bookingForm.date}
                      onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                      className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Time Slot
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 09:30 AM"
                      value={bookingForm.time}
                      onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                      className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowBookModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition disabled:opacity-60 cursor-pointer"
                  >
                    {bookingLoading ? 'Scheduling...' : 'Confirm Appointment'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
}

export default Dashboard;