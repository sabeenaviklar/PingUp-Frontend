import { useState, useEffect, useRef, useCallback } from 'react';
import { getSocket, disconnectSocket } from './socket';

import Login         from './components/Login';
import Register      from './components/Register';
import DMSidebar     from './components/DMSidebar';
import FriendsPanel  from './components/FriendsPanel';
import ProfileModal  from './components/ProfileModal';
import MessageList   from './components/MessageList';
import MessageInput  from './components/MessageInput';
import UserPanel     from './components/UserPanel';
import DMChat        from './components/DMChat';
import DMList        from './components/DMList';

export default function App() {
  // ── Auth ──────────────────────────────────────────────────────────
  const [authPage, setAuthPage] = useState('login'); // 'login' | 'register'

  const [currentUser, setCurrentUser] = useState(() => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');

  // ── App State ─────────────────────────────────────────────────────
  const [rooms,            setRooms]            = useState([]);
  const [activeRoom,       setActiveRoom]       = useState(null);
  const [messages,         setMessages]         = useState([]);
  const [notifications,    setNotifications]    = useState([]);
  const [commandResponses, setCommandResponses] = useState([]);
  const [typingUsers,      setTypingUsers]      = useState([]);
  const [onlineUsers,      setOnlineUsers]      = useState([]);

  const [showProfile, setShowProfile] = useState(false);
  const [showFriends, setShowFriends] = useState(false);

  const [activeDM,         setActiveDM]         = useState(null);
  const [dmNotifications,  setDmNotifications]  = useState([]);
  const [dmToast,          setDmToast]          = useState(null);

  const socketRef = useRef(null);

  // ── Load rooms ────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    fetch('http://localhost:3001/api/rooms', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json()).then(setRooms).catch(() => {});
  }, [token]);

  // ── Socket ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token || !currentUser) return;

    const socket = getSocket(token);
    socketRef.current = socket;
    socket.connect();

    socket.on('users:update', setOnlineUsers);
    socket.on('rooms:update', setRooms);

    socket.on('role:updated', ({ role }) => {
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

    socket.on('dm:notification', (notif) => {
      setDmNotifications(prev => [...prev, notif]);
      setDmToast(notif);
      setTimeout(() => setDmToast(null), 4000);
    });

    socket.on('message:new', msg =>
      setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg])
    );
    socket.on('message:deleted', ({ id }) =>
      setMessages(prev =>
        prev.map(m => m.id === id ? { ...m, deleted: true, text: '[message deleted]' } : m)
      )
    );
    socket.on('room:cleared',      ()           => setMessages([]));
    socket.on('room:notification', ({ text })   => setNotifications(prev => [...prev, text]));
    socket.on('command:response',  res          => setCommandResponses(prev => [...prev, res]));
    socket.on('typing:update',     ({ username, typing }) =>
      setTypingUsers(prev =>
        typing ? [...new Set([...prev, username])] : prev.filter(u => u !== username)
      )
    );
    socket.on('kicked', ({ by }) => {
      alert(`You were kicked by ${by}.`);
      handleLogout();
    });
    socket.on('error:permission', msg => alert(`⛔ ${msg}`));
    socket.on('error:general',    msg => console.error(msg));

    return () => { socket.removeAllListeners(); };
  }, [token, currentUser?.id]);

  // ── Handlers ──────────────────────────────────────────────────────
  const handleLogin = (user, tok) => {
    setCurrentUser(user);
    setToken(tok);
    localStorage.setItem('token', tok);
    localStorage.setItem('user',  JSON.stringify(user));
    setAuthPage('login'); // reset for next logout
  };

  const handleLogout = () => {
    disconnectSocket();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setToken('');
    setActiveRoom(null);
    setActiveDM(null);
    setMessages([]);
    setOnlineUsers([]);
    setShowProfile(false);
    setShowFriends(false);
    setAuthPage('login');
  };

  const handleRoomSelect = useCallback((room) => {
    setActiveRoom(room);
    setActiveDM(null);
    setShowFriends(false);
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

  function openDM(user) {
    setActiveDM(user);
    setActiveRoom(null);
    setShowFriends(false);
    socketRef.current?.emit('dm:join', { otherUserId: user.id });
    setDmNotifications(prev => prev.filter(n => n.fromId !== user.id));
  }

  // ── Not logged in → show auth pages ───────────────────────────────
  if (!currentUser) {
    if (authPage === 'register') {
      return (
        <Register
          onLogin={handleLogin}
          onSwitch={() => setAuthPage('login')}
        />
      );
    }
    return (
      <Login
        onLogin={handleLogin}
        onSwitch={() => setAuthPage('register')}
      />
    );
  }

  // ── Main App ──────────────────────────────────────────────────────
  return (
    <div className="app-layout">

      <DMSidebar
        currentUser={currentUser}
        onlineUsers={onlineUsers}
        activeRoom={activeRoom}
        rooms={rooms}
        onRoomSelect={handleRoomSelect}
        onLogout={handleLogout}
        onOpenProfile={() => setShowProfile(true)}
        onShowFriends={() => {
          setShowFriends(true);
          setActiveRoom(null);
          setActiveDM(null);
        }}
      />

      {/* DM List — visible when not in a room or friends panel */}
      {!activeRoom && !showFriends && (
        <DMList
          currentUser={currentUser}
          token={token}
          onlineUsers={onlineUsers}
          onOpenDM={openDM}
          activeDMId={activeDM?.id}
          dmNotifications={dmNotifications}
        />
      )}

      {/* Main content */}
      <div className="chat-area">
        {activeDM ? (
          <DMChat
            currentUser={currentUser}
            otherUser={{
              ...activeDM,
              online: !!onlineUsers.find(u => u.id === activeDM.id),
            }}
            token={token}
            socket={socketRef.current}
            onClose={() => setActiveDM(null)}
          />

        ) : showFriends ? (
          <FriendsPanel onlineUsers={onlineUsers} />

        ) : activeRoom ? (
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
            <h2>Welcome, {currentUser.username} 👋</h2>
            <p>Select a channel from the sidebar or click a user to DM.</p>
          </div>
        )}
      </div>

      {/* Right panel */}
      <UserPanel
        users={onlineUsers}
        onUserClick={(user) => {
          if (user.id === currentUser.id) return;
          openDM(user);
        }}
      />

      {/* Profile modal */}
      {showProfile && (
        <ProfileModal
          user={currentUser}
          onClose={() => setShowProfile(false)}
          onLogout={handleLogout}
        />
      )}

      {/* DM Toast notification */}
      {dmToast && (
        <div className="dm-toast" onClick={() => {
          openDM({ id: dmToast.fromId, username: dmToast.from, role: 'member', online: true });
          setDmToast(null);
        }}>
          <div className="dm-toast-avatar">
            {dmToast.from?.[0]?.toUpperCase()}
          </div>
          <div className="dm-toast-body">
            <div className="dm-toast-from">{dmToast.from}</div>
            <div className="dm-toast-preview">{dmToast.preview}</div>
          </div>
          <button
            className="dm-toast-close"
            onClick={e => { e.stopPropagation(); setDmToast(null); }}
          >✕</button>
        </div>
      )}

    </div>
  );
}
