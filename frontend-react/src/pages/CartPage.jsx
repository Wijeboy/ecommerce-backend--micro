import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { cart, loading, refreshCart, updateCartItem, removeFromCart, clearCart } = useCart();
  const [error, setError] = useState('');

  useEffect(() => {
    refreshCart().catch((err) => setError(err.message));
  }, [refreshCart]);

  async function changeQty(productId, quantity) {
    setError('');
    try {
      await updateCartItem(productId, Number(quantity));
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeItem(productId) {
    setError('');
    try {
      await removeFromCart(productId);
    } catch (err) {
      setError(err.message);
    }
  }

  async function clearAll() {
    setError('');
    try {
      await clearCart();
    } catch (err) {
      setError(err.message);
    }
  }

  const items = cart?.items || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cart</h1>
        <button
          onClick={() => refreshCart().catch((err) => setError(err.message))}
          className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      {loading && <p>Loading cart...</p>}
      {error && <p className="text-sm text-rose-600">{error}</p>}

      {items.length === 0 ? (
        <div className="rounded-xl border bg-white p-6">
          <p className="text-slate-600">Your cart is empty.</p>
          <Link to="/" className="mt-3 inline-block text-indigo-600">Go to Home</Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="rounded-xl border bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">{item.title || 'Product'}</p>
                    <p className="text-sm text-slate-600">LKR {item.price}</p>
                    <p className="text-xs text-slate-500">Product ID: {item.productId}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => changeQty(item.productId, e.target.value)}
                      className="w-20 rounded-lg border px-2 py-1"
                    />
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="rounded-lg bg-rose-600 px-3 py-1 text-sm font-medium text-white hover:bg-rose-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border bg-white p-4">
            <p className="text-lg font-bold text-slate-900">Total: LKR {cart?.total || 0}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={clearAll}
                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-slate-50"
              >
                Clear Cart
              </button>
              <Link
                to="/checkout"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
