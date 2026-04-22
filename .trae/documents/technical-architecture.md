## 1. Architecture Design
```mermaid
flowchart TD
    A[Frontend: React + TailwindCSS] --> B[OpenRouter API]
    B --> C[Streaming Response]
    A --> D[Local State Management]
```

## 2. Technology Description
- Frontend: React@18 + tailwindcss@3 + vite
- Initialization Tool: vite-init
- Backend: None (direct API calls from frontend)
- External Services: OpenRouter API

## 3. Route Definitions
| Route | Purpose |
|-------|---------|
| / | Chat page with message input and history |

## 4. API Definitions
### 4.1 OpenRouter API
- Endpoint: `https://openrouter.ai/api/v1/chat/completions`
- Method: POST
- Headers:
  - Content-Type: application/json
  - Authorization: Bearer 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
  - HTTP-Referer: https://example.com
  - X-Title: Test Chat App
- Request Body:
  ```json
  {
    "model": "openrouter/free",
    "messages": [
      {
        "role": "user",
        "content": "Hello"
      }
    ],
    "stream": true
  }
  ```
- Response: Streaming JSON with delta updates

## 5. Server Architecture Diagram
Not applicable (no backend server)

## 6. Data Model
### 6.1 Data Model Definition
```mermaid
flowchart TD
    A[Message] --> B[User Message]
    A --> C[AI Message]
```

### 6.2 Data Definition Language
Not applicable (no database)