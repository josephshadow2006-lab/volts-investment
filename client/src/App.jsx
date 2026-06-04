import { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Products from './pages/Products.jsx';
import Admin from './pages/Admin.jsx';
import RequestPasswordReset from './pages/RequestPasswordReset.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import { getSessionUser } from './api.js';

function App() {
  const [user, setUser] = useState(getSessionUser());
  const navigate = useNavigate();

  useEffect(() => {
    setUser(getSessionUser());
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('volts_token');
    localStorage.removeItem('volts_user');
    setUser(null);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/90 sticky top-0 z-30 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="text-xl font-bold text-emerald-400">VOLTS</Link>
          <nav className="flex items-center gap-4 text-sm text-slate-200">
            <Link to="/" className="hover:text-white">Home</Link>
            <Link to="/products" className="hover:text-white">Invest</Link>
            {user && <Link to="/dashboard" className="hover:text-white">Dashboard</Link>}
            {user?.role === 'admin' && <Link to="/admin" className="hover:text-white">Admin</Link>}
            {!user && <Link to="/login" className="hover:text-white">Login</Link>}
            {!user && <Link to="/register" className="text-emerald-400 hover:text-emerald-300">Register</Link>}
            {user && <button onClick={handleLogout} className="rounded bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400">Logout</button>}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/login" element={<Login onLogin={setUser} />} />
          <Route path="/register" element={<Register onRegister={setUser} />} />
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/products" element={<Products user={user} />} />
          <Route path="/admin" element={<Admin user={user} />} />
          <Route path="/forgot-password" element={<RequestPasswordReset />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
