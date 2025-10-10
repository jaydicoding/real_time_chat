import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import './App.css'
import { io } from 'socket.io-client';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState("");
  const [userInput, setUserInput] = useState("");
  const [currentRoom, setCurrentRoom] = useState("");   
  const [roomInput, setRoomInput] = useState("");  
  const [targetUsername, setTargetUsername] = useState("");
  const [dmInput, setDmInput] = useState("");
  const [socket, setSocket] = useState(null);

  const chatRef = useRef(null);

function connectToChatServer(){
  try {
    if(!username.trim()) {
      alert("Username is required before connecting.");
      return;
    }

    if (socket) {
      try { socket.disconnect(); } catch {}
      setSocket(null);
    }

    console.log('connectToChatServer');
    const _socket = io('http://localhost:3000', {
      autoConnect: false,
      query: {
        username: username,
      }
    });
    _socket.connect();
    setSocket(_socket);
  } catch (err) {
    console.error("Failed to connect:", err);
    alert("Failed to connect to chat server.");
  }
}

function disconnectToChatServer(){
  try{
    if(!socket) {
      console.warn("No active socket to disconnect.");
      return;
    }
    console.log('disconnectToChatServer');
    socket?.disconnect();
  } catch (err) {
  console.error("Failed to disconnect", err);
  }
}

function joinRoom() {
  if (!socket || !isConnected) { alert("Connect first."); return; }
  if (!roomInput.trim()) { alert("Room name required."); return; }
    socket.emit('join room', { room: roomInput.trim() }, (res) => {
    if (!res?.ok) { alert(res?.error || "Failed to join room"); return; }
    setCurrentRoom(roomInput.trim());
    setMessages([]); 
    console.log('joined room:', res.room);
  });
}

function leaveRoom() {
  if (!socket || !isConnected) { alert("Connect first."); return; }
  if (!currentRoom) { alert("No room to leave."); return; }
  socket.emit('leave room', { room: currentRoom }, (res) => {
    if (!res?.ok) { alert(res?.error || "Failed to leave room"); return; }
    console.log('left room:', res.room);
    setCurrentRoom("");
    setMessages([]);
  });
}
  
function onConnected() { setIsConnected(true); }
function onDisconnected() { setIsConnected(false); setCurrentRoom(""); setMessages([]); }

function onMessageReceived(msg) {
  try {
    if(!msg || !msg.username || !msg.message) return;
    if (msg.room && msg.room === currentRoom) {
      setMessages(prev => [...prev, { type:"room", ...msg }]);
    }
  } catch(err) {
  console.error("Error handling incoming message:", err);
  }
}

function onDmReceived(dm) {
    // dm = { from, to, message, ts, self? }
    if (!dm?.message || !dm?.from) return;
    setMessages(prev => [...prev, { type:'dm', ...dm }]);
  }

function sendDM() {
    try {
      if (!socket || !isConnected) { alert("Connect first."); return; }
      if (!targetUsername.trim()) { alert("Target username required."); return; }
      if (!dmInput.trim()) { alert("Cannot send empty DM."); return; }

      socket.emit('dm', { targetUsername: targetUsername.trim(), from: username, message: dmInput }, (res) => {
        if (!res?.ok) {
          alert(res?.error || "Failed to send DM");
        }
      });
      setDmInput("");
    } catch (err) {
      console.error("Failed to send DM:", err);
    }
  }

function onSystemMessage(msg) {
  if (msg?.message && currentRoom) {
    setMessages(prev => [
      ...prev, 
      { type: "system", username: 'SYSTEM', message: msg.message, room: currentRoom }
    ]);
  }
}

function sendMessageToChatServer() {
  try{
    if(!socket || !isConnected) {
      alert("You must connect before sending messages.");
      return;
    }
    if(!currentRoom) {
      alert("Join a room first");
      return;
    }
    if (!userInput.trim()) {
      alert("Cannot send empty message.");
      return;
    }
    console.log(`front -sendMessageToChatServer input: ${userInput}`);
    socket?.emit("new message", 
      { room: currentRoom, username, message: userInput }, 
      (response) => {
        console.log('ack:', response);
  });
  setUserInput("");
  } catch (err) {
  console.error("Failed to send message:", err);
  }
}
  
useEffect(() => {
  if (!socket) return;
  socket?.on('connect', onConnected);
  socket?.on('disconnect', onDisconnected);
  socket?.on('new message', onMessageReceived);
  socket.on('system', onSystemMessage);
  socket.on('dm', onDmReceived);

  return () => {
    socket?.off('connect', onConnected);
    socket?.off('disconnect', onDisconnected);
    socket?.off('new message', onMessageReceived);
    socket?.off('system', onSystemMessage);
    socket.off('dm', onDmReceived);
  };
}, [socket, currentRoom]);

 useLayoutEffect(() => {                                     
    try {
      if (chatRef.current) {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }
    } catch(err) {
      console.error("Scroll failed:", err)
    }
  }, [messages]);

const messageList = messages.map((m, i) => {
  if (m.type === 'dm') {
    const cls = `msg dm ${m.self ? 'self' : ''}`;
    const prefix = m.self ? `To ${m.to}` : `From ${m.from}`;
    return <li key={i} className={cls}><strong>[DM {prefix}]</strong> {m.message}</li>;
  } else if (m.type === 'system') {
    return <li key={i} className="msg system">[SYSTEM] {m.message}</li>;
  } else {
    const cls = `msg ${m.username === username ? 'self' : ''}`; 
    return <li key={i} className={cls}><strong>{m.username}</strong>: {m.message}</li>;
  }
});

  return (
    <>
    <div className="Layout">
      <div className='Navbar'>
        <h1>User: {username}</h1>
        <h2>Status: {isConnected? "Connected" : "Disconnected"} | Room: {currentRoom || "-"}</h2>
        <div className='Card'>
          <input value={username} onChange={e => setUsername(e.target.value)} />
          <button onClick={() => connectToChatServer()}>
            Connection
          </button>
          <button onClick={() => disconnectToChatServer()}>
            Disconnection
          </button>
        </div>
        <div className='Card' style={{ marginTop: 8 }}>
          <input placeholder="room name" value={roomInput} onChange={e => setRoomInput(e.target.value)} />
          <button onClick={joinRoom}>Join Room</button>
          <button onClick={leaveRoom}>Leave Room</button>
        </div>
        <div className='Card' style={{ marginTop: 8 }}>
          <input placeholder="DM to (username)" value={targetUsername} onChange={e => setTargetUsername(e.target.value)} />
          <input placeholder="DM message" value={dmInput} onChange={e => setDmInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendDM()} />
          <button type="button" onClick={sendDM}>Send DM</button>
        </div>
      </div>

      <div className="ChatPane">
          <ul className="ChatList" ref={chatRef}>
            {messageList}
          </ul>

      <div className="MessageInput">
        <input
          placeholder={currentRoom ? `Message to #${currentRoom}` : "Join a room first"}
          value={userInput}
          onChange={e => setUserInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessageToChatServer()}
          disabled={!currentRoom}
        />
        <button type="button" onClick={sendMessageToChatServer} disabled={!currentRoom}>
          Send
        </button>
      </div>
    </div>
  </div>
</>
)
}

export default App
