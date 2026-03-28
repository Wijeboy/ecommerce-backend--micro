import { useEffect, useState } from 'react';
import { request } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function OrderHistoryPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [orderIdInput, setOrderIdInput] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [userPayments, setUserPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadOrders() {
      setLoading(true);
      setError('');
      try {
        const data = await request('/api/orders', { token });
        if (!ignore) setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!ignore) setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadOrders();
    return () => {
      ignore = true;
    };
  }, [token]);

  async function fetchPayment(orderId) {
    try {
      const data = await request(`/api/payments/${orderId}`);
      setSelectedPayment(data);
    } catch (err) {
      setSelectedPayment({ error: err.message });
    }
  }

  async function fetchOrderById() {
    if (!orderIdInput.trim()) return;
    setError('');
    try {
      const data = await request(`/api/orders/${orderIdInput.trim()}`, { token });
      setSelectedOrder(data);
    } catch (err) {
      setSelectedOrder({ error: err.message });
    }
  }

  async function fetchUserPayments() {
    setError('');
    try {
      const data = await request('/api/payments/user', { token });
      setUserPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Order History</h1>

      <div className="rounded-xl border bg-white p-4">
        <h2 className="text-lg font-semibold">Find Order By ID</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          <input
            value={orderIdInput}
            onChange={(e) => setOrderIdInput(e.target.value)}
            placeholder="Paste order id"
            className="min-w-[280px] flex-1 rounded-lg border px-3 py-2 text-sm"
          />
          <button
            onClick={fetchOrderById}
            className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Get Order
          </button>
        </div>

        {selectedOrder && (
          <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm">
            {'error' in selectedOrder ? (
              <p className="text-rose-600">{selectedOrder.error}</p>
            ) : (
              <>
                <p><span className="font-medium">Order:</span> {selectedOrder._id}</p>
                <p><span className="font-medium">Status:</span> {selectedOrder.status}</p>
                <p><span className="font-medium">Payment:</span> {selectedOrder.paymentStatus}</p>
                <p><span className="font-medium">Total:</span> LKR {selectedOrder.totalAmount}</p>
              </>
            )}
          </div>
        )}
      </div>

      {loading && <p>Loading orders...</p>}
      {error && <p className="text-sm text-rose-600">{error}</p>}

      {!loading && orders.length === 0 && (
        <div className="rounded-xl border bg-white p-6 text-sm text-slate-600">No orders found.</div>
      )}

      <div className="space-y-3">
        {orders.map((order) => (
          <div key={order._id} className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold">Order #{order._id}</p>
              <p className="text-sm text-slate-600">Status: {order.status || 'pending'}</p>
            </div>

            <p className="mt-2 text-sm text-slate-700">Shipping: {order.shippingAddress}</p>
            <p className="text-sm text-slate-700">Total: LKR {order.totalAmount}</p>
            <p className="text-sm text-slate-700">Payment: {order.paymentStatus || 'pending'}</p>

            <div className="mt-3 space-y-2 text-sm">
              {Array.isArray(order.items) && order.items.map((item, idx) => (
                <div key={`${order._id}-${idx}`} className="rounded-md bg-slate-50 p-2">
                  {item.title} - {item.quantity} x LKR {item.price}
                </div>
              ))}
            </div>

            <button
              onClick={() => fetchPayment(order._id)}
              className="mt-3 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Check Payment Detail
            </button>
          </div>
        ))}
      </div>

      {selectedPayment && (
        <div className="rounded-xl border bg-white p-4">
          <h2 className="text-lg font-semibold">Payment Detail</h2>
          {'error' in selectedPayment ? (
            <p className="mt-2 text-sm text-rose-600">{selectedPayment.error}</p>
          ) : (
            <div className="mt-2 text-sm text-slate-700">
              <p>Order ID: {selectedPayment.orderId}</p>
              <p>Status: {selectedPayment.status}</p>
              <p>Amount: LKR {selectedPayment.amount}</p>
              <p>Method: {selectedPayment.method}</p>
              <p>Transaction: {selectedPayment.transactionId || 'N/A'}</p>
            </div>
          )}
        </div>
      )}

      <div className="rounded-xl border bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">My Payments</h2>
          <button
            onClick={fetchUserPayments}
            className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Load Payments
          </button>
        </div>

        {userPayments.length > 0 && (
          <div className="mt-3 space-y-2 text-sm">
            {userPayments.map((payment) => (
              <div key={payment._id} className="rounded-md bg-slate-50 p-3">
                <p><span className="font-medium">Order:</span> {payment.orderId}</p>
                <p><span className="font-medium">Status:</span> {payment.status}</p>
                <p><span className="font-medium">Amount:</span> LKR {payment.amount}</p>
                <p><span className="font-medium">Method:</span> {payment.method}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
