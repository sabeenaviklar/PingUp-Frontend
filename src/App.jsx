import { useState, useEffect, useRef, useCallback } from 'react';
import { getSocket, disconnectSocket } from './socket';
import Login         from './components/Login';
import DMSidebar     from './components/DMSidebar';
import FriendsPanel  from './components/FriendsPanel';
import ProfileModal  from './components/ProfileModal';
import MessageList   from './components/MessageList';
import MessageInput  from './components/MessageInput';
import UserPanel     from './components/UserPanel';
import DMChat  from './components/DMChat';
import DMList  from './components/DMList';


export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');

  const [rooms, setRooms]                     = useState([]);
  const [activeRoom, setActiveRoom]           = useState(null);
  const [messages, setMessages]               = useState([]);
  const [notifications, setNotifications]     = useState([]);
  const [commandResponses, setCommandResponses] = useState([]);
  const [typingUsers, setTypingUsers]         = useState([]);
  const [onlineUsers, setOnlineUsers]         = useState([]);

  const [showProfile, setShowProfile]         = useState(false);  // ← My Account modal
  const [showFriends, setShowFriends]         = useState(false);  // ← Friends panel

  const [activeDM, setActiveDM]           = useState(null); // { id, username, role, online }
const [dmNotifications, setDmNotifications] = useState([]);
const [dmToast, setDmToast]             = useState(null);


  const socketRef = useRef(null);

  // ── Load rooms ──
  useEffect(() => {
    fetch('http://localhost:3001/api/rooms')
      .then(r => r.json()).then(setRooms).catch(() => {});
  }, []);

  // ── Socket ──
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

    // DM notification when a message arrives and you're not in the conversation
socket.on('dm:notification', (notif) => {
  setDmNotifications(prev => [...prev, notif]);
  setDmToast(notif);
  setTimeout(() => setDmToast(null), 4000); // auto-dismiss after 4s
});


    socket.on('message:new',     msg => setMessages(prev => [...prev, msg]));
    socket.on('message:deleted', ({ id }) => {
      setMessages(prev =>
        prev.map(m => m.id === id ? { ...m, deleted: true, text: '[message deleted]' } : m)
      );
    });
    socket.on('room:cleared',        () => setMessages([]));
    socket.on('room:notification',   ({ text }) => setNotifications(prev => [...prev, text]));
    socket.on('command:response',    res  => setCommandResponses(prev => [...prev, res]));
    socket.on('typing:update',       ({ username, typing }) => {
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

    return () => { socket.removeAllListeners(); };
  }, [token, currentUser?.id]);

  const handleRoomSelect = useCallback((room) => {
    setActiveRoom(room);
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

  const handleLogin = (user, tok) => {
    setCurrentUser(user);
    setToken(tok);
  };

  const handleLogout = () => {
    disconnectSocket();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setToken('');
    setActiveRoom(null);
    setMessages([]);
    setShowProfile(false);
  };

  // ── Not logged in ──
  if (!currentUser) return <Login onLogin={handleLogin} />;

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
        onShowFriends={() => { setShowFriends(true); setActiveRoom(null); setActiveDM(null); }}
      />
  
      {/* DM List (between sidebar and chat) */}
      {!activeRoom && !showFriends && (
        <DMList
          currentUser={currentUser}
          token={token}
          onlineUsers={onlineUsers}
          onOpenDM={(user) => {
            setActiveDM(user);
            setActiveRoom(null);
            setShowFriends(false);
            socketRef.current?.emit('dm:join', { otherUserId: user.id });
            // Clear notifications from this user
            setDmNotifications(prev => prev.filter(n => n.fromId !== user.id));
          }}
          activeDMId={activeDM?.id}
          dmNotifications={dmNotifications}
        />
      )}
  
      {/* Main area */}
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
            <p>Select a channel or click a user to DM them.</p>
          </div>
        )}
      </div>
  
      <UserPanel
        users={onlineUsers}
        onUserClick={(user) => {
          if (user.id === currentUser.id) return;
          setActiveDM(user);
          setActiveRoom(null);
          setShowFriends(false);
          socketRef.current?.emit('dm:join', { otherUserId: user.id });
          setDmNotifications(prev => prev.filter(n => n.fromId !== user.id));
        }}
      />
  
      {showProfile && (
        <ProfileModal user={currentUser} onClose={() => setShowProfile(false)} onLogout={handleLogout} />
      )}
  
      {/* Toast notification */}
      {dmToast && (
        <div className="dm-toast" onClick={() => {
          setActiveDM({ id: dmToast.fromId, username: dmToast.from, role: 'member', online: true });
          setActiveRoom(null);
          setDmToast(null);
          setDmNotifications(prev => prev.filter(n => n.fromId !== dmToast.fromId));
        }}>
          <div className="dm-toast-avatar">{dmToast.from[0].toUpperCase()}</div>
          <div className="dm-toast-body">
            <div className="dm-toast-from">{dmToast.from}</div>
            <div className="dm-toast-preview">{dmToast.preview}</div>
          </div>
          <button className="dm-toast-close" onClick={e => { e.stopPropagation(); setDmToast(null); }}>✕</button>
        </div>
      )}
    </div>
  );
}

