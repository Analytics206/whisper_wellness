# Developer Notes
docker-compose up -d
docker-compose down

docker ps --filter name=whisper-wellness-qdrant
- in business requirements, fix 1 phase list with Core features phase 1

mongodb://admin:ChangeMeToASecurePassword123!@localhost:27017/admin?tls=true&tlsAllowInvalidCertificates=true
mongodb://localhost:27017
mongodb://admin:ChangeMeToASecurePassword123!@localhost:27017/admin?tls=true&tlsAllowInvalidCertificates=true

mongodb://admin:ChangeMeToASecurePassword123!@mongodb:27017/whisper_wellness?authSource=admin

mongodb://localhost:27018
mongodb://admin:ChangeMeToASecurePassword123!@localhost:27018/whisper_wellness?authSource=admin
./generate-mongodb-certs.sh

docker logs whisper-wellness-fastapi

# mongo command  temporarily disable SSL for testing by modifying the MongoDB service in docker-compose.yml
command: mongod --bind_ip_all --auth