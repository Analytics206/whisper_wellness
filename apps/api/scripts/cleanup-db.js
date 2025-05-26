const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function cleanupDatabase() {
  const uri = `mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DATABASE}?authSource=${process.env.MONGODB_AUTH_SOURCE}`;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Successfully connected to MongoDB');
    
    const db = client.db(process.env.MONGODB_DATABASE);
    
    // Drop the users collection to start fresh
    await db.collection('users').drop();
    console.log('✅ Dropped users collection');
    
    // Recreate the collection with a unique index on email
    await db.createCollection('users');
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    console.log('✅ Recreated users collection with unique email index');
    
  } catch (error) {
    console.error('❌ Error cleaning up database:', error);
  } finally {
    await client.close();
  }
}

cleanupDatabase();
