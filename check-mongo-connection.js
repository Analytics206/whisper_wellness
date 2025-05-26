const { MongoClient } = require('mongodb');

async function testConnection() {
  const uri = 'mongodb://admin:ChangeMeToASecurePassword123!@localhost:27018/whisper_wellness?authSource=admin';
  console.log('Connecting to MongoDB with URI:', uri);
  
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 30000,
    directConnection: true
  });

  try {
    await client.connect();
    console.log('✅ Successfully connected to MongoDB!');
    
    // List databases
    const adminDb = client.db('admin');
    const result = await adminDb.command({ listDatabases: 1 });
    console.log('Available databases:', result.databases.map(db => db.name));
    
    // Check whisper_wellness database
    const db = client.db('whisper_wellness');
    const collections = await db.listCollections().toArray();
    console.log('Collections in whisper_wellness:', collections.map(c => c.name));
    
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

testConnection().catch(console.error);
