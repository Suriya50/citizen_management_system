const mongoose = require('mongoose');

// ✅ PASTE YOUR ACTUAL MONGODB URI HERE
const MONGO_URI = "mongodb+srv://surya_data:member123@cluster0.qujmjrl.mongodb.net/village_citizen_db?retryWrites=true&w=majority&appName=Cluster0"
async function clearData() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Count before deletion
    const familyCount = await db.collection('families').countDocuments();
    const memberCount = await db.collection('members').countDocuments();
    const userCount = await db.collection('users').countDocuments();
    
    console.log(`📊 Before deletion:`);
    console.log(`   Families: ${familyCount}`);
    console.log(`   Members: ${memberCount}`);
    console.log(`   Users: ${userCount}`);
    
    // ✅ DELETE ALL FAMILIES
    const familyResult = await db.collection('families').deleteMany({});
    console.log(`🗑️ Deleted ${familyResult.deletedCount} families`);
    
    // ✅ DELETE ALL MEMBERS
    const memberResult = await db.collection('members').deleteMany({});
    console.log(`🗑️ Deleted ${memberResult.deletedCount} members`);
    
    // ✅ Keep users - just remove their villageId
    const userResult = await db.collection('users').updateMany(
      {},
      { $unset: { villageId: "", village: "" } }
    );
    console.log(`🔄 Reset ${userResult.modifiedCount} users (removed villageId)`);
    
    console.log('\n✅ ALL DATA CLEARED!');
    console.log('📊 After deletion:');
    console.log(`   Families: 0`);
    console.log(`   Members: 0`);
    console.log(`   Users: ${userCount}`);
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

clearData();