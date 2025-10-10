import { Server } from "socket.io";
import express from "express";
import * as http from 'http';


const app = express();
const server = http.createServer(app);
const userSockets = new Map();
const io = new Server(server, {
    cors: {
        origin:"*"
    }
});

io.on('connection', (socket) => {
  const { username } = socket.handshake.query || {};
  if (username) {
    if(!userSockets.has(username)) userSockets.set(username, new Set());
    userSockets.get(username).add(socket.id);
  }

  // 1:1 DM
  socket.on('dm', ({ targetUsername, from, message }, ack) => {
    if (!targetUsername || !message) {
      return ack?.({ ok:false, error:'targetUsername and message are required' });
    }
    const targets = userSockets.get(targetUsername);
    if (!targets || targets.size === 0) {
      return ack?.({ ok:false, error:`${targetUsername} is not online` });
    }
    
    for (const sid of targets) {
      io.to(sid).emit('dm', { from, to: targetUsername, message, ts: Date.now() });
    }
    
    io.to(socket.id).emit('dm', { from, to: targetUsername, message, ts: Date.now(), self: true });
    ack?.({ ok:true });
  });
  
  // Join room
  socket.on('join room', ({ room }, ack) => {
    if (!room) return ack?.({ ok:false, error:'Room is required' });
    socket.join(room);
    ack?.({ ok:true, room });
    
    socket.to(room).emit('system', { message: `${username} joined ${room}` });
  });

 // leave room
  socket.on('leave room', ({ room }, ack) => {
    if (!room) return ack?.({ ok:false, error:'Room is required' });
    socket.leave(room);
    ack?.({ ok:true, room });
    socket.to(room).emit('system', { message: `${username} left ${room}` });
  });

  
  socket.on('new message', ({ room, username, message }, ack) => {
    if (!room || !message) return ack?.({ ok:false, error:'room and message are required' });
    io.to(room).emit('new message', { room, username, message });
    ack?.({ ok:true });
  });

  socket.on("disconnecting", () => {
    if (!username) return;

    const otherSids = new Set(userSockets.get(username) || []);
    otherSids.delete(socket.id);

    for (const room of socket.rooms) {
      if (room === socket.id) continue; 

      const roomSet = io.sockets.adapter.rooms.get(room);
      const stillThere =
        roomSet && [...otherSids].some((sid) => roomSet.has(sid)); 

      if (!stillThere) {
        io.to(room).emit("system", { message: `${username} left ${room}` }); 
      }
    }
  });

  socket.on('disconnect', () => {
    if (username && userSockets.has(username)) {
      const set = userSockets.get(username);
      set.delete(socket.id);
      if (set.size === 0) userSockets.delete(username);
    }
  });
});

server.listen(3000, () => console.log('Socket server on :3000'));