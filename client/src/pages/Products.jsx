import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProducts, purchaseProduct, getAuthToken, getSessionUser } from '../api.js';

export default function Products({ user }) {
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const products = await fetchProducts();
        setItems(products);
      } catch (error) {
        console.error(error);
      }
    }
    load();
  }, []);

  const handlePurchase = async (productId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    const token = getAuthToken();
    try {
      await purchaseProduct(token, productId);
      setMessage('Purchase successful! Check your dashboard for updates.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to purchase product');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-slate-900 p-8 shadow-xl shadow-slate-950/40">
        <h1 className="text-3xl font-semibold text-white">Product investment plans</h1>
        <p className="mt-3 text-slate-400">Browse asset-backed device investment packages and make secure purchases.</p>
      </div>
      {message && <div className="rounded-3xl bg-emerald-500/15 p-4 text-emerald-200">{message}</div>}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {items.map((product) => (
          <article key={product.id} className="rounded-3xl bg-slate-900 p-6 shadow-xl shadow-slate-950/30">
            <div className="mb-5 h-40 overflow-hidden rounded-3xl bg-slate-800">
              <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
            </div>
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-white">{product.name}</h2>
              <div className="grid gap-2 text-sm text-slate-300">
                <p>Price: KSH {product.price.toLocaleString()}</p>
                <p>Daily income: KSH {product.dailyIncome}</p>
                <p>Duration: {product.duration} Days</p>
                <p>Expected returns: KSH {(product.dailyIncome * product.duration).toLocaleString()}</p>
              </div>
              <button onClick={() => handlePurchase(product.id)} className="mt-5 w-full rounded-full bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400">Purchase</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
