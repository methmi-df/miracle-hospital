import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import PatientRecords from './pages/PatientRecords';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';
import Billing from './pages/Billing';
import ProtectedRoute from './components/ProtectedRoute';
import Pharmacy from './pages/Pharmacy';
import Laboratory from './pages/Laboratory';
import Staff from './pages/Staff';
import Reports from './pages/Reports';
import Register from './pages/Register';
import MyAppointments from './pages/MyAppointments';
import MyRecords from './pages/MyRecords';
import Beds from './pages/Beds';

function App() {
  return (
    <BrowserRouter>
      <Routes>
  <Route path="/" element={<Login />} />
  <Route path="/dashboard" element={
    <ProtectedRoute><Dashboard /></ProtectedRoute>
  } />
  <Route path="/beds" element={
    <ProtectedRoute allowedRoles={['admin', 'doctor', 'nurse', 'receptionist']}><Beds /></ProtectedRoute>
  } />
  <Route path="/patients" element={
    <ProtectedRoute allowedRoles={['admin', 'doctor', 'nurse', 'receptionist']}><Patients /></ProtectedRoute>
  } />
  <Route path="/patients/:patientId/records" element={
    <ProtectedRoute allowedRoles={['admin', 'doctor', 'nurse']}><PatientRecords /></ProtectedRoute>
  } />
  <Route path="/doctors" element={
    <ProtectedRoute allowedRoles={['admin']}><Doctors /></ProtectedRoute>
  } />
  <Route path="/appointments" element={
    <ProtectedRoute allowedRoles={['admin', 'doctor', 'nurse', 'receptionist']}><Appointments /></ProtectedRoute>
  } />
  <Route path="/billing" element={
    <ProtectedRoute allowedRoles={['admin', 'receptionist', 'accountant']}><Billing /></ProtectedRoute>
  } />
  <Route path="/pharmacy" element={
    <ProtectedRoute allowedRoles={['admin', 'pharmacist']}><Pharmacy /></ProtectedRoute>
  } />
  <Route path="/laboratory" element={
    <ProtectedRoute allowedRoles={['admin', 'doctor', 'lab']}><Laboratory /></ProtectedRoute>
  } />
  <Route path="/staff" element={
    <ProtectedRoute allowedRoles={['admin']}><Staff /></ProtectedRoute>
  } />
  <Route path="/reports" element={
    <ProtectedRoute allowedRoles={['admin', 'accountant']}><Reports /></ProtectedRoute>
  } />
  <Route path="/register" element={<Register />} />
  <Route path="/my-appointments" element={
  <ProtectedRoute allowedRoles={['patient']}><MyAppointments /></ProtectedRoute>
} />
<Route path="/my-records" element={
  <ProtectedRoute allowedRoles={['patient']}><MyRecords /></ProtectedRoute>
} />
</Routes>
    </BrowserRouter>
  );
}

export default App;