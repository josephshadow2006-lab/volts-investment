import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { products } from '../data/products.js';

const testimonials = [
  { name: 'Amina', quote: 'VOLTS turned my savings into a smarter asset. The dashboard is clean and the returns are easy to track.' },
  { name: 'Brian', quote: 'I love how the platform blends device investment with performance data. Highly professional experience.' },
  { name: 'Chloe', quote: 'The referral program is simple to use and rewards are instant. Great fintech design.' },
];

export default function Home({ user }) {
  const [liveStats, setLiveStats] = useState({ investors: 3340, revenue: 215000 });

  useEffect(() => {
    const socket = io('http://localhost:4000');
    socket.on('marketUpdate', (data) => {
      setLiveStats(data);
    });
    return () => socket.disconnect();
  }, []);

  return (
    <div className="space-y-12">
      <section className="rounded-3xl bg-slate-900/90 p-8 shadow-xl shadow-slate-950/50">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">Digital Ownership</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Invest in premium devices. Earn daily income.</h1>
            <p className="mt-5 max-w-2xl text-slate-300">VOLTS connects customers with smart device investments, delivering transparent earnings, real-time reports, and a professional FinTech dashboard experience.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/products" className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400">Explore plans</Link>
              <Link to={user ? '/dashboard' : '/register'} className="inline-flex items-center justify-center rounded-full border border-slate-700 px-6 py-3 text-sm text-slate-200 hover:border-slate-500">Get started</Link>
            </div>
          </div>
          <div className="rounded-3xl bg-slate-950 p-6 text-slate-200 shadow-xl shadow-slate-950/40">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Live performance</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-900 p-5">
                <p className="text-sm text-slate-400">Active investors</p>
                <p className="mt-3 text-3xl font-semibold text-white">{liveStats.investors.toLocaleString()}</p>
              </div>
              <div className="rounded-3xl bg-slate-900 p-5">
                <p className="text-sm text-slate-400">Total projected earnings</p>
                <p className="mt-3 text-3xl font-semibold text-white">KSH {liveStats.revenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-3">
        <div className="rounded-3xl bg-slate-900 p-6 shadow-xl shadow-slate-950/40">
          <h2 className="text-xl font-semibold text-white">Featured products</h2>
          <p className="mt-2 text-slate-400">Top performing device investments available now.</p>
          <ul className="mt-6 space-y-4">
            {products.slice(0, 3).map((product) => (
              <li key={product.id} className="rounded-3xl bg-slate-950 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">{product.title}</p>
                    <p className="text-sm text-slate-400">KSH {product.price.toLocaleString()}</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">+{product.dailyIncome} / day</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl bg-slate-900 p-6 shadow-xl shadow-slate-950/40 lg:col-span-2">
          <h2 className="text-xl font-semibold text-white">What makes VOLTS unique?</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-950 p-5">
              <p className="font-semibold text-white">Real-time analytics</p>
              <p className="mt-2 text-sm text-slate-400">Track your daily and monthly earnings with modern dashboards and charts.</p>
            </div>
            <div className="rounded-3xl bg-slate-950 p-5">
              <p className="font-semibold text-white">Secure authentication</p>
              <p className="mt-2 text-sm text-slate-400">JWT login, password encryption, and secure session handling.</p>
            </div>
            <div className="rounded-3xl bg-slate-950 p-5">
              <p className="font-semibold text-white">Investment management</p>
              <p className="mt-2 text-sm text-slate-400">Browse device plans and manage your active investments with ease.</p>
            </div>
            <div className="rounded-3xl bg-slate-950 p-5">
              <p className="font-semibold text-white">Referral rewards</p>
              <p className="mt-2 text-sm text-slate-400">Invite friends and earn commissions with a built-in referral program.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-slate-900 p-8 shadow-xl shadow-slate-950/40">
        <h2 className="text-2xl font-semibold text-white">Testimonials</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
            <div key={item.name} className="rounded-3xl bg-slate-950 p-6">
              <p className="text-slate-300">“{item.quote}”</p>
              <p className="mt-4 font-semibold text-white">{item.name}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
