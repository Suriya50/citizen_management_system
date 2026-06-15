const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing users
    await User.deleteMany({});
    
    // Create officer user
    await User.create({
      username: 'officer',
      password: 'village123',
      name: 'Panchayat Officer',
      role: 'officer',
      village: 'Kallakurichi',
      employeeId: 'OFF001',
      isActive: true
    });
    console.log('✅ Officer user created: officer / village123');
    
    // Create admin user
    await User.create({
      username: 'admin',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin',
      village: 'Kallakurichi',
      employeeId: 'ADMIN001',
      isActive: true
    });
    console.log('✅ Admin user created: admin / admin123');
    
    console.log('✅ Database seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();