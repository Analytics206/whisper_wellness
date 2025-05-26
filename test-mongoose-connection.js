const mongoose = require('mongoose');

// Connection URI - same as in database.module.ts
const uri = 'mongodb://admin:ChangeMeToASecurePassword123!@localhost:27018/whisper_wellness?authSource=admin&directConnection=true';

// Set mongoose options
mongoose.set('strictQuery', false);

// Connect to MongoDB
mongoose.connect(uri, {
  // Disable all SSL/TLS in the connection options
  ssl: false,
  tls: false,
  // Connection settings
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 30000
});

// Get the default connection
const db = mongoose.connection;

// Handle connection events
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function() {
  console.log('Successfully connected to MongoDB using Mongoose');
  
  // List all collections in the database
  db.db.listCollections().toArray(function(err, collections) {
    if (err) {
      console.error('Error listing collections:', err);
      process.exit(1);
    }
    
    console.log('Collections in whisper_wellness database:');
    console.log(collections.map(c => c.name));
    
    // Close the connection
    mongoose.connection.close();
  });
});

// Handle process termination
process.on('SIGINT', function() {
  mongoose.connection.close(function () {
    console.log('MongoDB connection disconnected through app termination');
    process.exit(0);
  });
});
