const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');

// Add employee
router.post('/', async (req, res) => {
  try {
    const employee = new Employee(req.body);
    await employee.save();
    res.status(201).json(employee);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all employees
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find().sort({ name: 1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all leave records across staff
router.get('/leaves', async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate('employee', 'name role department email contact')
      .sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update employee
router.put('/:id', async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete employee
router.delete('/:id', async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    await Leave.deleteMany({ employee: req.params.id });
    await Attendance.deleteMany({ employee: req.params.id });
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Mark attendance
router.post('/:id/attendance', async (req, res) => {
  try {
    const attendance = new Attendance({ employee: req.params.id, ...req.body });
    await attendance.save();
    res.status(201).json(attendance);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get attendance for one employee
router.get('/:id/attendance', async (req, res) => {
  try {
    const records = await Attendance.find({ employee: req.params.id }).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Submit a leave request for an employee
router.post('/:id/leave', async (req, res) => {
  try {
    const leave = new Leave({ employee: req.params.id, ...req.body });
    await leave.save();
    const populated = await Leave.findById(leave._id).populate('employee', 'name role department');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update leave status (e.g. approve/reject)
router.put('/leaves/:leaveId', async (req, res) => {
  try {
    const leave = await Leave.findByIdAndUpdate(req.params.leaveId, req.body, { new: true })
      .populate('employee', 'name role department');
    res.json(leave);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete leave record
router.delete('/leaves/:leaveId', async (req, res) => {
  try {
    await Leave.findByIdAndDelete(req.params.leaveId);
    res.json({ message: 'Leave record removed.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;