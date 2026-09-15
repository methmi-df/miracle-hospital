const express = require('express');
const router = express.Router();
const LabTest = require('../models/LabTest');

// Request a new lab test
router.post('/', async (req, res) => {
  try {
    const test = new LabTest(req.body);
    await test.save();
    res.status(201).json(test);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all lab tests (with patient/doctor populated)
router.get('/', async (req, res) => {
  try {
    const tests = await LabTest.find()
      .populate('patient', 'name contact')
      .populate('doctor', 'name department')
      .sort({ createdAt: -1 });
    res.json(tests);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update a lab test (status, result, sample collected)
router.put('/:id', async (req, res) => {
  try {
    const test = await LabTest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(test);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete a lab test
router.delete('/:id', async (req, res) => {
  try {
    await LabTest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lab test deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;