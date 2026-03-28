import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { request } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadProducts() {
      setLoading(true);
      setError('');
      try {
        const data = await request('/api/products');
        if (!ignore) setProducts(data);
      } catch (err) {
        if (!ignore) setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadProducts();
    return () => {
      ignore = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return products;

    return products.filter((item) => {
      const title = item.title?.toLowerCase() || '';
      const category = item.category?.toLowerCase() || '';
      return title.includes(keyword) || category.includes(keyword);
    });
  }, [products, search]);

  async function handleAddToCart(product) {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await addToCart({
        productId: product._id,
        title: product.title,
        price: Number(product.price),
        quantity: 1,
      });
      toast.success('Added to cart');
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-indigo-700 to-cyan-700 p-6 text-white shadow-md">
        <h1 className="text-3xl font-bold">Ecommerce Products</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Browse catalog, open product details, view reviews, and add to cart.
        </p>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by product title or category"
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>

      {loading && <p>Loading products...</p>}
      {error && <p className="text-rose-600">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product) => (
          <div key={product._id} className="rounded-xl border bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold">{product.title}</h2>
            <p className="mt-1 text-sm text-slate-600 line-clamp-2">{product.description}</p>
            <p className="mt-2 text-sm text-slate-500">Category: {product.category}</p>
            <p className="mt-2 text-xl font-bold text-indigo-700">LKR {product.price}</p>
            <p className="text-sm text-slate-500">Stock: {product.stock ?? 0}</p>

            <div className="mt-4 flex gap-2">
              <Link
                to={`/products/${product._id}`}
                className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-slate-50"
              >
                View Details
              </Link>
              <button
                onClick={() => handleAddToCart(product)}
                className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="rounded-lg border bg-white p-4 text-sm text-slate-600">No products found.</div>
      )}
    </div>
  );
}
