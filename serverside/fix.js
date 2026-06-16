const mongoose = require('mongoose');
require('dotenv').config();

async function fixIndex() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/village_citizen_db');
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Drop old index
    try {
      await db.collection('members').dropIndex('citizenId_1');
      console.log('✅ citizenId_1 index dropped!');
    } catch(e) {
      console.log('⚠️ citizenId_1 not found or already dropped');
    }
    
    // Create correct index
    try {
      await db.collection('members').createIndex(
        { familyId: 1, citizenId: 1 },
        { unique: true }
      );
      console.log('✅ familyId_1_citizenId_1 index created!');
    } catch(e) {
      console.log('⚠️ Index already exists');
    }
    
    // Add villageId to members
    const membersResult = await db.collection('members').updateMany(
      { villageId: { $exists: false } },
      { $set: { villageId: 'mallavadi' } }
    );
    console.log(`✅ Updated ${membersResult.modifiedCount} members`);
    
    // Add villageId to families
    const familiesResult = await db.collection('families').updateMany(
      { villageId: { $exists: false } },
      { $set: { villageId: 'mallavadi' } }
    );
    console.log(`✅ Updated ${familiesResult.modifiedCount} families`);
    
    console.log('\n🎉 ALL FIXED! Now test your app!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

fixIndex();