import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../api.js';

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await resetPassword(token, password);
      setMessage(result.message || 'Password reset successfully.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to reset password.');
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-3xl bg-slate-900 p-8 shadow-xl shadow-slate-950/30">
      <h1 className="text-3xl font-semibold text-white">Reset password</h1>
      <p className="mt-3 text-slate-400">Choose a strong password for your VOLTS account.</p>
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm text-slate-300">New password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required className="mt-2 w-full" />
        </div>
        <button type="submit" className="w-full rounded-full bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400">Reset password</button>
      </form>
      {message && <p className="mt-4 text-sm text-emerald-300">{message}</p>}
    </div>
  );
}
