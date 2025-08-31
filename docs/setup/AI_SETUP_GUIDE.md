# AI Features Setup Guide for Vidibemus AI Website

## Overview

This guide provides comprehensive instructions for setting up and configuring all AI-powered features implemented in the Vidibemus AI website.

## Table of Contents

1. [Installation](#installation)
2. [Environment Configuration](#environment-configuration)
3. [API Keys Setup](#api-keys-setup)
4. [Database Setup](#database-setup)
5. [Vector Store Configuration](#vector-store-configuration)
6. [Feature Configuration](#feature-configuration)
7. [Testing](#testing)
8. [Deployment](#deployment)

## Installation

### Prerequisites

- Node.js 18.17.0 or higher
- npm or yarn package manager
- PostgreSQL database (for user data)
- Redis (for caching)

### Install Dependencies

```bash
npm install
```

This will install all required AI libraries including:
- OpenAI SDK
- Anthropic SDK
- LangChain
- Pinecone Vector Database
- Hugging Face Inference API
- Vercel AI SDK

## Environment Configuration

Create a `.env.local` file in your project root with the following configuration:

```bash
# Copy from .env.example
cp .env.example .env.local
```

### Required Environment Variables

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/vidibemus_ai"

# Authentication
NEXTAUTH_SECRET="your-super-secret-nextauth-key"
NEXTAUTH_URL="http://localhost:3000"

# AI Service API Keys
OPENAI_API_KEY="sk-your-openai-api-key"
ANTHROPIC_API_KEY="sk-ant-your-anthropic-api-key"
HUGGINGFACE_API_KEY="hf_your-huggingface-api-key"

# Vector Database
PINECONE_API_KEY="your-pinecone-api-key"
PINECONE_ENVIRONMENT="your-pinecone-environment"
PINECONE_INDEX="vidibemus-knowledge-base"

# AI Configuration
AI_MODEL_PROVIDER="openai"
DEFAULT_MODEL="gpt-4-turbo-preview"
MAX_TOKENS=4096
TEMPERATURE=0.7
STREAMING_ENABLED=true

# RAG Configuration
EMBEDDING_MODEL="text-embedding-3-small"
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
MAX_RETRIEVAL_DOCUMENTS=5

# Feature Flags
ENABLE_AI_CHAT=true
ENABLE_AI_DEMOS=true
ENABLE_TRANSCRIPTION=true
ENABLE_DOCUMENT_ANALYSIS=true
ENABLE_RECOMMENDATIONS=true
```

## API Keys Setup

### OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key
5. Add to your `.env.local` file

**Required Models:**
- GPT-4 Turbo (for chat and analysis)
- Text Embedding 3 Small (for RAG)
- Whisper (for transcription)

### Anthropic API Key

1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Create an account
3. Generate an API key
4. Add to your `.env.local` file

### Pinecone Vector Database

1. Visit [Pinecone](https://www.pinecone.io/)
2. Create an account
3. Create a new index with these specifications:
   - Name: `vidibemus-knowledge-base`
   - Dimensions: `1536` (for OpenAI embeddings)
   - Metric: `cosine`
   - Pod Type: `p1.x1` (starter)
4. Get your API key and environment
5. Add to your `.env.local` file

### Hugging Face API Key (Optional)

1. Visit [Hugging Face](https://huggingface.co/)
2. Create an account
3. Go to Settings > Access Tokens
4. Create a new token
5. Add to your `.env.local` file

## Database Setup

Run the database migrations and setup:

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed the database (optional)
npm run db:seed
```

## Vector Store Configuration

### Initialize Pinecone Index

```bash
# The system will automatically create the index structure
# when you first upload documents to the knowledge base
```

### Upload Initial Knowledge Base

You can upload documents to the knowledge base through the API:

```bash
curl -X POST http://localhost:3000/api/ai/knowledge \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Your document content here...",
    "title": "Document Title",
    "type": "knowledge",
    "metadata": {
      "author": "Your Name",
      "category": "AI"
    }
  }'
```

## Feature Configuration

### AI Chat System

The chat system supports:
- Multiple AI providers (OpenAI, Anthropic, Hugging Face)
- RAG-enhanced responses
- Conversation history
- Streaming responses
- Custom system prompts

### AI Demos

Available demos:
- **Sentiment Analysis**: Analyze text sentiment and emotions
- **Text Summarization**: Generate summaries in multiple formats
- **Entity Extraction**: Extract named entities from text
- **Language Detection**: Identify text language
- **Text Classification**: Classify text into categories

### Transcription Service

Features:
- Audio file transcription using Whisper
- Multiple language support
- Speaker identification (basic)
- Summary generation
- Key points extraction
- SRT subtitle export

### Recommendation Engine

Capabilities:
- User behavior tracking
- Content recommendations
- Trending topics analysis
- Personalization based on interests
- A/B testing support

### ML Model Showcase

Includes:
- Model performance metrics
- Real-time predictions
- A/B testing framework
- Model comparison tools
- Performance monitoring

## Testing

### Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Test AI Features

1. **Chat Interface**: Navigate to `/ai` and test the chat functionality
2. **Sentiment Analysis**: Try the sentiment demo with sample text
3. **Text Summarization**: Test with long text content
4. **API Endpoints**: Test API endpoints using curl or Postman

### Sample API Tests

```bash
# Test chat completion
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, how can you help me with AI?",
    "useRAG": true
  }'

# Test sentiment analysis
curl -X POST http://localhost:3000/api/ai/demos/sentiment \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I love this product! It works amazingly well."
  }'

# Test text summarization
curl -X POST http://localhost:3000/api/ai/demos/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Your long text here...",
    "length": "medium",
    "style": "paragraph"
  }'
```

## Deployment

### Environment Variables

Ensure all environment variables are properly set in your production environment.

### Build the Application

```bash
npm run build
```

### Production Considerations

1. **API Rate Limits**: Monitor API usage and implement rate limiting
2. **Caching**: Use Redis for caching frequent requests
3. **Security**: Implement proper authentication and authorization
4. **Monitoring**: Set up monitoring for API performance and errors
5. **Scaling**: Consider using multiple AI providers for redundancy

### Performance Optimization

- Use connection pooling for database connections
- Implement response caching for similar queries
- Use streaming responses for long-running operations
- Optimize vector database queries

## Troubleshooting

### Common Issues

1. **API Key Issues**
   - Verify API keys are correctly set
   - Check API key permissions and quotas
   - Ensure billing is set up for paid APIs

2. **Vector Database Issues**
   - Verify Pinecone index configuration
   - Check embedding dimensions match
   - Ensure sufficient quota for operations

3. **Model Access Issues**
   - Check model availability in your region
   - Verify API key has access to required models
   - Monitor usage limits and quotas

### Error Monitoring

Check the browser console and server logs for detailed error messages. All AI operations include comprehensive error handling and logging.

## Support and Resources

- [OpenAI Documentation](https://platform.openai.com/docs)
- [Anthropic Documentation](https://docs.anthropic.com/)
- [Pinecone Documentation](https://docs.pinecone.io/)
- [LangChain Documentation](https://docs.langchain.com/)

For additional support, check the project repository issues or contact the development team.