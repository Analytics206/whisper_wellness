#!/bin/bash

# Create a directory for the certificates
mkdir -p mongodb-certs
cd mongodb-certs || exit

# Generate a self-signed CA certificate
openssl req -x509 -nodes -new -newkey rsa:4096 -keyout mongo-ca.key -out mongo-ca.crt -subj "/CN=MongoDB CA" -days 3650

# Generate a certificate signing request for the server
openssl req -nodes -new -newkey rsa:4096 -keyout mongodb.key -out mongodb.csr -subj "/CN=localhost"

# Create a config file for the certificate extensions
echo "subjectKeyIdentifier=hash
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage=digitalSignature, keyEncipherment
extendedKeyUsage=serverAuth, clientAuth
subjectAltName=DNS:localhost,DNS:mongodb,DNS:whisper-wellness-mongodb" > mongodb.ext

# Sign the server certificate with the CA
openssl x509 -req -in mongodb.csr -CA mongo-ca.crt -CAkey mongo-ca.key -CAcreateserial -out mongodb.crt -days 365 -extfile mongodb.ext

# Create a combined PEM file for MongoDB
cat mongodb.key mongodb.crt > mongodb.pem

# Copy the CA certificate to the project root
cp mongo-ca.crt ../mongo-cert.crt
cp mongodb.pem ../mongo.pem

# Set proper permissions
chmod 600 mongodb.key mongodb.pem
chmod 644 mongo-ca.crt mongodb.crt

# Output instructions
echo "Certificates generated successfully!"
echo "- mongo-cert.crt and mongo.pem have been copied to the project root."
echo "- These files are referenced in the docker-compose.yml file."
echo "- The CA certificate (mongo-ca.crt) should be installed on any client that needs to connect to MongoDB."
