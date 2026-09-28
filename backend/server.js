require('./dns-setup');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Enable CORS for all frontends (Netlify, Vercel, Localhost, etc.)
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use('/api/auth', require('./routes/auth'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/medical-records', require('./routes/medicalRecords'));
app.use('/api/billing', require('./routes/billing'));
app.use('/api/medicines', require('./routes/medicines'));
app.use('/api/labtests', require('./routes/labtests'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/beds', require('./routes/beds'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Miracle Hospital DB connected'))
  .catch(err => console.error('❌ DB connection error:', err));

app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Miracle Hospital Backend API is running ✅',
    endpoints: {
      health: '/api/test',
      auth: '/api/auth',
      patients: '/api/patients',
      doctors: '/api/doctors',
      appointments: '/api/appointments',
      billing: '/api/billing',
      medicines: '/api/medicines',
      labtests: '/api/labtests',
      employees: '/api/employees',
      beds: '/api/beds',
      reports: '/api/reports'
    }
  });
});

app.get('/api/test', (req, res) => res.send('Miracle Hospital API is running ✅'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));