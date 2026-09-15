const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },
  department: { type: String, trim: true },
  contact: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  joinDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'on-leave', 'terminated'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);