const mongoose = require('mongoose');
require('dotenv').config();

async function deleteAllMembers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Count before deletion
    const count = await db.collection('members').countDocuments();
    console.log(`📊 Found ${count} members`);
    
    // Delete all members
    const result = await db.collection('members').deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} members`);
    
    // Reset family member counts
    await db.collection('families').updateMany(
      {},
      { $set: { totalMembers: 0 } }
    );
    console.log('✅ Reset all family member counts to 0');
    
    console.log('\n🎉 All members deleted! Now you can start fresh.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

deleteAllMembers();