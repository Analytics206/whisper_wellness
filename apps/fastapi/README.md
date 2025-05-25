# Whisper Wellness LLM API

FastAPI service for local LLM integration with HuggingFace and Ollama.

## Features

- RESTful API for text generation
- Support for multiple LLM backends (HuggingFace, Ollama)
- Async request handling
- Health check endpoint
- CORS support
- Environment-based configuration

## Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file in the project root with your configuration:
   ```env
   # Application
   DEBUG=True
   HOST=0.0.0.0
   PORT=8002
   
   # CORS
   CORS_ORIGINS=*
   
   # HuggingFace
   HUGGINGFACE_HUB_TOKEN=your_token_here
   HUGGINGFACE_MODEL=meta-llama/Llama-2-7b-chat-hf
   
   # Ollama
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=llama2
   
   # Model settings
   MODEL_MAX_LENGTH=4096
   MODEL_TEMPERATURE=0.7
   ```

## Running the Application

### Development

```bash
uvicorn app.main:app --reload --port 8002
```

### Production with Docker

```bash
docker build -t whisper-wellness-llm .
docker run -p 8002:8002 --env-file .env whisper-wellness-llm
```

## API Documentation

Once the application is running, you can access:

- Interactive API docs: http://localhost:8002/docs
- Alternative API docs: http://localhost:8002/redoc
- Health check: http://localhost:8002/health

## API Endpoints

- `GET /api/v1/models`: List available LLM models
- `POST /api/v1/completions`: Generate text completion

## Development

### Testing

Run tests with pytest:

```bash
pytest tests/
```

### Linting

```bash
black .
flake8
mypy .
```

## Deployment

The service is containerized using Docker and can be deployed to any container orchestration platform.

## License

Proprietary - All rights reserved.
