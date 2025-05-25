// Initialize the database with a user and collections
const dbName = 'whisper_wellness';
const adminUser = {
    user: process.env.MONGO_INITDB_ROOT_USERNAME,
    pwd: process.env.MONGO_INITDB_ROOT_PASSWORD,
    roles: [
        { role: 'readWrite', db: dbName },
        { role: 'dbAdmin', db: dbName },
        { role: 'userAdmin', db: dbName },
        { role: 'clusterMonitor', db: 'admin' }
    ]
};

// Create the database and user
db = db.getSiblingDB(dbName);

try {
    // Create admin user
    db.getUser(adminUser.user) || db.createUser({
        user: adminUser.user,
        pwd: adminUser.pwd,
        roles: adminUser.roles
    });

    // Create collections if they don't exist
    const collections = [
        'users',
        'sessions',
        'vector_processed_pdfs',
        'documents',
        'embeddings',
        'chats',
        'messages',
        'api_keys',
        'audit_logs'
    ];

    collections.forEach(collectionName => {
        if (!db.getCollectionNames().includes(collectionName)) {
            db.createCollection(collectionName);
            print(`Created collection: ${collectionName}`);
        }
    });

    // Create indexes for better query performance
    db.users.createIndex({ email: 1 }, { unique: true });
    db.sessions.createIndex({ user_id: 1, expires_at: 1 });
    db.vector_processed_pdfs.createIndex({ document_id: 1 }, { unique: true });
    db.documents.createIndex({ user_id: 1, created_at: -1 });
    db.embeddings.createIndex({ document_id: 1, chunk_index: 1 });
    db.chats.createIndex({ user_id: 1, updated_at: -1 });
    db.messages.createIndex({ chat_id: 1, created_at: 1 });
    db.api_keys.createIndex({ key: 1 }, { unique: true });
    db.audit_logs.createIndex({ user_id: 1, created_at: -1 });
    db.audit_logs.createIndex({ action: 1, created_at: -1 });

    // Create a default admin user if not exists
    const adminEmail = 'admin@whisperwellness.ai';
    if (!db.users.findOne({ email: adminEmail })) {
        const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'ChangeMe123!';
        const hashedPassword = _hashPassword(defaultPassword);
        
        db.users.insertOne({
            email: adminEmail,
            password: hashedPassword,
            name: 'Admin User',
            role: 'admin',
            email_verified: true,
            created_at: new Date(),
            updated_at: new Date(),
            last_login: null
        });
        print('Created default admin user');
    }

    print('MongoDB initialization completed successfully');
} catch (error) {
    print('Error during MongoDB initialization: ' + error);
    throw error;
}

// Helper function to hash passwords (basic implementation)
function _hashPassword(password) {
    // In a real application, use a proper password hashing library like bcrypt
    const crypto = require('crypto');
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
        .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
        .toString('hex');
    return `${salt}:${hash}`;
}
