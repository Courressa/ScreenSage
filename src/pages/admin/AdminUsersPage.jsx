import { useEffect, useState } from 'react';
import { getUsers } from '../../api/api';
import '../../styles/admin.css';
import '../../styles/forms.css';

function formatDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return '—';
  }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getUsers();
        if (!cancelled) setUsers(data);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load users');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Users</h1>
          <p className="admin-page__subtitle">
            Registered accounts. Role editing can be added later.
          </p>
        </div>
      </header>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}

      {loading ? (
        <p className="admin-loading">Loading users…</p>
      ) : users.length === 0 ? (
        <div className="admin-panel">
          <div className="admin-empty">
            <h2>No users found</h2>
            <p>Registered users will appear here.</p>
          </div>
        </div>
      ) : (
        <div className="admin-panel">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className="admin-status">{user.role}</span>
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
