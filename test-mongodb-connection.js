// Test MongoDB connection
const { MongoClient } = require('mongodb');

const url = 'mongodb://admin:ChangeMeToASecurePassword123!@localhost:27018/';
const client = new MongoClient(url);

async function testConnection() {
  try {
    await client.connect();
    console.log('Successfully connected to MongoDB');
    
    const db = client.db('whisper_wellness');
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  } finally {
    await client.close();
    process.exit(0);
  }
}

testConnection();
