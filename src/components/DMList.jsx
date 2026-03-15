import { useState, useEffect } from 'react';

export default function DMList({ currentUser, token, onlineUsers, onOpenDM, activeDMId, dmNotifications }) {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    if (!token) return;
    fetch('http://localhost:3001/api/dm', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => setConversations(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [token]);

  // Refresh list when a new DM notification arrives
  useEffect(() => {
    if (!dmNotifications.length || !token) return;
    fetch('http://localhost:3001/api/dm', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => setConversations(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [dmNotifications]);

  // Find a user to start a new DM with (all online users except self)
  const others = onlineUsers.filter(u => u.id !== currentUser.id);

  function startDM(user) {
    const existing = conversations.find(c => c.otherUser?.id === user.id);
    onOpenDM(user, existing?.conversationId || null);
  }

  const roleColor = { owner: 'var(--danger)', moderator: 'var(--mod-color)', member: 'var(--accent)' };

  return (
    <div className="dm-list-panel">
      {/* Start new DM */}
      {others.length > 0 && (
        <div className="dm-list-section">
          <div className="dm-list-label">ONLINE — START DM</div>
          {others.map(u => (
            <div key={u.id}
              className={`dm-list-item ${activeDMId === u.id ? 'active' : ''}`}
              onClick={() => startDM(u)}>
              <div className={`dm-list-avatar avatar-${u.role}`} style={{ position: 'relative' }}>
                {u.username[0].toUpperCase()}
                <span className="dm-list-dot" style={{ background: 'var(--success)' }} />
              </div>
              <div className="dm-list-info">
                <span className="dm-list-name" style={{ color: roleColor[u.role] }}>{u.username}</span>
                <span className="dm-list-sub">{u.role}</span>
              </div>
              {dmNotifications.filter(n => n.fromId === u.id).length > 0 && (
                <span className="dm-unread-badge">
                  {dmNotifications.filter(n => n.fromId === u.id).length}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Recent conversations */}
      {conversations.length > 0 && (
        <div className="dm-list-section">
          <div className="dm-list-label">RECENT</div>
          {conversations.map(c => {
            if (!c.otherUser) return null;
            const isOnline = onlineUsers.find(u => u.id === c.otherUser.id);
            return (
              <div key={c.conversationId}
                className={`dm-list-item ${activeDMId === c.otherUser.id ? 'active' : ''}`}
                onClick={() => onOpenDM(c.otherUser, c.conversationId)}>
                <div className={`dm-list-avatar avatar-${c.otherUser.role}`} style={{ position: 'relative' }}>
                  {c.otherUser.username[0].toUpperCase()}
                  {isOnline && <span className="dm-list-dot" style={{ background: 'var(--success)' }} />}
                </div>
                <div className="dm-list-info">
                  <span className="dm-list-name">{c.otherUser.username}</span>
                  <span className="dm-list-sub">{c.lastMessage?.slice(0, 28)}{c.lastMessage?.length > 28 ? '…' : ''}</span>
                </div>
                {c.unreadCount > 0 && (
                  <span className="dm-unread-badge">{c.unreadCount}</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {others.length === 0 && conversations.length === 0 && (
        <div className="dm-list-empty">No users online to message.</div>
      )}
    </div>
  );
}
