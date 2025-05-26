// This file is used to set up any test environment requirements
import { execSync } from 'child_process';
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables from .env.test file
config({ path: join(__dirname, '../.env.test') });

// Set test environment variables
process.env.NODE_ENV = 'test';

// Global test timeout
jest.setTimeout(30000);

// Global test configurations
beforeAll(async () => {
  // Add any global test setup here
  // For example, you might want to connect to a test database
});

afterAll(async () => {
  // Clean up any resources after all tests are done
});

// Global test teardown
afterEach(async () => {
  // Clean up after each test if needed
});
