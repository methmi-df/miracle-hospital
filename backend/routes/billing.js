const express = require('express');
const router = express.Router();
const Billing = require('../models/Billing');

// Generate a new bill
router.post('/', async (req, res) => {
  try {
    const { consultationFee = 0, labFee = 0, pharmacyFee = 0, admissionFee = 0 } = req.body;
    const total = Number(consultationFee) + Number(labFee) + Number(pharmacyFee) + Number(admissionFee);

    const bill = new Billing({ ...req.body, total });
    await bill.save();
    res.status(201).json(bill);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all bills (with patient info)
router.get('/', async (req, res) => {
  try {
    const bills = await Billing.find().populate('patient', 'name contact').sort({ createdAt: -1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Mark a bill as paid
router.put('/:id', async (req, res) => {
  try {
    const bill = await Billing.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(bill);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;