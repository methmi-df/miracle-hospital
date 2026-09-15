const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: Date, required: true, default: Date.now },
  status: { type: String, enum: ['present', 'absent', 'leave'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);