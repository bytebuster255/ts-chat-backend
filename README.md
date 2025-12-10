# TypeScript Chat Backend

A real-time chat application backend built with Node.js, Express, TypeScript, MongoDB, and Socket.io.

## Features

- **Authentication**: JWT-based auth (Access & Refresh tokens), RSA key generation for E2EE support.
- **Real-time Messaging**: Instant messaging using Socket.io.
- **Push Notifications**: Firebase Cloud Messaging (FCM) integration.
- **User Management**: Profile management, user search, and blocking.
- **Secure**: Password hashing with bcrypt, RSA key pairs for users.

## Prerequisites

- Node.js (v14+ recommended)
- MongoDB (running locally or a connection string)
- NPM or Yarn

## Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd typescript-chat-backend
    ```

2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  Configure Environment Variables:
    Create a `.env` file in the root directory and add the following variables:
    ```env
    JWT_SECRET_ACCESS=your_access_token_secret
    JWT_SECRET_REFRESH=your_refresh_token_secret
    REFRESH_SECRET=your_refresh_token_secret # Should match or be separate depending on rotation policy
    ```
    *Note: MongoDB URI is currently hardcoded in `src/db.ts` as `mongodb://localhost:27017/chat-app-db`. Update it there if needed.*

## Running the Application

- **Development Mode** (with hot-reload):
    ```bash
    npm run dev
    ```

- **Build and Start**:
    ```bash
    npm run serve
    ```

- **Build Only**:
    ```bash
    npm run build
    ```

## API Documentation

The API is prefixed with `/api`.

### Authentication

| Method | Endpoint | Description | Request Body |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register a new user | `{ "username": "...", "email": "...", "password": "..." }` |
| `POST` | `/auth/login` | Login user | `{ "email": "...", "password": "..." }` |
| `POST` | `/refresh` | Refresh access token | `{ "refreshToken": "..." }` |

### User & Profile

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/user/profile` | Get current user profile | Yes |
| `GET` | `/user/profile/:username` | Get public profile of a user | Yes |
| `PATCH` | `/user/profile` | Update profile (biography) | Yes |
| `GET` | `/users/search?query=name` | Search users by username | Yes |
| `GET` | `/publickey/:username` | Get user's RSA public key | Yes |

### Chat & Messaging

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/conversations` | Get all conversations | Yes |
| `GET` | `/conversations/check/:receiverId` | Check if conversation exists | Yes |
| `POST` | `/conversations/create-dm` | Create a new DM | Yes |
| `GET` | `/messages/:conversationId` | Get messages of a conversation | Yes |
| `POST` | `/send/:conversationId` | Send a message | Yes |

### Calls & Notifications

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/users/calls` | Get call history | Yes |
| `GET` | `/users/call/:callId` | Get specific call details | Yes |
| `POST` | `/users/call/reject` | Reject a call | Yes |
| `POST` | `/fcm-token` | Register FCM token | Yes |
| `POST` | `/remove-fcm-token` | Remove FCM token | Yes |

## real-time Events (Socket.io)

Connect to the socket using the JWT access token in the handshake auth (`token` field) or headers.

- **Events Emitted**:
    - `new_message`: Sent when a new message is received.
    - `call_rejected`: Sent when a call is rejected.

## Project Structure

- `src/models`: Mongoose schemas (User, Message, Conversation, Call).
- `src/routes`: API route definitions.
- `src/controllers`: (Inline in routes currently).
- `src/socket`: Socket.io connection and event handlers.
- `src/utils`: Helper functions (JWT, Crypto).

## License

ISC
