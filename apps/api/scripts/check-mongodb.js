const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function checkMongoDB() {
  // Set default values
  const config = {
    MONGODB_HOST: process.env.MONGODB_HOST || 'localhost',
    MONGODB_PORT: process.env.MONGODB_PORT || '27018',
    MONGODB_DATABASE: process.env.MONGODB_DATABASE || 'whisper_wellness',
    MONGODB_USERNAME: process.env.MONGODB_USERNAME || 'admin',
    MONGODB_PASSWORD: process.env.MONGODB_PASSWORD || 'ChangeMeToASecurePassword123!',
    MONGODB_AUTH_SOURCE: process.env.MONGODB_AUTH_SOURCE || 'admin'
  };

  console.log('Using MongoDB configuration:', {
    host: config.MONGODB_HOST,
    port: config.MONGODB_PORT,
    database: config.MONGODB_DATABASE,
    authSource: config.MONGODB_AUTH_SOURCE
  });

  const uri = `mongodb://${config.MONGODB_USERNAME}:${config.MONGODB_PASSWORD}@${config.MONGODB_HOST}:${config.MONGODB_PORT}/${config.MONGODB_DATABASE}?authSource=${config.MONGODB_AUTH_SOURCE}`;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Successfully connected to MongoDB');
    
    const db = client.db(config.MONGODB_DATABASE);
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('\n📂 Collections:');
    console.log(collections.map(c => `- ${c.name}`).join('\n') || 'No collections found');
    
    // Count documents in each collection
    for (const coll of collections) {
      const count = await db.collection(coll.name).countDocuments();
      console.log(`\n📊 ${coll.name} has ${count} documents`);
      
      // Show first few documents if collection is not empty
      if (count > 0) {
        const docs = await db.collection(coll.name).find().limit(3).toArray();
        console.log('Sample documents:');
        console.log(docs);
      }
    }
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
  } finally {
    await client.close();
  }
}

checkMongoDB();
