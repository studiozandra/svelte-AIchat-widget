# Backend Setup Guide

Complete backend implementation for `@studiozandra/svelte-ai-chat-widget`.

## Quick Setup (5 Minutes)

### 1. Install Dependencies

```bash
npm install @anthropic-ai/sdk better-sqlite3 @types/better-sqlite3
```

### 2. Copy Backend Files

```bash
# Create server directory
mkdir -p src/lib/server

# Copy utilities
cp templates/backend/db.ts src/lib/server/
cp templates/backend/env.ts src/lib/server/
cp templates/backend/rate-limit.ts src/lib/server/
cp templates/backend/knowledge.ts src/lib/server/
cp templates/backend/knowledge-base.json src/lib/server/

# Copy API routes
mkdir -p src/routes/api/chat/send src/routes/api/chat/history
cp templates/backend/api/chat/send/+server.ts src/routes/api/chat/send/
cp templates/backend/api/chat/history/+server.ts src/routes/api/chat/history/

# Copy environment template
cp templates/backend/.env.example .env
```

### 3. Configure Environment

Edit `.env` and add your Anthropic API key from [console.anthropic.com](https://console.anthropic.com/):

```env
ANTHROPIC_API_KEY=sk-ant-api-YOUR-KEY-HERE
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

### 4. Customize Knowledge Base (Optional)

Edit `src/lib/server/knowledge-base.json` with your product-specific FAQs:

```json
{
  "company": "Your Company Name",
  "faqs": [
    {
      "category": "support",
      "question": "How do I contact support?",
      "answer": "Email us at support@yourcompany.com",
      "keywords": ["contact", "support", "help", "email"]
    }
  ]
}
```

**📖 Full guide: [KNOWLEDGE_BASE.md](KNOWLEDGE_BASE.md)**

### 5. Start Server

```bash
npm run dev
```

✅ Done! Your backend is ready at:
- `POST /api/chat/send` - Message streaming
- `GET /api/chat/history` - Conversation history

## Authentication Requirements

⚠️ **This chatbot requires Better Auth.** Install and configure it first:

```bash
npm install better-auth
```

The chatbot endpoints authenticate users via `import { auth } from '$lib/server/auth'` and verify sessions server-side. Users must be logged in to access the chatbot, and each user's chat history is isolated. See [Better Auth docs](https://www.better-auth.com/docs) for setup.

## What's Included

### Database Layer (`db.ts`)
SQLite database with:
- Session management
- Message persistence
- Pagination support
- Auto-cleanup utilities

### Environment Config (`env.ts`)
Type-safe environment validation with defaults.

### Rate Limiting (`rate-limit.ts`)
In-memory rate limiter (10 req/min default).

### API Endpoints
- **POST /api/chat/send** - SSE streaming with context
- **GET /api/chat/history** - Paginated message retrieval

### Knowledge Base (`knowledge.ts` + `knowledge-base.json`)
RAG (Retrieval Augmented Generation) system that:
- Searches product-specific FAQs based on user questions
- Injects relevant information into the AI's system prompt
- Prevents hallucinations by constraining responses to known information
- Easy to customize via JSON file (no code changes needed)

**📖 See [KNOWLEDGE_BASE.md](KNOWLEDGE_BASE.md) for customization guide**

## Testing

```bash
# Send message
curl -X POST http://localhost:5173/api/chat/send \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!"}'

# Get history
curl "http://localhost:5173/api/chat/history?sessionId=test&limit=10"
```

## Security Features

- ✅ API key stored server-side only
- ✅ Rate limiting per IP
- ✅ Input validation (message length, types)
- ✅ SQL injection prevention (parameterized queries)
- ✅ Error handling with proper HTTP codes
- ✅ Knowledge base prevents AI hallucinations (RAG-based responses)

## Production Notes

- **SQLite**: Great for small-medium traffic, ensure backups
- **Scale**: Migrate to PostgreSQL for high traffic
- **Rate Limiting**: Use Redis for multi-server deployments
- **Environment**: Set `ANTHROPIC_API_KEY` in deployment platform

## Configuration Options

```env
ANTHROPIC_API_KEY=sk-ant-api-xxx              # Required
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022    # Default model
SYSTEM_PROMPT=You are a helpful assistant.    # Customize behavior
MAX_TOKENS=2048                                # Response length
RATE_LIMIT_REQUESTS=10                        # Requests per window
RATE_LIMIT_WINDOW_MS=60000                    # Time window (1 min)
DATABASE_PATH=chat.db                         # SQLite file path
DEBUG=false                                   # Debug logging
```

## Troubleshooting

**"Missing required environment variables"**
→ Create `.env` file with `ANTHROPIC_API_KEY`

**"SQLITE_CANTOPEN"**
→ Ensure write permissions in project directory

**"Rate limit exceeded"**
→ Wait 1 minute or adjust `RATE_LIMIT_REQUESTS`

**Streaming not working**
→ Check `Content-Type: text/event-stream` header
→ Test with curl to isolate issue

## Support

- [Report issues](https://github.com/studiozandra/svelte-ai-chat-widget/issues)
- [View main README](../README.md)
