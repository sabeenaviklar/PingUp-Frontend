import { useState } from 'react';

const STATUS_ICON = { online: '🟢', idle: '🌙', dnd: '🔴', offline: '⚫' };

export default function FriendsPanel({ onlineUsers }) {
  const [tab, setTab]       = useState('online');
  const [search, setSearch] = useState('');

  const tabs = ['online', 'all', 'pending'];

  const filtered = onlineUsers.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="friends-panel">

      {/* ── Header ── */}
      <div className="fp-header">
        <span className="fp-header-icon">👥</span>
        <span className="fp-header-title">Friends</span>
        <div className="fp-tabs">
          {tabs.map(t => (
            <button
              key={t}
              className={`fp-tab ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t === 'pending' && <span className="fp-pending-badge">1</span>}
            </button>
          ))}
        </div>
        <button className="fp-add-btn">Add Friend</button>
      </div>

      {/* ── Search ── */}
      <div className="fp-search-wrap">
        <input
          className="fp-search"
          placeholder="Search"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* ── List ── */}
      <div className="fp-list-header">Online — {filtered.length}</div>

      <div className="fp-list">
        {filtered.length === 0 && (
          <div className="fp-empty">No users found.</div>
        )}
        {filtered.map(u => (
          <div key={u.id} className="fp-user-row">
            <div className={`fp-avatar avatar-${u.role}`}>
              {u.username[0].toUpperCase()}
              <span className="fp-dot" style={{ background: '#23a55a' }} />
            </div>
            <div className="fp-user-info">
              <span className={`fp-username role-${u.role}`}>{u.username}</span>
              <span className="fp-userstatus">🟢 Online</span>
            </div>
            <div className="fp-user-actions">
              <button className="fp-action-btn" title="Message">💬</button>
              <button className="fp-action-btn" title="More">⋯</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
