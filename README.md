# React + Socket.IO Chat

A minimal real-time chat demo.  
**Frontend:** React (Vite) · **Backend:** Express + Socket.IO (Node.js)

---

## Features
- Join/leave rooms: `join room`, `leave room`
- Room broadcast: `new message`
- 1:1 direct messages: `dm`
- System notifications for join/leave
- Multi-tab user handling (avoid duplicate “left” when another tab remains)
- Responsive UI with auto-scroll to the latest message

---

## Project Strucuture
react-socketio-chat/
├─ public/
├─ src/
│  ├─ App.jsx
│  └─ App.css
├─ server.js # Express + Socket.IO server
├─ package.json
├─ vite.config.js
└─ .gitignore

---

## Tech Stack
- **Client:** React 18, Vite  
- **Server:** Node.js, Express, Socket.IO  
- **Node version:** ≥ 18 recommended

---

## Getting started

### Install
npm install

- **Run(two terminals)**
- Terminal A: server
node server.js

- Terminal B: client
npm run dev(open http://localhost:5173)

---

## Socket Events
**Client → Server**
- join room: { room }
- leave room: { room }
- new message: { room, username, message }
- dm: { targetUsername, from, message }

**Server → Client**
- new message: { room, username, message }
- system: { room?, message }
- dm: { from, to, message, ts, self? }

---

## Quick Test
1. Open two browser windows (or an incognito tab).
2. Use different usernames, join the same room, exchange messages.
3. Try closing a tab: the remaining user should see a “left” system message.

---

## Config & Ports
**No env vars required.**
- Change server port in server.js (server.listen(3000)).
- Change Vite port via vite.config.js or npm run dev -- --port 5174.

---

## Troubleshooting
- CORS error: ensure new Server(server, { cors: { origin: "*" }}) or set allowed origins.
- Auto-scroll not working: verify chatRef + useLayoutEffect scroll to bottom after messages update.
- System messages missing: make sure server emits system on disconnecting with the room info, or rebind client listeners when currentRoom changes.

---

## License
MIT (feel free to change to your preferred license).


