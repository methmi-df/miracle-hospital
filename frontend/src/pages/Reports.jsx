import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import AppLayout from '../components/AppLayout';
import {
  BarChart3,
  Users,
  Stethoscope,
  UserCheck,
  FlaskConical,
  Calendar,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';

function Reports() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/reports/summary`)
      .then((res) => setData(res.data))
      .catch((err) => console.error('Error fetching summary:', err));
  }, []);

  if (!data) {
    return (
      <AppLayout>
        <div className="py-20 text-center text-slate-400 text-xs">
          Loading hospital analytics and performance metrics...
        </div>
      </AppLayout>
    );
  }

  const totalAppts =
    (data.appointmentCounts.scheduled || 0) +
    (data.appointmentCounts.completed || 0) +
    (data.appointmentCounts.cancelled || 0);

  const scheduledPct = totalAppts ? Math.round((data.appointmentCounts.scheduled / totalAppts) * 100) : 0;
  const completedPct = totalAppts ? Math.round((data.appointmentCounts.completed / totalAppts) * 100) : 0;
  const cancelledPct = totalAppts ? Math.round((data.appointmentCounts.cancelled / totalAppts) * 100) : 0;

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Hospital Analytics & Operational Reports
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Executive oversight, revenue audit, patient volumes, and clinical workloads.
          </p>
        </div>

        {/* 4 Overview cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Patients</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1.5">{data.totalPatients}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Doctors Registered</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1.5">{data.totalDoctors}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Staff Workforce</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1.5">{data.totalEmployees}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Diagnostics</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1.5">{data.pendingLabTests}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <FlaskConical className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
        </div>

        {/* Middle Section: Appointments & Financials */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Appointments Distribution */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Appointment Distribution</h3>
                <p className="text-xs text-slate-400 mt-0.5">Summary of scheduled, completed, and cancelled visits</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-4 my-6">
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="flex items-center gap-2 font-medium text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    Scheduled ({data.appointmentCounts.scheduled})
                  </span>
                  <span className="font-bold text-slate-800">{scheduledPct}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${scheduledPct}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="flex items-center gap-2 font-medium text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Completed ({data.appointmentCounts.completed})
                  </span>
                  <span className="font-bold text-slate-800">{completedPct}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${completedPct}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="flex items-center gap-2 font-medium text-slate-700">
                    <XCircle className="w-3.5 h-3.5 text-rose-500" />
                    Cancelled ({data.appointmentCounts.cancelled})
                  </span>
                  <span className="font-bold text-slate-800">{cancelledPct}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full transition-all" style={{ width: `${cancelledPct}%` }}></div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Total Bookings Logged</span>
              <span className="font-bold text-slate-900">{totalAppts} total appointments</span>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Financial & Revenue Summary</h3>
                <p className="text-xs text-slate-400 mt-0.5">Billing settlements and pending receivables</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-4 my-6">
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-emerald-800">Collected Revenue</p>
                  <p className="text-xs text-emerald-600 mt-0.5">{data.revenue.paidCount} settled invoices</p>
                </div>
                <p className="text-xl font-extrabold text-emerald-700">
                  ${data.revenue.paid?.toFixed(2)}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-amber-800">Pending Receivables</p>
                  <p className="text-xs text-amber-600 mt-0.5">{data.revenue.unpaidCount} unpaid invoices</p>
                </div>
                <p className="text-xl font-extrabold text-amber-700">
                  ${data.revenue.unpaid?.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Gross Billed Total</span>
              <span className="text-base font-black text-blue-600">
                ${((data.revenue.paid || 0) + (data.revenue.unpaid || 0)).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Low Stock Items Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Inventory Reorder Attention</h3>
              <p className="text-xs text-slate-400 mt-0.5">Pharmaceutical items with stock levels under 10 units</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>

          {data.lowStockMedicines.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              All pharmaceuticals are sufficiently stocked above minimum levels.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
              {data.lowStockMedicines.map((m) => (
                <div
                  key={m._id}
                  className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-100 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900">{m.name}</p>
                    <p className="text-[10px] text-rose-600 font-semibold mt-0.5">Critical Reorder</p>
                  </div>
                  <span className="px-2.5 py-1 bg-rose-200 text-rose-900 rounded-lg text-xs font-black">
                    {m.stockQuantity} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default Reports;