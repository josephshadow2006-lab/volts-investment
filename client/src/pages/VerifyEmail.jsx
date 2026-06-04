import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { verifyEmail } from '../api.js';

export default function VerifyEmail() {
  const { token } = useParams();
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    async function verify() {
      try {
        const result = await verifyEmail(token);
        setMessage(result.message || 'Email verified successfully.');
      } catch (error) {
        setMessage(error.response?.data?.message || 'Verification failed.');
      }
    }
    verify();
  }, [token]);

  return (
    <div className="mx-auto max-w-md rounded-3xl bg-slate-900 p-8 shadow-xl shadow-slate-950/30">
      <h1 className="text-3xl font-semibold text-white">Email verification</h1>
      <p className="mt-4 text-slate-300">{message}</p>
    </div>
  );
}
