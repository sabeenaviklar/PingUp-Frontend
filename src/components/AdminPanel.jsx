import { useState, useEffect } from 'react';

export default function AdminPanel({ currentUser, socket, categories, onlineUsers, token, onClose }) {
  const [tab,         setTab]         = useState('channels'); // 'channels' | 'users' | 'roles'
  const [allUsers,    setAllUsers]    = useState([]);
  const [loadingUsers,setLoadingUsers]= useState(false);
  const [notification,setNotification]= useState('');

  const isOwner = currentUser?.role === 'owner';

  // Fetch all users for user management
  useEffect(() => {
    if (tab !== 'users' && tab !== 'roles') return;
    setLoadingUsers(true);
    fetch('http://localhost:3001/api/users', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { setAllUsers(data); setLoadingUsers(false); })
      .catch(() => setLoadingUsers(false));
  }, [tab, token]);

  function notify(msg) {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  }

  // ── Channel controls ────────────────────────────────────────────
  function handleToggleReadOnly(ch) {
    socket?.emit('channel:toggleReadOnly', { channelId: ch.id });
    notify(`Toggled read-only for #${ch.name}`);
  }
  function handleToggleLock(ch) {
    socket?.emit('channel:toggleLock', { channelId: ch.id });
    notify(`Toggled lock for #${ch.name}`);
  }
  function handleTogglePrivate(ch) {
    socket?.emit('channel:togglePrivate', { channelId: ch.id });
    notify(`Toggled private for #${ch.name}`);
  }
  function handleDeleteChannel(ch) {
    if (!confirm(`Delete #${ch.name} and all its messages?`)) return;
    socket?.emit('channel:delete', { channelId: ch.id });
    notify(`Deleted #${ch.name}`);
  }
  function handleRenameChannel(ch) {
    const newName = prompt(`Rename #${ch.name} to:`, ch.name);
    if (!newName?.trim() || newName.trim() === ch.name) return;
    socket?.emit('channel:rename', { channelId: ch.id, newName: newName.trim() });
    notify(`Renamed #${ch.name} → ${newName}`);
  }

  // ── User controls ───────────────────────────────────────────────
  function handleSetRole(userId, role) {
    socket?.emit('user:setrole', { targetId: userId, role });
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
    notify(`Role updated to ${role}`);
  }
  function handleKick(userId, username) {
    if (!confirm(`Kick ${username}?`)) return;
    socket?.emit('user:kick', { targetId: userId });
    notify(`Kicked ${username}`);
  }
  function handleBan(userId, username) {
    if (!confirm(`Ban ${username}? They won't be able to log in.`)) return;
    socket?.emit('user:ban', { targetId: userId });
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, banned: true } : u));
    notify(`Banned ${username}`);
  }

  const allChannels = (categories || []).flatMap(c => c.channels);

  return (
    <div className="admin-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="admin-panel">

        {/* Header */}
        <div className="admin-header">
          <div className="admin-header-left">
            <span className="admin-crown">👑</span>
            <h2 className="admin-title">Admin Panel</h2>
            <span className="admin-badge">{currentUser.username}</span>
          </div>
          <button className="admin-close" onClick={onClose}>✕</button>
        </div>

        {/* Notification toast */}
        {notification && (
          <div className="admin-notif">{notification}</div>
        )}

        {/* Tabs */}
        <div className="admin-tabs">
          {['channels', 'users', 'roles'].map(t => (
            <button
              key={t}
              className={`admin-tab ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'channels' && '🏠 Channels'}
              {t === 'users'    && '👥 Users'}
              {t === 'roles'    && '🔰 Roles'}
            </button>
          ))}
        </div>

        <div className="admin-body">

          {/* ── Channels tab ───────────────────────────────────── */}
          {tab === 'channels' && (
            <div className="admin-section">
              <p className="admin-hint">
                Manage all channels — toggle permissions, rename, or delete.
              </p>

              {(categories || []).map(cat => (
                <div key={cat.id} className="admin-cat-block">
                  <div className="admin-cat-name">
                    <span>📁 {cat.name}</span>
                    <button
                      className="admin-btn-sm admin-btn-danger"
                      onClick={() => {
                        if (!confirm(`Delete category "${cat.name}" and all its channels?`)) return;
                        socket?.emit('category:delete', { categoryId: cat.id });
                        notify(`Deleted category "${cat.name}"`);
                      }}
                    >Delete Category</button>
                  </div>

                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Channel</th>
                        <th>Read-only</th>
                        <th>Locked</th>
                        <th>Private</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cat.channels.map(ch => (
                        <tr key={ch.id}>
                          <td className="admin-ch-name">
                            {ch.emoji} #{ch.name}
                            <span className="admin-ch-desc">{ch.description}</span>
                          </td>
                          <td>
                            <button
                              className={`admin-toggle ${ch.isReadOnly ? 'on' : 'off'}`}
                              onClick={() => handleToggleReadOnly(ch)}
                              title="Toggle read-only"
                            >
                              {ch.isReadOnly ? '🔇 ON' : '✍️ OFF'}
                            </button>
                          </td>
                          <td>
                            <button
                              className={`admin-toggle ${ch.isLocked ? 'on' : 'off'}`}
                              onClick={() => handleToggleLock(ch)}
                              title="Toggle locked"
                            >
                              {ch.isLocked ? '🔒 ON' : '🔓 OFF'}
                            </button>
                          </td>
                          <td>
                            <button
                              className={`admin-toggle ${ch.isPrivate ? 'on' : 'off'}`}
                              onClick={() => handleTogglePrivate(ch)}
                              title="Toggle private"
                            >
                              {ch.isPrivate ? '👁️ ON' : '🌐 OFF'}
                            </button>
                          </td>
                          <td className="admin-actions-cell">
                            <button
                              className="admin-btn-sm"
                              onClick={() => handleRenameChannel(ch)}
                            >✏️ Rename</button>
                            <button
                              className="admin-btn-sm admin-btn-danger"
                              onClick={() => handleDeleteChannel(ch)}
                            >🗑️ Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}

              {/* Create new channel form */}
              <CreateChannelForm categories={categories} socket={socket} onNotify={notify} />
            </div>
          )}

          {/* ── Users tab ───────────────────────────────────────── */}
          {tab === 'users' && (
            <div className="admin-section">
              <p className="admin-hint">
                View all users, their roles and online status.
              </p>
              {loadingUsers ? (
                <div className="admin-loading">Loading users…</div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Logins</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map(u => (
                      <tr key={u.id} className={u.banned ? 'admin-row-banned' : ''}>
                        <td className="admin-user-cell">
                          <div className={`admin-user-avatar avatar-${u.role}`}>
                            {u.username[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="admin-user-name">{u.username}</div>
                            {u.displayName !== u.username && (
                              <div className="admin-user-display">{u.displayName}</div>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`role-badge-sm role-${u.role}`}>{u.role}</span>
                        </td>
                        <td>
                          <span className={`admin-status ${u.online ? 'online' : 'offline'}`}>
                            {u.online ? '🟢 Online' : '⚫ Offline'}
                          </span>
                        </td>
                        <td className="admin-center">{u.loginCount || 0}</td>
                        <td className="admin-actions-cell">
                          {u.id !== currentUser.id && u.role !== 'owner' && (
                            <>
                              <button
                                className="admin-btn-sm"
                                disabled={u.banned}
                                onClick={() => handleKick(u.id, u.username)}
                              >👢 Kick</button>
                              <button
                                className="admin-btn-sm admin-btn-danger"
                                disabled={u.banned}
                                onClick={() => handleBan(u.id, u.username)}
                              >{u.banned ? '🔨 Banned' : '🔨 Ban'}</button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── Roles tab ───────────────────────────────────────── */}
          {tab === 'roles' && (
            <div className="admin-section">
              <p className="admin-hint">
                Assign roles to users. Members can only read. Moderators can delete and pin messages.
              </p>

              <div className="admin-role-legend">
                <div className="role-legend-item">
                  <span className="role-badge-sm role-owner">👑 Owner</span>
                  <span>Full control — channel management, banning, all permissions</span>
                </div>
                <div className="role-legend-item">
                  <span className="role-badge-sm role-moderator">🛡️ Moderator</span>
                  <span>Delete & pin messages, kick members</span>
                </div>
                <div className="role-legend-item">
                  <span className="role-badge-sm role-member">👤 Member</span>
                  <span>Send messages in unlocked, non-read-only channels</span>
                </div>
              </div>

              {loadingUsers ? (
                <div className="admin-loading">Loading users…</div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Current Role</th>
                      <th>Assign Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.filter(u => u.role !== 'owner').map(u => (
                      <tr key={u.id}>
                        <td className="admin-user-cell">
                          <div className={`admin-user-avatar avatar-${u.role}`}>
                            {u.username[0].toUpperCase()}
                          </div>
                          <span>{u.username}</span>
                        </td>
                        <td>
                          <span className={`role-badge-sm role-${u.role}`}>{u.role}</span>
                        </td>
                        <td className="admin-role-btns">
                          <button
                            className={`admin-role-btn ${u.role === 'moderator' ? 'active' : ''}`}
                            onClick={() => handleSetRole(u.id, 'moderator')}
                            disabled={u.role === 'moderator'}
                          >🛡️ Moderator</button>
                          <button
                            className={`admin-role-btn ${u.role === 'member' ? 'active' : ''}`}
                            onClick={() => handleSetRole(u.id, 'member')}
                            disabled={u.role === 'member'}
                          >👤 Member</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ── Create Channel Form (inside admin panel) ─────────────────────
function CreateChannelForm({ categories, socket, onNotify }) {
  const [form, setForm] = useState({
    categoryId: '',
    name: '', description: '', emoji: '💬',
    isReadOnly: false, isPrivate: false,
  });
  const EMOJIS = ['💬','🌿','⚙️','📢','🎲','💡','📋','🔒','🌐','🎯','🧪','📌'];

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.categoryId) return;
    socket?.emit('channel:create', {
      categoryId:  form.categoryId,
      name:        form.name.trim(),
      description: form.description.trim(),
      emoji:       form.emoji,
    });
    onNotify(`Created #${form.name}`);
    setForm({ categoryId: form.categoryId, name: '', description: '', emoji: '💬', isReadOnly: false, isPrivate: false });
  }

  return (
    <div className="admin-create-form">
      <h4 className="admin-create-title">➕ Create New Channel</h4>
      <form onSubmit={handleSubmit}>
        <div className="admin-form-row">
          <select
            value={form.categoryId}
            onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
            required
          >
            <option value="">Select category…</option>
            {(categories || []).map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input
            placeholder="channel-name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required
          />
          <input
            placeholder="Description (optional)"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
        </div>
        <div className="admin-emoji-row">
          {EMOJIS.map(em => (
            <button
              key={em} type="button"
              className={`admin-emoji-btn ${form.emoji === em ? 'selected' : ''}`}
              onClick={() => setForm(f => ({ ...f, emoji: em }))}
            >{em}</button>
          ))}
        </div>
        <button type="submit" className="admin-submit-btn">Create Channel</button>
      </form>
    </div>
  );
}
