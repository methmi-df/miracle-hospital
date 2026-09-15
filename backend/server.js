const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
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

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Miracle Hospital DB connected'))
  .catch(err => console.log(err));

app.get('/api/test', (req, res) => res.send('Miracle Hospital API is running'));

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));