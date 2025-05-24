# MongoDB TLS/SSL Setup Guide

This guide provides detailed instructions for setting up MongoDB with TLS/SSL encryption in a Docker environment. This setup ensures secure communication between MongoDB clients and the server.

## Prerequisites

- Docker and Docker Compose installed
- OpenSSL for certificate generation
- MongoDB Compass (for testing the connection)

## Step 1: Create Certificate Configuration

Create a file named `mongodb.cnf` in your project root with the following content:

```ini
[req]
default_bits = 2048
default_md = sha256
distinguished_name = req_distinguished_name
x509_extensions = v3_req
prompt = no

[req_distinguished_name]
C = US
ST = Washington
L = Seattle
O = Your Organization
OU = Your Department
CN = localhost

[v3_req]
keyUsage = keyEncipherment, dataEncipherment, digitalSignature
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
IP.1 = 127.0.0.1
```

## Step 2: Generate SSL Certificates

Run the following commands in your project root directory:

```bash
# Generate private key and certificate
openssl req -x509 -nodes -newkey rsa:2048 \
  -keyout mongodb.key \
  -out mongodb.crt \
  -days 365 \
  -config mongodb.cnf \
  -extensions 'v3_req'

# Combine key and certificate into a single PEM file
cat mongodb.key mongodb.crt > mongo.pem

# Create a copy of the certificate for client use
cp mongodb.crt mongo-cert.crt

# Set proper permissions
chmod 600 mongo.pem mongo-cert.crt
```

## Step 3: Configure Docker Compose

Update your `docker-compose.yml` file with the following MongoDB service configuration:

```yaml
services:
  mongodb:
    image: mongo:latest
    container_name: whisper-wellness-mongodb
    restart: unless-stopped
    env_file:
      - .env
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_INITDB_ROOT_USERNAME}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_INITDB_ROOT_PASSWORD}
    user: root
    volumes:
      - mongodb_data:/data/db
      - mongodb_config:/data/configdb
      - ./mongo.pem:/etc/ssl/mongo.pem:ro
      - ./mongo-cert.crt:/etc/ssl/mongo-cert.crt:ro
    command: >
      bash -c '
        mkdir -p /data/ssl &&
        cp /etc/ssl/mongo.pem /data/ssl/ &&
        cp /etc/ssl/mongo-cert.crt /data/ssl/ &&
        chmod 600 /data/ssl/mongo.pem &&
        chmod 644 /data/ssl/mongo-cert.crt &&
        chown -R mongodb:mongodb /data/ssl &&
        exec gosu mongodb mongod --tlsMode requireTLS \
             --tlsCertificateKeyFile /data/ssl/mongo.pem \
             --tlsCAFile /data/ssl/mongo-cert.crt \
             --tlsAllowConnectionsWithoutCertificates \
             --bind_ip_all \
             --auth
      '
    networks:
      - whisper-wellness-network
```

## Step 4: Environment Variables

Ensure your `.env` file contains the following variables:

```
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=ChangeMeToASecurePassword123!
MONGO_INITDB_DATABASE=whisper_wellness
```

## Step 5: Start MongoDB Container

```bash
docker-compose up -d --force-recreate mongodb
```

## Step 6: Connect with MongoDB Compass (Windows)

1. Copy the certificate files from WSL2 to Windows:
   - Open Windows Explorer
   - Navigate to: `\\wsl$\Ubuntu\home\jharrell\whisper_wellness\`
   - Copy `mongo-cert.crt` to your Windows desktop

2. In MongoDB Compass:
   - Click "New Connection"
   - Use this connection string:
     ```
     mongodb://admin:ChangeMeToASecurePassword123!@localhost:27017/admin?tls=true&tlsAllowInvalidCertificates=true
     ```
   - Under "TLS/SSL" tab:
     - Enable "TLS/SSL"
     - For "Certificate Authority (.pem)": Select the `mongo-cert.crt` file
     - Check "Allow invalid certificates"
   - Click "Connect"

## Troubleshooting

### Common Issues

1. **Permission Denied** when generating certificates:
   ```bash
   sudo chown $USER:$USER mongo.pem mongo-cert.crt
   ```

2. **Certificate validation failed**:
   - Ensure the certificate includes proper Subject Alternative Names (SANs)
   - Verify the certificate files have correct permissions (600 for .pem, 644 for .crt)

3. **Connection refused**:
   - Check if MongoDB container is running: `docker ps`
   - View container logs: `docker logs whisper-wellness-mongodb`

### Verifying the Certificate

To verify the certificate includes the proper SAN:

```bash
openssl x509 -in mongo-cert.crt -text -noout | grep -A 1 "Subject Alternative Name"
```

## Security Notes

1. **Production Environment**:
   - Use certificates from a trusted Certificate Authority (CA)
   - Set up proper authentication and authorization
   - Consider using client certificates for mutual TLS

2. **Backup Certificates**:
   - Store certificates securely
   - Keep private keys private (never commit them to version control)

3. **Certificate Rotation**:
   - Set up a process to renew certificates before they expire
   - Update the container with new certificates when rotated

## References

- [MongoDB TLS/SSL Configuration](https://docs.mongodb.com/manual/tutorial/configure-ssl/)
- [OpenSSL Configuration Manual](https://www.openssl.org/docs/man1.1.1/man5/config.html)
- [Docker MongoDB Image](https://hub.docker.com/_/mongo)
