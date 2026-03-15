import { useState, useEffect, useRef, useCallback } from 'react';
import { getSocket, disconnectSocket } from './socket';
import Login        from './components/Login';
import Register     from './components/Register';
import DMSidebar    from './components/DMSidebar';
import FriendsPanel from './components/FriendsPanel';
import ProfileModal from './components/ProfileModal';
import MessageList  from './components/MessageList';
import MessageInput from './components/MessageInput';
import UserPanel    from './components/UserPanel';
import DMChat       from './components/DMChat';
import DMList       from './components/DMList';
import AdminPanel   from './components/AdminPanel';
import VoiceChannel from './components/VoiceChannel';

// Channel names that render as the music/voice player instead of a text chat
const VOICE_CHANNELS = ['music-lounge'];

export default function App() {
  const [authPage,     setAuthPage]     = useState('login');
  const [currentUser,  setCurrentUser]  = useState(() => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');

  // ── Server state ───────────────────────────────────────────────
  const [categories,    setCategories]    = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [roomSettings,  setRoomSettings]  = useState(null);
  const [messages,      setMessages]      = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [commandResps,  setCommandResps]  = useState([]);
  const [typingUsers,   setTypingUsers]   = useState([]);
  const [onlineUsers,   setOnlineUsers]   = useState([]);

  // ── UI state ───────────────────────────────────────────────────
  const [showProfile,   setShowProfile]   = useState(false);
  const [showFriends,   setShowFriends]   = useState(false);
  const [showAdmin,     setShowAdmin]     = useState(false);
  const [activeDM,      setActiveDM]      = useState(null);
  const [dmNotifs,      setDmNotifs]      = useState([]);
  const [dmToast,       setDmToast]       = useState(null);

  const socketRef = useRef(null);

  const isVoiceChannel = activeChannel && VOICE_CHANNELS.includes(activeChannel.name);
  const isOwner        = currentUser?.role === 'owner';
  const isMod          = ['owner', 'moderator'].includes(currentUser?.role);

  // ── Socket setup ───────────────────────────────────────────────
  useEffect(() => {
    if (!token || !currentUser) return;
    const socket = getSocket(token);
    socketRef.current = socket;
    socket.connect();

    socket.on('users:update', setOnlineUsers);
    socket.on('structure:update', setCategories);

    socket.on('role:updated', ({ role }) => {
      setCurrentUser(u => {
        const updated = { ...u, role };
        localStorage.setItem('user', JSON.stringify(updated));
        return updated;
      });
    });

    // Channel/room history
    socket.on('room:history', ({ messages: hist, roomSettings: rs }) => {
      setMessages(hist || []);
      setRoomSettings(rs || null);
      setNotifications([]);
      setCommandResps([]);
    });
    socket.on('channel:history', ({ messages: hist, roomSettings: rs }) => {
      setMessages(hist || []);
      setRoomSettings(rs || null);
      setNotifications([]);
      setCommandResps([]);
    });

    // Room settings live updates
    socket.on('room:settings', (rs) => {
      setRoomSettings(rs);
      setCategories(prev => prev.map(cat => ({
        ...cat,
        channels: cat.channels.map(ch => ch.id === rs.id ? { ...ch, ...rs } : ch),
      })));
    });

    socket.on('room:cleared', () => setMessages([]));

    socket.on('room:notification', ({ text }) =>
      setNotifications(prev => [...prev, text])
    );
    socket.on('command:response', res =>
      setCommandResps(prev => [...prev, res])
    );

    socket.on('message:new', msg =>
      setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg])
    );
    socket.on('message:deleted', ({ id }) =>
      setMessages(prev =>
        prev.map(m => m.id === id ? { ...m, deleted: true, text: '[message deleted]' } : m)
      )
    );
    socket.on('message:pinned', ({ id, pinnedBy }) => {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, pinned: true } : m));
      setNotifications(prev => [...prev, `📌 Message pinned by ${pinnedBy}`]);
    });
    socket.on('message:unpinned', ({ id }) => {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, pinned: false } : m));
    });

    socket.on('typing:update', ({ username, typing }) =>
      setTypingUsers(prev =>
        typing
          ? [...new Set([...prev, username])]
          : prev.filter(u => u !== username)
      )
    );

    socket.on('dm:notification', notif => {
      setDmNotifs(prev => [...prev, notif]);
      setDmToast(notif);
      setTimeout(() => setDmToast(null), 4000);
    });

    socket.on('kicked', ({ by }) => {
      alert(`You were kicked by ${by}.`);
      handleLogout();
    });
    socket.on('error:permission', msg =>
      setCommandResps(prev => [...prev, { type: 'error', text: `⛔ ${msg}` }])
    );
    socket.on('error:general', msg => console.error('[socket]', msg));

    return () => socket.removeAllListeners();
  }, [token, currentUser?.id]);

  // ── Auth ───────────────────────────────────────────────────────
  const handleLogin = (user, tok) => {
    setCurrentUser(user);
    setToken(tok);
    localStorage.setItem('token', tok);
    localStorage.setItem('user',  JSON.stringify(user));
  };

  const handleLogout = useCallback(() => {
    disconnectSocket();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setToken('');
    setActiveChannel(null);
    setActiveDM(null);
    setMessages([]);
    setOnlineUsers([]);
    setShowProfile(false);
    setShowFriends(false);
    setShowAdmin(false);
    setAuthPage('login');
  }, []);

  // ── Channel select ─────────────────────────────────────────────
  const handleChannelSelect = useCallback((ch) => {
    setActiveChannel(ch);
    setRoomSettings(ch);   // optimistic, server will overwrite on join
    setActiveDM(null);
    setShowFriends(false);
    setShowAdmin(false);
    setTypingUsers([]);
    setMessages([]);
    // Voice channels don't need a text channel:join
    if (!VOICE_CHANNELS.includes(ch.name)) {
      socketRef.current?.emit('channel:join', { channelId: ch.id });
    }
  }, []);

  // ── Messaging ──────────────────────────────────────────────────
  const handleSend = useCallback((text) => {
    if (!activeChannel) return;
    socketRef.current?.emit('message:send', {
      channelId: activeChannel.id,
      roomName:  activeChannel.name,
      text,
    });
  }, [activeChannel]);

  const handleTypingStart = useCallback(() => {
    if (!activeChannel) return;
    socketRef.current?.emit('typing:start', { channelId: activeChannel.id });
  }, [activeChannel]);

  const handleTypingStop = useCallback(() => {
    if (!activeChannel) return;
    socketRef.current?.emit('typing:stop', { channelId: activeChannel.id });
  }, [activeChannel]);

  // ── DM ─────────────────────────────────────────────────────────
  function openDM(user) {
    setActiveDM(user);
    setActiveChannel(null);
    setShowFriends(false);
    setShowAdmin(false);
    socketRef.current?.emit('dm:join', { otherUserId: user.id });
    setDmNotifs(prev => prev.filter(n => n.fromId !== user.id));
  }

  // ── Not logged in ──────────────────────────────────────────────
  if (!currentUser) {
    if (authPage === 'register')
      return <Register onLogin={handleLogin} onSwitch={() => setAuthPage('login')} />;
    return <Login onLogin={handleLogin} onSwitch={() => setAuthPage('register')} />;
  }

  // ── Render helpers ─────────────────────────────────────────────
  function renderChatArea() {

    // ── Admin panel ────────────────────────────────────────────
    if (showAdmin && isOwner) {
      return (
        <div className="chat-admin-embed">
          <AdminPanel
            currentUser={currentUser}
            socket={socketRef.current}
            categories={categories}
            onlineUsers={onlineUsers}
            token={token}
            onClose={() => setShowAdmin(false)}
            embedded
          />
        </div>
      );
    }

    // ── DM chat ────────────────────────────────────────────────
    if (activeDM) {
      return (
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
      );
    }

    // ── Friends panel ──────────────────────────────────────────
    if (showFriends) {
      return <FriendsPanel onlineUsers={onlineUsers} />;
    }

    // ── Voice / music channel ──────────────────────────────────
    if (activeChannel && isVoiceChannel) {
      return (
        <VoiceChannel
          channel={activeChannel}
          currentUser={currentUser}
          socket={socketRef.current}
          onlineUsers={onlineUsers}
          onLeave={() => setActiveChannel(null)}
        />
      );
    }

    // ── Text channel ───────────────────────────────────────────
    if (activeChannel) {
      return (
        <>
          {/* Channel header */}
          <div className="chat-header">
            <span className="chat-header-hash">{activeChannel.emoji || '#'}</span>
            <span className="chat-header-name">{activeChannel.name}</span>
            {activeChannel.description && (
              <span className="chat-header-desc">— {activeChannel.description}</span>
            )}

            {/* Status badges */}
            <div className="chat-header-badges">
              {roomSettings?.isReadOnly && (
                <span className="hdr-badge hdr-readonly">🔇 Read-only</span>
              )}
              {roomSettings?.isLocked && (
                <span className="hdr-badge hdr-locked">🔒 Locked</span>
              )}
              {roomSettings?.isPrivate && (
                <span className="hdr-badge hdr-private">👁️ Private</span>
              )}
            </div>

            {/* Owner quick-controls */}
            {isOwner && (
              <div className="chat-header-admin-btns">
                <button
                  className={`hdr-admin-btn ${roomSettings?.isReadOnly ? 'hdr-btn-active' : ''}`}
                  title="Toggle read-only"
                  onClick={() => socketRef.current?.emit('channel:toggleReadOnly', { channelId: activeChannel.id })}
                >🔇</button>
                <button
                  className={`hdr-admin-btn ${roomSettings?.isLocked ? 'hdr-btn-active' : ''}`}
                  title="Toggle lock"
                  onClick={() => socketRef.current?.emit('channel:toggleLock', { channelId: activeChannel.id })}
                >🔒</button>
                <button
                  className={`hdr-admin-btn ${roomSettings?.isPrivate ? 'hdr-btn-active' : ''}`}
                  title="Toggle private"
                  onClick={() => socketRef.current?.emit('channel:togglePrivate', { channelId: activeChannel.id })}
                >👁️</button>
                <button
                  className="hdr-admin-btn hdr-btn-danger"
                  title="Delete channel"
                  onClick={() => {
                    if (!confirm(`Delete #${activeChannel.name}?`)) return;
                    socketRef.current?.emit('channel:delete', { channelId: activeChannel.id });
                    setActiveChannel(null);
                  }}
                >🗑️</button>
              </div>
            )}
          </div>

          <MessageList
            messages={messages}
            notifications={notifications}
            commandResponses={commandResps}
            typingUsers={typingUsers}
            currentUser={currentUser}
            socket={socketRef.current}
            channelId={activeChannel.id}
            roomName={activeChannel.name}
            roomSettings={roomSettings}
          />
          <MessageInput
            onSend={handleSend}
            onTypingStart={handleTypingStart}
            onTypingStop={handleTypingStop}
            roomName={activeChannel.name}
            roomSettings={roomSettings}
            currentUser={currentUser}
          />
        </>
      );
    }

    // ── Welcome placeholder ────────────────────────────────────
    return (
      <div className="no-room-placeholder">
        <div className="placeholder-icon">💬</div>
        <h2>Welcome, {currentUser.username} 👋</h2>
        <span className={`role-badge-lg role-${currentUser.role}`}>
          {currentUser.role}
        </span>
        <p>Select a channel from the sidebar to start chatting.</p>
        {isOwner && (
          <button
            className="placeholder-admin-btn"
            onClick={() => setShowAdmin(true)}
          >
            👑 Open Admin Panel
          </button>
        )}
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────
  return (
    <div className="app-layout">

      <DMSidebar
        currentUser={currentUser}
        onlineUsers={onlineUsers}
        activeChannel={activeChannel}
        categories={categories}
        socket={socketRef.current}
        onChannelSelect={handleChannelSelect}
        onLogout={handleLogout}
        onOpenProfile={() => setShowProfile(true)}
        onShowFriends={() => {
          setShowFriends(true);
          setActiveChannel(null);
          setActiveDM(null);
          setShowAdmin(false);
        }}
        onOpenAdmin={isOwner ? () => {
          setShowAdmin(true);
          setActiveChannel(null);
          setActiveDM(null);
          setShowFriends(false);
        } : null}
      />

      {/* DM list — visible when no channel/admin/friends active */}
      {!activeChannel && !showFriends && !showAdmin && (
        <DMList
          currentUser={currentUser}
          token={token}
          onlineUsers={onlineUsers}
          onOpenDM={openDM}
          activeDMId={activeDM?.id}
          dmNotifications={dmNotifs}
        />
      )}

      {/* Main content area */}
      <div className={`chat-area ${isVoiceChannel ? 'chat-area-voice' : ''}`}>
        {renderChatArea()}
      </div>

      {/* Right user panel — hidden during voice (it has its own member list) */}
      {!isVoiceChannel && (
        <UserPanel
          currentUser={currentUser}
          onlineUsers={onlineUsers}
          token={token}
          socket={socketRef.current}
          onUserClick={(user) => {
            if (user.id === currentUser.id) return;
            openDM(user);
          }}
        />
      )}

      {/* Profile modal */}
      {showProfile && (
        <ProfileModal
          user={currentUser}
          onClose={() => setShowProfile(false)}
          onLogout={handleLogout}
        />
      )}

      {/* DM toast notification */}
      {dmToast && (
        <div
          className="dm-toast"
          onClick={() => {
            openDM({
              id:       dmToast.fromId,
              username: dmToast.from,
              role:     'member',
              online:   true,
            });
            setDmToast(null);
          }}
        >
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
