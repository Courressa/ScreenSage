import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../api/api.js';
import { useAuth } from '../../context/AuthContext.jsx';


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
      const response = await loginUser(email, password);

      if (response.user?.role === 'admin') {
        login(response.user, response.token);
        navigate('/admin/dashboard');
      } else {
        setError("This account does not have admin access.");
      }
    } catch (error) {
      setError(error.message || "Invalid email or password");
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
        placeholder='email@example.com'
        autoComplete='email'
        onChange={(event) => {setEmail(event.target.value)}}
      />

      <label htmlFor='password'>Password</label>
      <input
        type='password'
        id='password'
        placeholder='Enter password'
        autoComplete='current-password'
        onChange={(event) => {setPassword(event.target.value)}}
      />

      <button type='submit'>Login</button>
    </form>
  )
}
