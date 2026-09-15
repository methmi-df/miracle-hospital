const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  testType: { type: String, required: true, trim: true },
  sampleCollected: { type: Boolean, default: false },
  status: { type: String, enum: ['requested', 'in-progress', 'completed'], default: 'requested' },
  result: { type: String, trim: true },
  notes: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('LabTest', labTestSchema);