import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAdminOverview, fetchAdminWithdrawals, approveWithdrawal, rejectWithdrawal, getAuthToken } from '../api.js';

export default function Admin({ user }) {
  const [overview, setOverview] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    async function loadAdmin() {
      const token = getAuthToken();
      try {
        const dashboard = await fetchAdminOverview(token);
        const withdrawalsData = await fetchAdminWithdrawals(token);
        setOverview(dashboard);
        setWithdrawals(withdrawalsData);
      } catch (error) {
        console.error(error);
      }
    }
    loadAdmin();
  }, [user, navigate]);

  const handleUpdate = async (id, action) => {
    const token = getAuthToken();
    try {
      if (action === 'approve') {
        await approveWithdrawal(token, id);
      } else {
        await rejectWithdrawal(token, id);
      }
      setMessage(`Withdrawal ${action}d successfully.`);
      const updated = await fetchAdminWithdrawals(token);
      setWithdrawals(updated);
    } catch (error) {
      setMessage('Unable to update withdrawal status.');
      console.error(error);
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-slate-900 p-8 shadow-xl shadow-slate-950/30">
        <h1 className="text-3xl font-semibold text-white">Admin panel</h1>
        <p className="mt-3 text-slate-400">Manage users, deposits, withdrawals, and platform analytics.</p>
      </section>
      {message && <div className="rounded-3xl bg-emerald-500/10 p-4 text-emerald-200">{message}</div>}
      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-3xl bg-slate-900 p-6 shadow-xl shadow-slate-950/30">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Users</p>
          <p className="mt-4 text-3xl font-semibold text-white">{overview?.users ?? 0}</p>
        </div>
        <div className="rounded-3xl bg-slate-900 p-6 shadow-xl shadow-slate-950/30">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Investments</p>
          <p className="mt-4 text-3xl font-semibold text-white">{overview?.investments ?? 0}</p>
        </div>
        <div className="rounded-3xl bg-slate-900 p-6 shadow-xl shadow-slate-950/30">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Deposits</p>
          <p className="mt-4 text-3xl font-semibold text-white">{overview?.deposits ?? 0}</p>
        </div>
        <div className="rounded-3xl bg-slate-900 p-6 shadow-xl shadow-slate-950/30">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Pending withdrawals</p>
          <p className="mt-4 text-3xl font-semibold text-white">{overview?.pendingWithdrawals ?? 0}</p>
        </div>
      </div>
      <section className="rounded-3xl bg-slate-900 p-6 shadow-xl shadow-slate-950/30">
        <h2 className="text-2xl font-semibold text-white">Pending withdrawals</h2>
        <div className="mt-6 space-y-4">
          {withdrawals.length ? (
            withdrawals.map((item) => (
              <div key={item.id} className="rounded-3xl bg-slate-950 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-white">{item.name} ({item.email})</p>
                    <p className="text-sm text-slate-400">KSH {Number(item.amount).toLocaleString()} • {item.status}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => handleUpdate(item.id, 'approve')} className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400">Approve</button>
                    <button onClick={() => handleUpdate(item.id, 'reject')} className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-rose-400">Reject</button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-400">No withdrawal requests at the moment.</p>
          )}
        </div>
      </section>
    </div>
  );
}
