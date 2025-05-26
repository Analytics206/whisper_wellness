const { MongoClient } = require('mongodb');

// Connection URI - same as in database.module.ts
const uri = 'mongodb://admin:ChangeMeToASecurePassword123!@localhost:27018/whisper_wellness?authSource=admin&directConnection=true&tls=false&ssl=false';

// Create a new MongoClient with the same options as in database.module.ts
const client = new MongoClient(uri, {
  // Explicitly disable all SSL/TLS
  ssl: false,
  tls: false,
  // Disable certificate validation
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true,
  // Connection settings
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 30000
});

async function run() {
  try {
    // Connect the client to the server
    await client.connect();
    console.log('Successfully connected to MongoDB using the same config as the API');
    
    // List all databases
    const databasesList = await client.db().admin().listDatabases();
    console.log('Databases:', databasesList.databases.map(db => db.name));
    
    // List collections in whisper_wellness database
    const db = client.db('whisper_wellness');
    const collections = await db.listCollections().toArray();
    console.log('Collections in whisper_wellness:', collections.map(c => c.name));
    
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  } finally {
    // Close the connection
    await client.close();
  }
}

run().catch(console.dir);
