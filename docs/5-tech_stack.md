# 🛠️ WhisperWell Technical Stack

## System Architecture

WhisperWell is built on a modern, cloud-native architecture designed for scale, security, and reliability. The system is composed of microservices that can be independently scaled based on demand.

## Core Technologies

### Frontend
- **Framework**: React 19.1 with TypeScript
- **State Management**: Redux Toolkit with RTK Query
- **UI Components**: Material-UI (MUI) with custom theme
- **Progressive Web App**: Service workers for offline support
- **Mobile**: React Native for cross-platform mobile apps
- **Real-time**: Socket.IO for live updates

### Backend
- **API Gateway**: Kong/NGINX
- **Service Framework**: Node.js 24.1.0 with NestJS 11
- **Authentication**: Auth0 with JWT (Proprietary)
- **API**: GraphQL (Apollo Server) & REST
- **WebSockets**: Socket.IO for real-time features

### AI/ML Services
- **Conversation Engine**: GPT-4 with fine-tuning (Proprietary - OpenAI)
- **Speech-to-Text**: OpenAI Whisper (Cloud API is proprietary, On-Device is open source)
- **Text-to-Speech**: 
  - ElevenLabs (Proprietary)
  - Coqui TTS (Open Source)
- **Voice Activity Detection**: Silero VAD
- **Language Identification**: FastText LangID
- **Embedding Models**: Sentence Transformers (all-MiniLM-L6-v2)
- **Vector Database**: Qdrant (GPU-accelerated)
- **ML Framework**: PyTorch with CUDA
- **Model Serving**: Triton Inference Server

### Data Storage
- **Primary Database**: MongoDB Atlas (sharded) (Proprietary cloud service, MongoDB Community is open source)
  - User profiles
  - Journal entries
  - Voice recordings (metadata only)
  - Speech recognition results
  - System configurations
  - Chat history
  - Goals and progress
- **Vector Database**: Qdrant
  - Conversation embeddings
  - Semantic search indices
- **Graph Database**: Neo4j Aura (Proprietary cloud service, Neo4j Community is open source)
  - Relationship mapping
  - Knowledge graph
- **Cache**: Redis
  - Session storage
  - Rate limiting
  - Real-time features

### Voice Processing Pipeline
- **Real-time Processing**: WebRTC for browser-based audio capture
- **Audio Processing**: Web Audio API + librosa
- **Speech Recognition**:
  - **Cloud**: OpenAI Whisper API (Proprietary)
  - On-Device: Whisper.cpp for offline mode
- **Voice Command Processing**: Custom NLU pipeline
- **Audio Storage**: Encrypted temporary storage
- **Language Support**: 50+ languages with auto-detection

### Infrastructure
- **Containerization**: Docker + Kubernetes
- **CI/CD**: GitHub Actions + ArgoCD
- **Infrastructure as Code**: Terraform
- **Service Mesh**: Linkerd
- **API Gateway**: Kong
- **Media Processing**: FFmpeg for audio format conversion

### Monitoring & Observability
- **Metrics**: Prometheus + Grafana
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Tracing**: Jaeger
- **Alerting**: Alertmanager + PagerDuty
- **Synthetic Monitoring**: New Relic Synthetics (Proprietary)

## Deployment Architecture

### 1. Development Environment
- Local development with Docker Compose
- Minikube for local Kubernetes testing
- Automated testing with GitHub Actions

### 2. Staging Environment
- Full production-like environment
- Blue/green deployment testing
- Performance testing with k6

### 3. Production Environment
- Multi-region deployment
- Auto-scaling node groups
- Database read replicas
- Global- **CDN**: Cloudflare (Proprietary with free tier)

## Data Model

### MongoDB Collections
- `users` - User profiles and authentication
- `journal_entries` - Encrypted journal content
- `voice_recordings` - Metadata for voice recordings
- `speech_results` - Processed speech recognition data
- `voice_preferences` - User voice interaction settings
- `goals` - User goals and progress
- `conversations` - Chat history with AI
- `analytics_events` - User interaction data

### Qdrant Collections
- `conversation_embeddings` - Vector representations of conversations
  - Dimension: 384 (all-MiniLM-L6-v2)
  - Distance: Cosine
  - Payload: conversation_id, user_id, timestamp, metadata

### Neo4j Graph Model
- Nodes: User, JournalEntry, Goal, Conversation, Tag, Emotion
- Relationships: CREATED, TAGGED_WITH, RELATED_TO, EXPRESSES

## Security Architecture

### Data Protection
- **Encryption at Rest**: AES-256
- **Encryption in Transit**: TLS 1.3
- **Key Management**: 
  - AWS KMS (Proprietary)
  - HashiCorp Vault (Open Source with Enterprise features)
- **Data Masking**: PII redaction
- **Audit Logging**: All data access logged

### Access Control
- Role-Based Access Control (RBAC)
- Attribute-Based Access Control (ABAC)
- Just-In-Time (JIT) provisioning
- Multi-factor authentication (MFA)

### Compliance
- **GDPR/CCPA**: Data subject access requests
- **HIPAA**: BAA with providers
- **SOC 2 Type II**: Annual audits
- **Penetration Testing**: Quarterly security audits

## Performance & Scaling

### Read Optimization
- Database read replicas
- Redis caching layer
- CDN for static assets
- Edge caching with Cloudflare

### Write Optimization
- Database sharding by user ID
- Asynchronous processing for non-critical operations
- Batch processing for analytics

### AI/ML Scaling
- Model quantization for inference optimization
- Dynamic batching
- GPU acceleration for embedding generation
- Model versioning and A/B testing

## Disaster Recovery
- Multi-region deployment
- Automated backups with point-in-time recovery
- Chaos engineering testing
- Incident response playbooks

## Development Workflow
- Git Flow branching strategy
- Automated testing (unit, integration, E2E)
- Code review requirements
- Automated dependency updates with Dependabot

## Monitoring & Alerting
> Note: The following components have proprietary aspects:
> - **Grafana Cloud** (Proprietary SaaS, self-hosted is open source)
> - **ELK Stack** (Open Source, but Elastic Cloud is proprietary)
> - **PagerDuty** (Proprietary)
- Custom dashboards in Grafana
  - Voice recognition accuracy metrics
  - Processing latency monitoring
  - Language detection analytics
- SLO-based alerting
- Anomaly detection for voice processing
- Cost monitoring and optimization
- Voice quality metrics (WER, CER)
- Speaker diarization accuracy
