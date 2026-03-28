import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { request } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function CheckoutPage() {
  const { token } = useAuth();
  const { cart, refreshCart } = useCart();

  const [shippingAddress, setShippingAddress] = useState('Colombo, Sri Lanka');
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    refreshCart().catch((err) => setError(err.message));
  }, [refreshCart]);

  const items = cart?.items || [];
  const totalAmount = useMemo(() => cart?.total || 0, [cart]);

  async function createOrder() {
    if (items.length === 0) {
      setError('Cart is empty.');
      return;
    }

    setProcessing(true);
    setError('');
    setMessage('');

    try {
      const data = await request('/api/orders', {
        method: 'POST',
        token,
        body: {
          items: items.map((item) => ({
            productId: item.productId,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
          })),
          shippingAddress,
          totalAmount,
        },
      });

      setOrder(data.order);
      setMessage('Order created. Proceed with payment.');
      await refreshCart();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  }

  async function initiatePayment() {
    if (!order?._id) return;

    setProcessing(true);
    setError('');
    setMessage('');

    try {
      const data = await request('/api/payments/initiate', {
        method: 'POST',
        token,
        body: {
          orderId: order._id,
          amount: Number(order.totalAmount),
          method: 'credit_card',
        },
      });

      setPayment(data.payment);
      setMessage('Payment initiated. Confirm to complete transaction.');
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  }

  async function confirmPayment() {
    if (!order?._id) return;

    setProcessing(true);
    setError('');
    setMessage('');

    try {
      const data = await request('/api/payments/confirm', {
        method: 'POST',
        token,
        body: { orderId: order._id },
      });

      setPayment(data.payment);
      setMessage('Payment successful. Order payment status updated.');
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  }

  async function failPayment() {
    if (!order?._id) return;

    setProcessing(true);
    setError('');
    setMessage('');

    try {
      const data = await request('/api/payments/fail', {
        method: 'POST',
        token,
        body: { orderId: order._id },
      });

      setPayment(data.payment);
      setMessage('Payment marked as failed for testing flow.');
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <section className="rounded-xl border bg-white p-6 shadow-sm lg:col-span-2">
        <h1 className="text-2xl font-bold">Checkout</h1>
        <p className="mt-1 text-sm text-slate-600">Create an order and complete payment.</p>

        {items.length === 0 ? (
          <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
            Cart is empty. <Link to="/cart" className="text-indigo-600">Go to cart</Link>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                <span>{item.title}</span>
                <span>{item.quantity} x LKR {item.price}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium">Shipping Address</label>
          <textarea
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            rows={3}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 p-3">
          <span className="font-medium">Order Total</span>
          <span className="text-lg font-bold text-indigo-700">LKR {totalAmount}</span>
        </div>

        <button
          onClick={createOrder}
          disabled={processing || items.length === 0}
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {processing ? 'Processing...' : 'Create Order'}
        </button>
      </section>

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Payment</h2>

        {!order ? (
          <p className="mt-2 text-sm text-slate-600">Create an order first.</p>
        ) : (
          <>
            <p className="mt-2 text-sm text-slate-600">Order ID: {order._id}</p>
            <p className="text-sm text-slate-600">Amount: LKR {order.totalAmount}</p>

            <div className="mt-4 space-y-2">
              <button
                onClick={initiatePayment}
                disabled={processing}
                className="w-full rounded-lg border px-4 py-2 text-sm font-medium hover:bg-slate-50"
              >
                Initiate Payment
              </button>

              <button
                onClick={confirmPayment}
                disabled={processing}
                className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                Confirm Payment Success
              </button>

              <button
                onClick={failPayment}
                disabled={processing}
                className="w-full rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
              >
                Mark Payment Failed
              </button>
            </div>
          </>
        )}

        {payment && (
          <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm">
            <p><span className="font-medium">Payment Status:</span> {payment.status}</p>
            {payment.transactionId && (
              <p><span className="font-medium">Transaction ID:</span> {payment.transactionId}</p>
            )}
          </div>
        )}

        {message && <p className="mt-4 text-sm text-emerald-600">{message}</p>}
        {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
      </section>
    </div>
  );
}
