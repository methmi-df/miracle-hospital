const express = require('express');
const router = express.Router();
const Bed = require('../models/Bed');

// Add a new bed
router.post('/', async (req, res) => {
  try {
    const bed = new Bed(req.body);
    await bed.save();
    res.status(201).json(bed);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Seed default hospital beds
router.post('/seed', async (req, res) => {
  try {
    const sampleBeds = [
      { bedNumber: 'ICU-101', ward: 'ICU', status: 'available' },
      { bedNumber: 'ICU-102', ward: 'ICU', status: 'available' },
      { bedNumber: 'ICU-103', ward: 'ICU', status: 'available' },
      { bedNumber: 'GEN-201', ward: 'General Ward', status: 'available' },
      { bedNumber: 'GEN-202', ward: 'General Ward', status: 'available' },
      { bedNumber: 'GEN-203', ward: 'General Ward', status: 'available' },
      { bedNumber: 'GEN-204', ward: 'General Ward', status: 'available' },
      { bedNumber: 'MAT-301', ward: 'Maternity', status: 'available' },
      { bedNumber: 'MAT-302', ward: 'Maternity', status: 'available' },
      { bedNumber: 'PED-401', ward: 'Pediatrics', status: 'available' },
      { bedNumber: 'PED-402', ward: 'Pediatrics', status: 'available' },
      { bedNumber: 'TRM-501', ward: 'Trauma', status: 'available' },
      { bedNumber: 'TRM-502', ward: 'Trauma', status: 'available' },
    ];
    for (const b of sampleBeds) {
      const exists = await Bed.findOne({ bedNumber: b.bedNumber, ward: b.ward });
      if (!exists) {
        await Bed.create(b);
      }
    }
    const all = await Bed.find().populate('patient', 'name contact gender').sort({ ward: 1, bedNumber: 1 });
    res.json({ message: 'Beds initialized successfully', beds: all });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all beds (optionally filter by ward)
router.get('/', async (req, res) => {
  try {
    const { ward } = req.query;
    const filter = ward ? { ward } : {};
    const beds = await Bed.find(filter).populate('patient', 'name contact gender').sort({ ward: 1, bedNumber: 1 });
    res.json(beds);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Assign a patient to a bed (occupy it)
router.put('/:id/assign', async (req, res) => {
  try {
    const { patient } = req.body;
    const bed = await Bed.findByIdAndUpdate(
      req.params.id,
      { patient, status: 'occupied' },
      { new: true }
    ).populate('patient', 'name contact gender');
    res.json(bed);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Discharge (free up a bed)
router.put('/:id/discharge', async (req, res) => {
  try {
    const bed = await Bed.findByIdAndUpdate(
      req.params.id,
      { patient: null, status: 'available' },
      { new: true }
    );
    res.json(bed);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete a bed
router.delete('/:id', async (req, res) => {
  try {
    await Bed.findByIdAndDelete(req.params.id);
    res.json({ message: 'Bed deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Summary: occupancy stats by ward
router.get('/summary/occupancy', async (req, res) => {
  try {
    const beds = await Bed.find();
    const total = beds.length;
    const occupied = beds.filter((b) => b.status === 'occupied').length;
    const available = total - occupied;

    const wardStats = {};
    beds.forEach((b) => {
      if (!wardStats[b.ward]) wardStats[b.ward] = { total: 0, occupied: 0 };
      wardStats[b.ward].total += 1;
      if (b.status === 'occupied') wardStats[b.ward].occupied += 1;
    });

    const wardPercentages = Object.entries(wardStats).map(([ward, s]) => ({
      ward,
      percent: s.total > 0 ? Math.round((s.occupied / s.total) * 100) : 0
    }));

    res.json({
      total,
      occupied,
      available,
      occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0,
      wardStats: wardPercentages
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;