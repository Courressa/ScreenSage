import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/admin.css';

const navItems = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/wallpapers', label: 'Wallpapers' },
  { to: '/admin/sales', label: 'Sales' },
  { to: '/admin/users', label: 'Users' },
];

export default function AdminSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <aside className="admin-sidebar">
      <NavLink to="/admin" className="admin-sidebar__brand" end>
        Screen<span>Sage</span> Admin
      </NavLink>

      <nav className="admin-sidebar__nav" aria-label="Admin navigation">
        {navItems.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `admin-sidebar__link${isActive ? ' admin-sidebar__link--active' : ''}`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="admin-sidebar__footer">
        <div className="admin-sidebar__user">
          <strong>{user?.username || 'Admin'}</strong>
          {user?.email}
        </div>
        <button type="button" className="btn btn--ghost" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </aside>
  );
}
