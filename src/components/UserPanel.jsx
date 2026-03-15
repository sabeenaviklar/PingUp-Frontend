export default function UserPanel({ users, onUserClick }) {
  const grouped = {
    owner:     users.filter(u => u.role === 'owner'),
    moderator: users.filter(u => u.role === 'moderator'),
    member:    users.filter(u => u.role === 'member'),
  };

  const roleClassMap = {
    owner:     'role-admin',
    moderator: 'role-moderator',
    member:    'role-member',
  };

  const Section = ({ title, list, roleClass }) =>
    list.length > 0 ? (
      <>
        <div className="user-panel-title">{title} — {list.length}</div>
        {list.map(u => (
          <div
            key={u.id}
            className="user-list-item"
            onClick={() => onUserClick?.(u)}
            title={`DM ${u.username}`}
            style={{ cursor: onUserClick ? 'pointer' : 'default' }}
          >
            <div className="user-avatar-small" data-role={u.role}>
              {u.username[0].toUpperCase()}
            </div>
            <div className="user-list-info">
              <span className={roleClass}>{u.username}</span>
              <span className="user-list-role">{u.role}</span>
            </div>
            <div className="user-dot" title="Online" />
          </div>
        ))}
      </>
    ) : null;

  return (
    <div className="user-panel">
      <div className="user-panel-header">MEMBERS — {users.length}</div>
      <Section title="Owner"      list={grouped.owner}     roleClass="role-admin" />
      <Section title="Moderators" list={grouped.moderator} roleClass="role-moderator" />
      <Section title="Members"    list={grouped.member}    roleClass="role-member" />
      {users.length === 0 && (
        <div className="user-panel-empty">No users online</div>
      )}
    </div>
  );
}
