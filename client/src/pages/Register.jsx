import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authRequest, saveSession } from '../api.js';

export default function Register({ onRegister }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const data = await authRequest('/auth/register', { name, email, password });
      saveSession(data.user, data.token);
      onRegister(data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-3xl bg-slate-900 p-8 shadow-xl shadow-slate-950/30">
      <h1 className="text-3xl font-semibold text-white">Create account</h1>
      <p className="mt-3 text-slate-400">Register to start investing in digital devices and earn daily payouts.</p>
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm text-slate-300">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} type="text" required className="mt-2 w-full" />
        </div>
        <div>
          <label className="text-sm text-slate-300">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="mt-2 w-full" />
        </div>
        <div>
          <label className="text-sm text-slate-300">Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required className="mt-2 w-full" />
        </div>
        {error && <p className="text-sm text-rose-400">{error}</p>}
        <button type="submit" className="w-full rounded-full bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400">Create account</button>
      </form>
      <p className="mt-6 text-sm text-slate-400">Already have an account? <Link to="/login" className="text-emerald-400">Login</Link></p>
      <p className="mt-4 text-sm text-slate-400">After registration, check your email for a verification link before exploring the dashboard.</p>
    </div>
  );
}
