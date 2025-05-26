export default () => ({
  database: {
    host: process.env.MONGODB_HOST || 'localhost',
    port: parseInt(process.env.MONGODB_PORT, 10) || 27018,
    database: process.env.MONGODB_DATABASE || 'whisper_wellness',
    username: process.env.MONGODB_USERNAME || 'admin',
    password: process.env.MONGODB_PASSWORD || 'ChangeMeToASecurePassword123!',
    authSource: process.env.MONGODB_AUTH_SOURCE || 'admin',
  },
  // Add other configuration sections as needed
});
