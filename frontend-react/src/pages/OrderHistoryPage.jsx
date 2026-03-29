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
  const [editingOrderId, setEditingOrderId] = useState('');
  const [shippingDraft, setShippingDraft] = useState('');

  async function loadOrders() {
    setLoading(true);
    setError('');
    try {
      const data = await request('/api/orders', { token });
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;

    (async () => {
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
    })();

    return () => {
      ignore = true;
    };
  }, [token]);

  async function cancelOrder(orderId) {
    if (!window.confirm('Cancel this order?')) return;

    setError('');
    try {
      await request(`/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        token,
      });
      await loadOrders();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEditOrder(order) {
    setEditingOrderId(order._id);
    setShippingDraft(order.shippingAddress || '');
  }

  function stopEditOrder() {
    setEditingOrderId('');
    setShippingDraft('');
  }

  async function saveOrderUpdate(orderId) {
    setError('');
    try {
      await request(`/api/orders/${orderId}`, {
        method: 'PUT',
        token,
        body: {
          shippingAddress: shippingDraft,
        },
      });
      stopEditOrder();
      await loadOrders();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteOrder(orderId) {
    if (!window.confirm('Delete this order?')) return;

    setError('');
    try {
      await request(`/api/orders/${orderId}`, {
        method: 'DELETE',
        token,
      });
      if (editingOrderId === orderId) {
        stopEditOrder();
      }
      await loadOrders();
    } catch (err) {
      setError(err.message);
    }
  }

  async function fetchPayment(orderId) {
    try {
      const data = await request(`/api/payments/${orderId}`, { token });
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

            {editingOrderId === order._id && (
              <div className="mt-3 rounded-md bg-slate-50 p-3">
                <label className="mb-1 block text-xs font-medium text-slate-600">Update Shipping Address</label>
                <textarea
                  value={shippingDraft}
                  onChange={(e) => setShippingDraft(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => saveOrderUpdate(order._id)}
                    className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                  >
                    Save Update
                  </button>
                  <button
                    onClick={stopEditOrder}
                    className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="mt-3 space-y-2 text-sm">
              {Array.isArray(order.items) && order.items.map((item, idx) => (
                <div key={`${order._id}-${idx}`} className="rounded-md bg-slate-50 p-2">
                  {item.title} - {item.quantity} x LKR {item.price}
                </div>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => fetchPayment(order._id)}
                className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-slate-50"
              >
                Check Payment Detail
              </button>

              {order.status !== 'cancelled' && order.status !== 'shipped' && order.status !== 'delivered' && order.paymentStatus !== 'completed' && (
                <button
                  onClick={() => cancelOrder(order._id)}
                  className="rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700"
                >
                  Cancel Order
                </button>
              )}

              {order.status !== 'cancelled' && order.status !== 'shipped' && order.status !== 'delivered' && editingOrderId !== order._id && (
                <button
                  onClick={() => startEditOrder(order)}
                  className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Update Address
                </button>
              )}

              {order.status !== 'delivered' && (
                <button
                  onClick={() => deleteOrder(order._id)}
                  className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700"
                >
                  Delete Order
                </button>
              )}
            </div>
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
