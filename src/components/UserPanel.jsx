import { useState, useEffect } from 'react';

const ROLE_ORDER = { owner: 0, moderator: 1, member: 2 };

function UserAvatar({ user }) {
  return (
    <div className={`up-avatar up-avatar-${user.role}`}>
      {user.username?.[0]?.toUpperCase()}
      <span
        className="up-status-dot"
        style={{ background: user.online ? '#23a55a' : '#80848e' }}
      />
    </div>
  );
}

export default function UserPanel({
  currentUser,
  onlineUsers,   // real-time online list from socket
  token,         // needed to fetch ALL users
  socket,
  onUserClick,
}) {
  const [allUsers,     setAllUsers]     = useState([]);
  const [search,       setSearch]       = useState('');
  const [showSearch,   setShowSearch]   = useState(false);

  const isOwner = currentUser?.role === 'owner';
  const isMod   = ['owner', 'moderator'].includes(currentUser?.role);

  // ── Fetch ALL registered users once ───────────────────────────
  useEffect(() => {
    if (!token) return;
    fetch('https://pingup-backend-1.onrender.com/api/users', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => Array.isArray(data) ? setAllUsers(data) : null)
      .catch(console.error);
  }, [token]);

  // ── Merge online status from socket into allUsers ─────────────
  const onlineIds = new Set((onlineUsers || []).map(u => u.id || u._id?.toString()));

  const mergedUsers = allUsers.map(u => ({
    ...u,
    online: onlineIds.has(u.id),
  }));

  // ── Group by role, sort online first within each group ─────────
  const filtered = mergedUsers.filter(u =>
    !search || u.username.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = {
    owner:     filtered.filter(u => u.role === 'owner'),
    moderator: filtered.filter(u => u.role === 'moderator'),
    member:    filtered.filter(u => u.role === 'member'),
  };

  // Sort each group: online first, then alphabetical
  Object.keys(grouped).forEach(role => {
    grouped[role].sort((a, b) => {
      if (a.online !== b.online) return b.online - a.online;
      return a.username.localeCompare(b.username);
    });
  });

  const totalOnline = mergedUsers.filter(u => u.online).length;
  const totalAll    = mergedUsers.length;

  // ── Quick owner action ─────────────────────────────────────────
  function handleSetRole(userId, role) {
    socket?.emit('user:setrole', { targetId: userId, role });
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
  }

  function handleKick(userId) {
    socket?.emit('user:kick', { targetId: userId });
  }

  function handleBan(userId, username) {
    if (!confirm(`Ban ${username}?`)) return;
    socket?.emit('user:ban', { targetId: userId });
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, banned: true } : u));
  }

  function UserRow({ user }) {
    const [showMenu, setShowMenu] = useState(false);
    const isMe = user.id === currentUser?.id;

    return (
      <div
        className={`up-user-row ${user.online ? 'up-online' : 'up-offline'} ${user.banned ? 'up-banned' : ''}`}
        onClick={() => { if (!isMe) onUserClick?.(user); }}
        title={isMe ? 'You' : `Message ${user.username}`}
      >
        <UserAvatar user={user} />
        <div className="up-user-info">
          <span className="up-username">
            {user.username}
            {isMe && <span className="up-you-tag"> (you)</span>}
          </span>
          <span className={`up-role-label up-role-${user.role}`}>{user.role}</span>
        </div>

        {/* Owner quick-action menu */}
        {isOwner && !isMe && user.role !== 'owner' && (
          <div className="up-actions" onClick={e => e.stopPropagation()}>
            <button
              className="up-action-dot-btn"
              onClick={() => setShowMenu(v => !v)}
              title="Actions"
            >⋮</button>
            {showMenu && (
              <div className="up-action-menu">
                <div className="up-action-menu-header">{user.username}</div>
                <div className="up-action-divider" />
                <button
                  className="up-action-item"
                  onClick={() => { handleSetRole(user.id, 'moderator'); setShowMenu(false); }}
                  disabled={user.role === 'moderator'}
                >🛡️ Make Moderator</button>
                <button
                  className="up-action-item"
                  onClick={() => { handleSetRole(user.id, 'member'); setShowMenu(false); }}
                  disabled={user.role === 'member'}
                >👤 Make Member</button>
                <div className="up-action-divider" />
                <button
                  className="up-action-item"
                  onClick={() => { handleKick(user.id); setShowMenu(false); }}
                >👢 Kick</button>
                <button
                  className="up-action-item up-action-danger"
                  onClick={() => { handleBan(user.id, user.username); setShowMenu(false); }}
                  disabled={user.banned}
                >{user.banned ? '🔨 Banned' : '🔨 Ban'}</button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="user-panel">

      {/* ── Header ── */}
      <div className="up-header">
        <div className="up-header-title">
          MEMBERS
          <span className="up-header-count">
            {totalOnline}/{totalAll}
          </span>
        </div>
        <button
          className="up-search-toggle"
          onClick={() => { setShowSearch(v => !v); setSearch(''); }}
          title="Search members"
        >🔍</button>
      </div>

      {/* ── Search bar ── */}
      {showSearch && (
        <div className="up-search-wrap">
          <input
            className="up-search-input"
            placeholder="Search members…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
        </div>
      )}

      {/* ── Member groups ── */}
      <div className="up-list">

        {/* Owner group */}
        {grouped.owner.length > 0 && (
          <div className="up-group">
            <div className="up-group-label">
              👑 Owner — {grouped.owner.length}
            </div>
            {grouped.owner.map(u => <UserRow key={u.id} user={u} />)}
          </div>
        )}

        {/* Moderator group */}
        {grouped.moderator.length > 0 && (
          <div className="up-group">
            <div className="up-group-label">
              🛡️ Moderators — {grouped.moderator.length}
            </div>
            {grouped.moderator.map(u => <UserRow key={u.id} user={u} />)}
          </div>
        )}

        {/* Member group */}
        {grouped.member.length > 0 && (
          <div className="up-group">
            <div className="up-group-label">
              👤 Members — {grouped.member.length}
            </div>
            {grouped.member.map(u => <UserRow key={u.id} user={u} />)}
          </div>
        )}

        {/* Empty state */}
        {totalAll === 0 && (
          <div className="up-empty">No members found</div>
        )}
        {totalAll > 0 && filtered.length === 0 && (
          <div className="up-empty">No results for "{search}"</div>
        )}
      </div>
    </div>
  );
}
