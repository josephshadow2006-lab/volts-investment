import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDashboard, getAuthToken, getSessionUser, depositFunds, requestWithdrawal } from '../api.js';

export default function Dashboard({ user }) {
  const [data, setData] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [transactionMessage, setTransactionMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    async function loadDashboard() {
      try {
        const token = getAuthToken();
        const response = await fetchDashboard(token);
        setData(response);
      } catch (err) {
        console.error(err);
      }
    }
    loadDashboard();
  }, [user, navigate]);

  const handleDeposit = async (event) => {
    event.preventDefault();
    try {
      const token = getAuthToken();
      const response = await depositFunds(token, Number(depositAmount));
      setTransactionMessage(response.message);
      setDepositAmount('');
      const refreshed = await fetchDashboard(token);
      setData(refreshed);
    } catch (err) {
      setTransactionMessage(err.response?.data?.message || 'Deposit failed');
    }
  };

  const handleWithdraw = async (event) => {
    event.preventDefault();
    try {
      const token = getAuthToken();
      const response = await requestWithdrawal(token, Number(withdrawAmount));
      setTransactionMessage(response.message);
      setWithdrawAmount('');
      const refreshed = await fetchDashboard(token);
      setData(refreshed);
    } catch (err) {
      setTransactionMessage(err.response?.data?.message || 'Withdrawal failed');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-slate-900 p-8 shadow-xl shadow-slate-950/30">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">Welcome back</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">{user.name}</h1>
            <p className="mt-3 text-slate-400">Your portfolio overview, transaction history, and investment metrics are all in one place.</p>
          </div>
          <div className="rounded-3xl bg-slate-950 p-5 text-slate-100">
            <p className="text-sm text-slate-400">Current balance</p>
            <p className="mt-2 text-3xl font-semibold text-white">KSH {(data?.user?.balance ?? user.balance ?? 0).toLocaleString()}</p>
            <p className={`mt-3 text-sm ${(data?.user?.email_verified ?? user.email_verified) ? 'text-emerald-300' : 'text-amber-300'}`}>
              {(data?.user?.email_verified ?? user.email_verified) ? 'Email verified' : 'Email not verified'}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl bg-slate-900 p-6 shadow-xl shadow-slate-950/30">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Total Earnings</p>
          <p className="mt-4 text-3xl font-semibold text-white">KSH {data?.stats.totalEarnings?.toLocaleString() ?? '0'}</p>
        </div>
        <div className="rounded-3xl bg-slate-900 p-6 shadow-xl shadow-slate-950/30">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Active investments</p>
          <p className="mt-4 text-3xl font-semibold text-white">{data?.stats.activeInvestments ?? 0}</p>
        </div>
        <div className="rounded-3xl bg-slate-900 p-6 shadow-xl shadow-slate-950/30">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Completed investments</p>
          <p className="mt-4 text-3xl font-semibold text-white">{data?.stats.completedInvestments ?? 0}</p>
        </div>
      </div>

      {transactionMessage && <div className="rounded-3xl bg-emerald-500/10 p-4 text-emerald-200">{transactionMessage}</div>}

      <section className="grid gap-6 xl:grid-cols-[1fr_0.7fr]">
        <div className="rounded-3xl bg-slate-900 p-6 shadow-xl shadow-slate-950/30">
          <h2 className="text-xl font-semibold text-white">Active investments</h2>
          <div className="mt-5 space-y-4">
            {data?.investments?.length ? (
              data.investments.map((item) => (
                <div key={item.id} className="rounded-3xl bg-slate-950 p-4">
                  <p className="font-semibold text-white">{item.product_name}</p>
                  <div className="mt-2 grid gap-2 text-sm text-slate-400 sm:grid-cols-2">
                    <span>Daily income: KSH {item.daily_income}</span>
                    <span>Duration: {item.duration_days} days</span>
                    <span>Status: {item.status}</span>
                    <span>Created: {new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400">No active investments yet. Browse products to start earning today.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl bg-slate-900 p-6 shadow-xl shadow-slate-950/30">
            <h2 className="text-xl font-semibold text-white">Manage funds</h2>
            <form onSubmit={handleDeposit} className="space-y-4">
              <label className="block text-sm text-slate-300">Deposit amount</label>
              <input value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} type="number" min="1" placeholder="KSH 1000" className="w-full" />
              <button type="submit" className="w-full rounded-full bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400">Deposit funds</button>
            </form>
            <form onSubmit={handleWithdraw} className="mt-6 space-y-4">
              <label className="block text-sm text-slate-300">Request withdrawal</label>
              <input value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} type="number" min="1" placeholder="KSH 1000" className="w-full" />
              <button type="submit" className="w-full rounded-full bg-amber-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-400">Request withdrawal</button>
            </form>
          </div>

          <div className="rounded-3xl bg-slate-900 p-6 shadow-xl shadow-slate-950/30">
            <h2 className="text-xl font-semibold text-white">Recent activity</h2>
            <div className="mt-4 space-y-4 text-slate-400">
              <div className="rounded-3xl bg-slate-950 p-4">
                <p className="font-semibold text-white">Deposits</p>
                {data?.deposits?.length ? data.deposits.slice(0, 3).map((deposit) => (
                  <p key={deposit.id} className="mt-2 text-sm">KSH {deposit.amount.toLocaleString()} • {new Date(deposit.created_at).toLocaleDateString()}</p>
                )) : <p className="mt-2 text-sm">No recent deposits.</p>}
              </div>
              <div className="rounded-3xl bg-slate-950 p-4">
                <p className="font-semibold text-white">Withdrawals</p>
                {data?.withdrawals?.length ? data.withdrawals.slice(0, 3).map((withdrawal) => (
                  <p key={withdrawal.id} className="mt-2 text-sm">KSH {withdrawal.amount.toLocaleString()} • {withdrawal.status}</p>
                )) : <p className="mt-2 text-sm">No recent withdrawals.</p>}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
