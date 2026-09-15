const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },
  specialization: { type: String, trim: true },
  contact: { type: String, trim: true },
  schedule: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);