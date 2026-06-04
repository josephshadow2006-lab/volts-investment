import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authRequest, saveSession } from '../api.js';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const data = await authRequest('/auth/login', { email, password });
      saveSession(data.user, data.token);
      onLogin(data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-3xl bg-slate-900 p-8 shadow-xl shadow-slate-950/30">
      <h1 className="text-3xl font-semibold text-white">Login</h1>
      <p className="mt-3 text-slate-400">Access your VOLTS dashboard and manage device investments.</p>
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm text-slate-300">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="mt-2 w-full" />
        </div>
        <div>
          <label className="text-sm text-slate-300">Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required className="mt-2 w-full" />
        </div>
        {error && <p className="text-sm text-rose-400">{error}</p>}
        <button type="submit" className="w-full rounded-full bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400">Sign in</button>
      </form>
      <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
        <Link to="/forgot-password" className="text-emerald-400 hover:text-emerald-300">Forgot password?</Link>
        <Link to="/register" className="text-emerald-400 hover:text-emerald-300">Create account</Link>
      </div>
    </div>
  );
}
