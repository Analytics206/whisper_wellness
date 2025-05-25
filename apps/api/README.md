# Whisper Wellness API

A NestJS-based API for Whisper Wellness application, providing authentication, user management, and journaling features with MongoDB, Neo4j, and Qdrant integration.

## Features

- **Authentication**: JWT-based authentication with local strategy
- **User Management**: CRUD operations for user profiles with role-based access control
- **Journaling**: Create, read, update, and delete journal entries with rich text support
- **Search**: Full-text and semantic search capabilities using Qdrant
- **Relationships**: Graph-based relationships between entities using Neo4j
- **Documentation**: Auto-generated API documentation with Swagger

## Prerequisites

- Node.js 18+
- MongoDB 6.0+
- Neo4j 5.0+
- Qdrant 1.1.1+
- pnpm 8.0.0+

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/whisper-wellness.git
   cd whisper-wellness/apps/api
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Copy the environment file and update the values:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   pnpm start:dev
   ```

## Configuration

Update the `.env` file with your configuration:

- `MONGODB_URI`: MongoDB connection string
- `NEO4J_*`: Neo4j connection details
- `QDRANT_URL`: Qdrant server URL
- `JWT_SECRET`: Secret key for JWT signing

## API Documentation

Once the server is running, you can access the API documentation at:

- Swagger UI: http://localhost:3000/api
- JSON API Spec: http://localhost:3000/api-json

## Development

- Run the application in development mode:
  ```bash
  pnpm start:dev
  ```

- Build the application:
  ```bash
  pnpm build
  ```

- Run tests:
  ```bash
  pnpm test
  ```

## Project Structure

```
src/
├── auth/                  # Authentication module
├── common/                # Common utilities and types
├── config/                # Configuration files
├── database/              # Database module (MongoDB, Neo4j, Qdrant)
├── journal/               # Journal entries module
├── users/                 # Users module
├── app.module.ts          # Root module
└── main.ts                # Application entry point
```

## Environment Variables

See `.env.example` for all available environment variables.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.