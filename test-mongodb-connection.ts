import { MongoClient } from 'mongodb';

// Use the same connection string as in the .env file
const MONGODB_URI = 'mongodb://admin:ChangeMeToASecurePassword123!@localhost:27018/whisper_wellness?authSource=admin';

async function testConnection() {
  const client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    // Disable SSL/TLS for development
    tls: false,
    ssl: false
  });

  try {
    console.log('Attempting to connect to MongoDB...');
    
    // Connect to MongoDB
    await client.connect();
    console.log('✅ Successfully connected to MongoDB!');
    
    // Verify the connection is established
    const db = client.db('admin');
    await db.command({ ping: 1 });
    
    // Get the admin database
    const adminDb = client.db('admin');
    
    // List all databases
    const dbs = await adminDb.admin().listDatabases();
    console.log('Available databases:', dbs.databases.map((db: any) => db.name));
    
    // Try to access a specific database
    const targetDb = client.db('whisper_wellness');
    const collections = await targetDb.listCollections().toArray();
    console.log('Collections in whisper_wellness:', collections.map((c: any) => c.name));
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  } finally {
    // Close the connection when done
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
testConnection();
