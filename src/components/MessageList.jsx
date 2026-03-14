import { useEffect, useRef } from 'react';

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function avatarClass(role) {
  if (role === 'admin')     return 'avatar-admin';
  if (role === 'moderator') return 'avatar-moderator';
  return 'avatar-member';
}

export default function MessageList({ messages, notifications, commandResponses, typingUsers }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, notifications, commandResponses]);

  return (
    <div className="messages-container">
      {messages.map((msg, i) => (
        <div key={msg.id || i} className="message-row">
          <div className={`message-avatar ${avatarClass(msg.role)}`}>
            {msg.username[0].toUpperCase()}
          </div>
          <div className="message-body">
            <div className="message-meta">
              <span className={`message-username role-${msg.role}`}>{msg.username}</span>
              {msg.role === 'admin'     && <span className="message-badge badge-admin">ADMIN</span>}
              {msg.role === 'moderator' && <span className="message-badge badge-moderator">MOD</span>}
              <span className="message-timestamp">{formatTime(msg.timestamp)}</span>
            </div>
            <div className={`message-text ${msg.deleted ? 'deleted' : ''}`}>{msg.text}</div>
          </div>
        </div>
      ))}

      {notifications.map((n, i) => (
        <div key={`n-${i}`} className="notification-row">— {n} —</div>
      ))}

      {commandResponses.map((r, i) => (
        <div key={`cr-${i}`} className={`command-response ${r.type}`}>
          <pre>{r.text}</pre>
        </div>
      ))}

      {typingUsers.length > 0 && (
        <div className="typing-indicator">
          {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing…
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
