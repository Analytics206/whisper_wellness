#!/bin/bash

# Wait for MongoDB to start
until mongosh --eval "print('waited for connection')" &>/dev/null; do
    echo "Waiting for MongoDB to start..."
    sleep 1
done

# Create admin user if it doesn't exist
mongosh admin --eval '
  db.getSiblingDB("admin").runCommand({
    createUser: "admin",
    pwd: "ChangeMeToASecurePassword123!",
    roles: [
      { role: "root", db: "admin" },
      { role: "userAdminAnyDatabase", db: "admin" },
      { role: "readWriteAnyDatabase", db: "admin" }
    ]
  })
'

# Create the whisper_wellness database and user
mongosh admin -u admin -p ChangeMeToASecurePassword123! --eval '
  db.getSiblingDB("whisper_wellness").runCommand({
    createUser: "whisper_user",
    pwd: "whisper_password",
    roles: [
      { role: "readWrite", db: "whisper_wellness" },
      { role: "dbAdmin", db: "whisper_wellness" }
    ]
  })
'

echo "MongoDB initialization completed!"
