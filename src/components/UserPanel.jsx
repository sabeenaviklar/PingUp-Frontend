export default function UserPanel({ users }) {
    const grouped = {
      admin:     users.filter(u => u.role === 'admin'),
      moderator: users.filter(u => u.role === 'moderator'),
      member:    users.filter(u => u.role === 'member'),
    };
  
    const Section = ({ title, list, roleClass }) =>
      list.length > 0 ? (
        <>
          <div className="user-panel-title">{title} — {list.length}</div>
          {list.map(u => (
            <div key={u.id} className="user-list-item">
              <div className="user-dot" />
              <span className={roleClass}>{u.username}</span>
            </div>
          ))}
        </>
      ) : null;
  
    return (
      <div className="user-panel">
        <Section title="Admins"     list={grouped.admin}     roleClass="role-admin" />
        <Section title="Moderators" list={grouped.moderator} roleClass="role-moderator" />
        <Section title="Members"    list={grouped.member}    roleClass="role-member" />
      </div>
    );
  }
  