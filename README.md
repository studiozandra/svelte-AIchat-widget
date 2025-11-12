# @studiozandra/svelte-ai-chat-widget

A production-ready AI chatbot widget for SvelteKit with Server-Sent Events (SSE) streaming. Built with Svelte 5 runes.

[![npm version](https://img.shields.io/npm/v/@studiozandra/svelte-ai-chat-widget)](https://www.npmjs.com/package/@studiozandra/svelte-ai-chat-widget)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Features

- 🚀 **Svelte 5 Runes** - Modern reactive state management
- 💬 **Real-time Streaming** - SSE support for responsive AI interactions
- 🎨 **Fully Customizable** - Themes, slots, and CSS custom properties
- 🌍 **i18n Ready** - All UI text exposed through props
- ⌨️ **Keyboard Navigation** - Escape to close, Enter to send
- 📱 **Responsive Design** - Works on mobile and desktop
- 🔒 **Session Persistence** - Resume conversations automatically
- 🪶 **Lightweight** - Under 50KB gzipped

## Installation

```bash
npm install @studiozandra/svelte-ai-chat-widget
```

## Quick Start

### 1. Add the Widget

```svelte
<script lang="ts">
  import { ChatWidget } from '@studiozandra/svelte-ai-chat-widget';
</script>

<ChatWidget
  sendMessageEndpoint="/api/chat/send"
  historyEndpoint="/api/chat/history"
  theme="light"
/>
```

### 2. Set Up Backend

This widget requires backend API endpoints. **Complete backend implementation included** in `templates/backend/`.

**Quick setup (5 minutes):**

```bash
# Install dependencies
npm install @anthropic-ai/sdk better-sqlite3

# Copy backend files
cp -r templates/backend/* src/

# Configure .env
echo "ANTHROPIC_API_KEY=sk-ant-xxx" > .env

# Start server
npm run dev
```

📖 **[Full Backend Setup Guide →](./templates/backend/BACKEND_SETUP.md)**

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `sendMessageEndpoint` | `string` | Yes | POST endpoint for sending messages (SSE stream) |
| `historyEndpoint` | `string` | Yes | GET endpoint for conversation history |
| `context` | `Record<string, any>` | No | Additional context sent with each request |
| `theme` | `'light' \| 'dark' \| string` | No | Built-in theme or custom CSS class |
| `i18n` | `object` | No | Customize UI text |

### i18n Options

```typescript
{
  placeholder?: string;      // Default: "Type your message..."
  title?: string;           // Default: "Chat"
  sendButton?: string;      // Default: "Send"
  errorMessage?: string;    // Default: "Something went wrong"
}
```

## Events

```svelte
<ChatWidget
  {...props}
  onopen={() => console.log('Chat opened')}
  onclose={() => console.log('Chat closed')}
  onmessage={(msg) => console.log('Message:', msg)}
/>
```

## Theming

### Built-in Themes

```svelte
<ChatWidget theme="light" {...props} />
<ChatWidget theme="dark" {...props} />
```

### Custom CSS Variables

```css
:root {
  --chat-bubble-bg: #4f46e5;
  --chat-bubble-color: white;
  --chat-window-bg: white;
  --chat-header-bg: #4f46e5;
  --chat-header-color: white;
  --chat-user-message-bg: #4f46e5;
  --chat-user-message-color: white;
  --chat-assistant-message-bg: #f3f4f6;
  --chat-input-border: #e5e7eb;
  --chat-send-button-bg: #4f46e5;
}
```

## Slots

### Custom Header

```svelte
<ChatWidget {...props}>
  {#snippet header()}
    <div class="custom-header">
      <img src="/logo.png" alt="Logo" />
      <h3>Support Chat</h3>
    </div>
  {/snippet}
</ChatWidget>
```

### Custom Footer

```svelte
<ChatWidget {...props}>
  {#snippet footer()}
    <p>Your conversations are private and encrypted.</p>
  {/snippet}
</ChatWidget>
```

## Backend API Specification

The widget requires two endpoints:

### POST /api/chat/send

**Request:**
```json
{
  "message": "Hello, AI!",
  "sessionId": "optional-uuid",
  "context": { "userId": "123" }
}
```

**Response:** Server-Sent Events stream
```
data: {"chunk": "Hello"}
data: {"chunk": " there!"}
data: {"done": true, "sessionId": "uuid"}
```

### GET /api/chat/history

**Request:**
```
GET /api/chat/history?sessionId=uuid&limit=50&offset=0
```

**Response:**
```json
{
  "messages": [
    {
      "id": "msg-1",
      "role": "user",
      "content": "Hello!",
      "timestamp": 1234567890000
    }
  ],
  "hasMore": false
}
```

📖 **[Complete Backend Implementation Guide →](./templates/backend/BACKEND_SETUP.md)**

## TypeScript Support

Full TypeScript support with exported types:

```typescript
import type {
  ChatWidgetProps,
  Message,
  ChatSession,
  HistoryResponse,
  SendMessageRequest
} from '@studiozandra/svelte-ai-chat-widget';
```

## Advanced Usage

### Programmatic Control

```typescript
import { createChatStore } from '@studiozandra/svelte-ai-chat-widget';

const chatStore = createChatStore();

// Access state
console.log(chatStore.messages);
console.log(chatStore.isOpen);

// Control widget
chatStore.open();
chatStore.close();
chatStore.addMessage({ role: 'user', content: 'Hello' });
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Security

The included backend implementation provides:
- ✅ API key security (server-side only)
- ✅ Rate limiting (10 req/min default)
- ✅ Input validation
- ✅ SQL injection prevention
- ✅ Session validation

**Production recommendations:**
- Add user authentication
- Implement authorization checks
- Use HTTPS
- Enable CORS properly
- Add content moderation

## License

MIT © studiozandra

## Links

- 🐛 [Report a bug](https://github.com/studiozandra/svelte-ai-chat-widget/issues)
- 💡 [Request a feature](https://github.com/studiozandra/svelte-ai-chat-widget/issues)
- 📖 [Backend Setup Guide](./templates/backend/BACKEND_SETUP.md)
- 📝 [Changelog](./CHANGELOG.md)
