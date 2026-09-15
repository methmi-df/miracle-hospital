const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Billing = require('../models/Billing');
const Medicine = require('../models/Medicine');
const LabTest = require('../models/LabTest');
const Employee = require('../models/Employee');

router.get('/summary', async (req, res) => {
  try {
    const [
      totalPatients,
      totalDoctors,
      totalEmployees,
      appointmentsByStatus,
      billingStats,
      lowStockMedicines,
      pendingLabTests,
    ] = await Promise.all([
      Patient.countDocuments(),
      Doctor.countDocuments(),
      Employee.countDocuments(),
      Appointment.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Billing.aggregate([
        { $group: {
            _id: '$status',
            total: { $sum: '$total' },
            count: { $sum: 1 }
          }
        }
      ]),
      Medicine.find({ stockQuantity: { $lte: 10 } }).select('name stockQuantity'),
      LabTest.countDocuments({ status: { $ne: 'completed' } }),
    ]);

    const appointmentCounts = { scheduled: 0, completed: 0, cancelled: 0 };
    appointmentsByStatus.forEach((a) => { appointmentCounts[a._id] = a.count; });

    const revenue = { paid: 0, unpaid: 0, paidCount: 0, unpaidCount: 0 };
    billingStats.forEach((b) => {
      if (b._id === 'paid') { revenue.paid = b.total; revenue.paidCount = b.count; }
      if (b._id === 'unpaid') { revenue.unpaid = b.total; revenue.unpaidCount = b.count; }
    });

    res.json({
      totalPatients,
      totalDoctors,
      totalEmployees,
      appointmentCounts,
      revenue,
      lowStockMedicines,
      pendingLabTests,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;