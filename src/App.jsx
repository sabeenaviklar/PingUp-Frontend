import { useState, useEffect, useRef, useCallback } from 'react';
import { getSocket, disconnectSocket } from './socket';
import Login    from './components/Login';
import Sidebar  from './components/Sidebar';
import MessageList  from './components/MessageList';
import MessageInput from './components/MessageInput';
import UserPanel    from './components/UserPanel';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  });
  const [token, setToken]           = useState(() => localStorage.getItem('token') || '');
  const [rooms, setRooms]           = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages]     = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [commandResponses, setCommandResponses] = useState([]);
  const [typingUsers, setTypingUsers]   = useState([]);
  const [onlineUsers, setOnlineUsers]   = useState([]);
  const socketRef = useRef(null);

  // ── Load rooms ──
  useEffect(() => {
    fetch('http://localhost:3001/api/rooms')
      .then(r => r.json()).then(setRooms).catch(() => {});
  }, []);

  // ── Init socket ──
  useEffect(() => {
    if (!token || !currentUser) return;
    const socket = getSocket(token);
    socketRef.current = socket;
    socket.connect();

    socket.on('users:update',  setOnlineUsers);
    socket.on('rooms:update',  setRooms);
    socket.on('role:updated',  ({ role }) => {
      setCurrentUser(u => {
        const updated = { ...u, role };
        localStorage.setItem('user', JSON.stringify(updated));
        return updated;
      });
    });

    socket.on('room:history', ({ messages: hist }) => {
      setMessages(hist);
      setNotifications([]);
      setCommandResponses([]);
    });

    socket.on('message:new', msg => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('message:deleted', ({ id }) => {
      setMessages(prev => prev.map(m =>
        m.id === id ? { ...m, deleted: true, text: '[message deleted]' } : m
      ));
    });

    socket.on('room:cleared', () => setMessages([]));

    socket.on('room:notification', ({ text }) => {
      setNotifications(prev => [...prev, text]);
    });

    socket.on('command:response', res => {
      setCommandResponses(prev => [...prev, res]);
    });

    socket.on('typing:update', ({ username, typing }) => {
      setTypingUsers(prev =>
        typing ? [...new Set([...prev, username])] : prev.filter(u => u !== username)
      );
    });

    socket.on('kicked', ({ by }) => {
      alert(`You were kicked by ${by}.`);
      handleLogout();
    });

    socket.on('error:permission', msg => alert(`⛔ ${msg}`));
    socket.on('error:general',    msg => console.error(msg));

    return () => {
      socket.off('users:update'); socket.off('rooms:update');
      socket.off('room:history'); socket.off('message:new');
      socket.off('message:deleted'); socket.off('room:cleared');
      socket.off('room:notification'); socket.off('command:response');
      socket.off('typing:update'); socket.off('kicked');
      socket.off('error:permission'); socket.off('error:general');
      socket.off('role:updated');
    };
  }, [token, currentUser?.id]);

  const handleRoomSelect = useCallback((room) => {
    setActiveRoom(room);
    setTypingUsers([]);
    socketRef.current?.emit('room:join', { roomName: room.name });
  }, []);

  const handleSend = useCallback((text) => {
    if (!activeRoom) return;
    socketRef.current?.emit('message:send', { roomName: activeRoom.name, text });
  }, [activeRoom]);

  const handleTypingStart = useCallback(() => {
    if (!activeRoom) return;
    socketRef.current?.emit('typing:start', { roomName: activeRoom.name });
  }, [activeRoom]);

  const handleTypingStop = useCallback(() => {
    if (!activeRoom) return;
    socketRef.current?.emit('typing:stop', { roomName: activeRoom.name });
  }, [activeRoom]);

  const handleLogin = (user, tok) => {
    setCurrentUser(user); setToken(tok);
  };

  const handleLogout = () => {
    disconnectSocket();
    localStorage.removeItem('token'); localStorage.removeItem('user');
    setCurrentUser(null); setToken(''); setActiveRoom(null); setMessages([]);
  };

  if (!currentUser) return <Login onLogin={handleLogin} />;

  return (
    <div className="app-layout">
      <Sidebar
        rooms={rooms}
        activeRoom={activeRoom}
        onRoomSelect={handleRoomSelect}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <div className="chat-area">
        {activeRoom ? (
          <>
            <div className="chat-header">
              <span className="chat-header-hash">#</span>
              {activeRoom.name}
              <span style={{ color: 'var(--text-muted)', fontSize: '.8rem', fontWeight: 400 }}>
                &nbsp;— {activeRoom.description}
              </span>
            </div>
            <MessageList
              messages={messages}
              notifications={notifications}
              commandResponses={commandResponses}
              typingUsers={typingUsers}
            />
            <MessageInput
              onSend={handleSend}
              onTypingStart={handleTypingStart}
              onTypingStop={handleTypingStop}
              roomName={activeRoom.name}
            />
          </>
        ) : (
          <div className="no-room-placeholder">
            <h2>Welcome, {currentUser.username}</h2>
            <p>Select a channel from the sidebar to start messaging.</p>
            <p style={{ fontSize: '.78rem' }}>Tip: type <code>/help</code> after joining a room</p>
          </div>
        )}
      </div>

      <UserPanel users={onlineUsers} />
    </div>
  );
}
