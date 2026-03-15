import { useState, useEffect, useRef } from 'react';

export default function MessageList({
  messages,
  notifications,
  commandResponses,
  typingUsers,
  currentUser,
  socket,
  channelId,
  roomName,
  roomSettings,
}) {
  const [hoveredMsg, setHoveredMsg] = useState(null);
  const bottomRef = useRef(null);
  const isMod = ['owner', 'moderator'].includes(currentUser?.role);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleDelete(msgId) {
    if (!confirm('Delete this message?')) return;
    socket?.emit('message:delete', { channelId, roomName, messageId: msgId });
  }

  function handlePin(msgId) {
    socket?.emit('message:pin', { channelId, roomName, messageId: msgId });
  }

  const pinnedMessages = messages.filter(m => m.pinned && !m.deleted);

  return (
    <div className="msg-list">

      {/* ── Pinned messages banner ── */}
      {pinnedMessages.length > 0 && (
        <div className="msg-pinned-banner">
          <span className="msg-pinned-label">📌 {pinnedMessages.length} pinned</span>
          <div className="msg-pinned-list">
            {pinnedMessages.map(m => (
              <div key={m.id} className="msg-pinned-item">
                <span className="msg-pinned-author">{m.username}:</span>
                <span className="msg-pinned-text">{m.text}</span>
                {isMod && (
                  <button
                    className="msg-pinned-unpin"
                    onClick={() => handlePin(m.id)}
                    title="Unpin"
                  >✕</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Room status badges ── */}
      {(roomSettings?.isReadOnly || roomSettings?.isLocked || roomSettings?.isPrivate) && (
        <div className="msg-room-status-row">
          {roomSettings.isReadOnly && <span className="msg-room-badge badge-readonly">🔇 Read-only</span>}
          {roomSettings.isLocked   && <span className="msg-room-badge badge-locked">🔒 Locked</span>}
          {roomSettings.isPrivate  && <span className="msg-room-badge badge-private">👁️ Private</span>}
        </div>
      )}

      {/* ── Notifications ── */}
      {notifications.map((n, i) => (
        <div key={i} className="msg-notification">{n}</div>
      ))}

      {/* ── Messages ── */}
      <div className="msg-messages-wrap">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`msg-row ${msg.deleted ? 'msg-deleted' : ''} ${msg.pinned && !msg.deleted ? 'msg-is-pinned' : ''}`}
            onMouseEnter={() => setHoveredMsg(msg.id)}
            onMouseLeave={() => setHoveredMsg(null)}
          >
            {/* Avatar */}
            <div className={`msg-avatar msg-avatar-role-${msg.role}`}>
              {msg.username?.[0]?.toUpperCase()}
            </div>

            {/* Content */}
            <div className="msg-content">
              <div className="msg-header">
                <span className={`msg-username msg-username-${msg.role}`}>
                  {msg.username}
                </span>
                <span className={`msg-role-pill msg-role-pill-${msg.role}`}>
                  {msg.role}
                </span>
                <span className="msg-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
                {msg.pinned && !msg.deleted && (
                  <span className="msg-pin-tag">📌 pinned</span>
                )}
              </div>
              <div className="msg-text">{msg.text}</div>
            </div>

            {/* Mod toolbar — appears on hover */}
            {!msg.deleted && hoveredMsg === msg.id && isMod && (
              <div className="msg-toolbar">
                <button
                  className="msg-toolbar-btn"
                  title={msg.pinned ? 'Unpin' : 'Pin message'}
                  onClick={() => handlePin(msg.id)}
                >📌</button>
                <button
                  className="msg-toolbar-btn msg-toolbar-btn-delete"
                  title="Delete message"
                  onClick={() => handleDelete(msg.id)}
                >🗑️</button>
              </div>
            )}
          </div>
        ))}

        {/* ── Command responses ── */}
        {commandResponses.map((r, i) => (
          <div key={i} className={`msg-command-resp msg-command-resp-${r.type}`}>
            <pre className="msg-command-pre">{r.text}</pre>
          </div>
        ))}

        {/* ── Typing indicator ── */}
        {typingUsers.length > 0 && (
          <div className="msg-typing">
            <div className="typing-dots">
              <span /><span /><span />
            </div>
            <span>
              {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing…
            </span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
