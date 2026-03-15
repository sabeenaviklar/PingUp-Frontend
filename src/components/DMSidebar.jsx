import { useState } from 'react';

const STATUS_COLORS = {
  online:  '#23a55a',
  idle:    '#f0b232',
  dnd:     '#ed4245',
  offline: '#80848e',
};

function StatusDot({ status }) {
  return (
    <span
      className="dm-status-dot"
      style={{ background: STATUS_COLORS[status] || STATUS_COLORS.offline }}
    />
  );
}

const CHANNEL_EMOJIS = ['💬','🌿','⚙️','📢','🎲','💡','📋','🔒','🌐','🎯','🧪','📌'];

export default function DMSidebar({
  currentUser,
  onlineUsers,
  activeRoom,
  activeChannel,
  rooms,
  categories,
  socket,
  onRoomSelect,
  onChannelSelect,
  onLogout,
  onOpenProfile,
  onShowFriends,
  onOpenAdmin,       // ← new prop
}) {
  const [search,          setSearch]          = useState('');
  const [muted,           setMuted]           = useState(false);
  const [deafened,        setDeafened]        = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [collapsed,       setCollapsed]       = useState({});
  const [hoveredChannel,  setHoveredChannel]  = useState(null);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [showNewChannel,  setShowNewChannel]  = useState(null);
  const [catName,         setCatName]         = useState('');
  const [chForm,          setChForm]          = useState({ name: '', description: '', emoji: '💬' });

  const isOwner = currentUser?.role === 'owner';
  const isMod   = ['owner', 'moderator'].includes(currentUser?.role);

  // ── Derive display list ─────────────────────────────────────────
  const displayCategories = (() => {
    if (categories?.length) {
      return categories.map(cat => ({
        ...cat,
        channels: cat.channels.filter(ch =>
          !search || ch.name.toLowerCase().includes(search.toLowerCase())
        ),
      }));
    }
    const filtered = (rooms || []).filter(r =>
      !search || r.name.toLowerCase().includes(search.toLowerCase())
    );
    return filtered.length
      ? [{ id: 'cat-legacy', name: '✦ channels', channels: filtered }]
      : [];
  })();

  function handleChannelClick(ch) {
    if (onChannelSelect) onChannelSelect(ch);
    else if (onRoomSelect) onRoomSelect(ch);
  }

  function isChannelActive(ch) {
    if (activeChannel) return activeChannel.id === ch.id;
    if (activeRoom)    return activeRoom.name === ch.name;
    return false;
  }

  const toggleCollapse = (catId) =>
    setCollapsed(prev => ({ ...prev, [catId]: !prev[catId] }));

  function handleCreateCategory(e) {
    e.preventDefault();
    if (!catName.trim()) return;
    socket?.emit('category:create', { name: catName.trim() });
    setCatName('');
    setShowNewCategory(false);
  }

  function handleCreateChannel(e, categoryId) {
    e.preventDefault();
    if (!chForm.name.trim()) return;
    socket?.emit('channel:create', {
      categoryId,
      name:        chForm.name.trim(),
      description: chForm.description.trim(),
      emoji:       chForm.emoji,
    });
    setChForm({ name: '', description: '', emoji: '💬' });
    setShowNewChannel(null);
  }

  function handleDeleteChannel(e, channelId) {
    e.stopPropagation();
    if (!confirm('Delete this channel and all its messages?')) return;
    socket?.emit('channel:delete', { channelId });
  }

  function handleDeleteCategory(e, categoryId) {
    e.stopPropagation();
    if (!confirm('Delete this entire category and all its channels?')) return;
    socket?.emit('category:delete', { categoryId });
  }

  // ── Channel status badge ────────────────────────────────────────
  function ChannelStatusBadges({ ch }) {
    return (
      <div className="dm-ch-status-badges">
        {ch.isReadOnly && <span className="dm-ch-badge dm-ch-badge-ro" title="Read-only">🔇</span>}
        {ch.isLocked   && <span className="dm-ch-badge dm-ch-badge-lk" title="Locked">🔒</span>}
        {ch.isPrivate  && <span className="dm-ch-badge dm-ch-badge-pv" title="Private">👁️</span>}
      </div>
    );
  }

  return (
    <div className="dm-sidebar">

      {/* ── Top search ── */}
      <div className="dm-search-bar">
        <span className="dm-search-icon">🔍</span>
        <input
          className="dm-search-input"
          placeholder="Search channels…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* ── Nav items ── */}
      <nav className="dm-nav">
        <div
          className="dm-nav-item"
          onClick={() => { setShowProfileMenu(false); onShowFriends?.(); }}
        >
          <span className="dm-nav-icon">👥</span>
          Friends &amp; Online
        </div>
        <div
          className="dm-nav-item"
          onClick={() => { setShowProfileMenu(false); onShowFriends?.(); }}
        >
          <span className="dm-nav-icon">✉️</span>
          Direct Messages
        </div>

        {/* Admin Panel shortcut — owner only */}
        {isOwner && onOpenAdmin && (
          <button
            className="dms-admin-btn"
            onClick={() => { setShowProfileMenu(false); onOpenAdmin(); }}
          >
            <span>👑</span>
            Admin Panel
          </button>
        )}
      </nav>

      <div className="dm-sidebar-divider" />

      {/* ── Categories + Channels ── */}
      <div className="dm-channels-scroll">

        {displayCategories.map(cat => (
          <div key={cat.id} className="dm-category-group">

            {/* Category header */}
            <div
              className="dm-category-header"
              onClick={() => toggleCollapse(cat.id)}
            >
              <span className="dm-cat-arrow">{collapsed[cat.id] ? '▶' : '▼'}</span>
              <span className="dm-cat-label">{cat.name}</span>

              {isOwner && (
                <div className="dm-cat-owner-btns">
                  <button
                    className="dm-cat-icon-btn"
                    title="Add channel"
                    onClick={e => {
                      e.stopPropagation();
                      setShowNewChannel(showNewChannel === cat.id ? null : cat.id);
                    }}
                  >＋</button>
                  <button
                    className="dm-cat-icon-btn dm-cat-icon-btn-danger"
                    title="Delete category"
                    onClick={e => handleDeleteCategory(e, cat.id)}
                  >✕</button>
                </div>
              )}
            </div>

            {/* New channel form */}
            {isOwner && showNewChannel === cat.id && (
              <form
                className="dm-new-channel-form"
                onSubmit={e => handleCreateChannel(e, cat.id)}
              >
                <div className="dm-emoji-picker">
                  {CHANNEL_EMOJIS.map(em => (
                    <button
                      key={em} type="button"
                      className={`dm-emoji-opt ${chForm.emoji === em ? 'selected' : ''}`}
                      onClick={() => setChForm(f => ({ ...f, emoji: em }))}
                    >{em}</button>
                  ))}
                </div>
                <input
                  placeholder="channel-name"
                  value={chForm.name}
                  onChange={e => setChForm(f => ({ ...f, name: e.target.value }))}
                  autoFocus
                />
                <input
                  placeholder="Description (optional)"
                  value={chForm.description}
                  onChange={e => setChForm(f => ({ ...f, description: e.target.value }))}
                />
                <div className="dm-new-ch-row">
                  <button type="submit" className="dm-new-ch-create">Create</button>
                  <button
                    type="button"
                    className="dm-new-ch-cancel"
                    onClick={() => setShowNewChannel(null)}
                  >Cancel</button>
                </div>
              </form>
            )}

            {/* Channel list */}
            {!collapsed[cat.id] && cat.channels.map(ch => (
              <div
                key={ch.id}
                className={`dm-channel-row ${isChannelActive(ch) ? 'active' : ''} ${ch.isLocked ? 'ch-locked' : ''} ${ch.isReadOnly ? 'ch-readonly' : ''}`}
                onClick={() => handleChannelClick(ch)}
                onMouseEnter={() => setHoveredChannel(ch.id)}
                onMouseLeave={() => setHoveredChannel(null)}
              >
                <span className="dm-ch-hash">#</span>
                <span className="dm-ch-emoji">{ch.emoji || '💬'}</span>
                <span className="dm-ch-name">{ch.name}</span>

                {/* Status badges — always visible on locked/readonly/private */}
                <ChannelStatusBadges ch={ch} />

                {/* Owner quick-actions on hover */}
                {isOwner && hoveredChannel === ch.id && (
                  <div className="dm-ch-hover-actions">
                    <button
                      className={`dm-ch-quick-btn ${ch.isReadOnly ? 'active' : ''}`}
                      title="Toggle read-only"
                      onClick={e => {
                        e.stopPropagation();
                        socket?.emit('channel:toggleReadOnly', { channelId: ch.id });
                      }}
                    >🔇</button>
                    <button
                      className={`dm-ch-quick-btn ${ch.isLocked ? 'active' : ''}`}
                      title="Toggle lock"
                      onClick={e => {
                        e.stopPropagation();
                        socket?.emit('channel:toggleLock', { channelId: ch.id });
                      }}
                    >🔒</button>
                    <button
                      className={`dm-ch-quick-btn ${ch.isPrivate ? 'active' : ''}`}
                      title="Toggle private"
                      onClick={e => {
                        e.stopPropagation();
                        socket?.emit('channel:togglePrivate', { channelId: ch.id });
                      }}
                    >👁️</button>
                    <button
                      className="dm-ch-del-btn"
                      title="Delete channel"
                      onClick={e => handleDeleteChannel(e, ch.id)}
                    >🗑️</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}

        {/* New Category — owner only */}
        {isOwner && (
          <div className="dm-add-category-wrap">
            {showNewCategory ? (
              <form className="dm-new-cat-form" onSubmit={handleCreateCategory}>
                <input
                  placeholder="Category name"
                  value={catName}
                  onChange={e => setCatName(e.target.value)}
                  autoFocus
                />
                <div className="dm-new-ch-row">
                  <button type="submit" className="dm-new-ch-create">Create</button>
                  <button
                    type="button"
                    className="dm-new-ch-cancel"
                    onClick={() => setShowNewCategory(false)}
                  >Cancel</button>
                </div>
              </form>
            ) : (
              <button
                className="dm-add-cat-btn"
                onClick={() => setShowNewCategory(true)}
              >
                ＋ New Category
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Bottom User Bar ── */}
      <div className="dm-user-bar">
        <div
          className="dm-user-info"
          onClick={() => setShowProfileMenu(v => !v)}
          title="View Profile"
        >
          <div className={`dm-user-avatar avatar-${currentUser.role}`}>
            {currentUser.username[0].toUpperCase()}
            <StatusDot status="online" />
          </div>
          <div className="dm-user-text">
            <span className="dm-user-name">{currentUser.username}</span>
            <span className={`dm-user-role role-${currentUser.role}`}>
              {currentUser.role}
            </span>
          </div>
        </div>

        <div className="dm-user-actions">
          <button
            className={`dm-action-btn ${muted ? 'active-danger' : ''}`}
            title={muted ? 'Unmute' : 'Mute'}
            onClick={() => setMuted(v => !v)}
          >{muted ? '🔇' : '🎙️'}</button>
          <button
            className={`dm-action-btn ${deafened ? 'active-danger' : ''}`}
            title={deafened ? 'Undeafen' : 'Deafen'}
            onClick={() => setDeafened(v => !v)}
          >{deafened ? '🔕' : '🎧'}</button>
          <button
            className="dm-action-btn"
            title="Settings"
            onClick={() => setShowProfileMenu(v => !v)}
          >⚙️</button>
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

            <button
              className="dm-pm-item"
              onClick={() => { onOpenProfile(); setShowProfileMenu(false); }}
            >👤 View Profile</button>
            <button
              className="dm-pm-item"
              onClick={() => setMuted(v => !v)}
            >{muted ? '🎙️ Unmute' : '🔇 Mute Microphone'}</button>
            <button
              className="dm-pm-item"
              onClick={() => setDeafened(v => !v)}
            >{deafened ? '🎧 Undeafen' : '🔕 Deafen'}</button>

            {/* Owner-only section */}
            {isOwner && (
              <>
                <div className="dm-pm-divider" />
                <div className="dm-pm-section-label">👑 Owner Controls</div>

                <button
                  className="dm-pm-item"
                  onClick={() => {
                    onOpenAdmin?.();
                    setShowProfileMenu(false);
                  }}
                >🛡️ Admin Panel</button>

                <button
                  className="dm-pm-item"
                  onClick={() => {
                    setShowNewCategory(true);
                    setShowProfileMenu(false);
                  }}
                >📁 New Category</button>
              </>
            )}

            <div className="dm-pm-divider" />

            <button
              className="dm-pm-item danger"
              onClick={() => { setShowProfileMenu(false); onLogout(); }}
            >🚪 Log Out</button>
          </div>
        )}
      </div>
    </div>
  );
}
