import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import AppLayout from '../components/AppLayout';
import {
  Bed as BedIcon,
  Plus,
  Search,
  UserCheck,
  UserX,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Users,
  Activity,
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';

const WARD_CONFIG = {
  'ICU': {
    badge: 'bg-rose-50 text-rose-700 border-rose-200/80',
    bar: 'bg-rose-500',
    light: 'bg-rose-500/10 text-rose-600',
    border: 'border-rose-100'
  },
  'General Ward': {
    badge: 'bg-blue-50 text-blue-700 border-blue-200/80',
    bar: 'bg-blue-500',
    light: 'bg-blue-500/10 text-blue-600',
    border: 'border-blue-100'
  },
  'Maternity': {
    badge: 'bg-purple-50 text-purple-700 border-purple-200/80',
    bar: 'bg-purple-500',
    light: 'bg-purple-500/10 text-purple-600',
    border: 'border-purple-100'
  },
  'Pediatrics': {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    bar: 'bg-emerald-500',
    light: 'bg-emerald-500/10 text-emerald-600',
    border: 'border-emerald-100'
  },
  'Trauma': {
    badge: 'bg-amber-50 text-amber-700 border-amber-200/80',
    bar: 'bg-amber-500',
    light: 'bg-amber-500/10 text-amber-600',
    border: 'border-amber-100'
  }
};

function Beds() {
  const [beds, setBeds] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWard, setSelectedWard] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [assignModalBed, setAssignModalBed] = useState(null);
  const [dischargeModalBed, setDischargeModalBed] = useState(null);

  // Forms
  const [form, setForm] = useState({ bedNumber: '', ward: 'ICU' });
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  const showToast = (message, type = 'success') => {
    setActionMessage({ message, type });
    setTimeout(() => setActionMessage(null), 3500);
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [bedRes, patRes] = await Promise.all([
        axios.get(`${API_URL}/api/beds`),
        axios.get(`${API_URL}/api/patients`).catch(() => ({ data: [] }))
      ]);
      setBeds(bedRes.data || []);
      setPatients(patRes.data || []);
    } catch (err) {
      console.error('Error fetching bed data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleSeedDefaults = async () => {
    try {
      setSubmitting(true);
      const res = await axios.post(`${API_URL}/api/beds/seed`);
      setBeds(res.data.beds || []);
      showToast('Sample hospital ward beds initialized!');
      fetchAll();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to initialize beds', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddBed = async (e) => {
    e.preventDefault();
    if (!form.bedNumber.trim()) return;
    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/api/beds`, form);
      setForm({ bedNumber: '', ward: 'ICU' });
      setShowAddModal(false);
      showToast(`Bed ${form.bedNumber} added successfully to ${form.ward}`);
      fetchAll();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add bed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignPatient = async (e) => {
    e.preventDefault();
    if (!assignModalBed || !selectedPatientId) return;
    setSubmitting(true);
    try {
      await axios.put(`${API_URL}/api/beds/${assignModalBed._id}/assign`, {
        patient: selectedPatientId
      });
      const assignedPat = patients.find((p) => p._id === selectedPatientId);
      setAssignModalBed(null);
      setSelectedPatientId('');
      setPatientSearch('');
      showToast(`Bed ${assignModalBed.bedNumber} assigned to ${assignedPat?.name || 'patient'}`);
      fetchAll();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to assign patient.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDischarge = async () => {
    if (!dischargeModalBed) return;
    setSubmitting(true);
    try {
      await axios.put(`${API_URL}/api/beds/${dischargeModalBed._id}/discharge`);
      showToast(`Bed ${dischargeModalBed.bedNumber} has been discharged and is now available`);
      setDischargeModalBed(null);
      fetchAll();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to discharge bed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBed = async (bed) => {
    if (!window.confirm(`Are you sure you want to permanently delete bed "${bed.bedNumber}"?`)) return;
    try {
      await axios.delete(`${API_URL}/api/beds/${bed._id}`);
      showToast(`Bed ${bed.bedNumber} removed.`);
      fetchAll();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete bed.', 'error');
    }
  };

  // Filter beds
  const filteredBeds = beds.filter((b) => {
    const matchesSearch =
      b.bedNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.ward.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.patient?.name && b.patient.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesWard = selectedWard === 'All' || b.ward === selectedWard;
    const matchesStatus = selectedStatus === 'All' || b.status === selectedStatus;

    return matchesSearch && matchesWard && matchesStatus;
  });

  // KPI Calculations
  const totalBedsCount = beds.length;
  const occupiedCount = beds.filter((b) => b.status === 'occupied').length;
  const availableCount = totalBedsCount - occupiedCount;
  const occupancyRate = totalBedsCount > 0 ? Math.round((occupiedCount / totalBedsCount) * 100) : 0;

  const wardsList = ['All', 'ICU', 'General Ward', 'Maternity', 'Pediatrics', 'Trauma'];

  // Filtered patients for assignment modal
  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
      (p.contact && p.contact.includes(patientSearch))
  );

  return (
    <AppLayout>
      <div className="space-y-8 pb-12">
        {/* Toast Alert */}
        {actionMessage && (
          <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-sm font-semibold transition-all animate-bounce duration-300 ${
              actionMessage.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
          >
            {actionMessage.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-600" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            )}
            <span>{actionMessage.message}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200/80 rounded-full text-xs font-semibold text-slate-600 mb-2 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Ward & Inpatient Operations</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Bed Management
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Live ward capacity tracking, patient admission allocation, and real-time occupancy.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {beds.length === 0 && (
              <button
                type="button"
                onClick={handleSeedDefaults}
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-xl border border-slate-200 text-sm transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Load Sample Beds</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 transition text-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add New Bed</span>
            </button>
          </div>
        </div>

        {/* 4 KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Total Beds */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Capacity
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                  {totalBedsCount}
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <BedIcon className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Across 5 departments</span>
              <span className="font-semibold text-slate-700">100% active</span>
            </div>
          </div>

          {/* Card 2: Available Beds */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Available Beds
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-2">
                  {availableCount}
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>
                {totalBedsCount > 0 ? Math.round((availableCount / totalBedsCount) * 100) : 0}% ready for admission
              </span>
            </div>
          </div>

          {/* Card 3: Occupied Beds */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Occupied Beds
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-rose-600 mt-2">
                  {occupiedCount}
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-rose-600">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>Currently admitted patients</span>
            </div>
          </div>

          {/* Card 4: Occupancy Rate */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Occupancy Rate
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                  {occupancyRate}%
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    occupancyRate > 85 ? 'bg-rose-500' : occupancyRate > 60 ? 'bg-blue-600' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by bed number, patient or ward..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status Filter Buttons */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl shrink-0">
              {['All', 'available', 'occupied'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSelectedStatus(st)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                    selectedStatus === st
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st === 'All' ? 'All Status' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Ward Selector Pills */}
          <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mr-2 shrink-0">
              <Filter className="w-3.5 h-3.5" />
              Wards:
            </span>
            {wardsList.map((w) => {
              const wardBeds = w === 'All' ? beds : beds.filter((b) => b.ward === w);
              const count = wardBeds.length;
              const isSelected = selectedWard === w;

              return (
                <button
                  key={w}
                  type="button"
                  onClick={() => setSelectedWard(w)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{w}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                      isSelected ? 'bg-blue-700 text-white' : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bed Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-6 animate-pulse space-y-4">
                <div className="flex justify-between items-center">
                  <div className="h-5 w-24 bg-slate-200 rounded"></div>
                  <div className="h-5 w-16 bg-slate-200 rounded-full"></div>
                </div>
                <div className="h-16 bg-slate-100 rounded-xl"></div>
                <div className="h-9 bg-slate-200 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : filteredBeds.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <BedIcon className="w-8 h-8 stroke-[1.8]" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No beds found</h3>
            <p className="text-sm text-slate-500 mt-1">
              {searchQuery || selectedWard !== 'All' || selectedStatus !== 'All'
                ? 'No beds matched your active filters. Try adjusting search query or ward selection.'
                : 'There are no beds registered in the hospital yet. Add your first bed or load default sample beds.'}
            </p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              {(searchQuery || selectedWard !== 'All' || selectedStatus !== 'All') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedWard('All');
                    setSelectedStatus('All');
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
                >
                  Clear Filters
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition"
              >
                + Add Bed
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBeds.map((bed) => {
              const isOccupied = bed.status === 'occupied';
              const wardStyle = WARD_CONFIG[bed.ward] || {
                badge: 'bg-slate-100 text-slate-700 border-slate-200',
                light: 'bg-slate-100 text-slate-700',
                border: 'border-slate-200'
              };

              return (
                <div
                  key={bed._id}
                  className={`bg-white rounded-2xl border transition-all duration-200 hover:shadow-md flex flex-col justify-between ${
                    isOccupied ? 'border-rose-200/80 shadow-xs' : 'border-slate-200/80 shadow-2xs'
                  }`}
                >
                  {/* Card Top */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${wardStyle.light}`}
                        >
                          <BedIcon className="w-5 h-5 stroke-[2.2]" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-base leading-tight">
                            {bed.bedNumber}
                          </h4>
                          <span
                            className={`inline-block mt-0.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${wardStyle.badge}`}
                          >
                            {bed.ward}
                          </span>
                        </div>
                      </div>

                      {/* Status Pill */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          isOccupied
                            ? 'bg-rose-50 text-rose-700 border border-rose-200/70'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isOccupied ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'
                          }`}
                        />
                        <span className="capitalize">{bed.status}</span>
                      </span>
                    </div>

                    {/* Patient info or Ready banner */}
                    {isOccupied ? (
                      <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Current Patient
                        </p>
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {bed.patient?.name ? bed.patient.name.charAt(0).toUpperCase() : 'P'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 text-sm truncate">
                              {bed.patient?.name || 'Unknown Patient'}
                            </p>
                            {bed.patient?.contact && (
                              <p className="text-xs text-slate-400 truncate">
                                Tel: {bed.patient.contact}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100/60 flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <p className="text-xs font-medium text-emerald-800">
                          Available for immediate patient admission
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="p-4 bg-slate-50/60 border-t border-slate-100 rounded-b-2xl flex items-center justify-between gap-2">
                    {isOccupied ? (
                      <button
                        type="button"
                        onClick={() => setDischargeModalBed(bed)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-rose-200/80 font-semibold px-3 py-2 rounded-xl text-xs shadow-2xs transition cursor-pointer"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>Discharge Patient</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setAssignModalBed(bed);
                          setSelectedPatientId('');
                          setPatientSearch('');
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-2 rounded-xl text-xs shadow-xs transition cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Assign Patient</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeleteBed(bed)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                      title="Delete Bed"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL 1: ADD NEW BED */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <BedIcon className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Add New Hospital Bed</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBed} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Bed Identifier / Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ICU-04, GW-102, MAT-05"
                  value={form.bedNumber}
                  onChange={(e) => setForm({ ...form, bedNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Ward Department *
                </label>
                <select
                  value={form.ward}
                  onChange={(e) => setForm({ ...form, ward: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                >
                  <option value="ICU">ICU (Intensive Care Unit)</option>
                  <option value="General Ward">General Ward</option>
                  <option value="Maternity">Maternity</option>
                  <option value="Pediatrics">Pediatrics & Neonatal</option>
                  <option value="Trauma">Trauma & Emergency</option>
                </select>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition shadow-md shadow-blue-600/20"
                >
                  {submitting ? 'Adding...' : 'Create Bed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ASSIGN PATIENT */}
      {assignModalBed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Assign Bed {assignModalBed.bedNumber}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ward: <span className="font-semibold text-slate-700">{assignModalBed.ward}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAssignModalBed(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignPatient} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Search Patient
                </label>
                <div className="relative mb-2">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search patient by name or phone..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Select Patient to Admit *
                </label>
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
                  {filteredPatients.length === 0 ? (
                    <p className="p-4 text-xs text-slate-400 text-center">No patients found</p>
                  ) : (
                    filteredPatients.map((p) => {
                      const isSelected = selectedPatientId === p._id;
                      return (
                        <button
                          key={p._id}
                          type="button"
                          onClick={() => setSelectedPatientId(p._id)}
                          className={`w-full text-left p-3 flex items-center justify-between text-xs transition cursor-pointer ${
                            isSelected ? 'bg-blue-50 text-blue-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div>
                            <p className="font-semibold text-slate-900">{p.name}</p>
                            <p className="text-[11px] text-slate-400">
                              {p.gender ? `${p.gender} • ` : ''}Tel: {p.contact || 'N/A'}
                            </p>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setAssignModalBed(null)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !selectedPatientId}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition shadow-md shadow-blue-600/20"
                >
                  {submitting ? 'Assigning...' : 'Confirm Admission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DISCHARGE CONFIRMATION */}
      {dischargeModalBed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <UserX className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Confirm Patient Discharge</h3>
            <p className="text-sm text-slate-500 mt-2">
              Are you sure you want to discharge{' '}
              <span className="font-bold text-slate-800">
                {dischargeModalBed.patient?.name || 'the patient'}
              </span>{' '}
              from bed <span className="font-bold text-slate-800">{dischargeModalBed.bedNumber}</span>?
            </p>
            <p className="text-xs text-slate-400 mt-1">
              This will mark the bed as available for newly admitted patients.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setDischargeModalBed(null)}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirmDischarge}
                className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-sm transition shadow-md shadow-rose-600/20"
              >
                {submitting ? 'Discharging...' : 'Confirm Discharge'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

export default Beds;