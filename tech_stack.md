# 🛠️ Technical Stack Documentation

## System Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Ingestion     │────▶│  Data Storage   │────▶│   Processing    │
│   Service       │     │    Layer        │     │    Layer        │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                         │
                                                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│      User       │◀────│   Knowledge     │◀────│   Vector        │
│   Interface     │     │     Graph       │     │   Embeddings    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Core Technologies

### Infrastructure & Containerization


### Messaging System


### Monitoring & Observability

### Data Sources

### Ingestion Layer

### Data Storage Layer

### Graph Representation


### Vector Embeddings & Topic Modeling
- **Hugging Face Transformers**: Machine learning models for text embeddings
- **PyTorch with CUDA**: GPU-accelerated embeddings generation
- **Top2Vec**: Topic modeling with BERT-based embeddings
  - Memory-efficient batch processing
  - Category and date filtering support
  - MongoDB integration for topic storage
- **BERTopic**: Topic modeling with BERT-based embeddings
  - Memory-efficient batch processing
  - Category and date filtering support
  - MongoDB integration for topic storage
- **Ollama**: Local LLM server for text analysis and embedding generation
  - Deployment options:
    - Local instance: Run directly on the host machine
    - Docker container: Standard deployment within main pipeline
    - External Docker: Standalone deployment on separate machine with model management
- **Qdrant**: Vector database for similarity search
  - Collections: paper_embeddings
  - Storage of metadata with vectors
  - Deployment options:
    - Docker container: Standard deployment
    - External Docker: Standalone deployment on separate machine
    - WSL2 GPU-accelerated: Enhanced performance with CUDA support
    - Standalone with GPU: Direct installation with CUDA support
    - Remote WSL2 with GPU: Dedicated vector server on separate machine
  - Vector optimization: Native GPU acceleration through Rust with CUDA
  - Benchmarking tools for performance testing
- **Embedding models**: Sentence transformers for semantic representation
- **MongoDB Tracking**: Prevents duplicate PDF processing


### Configuration & Utilities

## API Integrations

## Development Tools

## Monitoring Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Monitoring Environment                  │
│                                                          │
│   ┌─────────┐     ┌──────────┐     ┌────────────┐       │
│   │Prometheus│────▶│ Grafana  │     │  cAdvisor  │       │
│   │          │     │          │     │            │       │
│   └─────────┘     └──────────┘     └────────────┘       │
│        │                               │                 │
│        │          ┌──────────┐         │                 │
│        └──────────│Node      │─────────┘                 │
│                   │Exporter  │                           │
│                   └──────────┘                           │
│                        │                                 │
└────────────────────────│─────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   Docker Environment                     │
│  (Application containers, databases, and services)       │
└─────────────────────────────────────────────────────────┘
```

## Deployment Architecture

The system supports four deployment architectures:

### 2. Standard Docker Deployment


### 3. Hybrid Deployment with GPU Acceleration

### 4. Distributed Services Deployment
```
┌────────────────────────────────────────────┐     ┌────────────────────────────────────────────┐
│          Machine 1 (Main Pipeline)         │     │          Machine 2 (MongoDB)               │
│                                            │     │                                            │
│ ┌─────────┐     ┌──────────┐     ┌──────┐ │     │ ┌──────────┐                               │
│ │  app    │────▶│sync-neo4j│────▶│web-ui│ │     │ │ mongodb  │◀─────────────────────────────┤
│ │         │     │          │     │      │ │     │ │          │                               │
│ └─────────┘     └──────────┘     └──────┘ │     │ └──────────┘                               │
└────────────────────────────────────────────┘     └────────────────────────────────────────────┘
                       ▲
                       │
                       ▼
┌────────────────────────────────────────────┐     ┌────────────────────────────────────────────┐
│          Machine 3 (Neo4j)                 │     │          Machine 4 (Qdrant GPU)            │
│                                            │     │                                            │
│ ┌──────────┐                               │     │ ┌─────────┐                                │
│ │  neo4j   │◀─────────────────────────────┤     │ │ qdrant  │◀─────────────────────────────┤
│ │          │                               │     │ │ (GPU)   │                                │
│ └──────────┘                               │     │ └─────────┘                                │
└────────────────────────────────────────────┘     └────────────────────────────────────────────┘
```

## Database Schema

### MongoDB Collections

### Neo4j Graph Model


### MongoDB Topic Collection


### Qdrant Collections

- **wellness_summary**:
  - Vector dimension: Model-dependent (768 default)
  - Metadata: paper_id, title, category, published date, summary_length
  - Distance metric: Cosine similarity
  - Source: Paper summary/abstract from MongoDB

## Security Considerations
- Local-first architecture minimizes external dependencies
- Docker isolation for service components
- No exposed credentials in code
- Grafana access protected by authentication

## Scaling Considerations
- Container-based architecture supports horizontal scaling
- Database services can be scaled independently
- Modular components allow selective enhancement
- Monitoring stack provides visibility into resource usage for capacity planning
