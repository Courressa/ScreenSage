import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../../api/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import '../../styles/forms.css';

export default function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginAdmin(email, password);
      login(response.user, response.token);
      navigate('/admin');
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor='email'>Email</label>
      <input
        type='email'
        id='email'
        value={email}
        placeholder='email@example.com'
        autoComplete='email'
        required
        onChange={(event) => { setEmail(event.target.value) }}
      />

      <label htmlFor='password'>Password</label>
      <input
        type='password'
        id='password'
        value={password}
        placeholder='Enter password'
        autoComplete='current-password'
        required
        onChange={(event) => { setPassword(event.target.value) }}
      />

      {error && <div className="admin-alert admin-alert--error">{error}</div>}

      <button type='submit' className="btn btn--primary" disabled={loading}>
        {loading ? 'Signing in…' : 'Login'}
      </button>
    </form>
  )
}
