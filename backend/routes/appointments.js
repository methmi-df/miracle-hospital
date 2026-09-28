const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');

// Book an appointment
router.post('/', async (req, res) => {
  try {
    const { patient, doctor, date, time } = req.body;

    // Prevent booking in the past
    const appointmentDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (appointmentDate < today) {
      return res.status(400).json({ message: 'Cannot book an appointment in the past.' });
    }

    // Prevent double-booking the same doctor at the same date/time
    const conflict = await Appointment.findOne({
      doctor,
      date: appointmentDate,
      time,
      status: { $ne: 'cancelled' }
    });
    if (conflict) {
      return res.status(400).json({ message: 'This doctor already has an appointment at that date and time.' });
    }

    const appointment = new Appointment(req.body);
    await appointment.save();
    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all appointments (with patient & doctor details populated)
router.get('/', async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patient', 'name contact')
      .populate('doctor', 'name department');
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update appointment (e.g. cancel, complete, or reschedule date/time)
router.put('/:id', async (req, res) => {
  try {
    const { date, time, doctor } = req.body;
    
    // If rescheduling date/time, validate
    if (date && time) {
      const appointmentDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (appointmentDate < today) {
        return res.status(400).json({ message: 'Cannot reschedule to a past date.' });
      }

      // Check conflict excluding current appointment
      const docId = doctor || (await Appointment.findById(req.params.id))?.doctor;
      if (docId) {
        const conflict = await Appointment.findOne({
          _id: { $ne: req.params.id },
          doctor: docId,
          date: appointmentDate,
          time,
          status: { $ne: 'cancelled' }
        });
        if (conflict) {
          return res.status(400).json({ message: 'Doctor already has an appointment booked for that date & time slot.' });
        }
      }
    }

    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('patient', 'name contact')
      .populate('doctor', 'name department');
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete an appointment
router.delete('/:id', async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
module.exports = router;