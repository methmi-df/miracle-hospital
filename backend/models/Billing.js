const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  consultationFee: { type: Number, default: 0, min: [0, 'Fee cannot be negative'] },
  labFee: { type: Number, default: 0, min: [0, 'Fee cannot be negative'] },
  pharmacyFee: { type: Number, default: 0, min: [0, 'Fee cannot be negative'] },
  admissionFee: { type: Number, default: 0, min: [0, 'Fee cannot be negative'] },
  total: { type: Number, required: true, min: [0, 'Total cannot be negative'] },
  status: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
  paymentMethod: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Billing', billingSchema);