import { useState } from 'react';
import { requestPasswordReset } from '../api.js';

export default function RequestPasswordReset() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await requestPasswordReset(email);
      setMessage(result.message || 'Password reset requested.');
    } catch (error) {
      setMessage('Unable to request password reset.');
      console.error(error);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-3xl bg-slate-900 p-8 shadow-xl shadow-slate-950/30">
      <h1 className="text-3xl font-semibold text-white">Forgot password</h1>
      <p className="mt-3 text-slate-400">Enter your email to receive password reset instructions.</p>
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm text-slate-300">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="mt-2 w-full" />
        </div>
        <button type="submit" className="w-full rounded-full bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400">Send reset link</button>
      </form>
      {message && <p className="mt-4 text-sm text-emerald-300">{message}</p>}
    </div>
  );
}
