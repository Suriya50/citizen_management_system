const mongoose = require('mongoose');
require('dotenv').config();

async function dropIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Get all indexes on members collection
    const indexes = await db.collection('members').getIndexes();
    console.log('\n📊 Current indexes on members:');
    indexes.forEach(idx => {
      console.log('- ' + idx.name);
    });
    
    // Check if citizenId_1 exists
    const hasOldIndex = indexes.some(idx => idx.name === 'citizenId_1');
    
    if (hasOldIndex) {
      // Drop the old index
      await db.collection('members').dropIndex('citizenId_1');
      console.log('\n✅ citizenId_1 index dropped successfully!');
    } else {
      console.log('\n⚠️ citizenId_1 index not found. It may already be dropped.');
    }
    
    // Create the correct compound index if it doesn't exist
    const hasCorrectIndex = indexes.some(idx => idx.name === 'familyId_1_citizenId_1');
    
    if (!hasCorrectIndex) {
      await db.collection('members').createIndex(
        { familyId: 1, citizenId: 1 },
        { unique: true }
      );
      console.log('✅ familyId_1_citizenId_1 index created!');
    } else {
      console.log('✅ familyId_1_citizenId_1 index already exists.');
    }
    
    // Add villageId to all members (if missing)
    const membersResult = await db.collection('members').updateMany(
      { villageId: { $exists: false } },
      { $set: { villageId: 'mallavadi' } }
    );
    console.log(`✅ Updated ${membersResult.modifiedCount} members with villageId`);
    
    // Add villageId to all families (if missing)
    const familiesResult = await db.collection('families').updateMany(
      { villageId: { $exists: false } },
      { $set: { villageId: 'mallavadi' } }
    );
    console.log(`✅ Updated ${familiesResult.modifiedCount} families with villageId`);
    
    // Final verification
    const finalIndexes = await db.collection('members').getIndexes();
    console.log('\n📊 Final indexes on members:');
    finalIndexes.forEach(idx => {
      console.log('- ' + idx.name + ' (Unique: ' + (idx.unique ? 'Yes' : 'No') + ')');
    });
    
    console.log('\n🎉 ALL FIXED! Now test your app!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

dropIndex();