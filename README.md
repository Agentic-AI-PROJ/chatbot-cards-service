# Chatbot Cards Service

The **Chatbot Cards Service** manages the lifecycle of "Chatbot Cards" and "Conversation Cards". These entities represent the agents/bots available to users and the individual conversation sessions they have with them.

## 🚀 Features

- **Chatbot Cards**: CRUD operations for defining new agents (name, description, capabilities).
- **Conversation Cards**: Manages conversation history, linking user sessions to specific kinds of chatbots.
- **Message Handling**: Stores and retrieves messages for a specific conversation session.

## 🛠️ Technology Stack

- **Runtime**: Node.js, Express
- **Database**: MongoDB (via Mongoose)
- **Logging**: Winston

## 📦 Installation & Setup

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Create a `.env` file in the root of the service:
    ```env
    PORT=3004
    MONGO_URI=mongodb://localhost:27017/ai-agents
    NODE_ENV=development
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    The server will start at `http://localhost:3004`.

## 🔌 API Reference & Curl Examples

### 1. Chatbot Cards

Manage the definitions of chatbots available in the system.

#### List Chatbot Cards
```bash
curl http://localhost:3004/
```

#### Create Chatbot Card
```bash
curl -X POST http://localhost:3004/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Research Assistant",
    "description": "Helps with web research",
    "icon": "🔍"
  }'
```

#### Get Chatbot Card by ID
```bash
curl http://localhost:3004/card_id_123
```

### 2. Conversation Cards

Manage specific conversation sessions.

#### Create Conversation
```bash
curl -X POST http://localhost:3004/conversation \
  -H "Content-Type: application/json" \
  -d '{
    "chatbotCard": "card_id_123",
    "title": "My Research Session"
  }'
```

#### List Conversations for a Chatbot
```bash
curl http://localhost:3004/conversation/card/card_id_123
```

#### Get Conversation by GUID
```bash
curl http://localhost:3004/conversation/conv_guid_456
```

#### Delete Conversation
```bash
curl -X DELETE http://localhost:3004/conversation/conv_guid_456
```

## 💓 Health Checks

- **Server Health**: `GET /health`
- **Database Health**: `GET /db-health`
