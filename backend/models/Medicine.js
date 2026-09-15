const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, trim: true },
  stockQuantity: { type: Number, required: true, default: 0, min: [0, 'Stock cannot be negative'] },
  unit: { type: String, default: 'tablets' },
  pricePerUnit: { type: Number, default: 0, min: [0, 'Price cannot be negative'] },
  expiryDate: { type: Date, required: true },
  supplier: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Medicine', medicineSchema);