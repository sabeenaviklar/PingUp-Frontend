import { useState } from 'react';

export default function ProfileModal({ user, onClose }) {
  if (!user) return null;

  const [tab, setTab] = useState('security');
  const [editing, setEditing] = useState(null); // 'displayName' | 'username' | 'email' | 'phone'
  const [fields, setFields] = useState({
    displayName: user.username,
    username:    user.username,
    email:       'user@example.com',
    phone:       '1234565862',
  });
  const [tempVal, setTempVal] = useState('');
  const [revealed, setRevealed] = useState({ email: false, phone: false });

  const bannerGradient = {
    admin:     'linear-gradient(135deg, #3a1f1f 0%, #1a0a0a 100%)',
    moderator: 'linear-gradient(135deg, #2a2010 0%, #1a1408 100%)',
    member:    'linear-gradient(135deg, #1a1f3a 0%, #0d0f1f 100%)',
  };

  function startEdit(field) {
    setTempVal(fields[field]);
    setEditing(field);
  }

  function saveEdit() {
    if (tempVal.trim()) {
      setFields(f => ({ ...f, [editing]: tempVal.trim() }));
    }
    setEditing(null);
  }

  function maskEmail(email) {
    const [local, domain] = email.split('@');
    return '*'.repeat(Math.max(local.length, 8)) + '@' + domain;
  }

  function maskPhone(phone) {
    return '*'.repeat(Math.max(phone.length - 4, 6)) + phone.slice(-4);
  }

  return (
    <div className="ma-overlay" onClick={onClose}>
      <div className="ma-page" onClick={e => e.stopPropagation()}>

        {/* ── Left settings nav ── */}
        <aside className="ma-sidenav">
          <div className="ma-sidenav-section">My Account</div>
          <div className="ma-sidenav-item active">My Account</div>
          <div className="ma-sidenav-item">Profiles</div>
          <div className="ma-sidenav-item">Privacy & Safety</div>
          <div className="ma-sidenav-item">Notifications</div>
          <div className="ma-sidenav-item">Appearance</div>
          <div className="ma-sidenav-divider" />
          <div className="ma-sidenav-item danger" onClick={onClose}>Log Out</div>
        </aside>

        {/* ── Main content ── */}
        <main className="ma-content">

          {/* Close button */}
          <button className="ma-close" onClick={onClose}>✕<span>ESC</span></button>

          <h2 className="ma-page-title">My Account</h2>

          {/* Tabs */}
          <div className="ma-tabs">
            <button
              className={`ma-tab ${tab === 'security' ? 'active' : ''}`}
              onClick={() => setTab('security')}
            >Security</button>
            <button
              className={`ma-tab ${tab === 'standing' ? 'active' : ''}`}
              onClick={() => setTab('standing')}
            >Standing</button>
          </div>
          <div className="ma-tab-underline" />

          {tab === 'security' && (
            <div className="ma-card">

              {/* Profile banner */}
              <div className="ma-banner" style={{ background: bannerGradient[user.role] }} />

              {/* Avatar row */}
              <div className="ma-avatar-row">
                <div className="ma-avatar-wrap">
                  <div className={`ma-avatar avatar-${user.role}`}>
                    {user.username[0].toUpperCase()}
                  </div>
                  <span className="ma-online-dot" />
                  <span className="ma-hash-badge">#</span>
                </div>
                <div className="ma-avatar-info">
                  <span className="ma-display-name">{fields.displayName}</span>
                  <span className="ma-dots">···</span>
                </div>
                <button className="ma-edit-profile-btn">Edit User Profile</button>
              </div>

              {/* Fields */}
              <div className="ma-fields">

                {/* Display Name */}
                <div className="ma-field-row">
                  <div className="ma-field-info">
                    <label>Display Name</label>
                    {editing === 'displayName' ? (
                      <div className="ma-inline-edit">
                        <input autoFocus value={tempVal} onChange={e => setTempVal(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && saveEdit()} />
                        <button className="ma-save-btn" onClick={saveEdit}>Save</button>
                        <button className="ma-cancel-btn" onClick={() => setEditing(null)}>Cancel</button>
                      </div>
                    ) : (
                      <span>{fields.displayName}</span>
                    )}
                  </div>
                  {editing !== 'displayName' && (
                    <button className="ma-field-btn" onClick={() => startEdit('displayName')}>Edit</button>
                  )}
                </div>

                <div className="ma-field-divider" />

                {/* Username */}
                <div className="ma-field-row">
                  <div className="ma-field-info">
                    <label>Username</label>
                    {editing === 'username' ? (
                      <div className="ma-inline-edit">
                        <input autoFocus value={tempVal} onChange={e => setTempVal(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && saveEdit()} />
                        <button className="ma-save-btn" onClick={saveEdit}>Save</button>
                        <button className="ma-cancel-btn" onClick={() => setEditing(null)}>Cancel</button>
                      </div>
                    ) : (
                      <span>{fields.username}</span>
                    )}
                  </div>
                  {editing !== 'username' && (
                    <button className="ma-field-btn" onClick={() => startEdit('username')}>Edit</button>
                  )}
                </div>

                <div className="ma-field-divider" />

                {/* Email */}
                <div className="ma-field-row">
                  <div className="ma-field-info">
                    <label>Email</label>
                    {editing === 'email' ? (
                      <div className="ma-inline-edit">
                        <input autoFocus type="email" value={tempVal} onChange={e => setTempVal(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && saveEdit()} />
                        <button className="ma-save-btn" onClick={saveEdit}>Save</button>
                        <button className="ma-cancel-btn" onClick={() => setEditing(null)}>Cancel</button>
                      </div>
                    ) : (
                      <span>
                        {revealed.email ? fields.email : maskEmail(fields.email)}{' '}
                        <span className="ma-reveal-link"
                          onClick={() => setRevealed(r => ({ ...r, email: !r.email }))}>
                          {revealed.email ? 'Hide' : 'Reveal'}
                        </span>
                      </span>
                    )}
                  </div>
                  {editing !== 'email' && (
                    <button className="ma-field-btn" onClick={() => startEdit('email')}>Edit</button>
                  )}
                </div>

                <div className="ma-field-divider" />

                {/* Phone */}
                <div className="ma-field-row">
                  <div className="ma-field-info">
                    <label>Phone Number</label>
                    {editing === 'phone' ? (
                      <div className="ma-inline-edit">
                        <input autoFocus type="tel" value={tempVal} onChange={e => setTempVal(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && saveEdit()} />
                        <button className="ma-save-btn" onClick={saveEdit}>Save</button>
                        <button className="ma-cancel-btn" onClick={() => setEditing(null)}>Cancel</button>
                      </div>
                    ) : (
                      <span>
                        {revealed.phone ? fields.phone : maskPhone(fields.phone)}{' '}
                        <span className="ma-reveal-link"
                          onClick={() => setRevealed(r => ({ ...r, phone: !r.phone }))}>
                          {revealed.phone ? 'Hide' : 'Reveal'}
                        </span>
                      </span>
                    )}
                  </div>
                  {editing !== 'phone' && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="ma-field-btn ghost"
                        onClick={() => setFields(f => ({ ...f, phone: '' }))}>Remove</button>
                      <button className="ma-field-btn" onClick={() => startEdit('phone')}>Edit</button>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {tab === 'standing' && (
            <div className="ma-card ma-standing">
              <div className="ma-standing-icon">🛡️</div>
              <h3>Your account is in good standing</h3>
              <p>No violations or restrictions have been applied to your account.</p>
              <div className="ma-standing-badge">Good Standing</div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
