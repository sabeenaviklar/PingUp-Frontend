import { useState } from 'react';

const STATUS_COLORS = {
  online:    '#23a55a',
  idle:      '#f0b232',
  dnd:       '#ed4245',
  offline:   '#80848e',
};

function StatusDot({ status }) {
  return (
    <span className="dm-status-dot" style={{ background: STATUS_COLORS[status] || STATUS_COLORS.offline }} />
  );
}

export default function DMSidebar({
  currentUser,
  onlineUsers,
  activeRoom,
  rooms,
  onRoomSelect,
  onLogout,
  onOpenProfile,
}) {
  const [search, setSearch]         = useState('');
  const [friendTab, setFriendTab]   = useState('online'); // 'online' | 'all' | 'pending'
  const [showFriends, setShowFriends] = useState(false);
  const [muted, setMuted]           = useState(false);
  const [deafened, setDeafened]     = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const filteredRooms = rooms.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = 1; // placeholder badge

  return (
    <div className="dm-sidebar">

      {/* ── Top search ── */}
      <div className="dm-search-bar" onClick={() => setShowFriends(false)}>
        <span className="dm-search-icon">🔍</span>
        <input
          className="dm-search-input"
          placeholder="Find or start a conversation"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* ── Nav items ── */}
      <nav className="dm-nav">
        <div
          className={`dm-nav-item ${showFriends ? 'active' : ''}`}
          onClick={() => setShowFriends(true)}
        >
          <span className="dm-nav-icon">👥</span>
          Friends
          {pendingCount > 0 && <span className="dm-badge">{pendingCount}</span>}
        </div>
        <div className="dm-nav-item">
          <span className="dm-nav-icon">✉️</span>
          Message Requests
          <span className="dm-badge">5</span>
        </div>
        <div className="dm-nav-item">
          <span className="dm-nav-icon">⚡</span>
          Nitro
        </div>
        <div className="dm-nav-item">
          <span className="dm-nav-icon">🛍️</span>
          Shop
          <span className="dm-badge-new">NEW</span>
        </div>
        <div className="dm-nav-item">
          <span className="dm-nav-icon">⚙️</span>
          Quests
        </div>
      </nav>

      {/* ── Direct Messages label ── */}
      <div className="dm-section-header">
        <span>Direct Messages</span>
        <button className="dm-plus-btn" title="New DM">＋</button>
      </div>

      {/* ── Room / DM list ── */}
      <div className="dm-list">
        {filteredRooms.map(room => {
          const isActive = activeRoom?.name === room.name;
          return (
            <div
              key={room.id}
              className={`dm-item ${isActive ? 'active' : ''}`}
              onClick={() => { onRoomSelect(room); setShowFriends(false); }}
            >
              <div className={`dm-avatar avatar-${room.name.charCodeAt(0) % 5}`}>
                {room.name[0].toUpperCase()}
              </div>
              <div className="dm-item-info">
                <span className="dm-item-name"># {room.name}</span>
                <span className="dm-item-sub">{room.description}</span>
              </div>
              {isActive && (
                <button className="dm-close-btn" onClick={e => { e.stopPropagation(); }}>✕</button>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Bottom User Bar ── */}
      <div className="dm-user-bar">
        <div
          className="dm-user-info"
          onClick={() => { setShowProfileMenu(v => !v); }}
          title="View Profile"
        >
          <div className={`dm-user-avatar avatar-${currentUser.role}`}>
            {currentUser.username[0].toUpperCase()}
            <StatusDot status="online" />
          </div>
          <div className="dm-user-text">
            <span className="dm-user-name">{currentUser.username}</span>
            <span className={`dm-user-role role-${currentUser.role}`}>{currentUser.role}</span>
          </div>
        </div>

        <div className="dm-user-actions">
          <button
            className={`dm-action-btn ${muted ? 'active-danger' : ''}`}
            title={muted ? 'Unmute' : 'Mute'}
            onClick={() => setMuted(v => !v)}
          >
            {muted ? '🔇' : '🎙️'}
          </button>
          <button
            className={`dm-action-btn ${deafened ? 'active-danger' : ''}`}
            title={deafened ? 'Undeafen' : 'Deafen'}
            onClick={() => setDeafened(v => !v)}
          >
            {deafened ? '🔕' : '🎧'}
          </button>
          <button
            className="dm-action-btn"
            title="Settings / Logout"
            onClick={() => setShowProfileMenu(v => !v)}
          >
            ⚙️
          </button>
        </div>

        {/* ── Profile Pop-up Menu ── */}
        {showProfileMenu && (
          <div className="dm-profile-menu">
            <div className="dm-profile-menu-header">
              <div className={`dm-pm-avatar avatar-${currentUser.role}`}>
                {currentUser.username[0].toUpperCase()}
              </div>
              <div>
                <div className="dm-pm-name">{currentUser.username}</div>
                <div className={`dm-pm-role role-${currentUser.role}`}>{currentUser.role}</div>
                <div className="dm-pm-status">🟢 Online</div>
              </div>
            </div>

            <div className="dm-pm-divider" />

            <button className="dm-pm-item" onClick={() => { onOpenProfile(); setShowProfileMenu(false); }}>
              👤 View Profile
            </button>
            <button className="dm-pm-item" onClick={() => setMuted(v => !v)}>
              {muted ? '🎙️ Unmute' : '🔇 Mute Microphone'}
            </button>
            <button className="dm-pm-item" onClick={() => setDeafened(v => !v)}>
              {deafened ? '🎧 Undeafen' : '🔕 Deafen'}
            </button>

            <div className="dm-pm-divider" />

            <button className="dm-pm-item danger" onClick={() => { setShowProfileMenu(false); onLogout(); }}>
              🚪 Log Out
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
