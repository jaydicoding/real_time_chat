# Real-Time Chat

A minimal real-time chat application built with **React**, **Express**, and **Socket.IO**.

Users can join chat rooms, exchange messages in real time, and send direct messages to other users.

---

## Features

- Join and leave chat rooms
- Send and receive real-time room messages
- Send 1:1 direct messages
- System notifications when users join or leave
- Multi-tab user handling to avoid duplicate "left" messages
- Responsive chat interface
- Auto-scroll to the latest message

---

## Tech Stack

- **Frontend:** React 18, Vite
- **Backend:** Node.js, Express
- **Real-Time Communication:** Socket.IO
- **Node Version:** Node.js 18 or later recommended

---

## Project Structure

```text
reactSocketIOChatApp/
├── public/
├── src/
│   ├── App.jsx
│   └── App.css
├── server.js
├── package.json
├── vite.config.js
└── .gitignore
```

---

## Installation

Clone the repository.

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Move into the project directory.

```bash
cd WebTutorial/reactSocketIOChatApp
```

Install the dependencies.

```bash
npm install
```

Run the Socket.IO server in the first terminal.

```bash
node server.js
```

Run the React client in a second terminal.

```bash
npm run dev
```

Open the application in your browser:

```text
http://localhost:5173
```

---

## Preview

<img src="../../images/Real-Time-Chat.gif" width="700">

---

## Socket Events

### Client → Server

- `join room`: `{ room }`
- `leave room`: `{ room }`
- `new message`: `{ room, username, message }`
- `dm`: `{ targetUsername, from, message }`

### Server → Client

- `new message`: `{ room, username, message }`
- `system`: `{ room?, message }`
- `dm`: `{ from, to, message, ts, self? }`

---

## Quick Test

1. Open two browser windows or use an incognito tab.
2. Enter different usernames and connect both users.
3. Join the same chat room.
4. Exchange messages between the two users.
5. Try sending a direct message.
6. Leave the room or disconnect one user and check that the other user receives the appropriate system message.
7. Open multiple tabs with the same username and verify that a "left" message is only shown when the user's final connection is closed.

---

## Config & Ports

**No environment variables are required.**

The Socket.IO server runs on port `3000` by default.

```javascript
server.listen(3000)
```

The Vite development server runs on port `5173` by default.

To use a different Vite port:

```bash
npm run dev -- --port 5174
```

You can also configure the port in `vite.config.js`.

---

## Troubleshooting

### CORS Error

Make sure the Socket.IO server allows the required origin.

```javascript
new Server(server, {
  cors: {
    origin: "*"
  }
})
```

### Auto-scroll Not Working

Verify that `chatRef` and `useLayoutEffect` are correctly configured to scroll to the bottom whenever the messages are updated.

### System Messages Missing

Make sure the server emits the `system` event during `disconnecting` with the correct room information.

Also check that client event listeners are rebound correctly when `currentRoom` changes.

