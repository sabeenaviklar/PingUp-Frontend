export default function Sidebar({ rooms, activeRoom, onRoomSelect, currentUser, onLogout }) {
    const roleClass = `role-${currentUser.role}`;
  
    return (
      <div className="sidebar">
        <div className="sidebar-header">⚙️ Internal Network</div>
  
        <div className="sidebar-section">
          <div className="sidebar-label">Text Channels</div>
          {rooms.map(room => (
            <div key={room.id}
              className={`room-item ${activeRoom?.name === room.name ? 'active' : ''}`}
              onClick={() => onRoomSelect(room)}
              title={room.description}>
              <span className="room-hash">#</span> {room.name}
            </div>
          ))}
        </div>
  
        <div className="sidebar-footer">
          <div className={`sidebar-avatar avatar-${currentUser.role}`}>
            {currentUser.username[0].toUpperCase()}
          </div>
          <div className="sidebar-userinfo">
            <div className="sidebar-username">{currentUser.username}</div>
            <div className={`sidebar-role ${roleClass}`}>{currentUser.role}</div>
          </div>
          <button className="btn-logout" onClick={onLogout} title="Logout">✕</button>
        </div>
      </div>
    );
  }
  