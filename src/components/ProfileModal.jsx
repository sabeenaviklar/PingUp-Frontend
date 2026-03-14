export default function ProfileModal({ user, onClose }) {
    if (!user) return null;
  
    const bannerColors = {
      admin:     'linear-gradient(135deg, #ed4245, #a12d30)',
      moderator: 'linear-gradient(135deg, #f0b232, #a87820)',
      member:    'linear-gradient(135deg, #5865f2, #3a45b0)',
    };
  
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="profile-modal" onClick={e => e.stopPropagation()}>
  
          {/* Banner */}
          <div className="pm-banner" style={{ background: bannerColors[user.role] || bannerColors.member }} />
  
          {/* Avatar */}
          <div className="pm-avatar-wrap">
            <div className={`pm-avatar avatar-${user.role}`}>
              {user.username[0].toUpperCase()}
            </div>
            <span className="pm-status-badge">🟢</span>
          </div>
  
          {/* Close */}
          <button className="pm-close" onClick={onClose}>✕</button>
  
          {/* Info */}
          <div className="pm-body">
            <div className="pm-username">{user.username}</div>
            <div className={`pm-role-badge badge-${user.role}`}>{user.role.toUpperCase()}</div>
  
            <div className="pm-divider" />
  
            <div className="pm-section-title">ABOUT ME</div>
            <div className="pm-about">
              {user.role === 'admin'     && '🛡️ System Administrator — Full control over the Internal Network.'}
              {user.role === 'moderator' && '⚡ Moderator — Manages rooms and keeps order.'}
              {user.role === 'member'    && '💬 Member — Participant in discussions.'}
            </div>
  
            <div className="pm-divider" />
  
            <div className="pm-section-title">INTERNAL NETWORK SINCE</div>
            <div className="pm-since">March 2026</div>
          </div>
        </div>
      </div>
    );
  }
  