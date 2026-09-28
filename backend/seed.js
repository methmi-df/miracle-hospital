const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  const users = [
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'doctor1', password: 'doctor123', role: 'doctor' },
    { username: 'nurse1', password: 'nurse123', role: 'nurse' },
    { username: 'reception1', password: 'reception123', role: 'receptionist' },
    { username: 'lab1', password: 'lab123', role: 'lab' },
    { username: 'pharmacy1', password: 'pharmacy123', role: 'pharmacist' },
    { username: 'accounts1', password: 'accounts123', role: 'accountant' },
  ];

  for (const u of users) {
    const exists = await User.findOne({ username: u.username });
    if (exists) {
      console.log(`Skipped (already exists): ${u.username}`);
      continue;
    }
    const hashedPassword = await bcrypt.hash(u.password, 10);
    await User.create({ username: u.username, password: hashedPassword, role: u.role });
    console.log(`Created: ${u.username} / ${u.password} (${u.role})`);
  }

  mongoose.disconnect();
}

seed();