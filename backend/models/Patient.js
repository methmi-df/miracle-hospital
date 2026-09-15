const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  dob: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  contact: { type: String, trim: true },
  address: { type: String, trim: true },
  medicalHistory: { type: String, trim: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);