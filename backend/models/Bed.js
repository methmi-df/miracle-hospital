const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema({
  bedNumber: { type: String, required: true, trim: true },
  ward: { type: String, required: true, enum: ['ICU', 'General Ward', 'Maternity', 'Pediatrics', 'Trauma'] },
  status: { type: String, enum: ['occupied', 'available'], default: 'available' },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', default: null }
}, { timestamps: true });

bedSchema.index({ bedNumber: 1, ward: 1 }, { unique: true });

module.exports = mongoose.model('Bed', bedSchema);