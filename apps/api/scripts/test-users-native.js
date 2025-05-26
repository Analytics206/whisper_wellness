const { MongoClient } = require('mongodb');
const { describe, before, after, it } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Check for --keep-data flag before Node's test runner processes the arguments
const keepData = process.env.KEEP_TEST_DATA === 'true' || 
                process.argv.some(arg => arg === '--keep-data');

// Remove the flag from process.argv to prevent test runner errors
process.argv = process.argv.filter(arg => arg !== '--keep-data');

// Import ObjectId for direct use
const { ObjectId } = require('mongodb');

// Set default values for required environment variables
process.env.MONGODB_HOST = process.env.MONGODB_HOST || 'localhost';
process.env.MONGODB_PORT = process.env.MONGODB_PORT || '27018';
process.env.MONGODB_DATABASE = process.env.MONGODB_DATABASE || 'whisper_wellness';
process.env.MONGODB_AUTH_SOURCE = process.env.MONGODB_AUTH_SOURCE || 'admin';

console.log('=== Test Configuration ===');
console.log('Keep test data:', keepData);
console.log('Current working directory:', process.cwd());
console.log('MongoDB Connection:', {
  host: process.env.MONGODB_HOST,
  port: process.env.MONGODB_PORT,
  database: process.env.MONGODB_DATABASE,
  authSource: process.env.MONGODB_AUTH_SOURCE
});

// Test data with unique emails
const TEST_USER = {
  firstName: 'Test',
  lastName: 'User',
  email: `test-${Date.now()}@example.com`,
  password: 'password123',
  roles: ['user']
};

// MongoDB connection using environment variables
const MONGODB_URI = `mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DATABASE}?authSource=${process.env.MONGODB_AUTH_SOURCE}`;
const DB_NAME = process.env.MONGODB_DATABASE;

// Debug: Print the actual connection URI (with password masked)
const maskedUri = MONGODB_URI.replace(/:([^:]+)@/, ':****@');
console.log('MongoDB URI:', maskedUri);

let client;
let db;
let usersCollection;

// Helper functions
async function createTestUser(userData) {
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const result = await usersCollection.insertOne({
    ...userData,
    password: hashedPassword,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return { ...userData, _id: result.insertedId };
}

// Test suite
describe('User Service Tests', () => {
  before(async () => {
    try {
      console.log('\n=== Starting Test Setup ===');
      console.log('Connecting to MongoDB...');
      
      // Connect to MongoDB with authentication
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        auth: {
          username: process.env.MONGODB_USERNAME,
          password: process.env.MONGODB_PASSWORD
        },
        authSource: process.env.MONGODB_AUTH_SOURCE
      };
      
      console.log('MongoDB connection options:', JSON.stringify(options, null, 2));
      
      client = new MongoClient(MONGODB_URI, options);
      await client.connect();
      console.log('Successfully connected to MongoDB');
      
      db = client.db(DB_NAME);
      usersCollection = db.collection('users');
      
      // List all collections for debugging
      const collections = await db.listCollections().toArray();
      console.log('\n=== Existing Collections ===');
      console.log(collections.map(c => `- ${c.name}`).join('\n') || 'No collections found');
      
      if (!keepData) {
        console.log('\n=== Cleaning Up ===');
        console.log('Dropping test database...');
        await db.dropDatabase();
        console.log('Test database cleaned');
      } else {
        console.log('\n=== Data Retention ===');
        console.log('Test data will be preserved in the database');
        console.log(`Database: ${DB_NAME}`);
        console.log('Collections will be preserved between test runs');
        console.log('======================');
      }
      
      // Ensure email index exists for unique constraint
      try {
        await db.collection('users').createIndex({ email: 1 }, { unique: true });
        console.log('Ensured unique index on email field');
      } catch (error) {
        console.log('Email index already exists or could not be created:', error.message);
      }
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      console.error('Please ensure MongoDB is running and the credentials in .env are correct');
      throw error;
    }
  });

  after(async () => {
    // Close the connection after all tests
    if (client) {
      if (!keepData) {
        console.log('Cleaning up test data...');
        await db.dropDatabase();
      } else {
        console.log('Test data kept in the database');
        console.log('You can view the test data in MongoDB Compass');
        console.log(`Connection string: mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DATABASE}?authSource=${process.env.MONGODB_AUTH_SOURCE}`);
      }
      await client.close();
      console.log('MongoDB connection closed');
    }
  });

  describe('User Creation', () => {
    it('should create a new user', async () => {
      const testUser = {
        ...TEST_USER,
        email: `create-${Date.now()}@example.com`
      };
      
      const user = await createTestUser(testUser);
      console.log('Created user with email:', user.email);
      
      // Verify the user was created in the database
      const foundUser = await usersCollection.findOne({ _id: user._id });
      
      assert.ok(user._id, 'User should have an _id');
      assert.strictEqual(user.firstName, testUser.firstName);
      assert.strictEqual(user.lastName, testUser.lastName);
      assert.strictEqual(user.email, testUser.email);
      assert.ok(user.createdAt || foundUser?.createdAt, 'User should have a createdAt timestamp');
    });

    it('should not allow duplicate emails', async () => {
      const email = `duplicate-${Date.now()}@example.com`;
      
      // First user should be created successfully
      const user1 = await createTestUser({
        ...TEST_USER,
        email
      });
      
      console.log('Created first user with email:', user1.email);
      
      // Second user with same email should fail
      let duplicateError = null;
      try {
        // Create a new user with the same email directly through the collection
        await usersCollection.insertOne({
          firstName: 'Another',
          lastName: 'User',
          email: email, // Same email as first user
          password: 'differentpassword',
          roles: ['user'],
          _id: new ObjectId(), // New ID
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } catch (error) {
        duplicateError = error;
        console.log('Caught error (expected):', error.message);
      }
      
      // Check if we got a duplicate key error
      if (!duplicateError) {
        // If no error was thrown, the test should fail
        const count = await usersCollection.countDocuments({ email });
        console.log(`Found ${count} users with email: ${email}`);
        assert.fail('Expected duplicate key error was not thrown');
      } else {
        // Check if it's a duplicate key error
        assert.strictEqual(duplicateError.code, 11000, 'Error should be a duplicate key error');
        console.log('Received expected duplicate key error');
      }
    });
  });

  describe('User Retrieval', () => {
    let testUser;

    before(async () => {
      // Create a test user for retrieval tests
      const testUserData = {
        ...TEST_USER,
        email: `retrieve-${Date.now()}@example.com`,
        _id: new ObjectId() // Explicitly set _id for consistency
      };
      testUser = await createTestUser(testUserData);
      console.log('Created retrieval test user with email:', testUser.email);
    });

    it('should find user by ID', async () => {
      const foundUser = await usersCollection.findOne({ _id: testUser._id });
      assert.ok(foundUser, 'User should be found by ID');
      assert.strictEqual(foundUser.email, testUser.email);
    });

    it('should find user by email', async () => {
      const foundUser = await usersCollection.findOne({ email: testUser.email });
      assert.ok(foundUser, 'User should be found by email');
      assert.ok(foundUser._id, 'User should have an _id');
      assert.ok(ObjectId.isValid(foundUser._id), 'User _id should be a valid ObjectId');
      assert.ok(ObjectId.isValid(testUser._id), 'Test user _id should be a valid ObjectId');
      assert.strictEqual(
        foundUser._id.toString(), 
        testUser._id.toString(),
        'User IDs should match'
      );
    });
  });

  describe('User Update', () => {
    let testUser;

    before(async () => {
      // Create a test user for update tests
      const testUserData = {
        ...TEST_USER,
        email: `update-${Date.now()}@example.com`,
        _id: new ObjectId() // Explicitly set _id for consistency
      };
      testUser = await createTestUser(testUserData);
      console.log('Created update test user with email:', testUser.email);
    });

    it('should update user information', async () => {
      const newFirstName = 'Updated';
      const newLastName = 'Name';
      // Get original timestamp
      const originalUser = await usersCollection.findOne({ _id: testUser._id });
      const originalUpdatedAt = originalUser.updatedAt;
      
      // Small delay to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Update user
      const updateResult = await usersCollection.updateOne(
        { _id: testUser._id },
        { 
          $set: { 
            firstName: newFirstName, 
            lastName: newLastName
          },
          $currentDate: { updatedAt: true }
        }
      );
      
      assert.strictEqual(updateResult.modifiedCount, 1, 'Should update one document');
      
      const updatedUser = await usersCollection.findOne({ _id: testUser._id });
      assert.strictEqual(updatedUser.firstName, newFirstName);
      assert.strictEqual(updatedUser.lastName, newLastName);
      assert.ok(updatedUser.updatedAt > originalUpdatedAt, 'updatedAt should be updated');
    });
  });

  describe('User Deletion', () => {
    let testUser;

    before(async () => {
      // Create a test user for deletion test
      const testUserData = {
        ...TEST_USER,
        email: `delete-${Date.now()}@example.com`,
        _id: new ObjectId() // Explicitly set _id for consistency
      };
      testUser = await createTestUser(testUserData);
      console.log('Created deletion test user with email:', testUser.email);
    });

    it('should delete a user', async () => {
      const result = await usersCollection.deleteOne({ _id: testUser._id });
      assert.strictEqual(result.deletedCount, 1, 'Should delete exactly one user');
      
      const deletedUser = await usersCollection.findOne({ _id: testUser._id });
      assert.strictEqual(deletedUser, null, 'User should no longer exist');
    });
  });
});
