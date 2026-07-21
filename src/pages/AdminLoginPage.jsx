import AdminLoginForm from '../components/auth/AdminLoginForm';
import '../styles/admin.css';
import '../styles/forms.css';

export default function AdminLoginPage() {
  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <h1>
          Screen<span style={{ color: 'var(--accent)' }}>Sage</span> Admin
        </h1>
        <p className="admin-login-card__subtitle">Sign in to manage the store</p>
        <AdminLoginForm />
      </div>
    </div>
  );
}
